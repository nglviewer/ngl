/**
 * @file Dcd Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Debug, Log, ParserRegistry } from "../globals.js";
import TrajectoryParser from "./trajectory-parser.js";
import { uint8ToString } from "../utils.js";


function DcdParser( streamer, params ){

    TrajectoryParser.call( this, streamer, params );

}

DcdParser.prototype = Object.assign( Object.create(

    TrajectoryParser.prototype ), {

    constructor: DcdParser,
    type: "dcd",

    _parse: function(){

        // http://www.ks.uiuc.edu/Research/vmd/plugins/molfile/dcdplugin.html

        // The DCD format is structured as follows
        //   (FORTRAN UNFORMATTED, with Fortran data type descriptions):
        // HDR     NSET    ISTRT   NSAVC   5-ZEROS NATOM-NFREAT    DELTA   9-ZEROS
        // `CORD'  #files  step 1  step    zeroes  (zero)          timestep  (zeroes)
        //                         interval
        // C*4     INT     INT     INT     5INT    INT             DOUBLE  9INT
        // ==========================================================================
        // NTITLE          TITLE
        // INT (=2)        C*MAXTITL
        //                 (=32)
        // ==========================================================================
        // NATOM
        // #atoms
        // INT
        // ==========================================================================
        // X(I), I=1,NATOM         (DOUBLE)
        // Y(I), I=1,NATOM
        // Z(I), I=1,NATOM
        // ==========================================================================

        if( Debug ) Log.time( "DcdParser._parse " + this.name );

        var bin = this.streamer.data;
        if( bin instanceof Uint8Array ){
            bin = bin.buffer;
        }
        var dv = new DataView( bin );

        var i, n;
        var f = this.frames;
        var coordinates = f.coordinates;
        var boxes = f.boxes;
        var header = {};
        var nextPos = 0;

        // header block

        var intView = new Int32Array( bin, 0, 23 );
        var ef = intView[ 0 ] !== dv.getInt32( 0 );  // endianess flag
        // swap byte order when big endian (84 indicates little endian)
        if( intView[ 0 ] !== 84 ){
            n = bin.byteLength;
            for( i = 0; i < n; i+=4 ){
                dv.setFloat32( i, dv.getFloat32( i ), true );
            }
        }
        if( intView[ 0 ] !== 84 ){
            Log.error( "dcd bad format, header block start" );
        }
        // format indicator, should read 'CORD'
        var formatString = String.fromCharCode(
            dv.getUint8( 4 ), dv.getUint8( 5 ),
            dv.getUint8( 6 ), dv.getUint8( 7 )
        );
        if( formatString !== "CORD" ){
            Log.error( "dcd bad format, format string" );
        }
        var isCharmm = false;
        var extraBlock = false;
        var fourDims = false;
        // version field in charmm, unused in X-PLOR
        if( intView[ 22 ] !== 0 ){
            isCharmm = true;
            if( intView[ 12 ] !== 0 ) extraBlock = true;
            if( intView[ 13 ] === 1 ) fourDims = true;
        }
        header.NSET = intView[ 2 ];
        header.ISTART = intView[ 3 ];
        header.NSAVC = intView[ 4 ];
        header.NAMNF = intView[ 10 ];
        if( isCharmm ){
            header.DELTA = dv.getFloat32( 44, ef );
        }else{
            header.DELTA = dv.getFloat64( 44, ef );
        }
        if( intView[ 22 ] !== 84 ){
            Log.error( "dcd bad format, header block end" );
        }
        nextPos = nextPos + 21 * 4 + 8;

        // title block

        var titleLength = dv.getInt32( nextPos, ef );
        var titlePos = nextPos + 1;
        if( ( titleLength - 4 ) % 80 !== 0 ){
            Log.error( "dcd bad format, title block start" );
        }
        header.TITLE = uint8ToString(
            new Uint8Array( bin, titlePos, titleLength )
        );
        if( dv.getInt32( titlePos + titleLength + 4 - 1, ef ) !== titleLength ){
            Log.error( "dcd bad format, title block end" );
        }
        nextPos = nextPos + titleLength + 8;

        // natom block

        if( dv.getInt32( nextPos, ef ) !== 4 ){
            Log.error( "dcd bad format, natom block start" );
        }
        header.NATOM = dv.getInt32( nextPos + 4, ef );
        if( dv.getInt32( nextPos + 8, ef ) !== 4 ){
            Log.error( "dcd bad format, natom block end" );
        }
        nextPos = nextPos + 4 + 8;

        // fixed atoms block

        if( header.NAMNF > 0 ){
            // TODO read coordinates and indices of fixed atoms
            Log.error( "dcd format with fixed atoms unsupported, aborting" );
            return;
        }

        // frames

        var natom = header.NATOM;
        var natom4 = natom * 4;

        for( i = 0, n = header.NSET; i < n; ++i ){

            if( extraBlock ){
                nextPos += 4;  // block start
                // unitcell: A, alpha, B, beta, gamma, C (doubles)
                var box = new Float32Array( 9 );
                box[ 0 ] = dv.getFloat64( nextPos        , ef );
                box[ 4 ] = dv.getFloat64( nextPos + 2 * 8, ef );
                box[ 8 ] = dv.getFloat64( nextPos + 5 * 8, ef );
                boxes.push( box );
                nextPos += 48;
                nextPos += 4;  // block end
            }

            // xyz coordinates
            var coord = new Float32Array( natom * 3 );
            for( var j = 0; j < 3; ++j ){
                if( dv.getInt32( nextPos, ef ) !== natom4 ){
                    Log.error( "dcd bad format, coord block start", i, j );
                }
                nextPos += 4;  // block start
                var c = new Float32Array( bin, nextPos, natom );
                for( var k = 0; k < natom; ++k ){
                    coord[ 3 * k + j ] = c[ k ];
                }
                nextPos += natom4;
                if( dv.getInt32( nextPos, ef ) !== natom4 ){
                    Log.error( "dcd bad format, coord block end", i, j );
                }
                nextPos += 4;  // block end
            }
            coordinates.push( coord );

            if( fourDims ){
                var bytes = dv.getInt32( nextPos, ef );
                nextPos += 4 + bytes + 4;  // block start + skip + block end
            }

        }

        // console.log( header );
        // console.log( header.TITLE );
        // console.log( "isCharmm", isCharmm, "extraBlock", extraBlock, "fourDims", fourDims );

        if( Debug ) Log.timeEnd( "DcdParser._parse " + this.name );

    },

} );

ParserRegistry.add( "dcd", DcdParser );


export default DcdParser;
