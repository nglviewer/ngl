/**
 * @file Cube Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Matrix4, Vector3 } from "../../lib/three.es6.js";

import { Debug, Log, ParserRegistry } from "../globals.js";
import VolumeParser from "./volume-parser.js";


// @author Johanna Tiemann <johanna.tiemann@googlemail.com>
// @author Alexander Rose <alexander.rose@weirdbyte.de>

class CubeParser extends VolumeParser{

    get type (){ return "cube"; }

    _parse(){

        // http://paulbourke.net/dataformats/cube/

        if( Debug ) Log.time( "CubeParser._parse " + this.name );

        var v = this.volume;
        var headerLines = this.streamer.peekLines( 6 );
        var header = {};
        var reWhitespace = /\s+/;
        var bohrToAngstromFactor = 0.529177210859;
        var scaleFactor = bohrToAngstromFactor * this.voxelSize;

        function h( k, l ) {
            var field = headerLines[ k ].trim().split( reWhitespace )[ l ];
            return parseFloat( field );
        }

        header.atomCount = Math.abs( h( 2, 0 ) );  // Number of atoms
        header.originX = h( 2, 1 ) * bohrToAngstromFactor;  // Position of origin of volumetric data
        header.originY = h( 2, 2 ) * bohrToAngstromFactor;
        header.originZ = h( 2, 3 ) * bohrToAngstromFactor;
        header.NVX = h( 3, 0 );  // Number of voxels
        header.NVY = h( 4, 0 );
        header.NVZ = h( 5, 0 );

        header.basisX = new Vector3(
            h( 3, 1 ), h( 3, 2 ), h( 3, 3 ) ).multiplyScalar( scaleFactor );
        header.basisY = new Vector3(
            h( 4, 1 ), h( 4, 2 ), h( 4, 3 ) ).multiplyScalar( scaleFactor );
        header.basisZ = new Vector3(
            h( 5, 1 ), h( 5, 2 ), h( 5, 3 ) ).multiplyScalar( scaleFactor );

        var data = new Float32Array( header.NVX * header.NVY * header.NVZ );
        var count = 0;
        var lineNo = 0;
        var oribitalFlag = h( 2, 0 ) > 0 ? 0 : 1;

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

    }

    getMatrix(){

        var h = this.volume.header;
        var matrix = new Matrix4();

        matrix.multiply(
            new Matrix4().makeTranslation(
                h.originX, h.originY, h.originZ
            )
        );

        matrix.multiply(
            new Matrix4().makeBasis(
                h.basisZ,
                h.basisY,
                h.basisX
            )
        );

        return matrix;

    }

}

ParserRegistry.add( "cub", CubeParser );
ParserRegistry.add( "cube", CubeParser );


export default CubeParser;
