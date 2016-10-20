/**
 * @file Sdf Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Debug, Log, ParserRegistry } from "../globals.js";
import { assignResidueTypeBonds } from "../structure/structure-utils.js";
import StructureParser from "./structure-parser.js";


function SdfParser( streamer, params ){

    StructureParser.call( this, streamer, params );

}

SdfParser.prototype = Object.assign( Object.create(

    StructureParser.prototype ), {

    constructor: SdfParser,
    type: "sdf",

    _parse: function(){

        // https://en.wikipedia.org/wiki/Chemical_table_file#SDF
        // http://download.accelrys.com/freeware/ctfile-formats/ctfile-formats.zip

        if( Debug ) Log.time( "SdfParser._parse " + this.name );

        var s = this.structure;
        var sb = this.structureBuilder;

        var firstModelOnly = this.firstModelOnly;
        var asTrajectory = this.asTrajectory;

        var headerLines = this.streamer.peekLines( 2 );

        s.id = headerLines[ 0 ].trim();
        s.title = headerLines[ 1 ].trim();

        var frames = s.frames;
        var doFrames = false;
        var currentFrame, currentCoord;

        var atomMap = s.atomMap;
        var atomStore = s.atomStore;
        atomStore.resize( Math.round( this.streamer.data.length / 50 ) );

        var ap1 = s.getAtomProxy();
        var ap2 = s.getAtomProxy();

        var idx = 0;
        var lineNo = 0;
        var modelIdx = 0;
        var modelAtomIdxStart = 0;

        var atomCount, bondCount, atomStart, atomEnd, bondStart, bondEnd;

        function _parseChunkOfLines( _i, _n, lines ){

            for( var i = _i; i < _n; ++i ){

                var line = lines[ i ];

                if( line.substr( 0, 4 ) === "$$$$" ){

                    lineNo = -1;
                    ++modelIdx;
                    modelAtomIdxStart = atomStore.count;

                }

                if( lineNo === 3 ){

                    atomCount = parseInt( line.substr( 0, 3 ) );
                    bondCount = parseInt( line.substr( 3, 3 ) );

                    atomStart = 4;
                    atomEnd = atomStart + atomCount;
                    bondStart = atomEnd;
                    bondEnd = bondStart + bondCount;

                    if( asTrajectory ){

                        currentCoord = 0;
                        currentFrame = new Float32Array( atomCount * 3 );
                        frames.push( currentFrame );

                        if( modelIdx > 0 ) doFrames = true;

                    }

                }

                if( lineNo >= atomStart && lineNo < atomEnd ){

                    if( firstModelOnly && modelIdx > 0 ) continue;

                    var x = parseFloat( line.substr( 0, 10 ) );
                    var y = parseFloat( line.substr( 10, 10 ) );
                    var z = parseFloat( line.substr( 20, 10 ) );

                    if( asTrajectory ){

                        var j = currentCoord * 3;

                        currentFrame[ j + 0 ] = x;
                        currentFrame[ j + 1 ] = y;
                        currentFrame[ j + 2 ] = z;

                        currentCoord += 1;

                        if( doFrames ) continue;

                    }

                    var element = line.substr( 31, 3 ).trim();
                    var atomname = element + ( idx + 1 );

                    atomStore.growIfFull();
                    atomStore.atomTypeId[ idx ] = atomMap.add( atomname, element );

                    atomStore.x[ idx ] = x;
                    atomStore.y[ idx ] = y;
                    atomStore.z[ idx ] = z;
                    atomStore.serial[ idx ] = idx;

                    sb.addAtom( modelIdx, "", "", "HET", 1, 1 );

                    idx += 1;

                }

                if( lineNo >= bondStart && lineNo < bondEnd ){

                    if( firstModelOnly && modelIdx > 0 ) continue;
                    if( asTrajectory && modelIdx > 0 ) continue;

                    ap1.index = parseInt( line.substr( 0, 3 ) ) - 1 + modelAtomIdxStart;
                    ap2.index = parseInt( line.substr( 3, 3 ) ) - 1 + modelAtomIdxStart;
                    var order = parseInt( line.substr( 6, 3 ) );

                    s.bondStore.addBond( ap1, ap2, order );

                }

                ++lineNo;

            }

        }

        this.streamer.eachChunkOfLines( function( lines/*, chunkNo, chunkCount*/ ){
            _parseChunkOfLines( 0, lines.length, lines );
        } );

        sb.finalize();
        s.finalizeAtoms();
        s.finalizeBonds();
        assignResidueTypeBonds( s );

        if( Debug ) Log.timeEnd( "SdfParser._parse " + this.name );

    },

    _postProcess: function(){

        assignResidueTypeBonds( this.structure );

    }

} );

ParserRegistry.add( "sdf", SdfParser );


export default SdfParser;
