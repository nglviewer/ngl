/**
 * @file Cube Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Matrix4 } from "../../lib/three.es6.js";

import { Debug, Log, ParserRegistry } from "../globals.js";
import { degToRad } from "../math/math-utils.js";
import VolumeParser from "./volume-parser.js";


function CubeParser( streamer, params ){

    // @author Johanna Tiemann <johanna.tiemann@googlemail.com>
    // @author Alexander Rose <alexander.rose@weirdbyte.de>

    VolumeParser.call( this, streamer, params );

}

CubeParser.prototype = Object.assign( Object.create(

    VolumeParser.prototype ), {

    constructor: CubeParser,
    type: "cube",

    _parse: function(){

        // http://paulbourke.net/dataformats/cube/

        if( Debug ) Log.time( "CubeParser._parse " + this.name );

        var v = this.volume;
        var headerLines = this.streamer.peekLines( 6 );
        var header = {};
        var reWhitespace = /\s+/;
        var bohrToAngstromFactor = 0.529177210859;

        function headerhelper( k, l ) {
            var field = headerLines[ k ].trim().split( reWhitespace )[ l ];
            return parseFloat( field );
        }

        header.atomCount = Math.abs( headerhelper( 2, 0 ) );  // Number of atoms
        header.originX = headerhelper( 2, 1 ) * bohrToAngstromFactor;  // Position of origin of volumetric data
        header.originY = headerhelper( 2, 2 ) * bohrToAngstromFactor;
        header.originZ = headerhelper( 2, 3 ) * bohrToAngstromFactor;
        header.NVX = headerhelper( 3, 0 );  // Number of voxels
        header.NVY = headerhelper( 4, 0 );
        header.NVZ = headerhelper( 5, 0 );
        header.AVX = headerhelper( 3, 1 ) * bohrToAngstromFactor;  // Axis vector
        header.AVY = headerhelper( 4, 2 ) * bohrToAngstromFactor;
        header.AVZ = headerhelper( 5, 3 ) * bohrToAngstromFactor;

        var data = new Float32Array( header.NVX * header.NVY * header.NVZ );
        var count = 0;
        var lineNo = 0;
        var oribitalFlag = headerhelper( 2, 0 ) > 0 ? 0 : 1;

        function _parseChunkOfLines( _i, _n, lines ){

            for( var i = _i; i < _n; ++i ){

                var line = lines[ i ].trim();

                if( line !== "" && lineNo >= header.atomCount + 6 + oribitalFlag ){

                    line = line.split( reWhitespace );
                    for( var j = 0, lj = line.length; j < lj; ++j ){
                        if ( line.length !==1 ) {
                            data[ count ] = parseFloat( line[ j ] );
                            ++count;
                        }
                    }

                }

                ++lineNo;

            }

        }

        this.streamer.eachChunkOfLines( function( lines/*, chunkNo, chunkCount*/ ){
            _parseChunkOfLines( 0, lines.length, lines );
        } );

        v.header = header;
        v.setData( data, header.NVZ, header.NVY, header.NVX );

        if( Debug ) Log.timeEnd( "CubeParser._parse " + this.name );

    },

    getMatrix: function(){

        var h = this.volume.header;
        var matrix = new Matrix4();

        matrix.multiply(
            new Matrix4().makeRotationY( degToRad( 90 ) )
        );

        matrix.multiply(
            new Matrix4().makeTranslation(
                -h.originZ, h.originY, h.originX
            )
        );

        matrix.multiply(
            new Matrix4().makeScale(
                -h.AVZ, h.AVY, h.AVX
            )
        );

        return matrix;

    }

} );

ParserRegistry.add( "cub", CubeParser );
ParserRegistry.add( "cube", CubeParser );


export default CubeParser;
