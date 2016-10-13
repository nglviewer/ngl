/**
 * @file Dx Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Matrix4 } from "../../lib/three.es6.js";

import { Debug, Log, ParserRegistry } from "../globals.js";
import { degToRad } from "../math/math-utils.js";
import VolumeParser from "./volume-parser.js";


function DxParser( streamer, params ){

    VolumeParser.call( this, streamer, params );

}

DxParser.prototype = Object.assign( Object.create(

    VolumeParser.prototype ), {

    constructor: DxParser,
    type: "dx",

    _parse: function(){

        // http://www.poissonboltzmann.org/docs/file-format-info/

        if( Debug ) Log.time( "DxParser._parse " + this.name );

        var v = this.volume;
        var headerLines = this.streamer.peekLines( 30 );
        var headerInfo = this.parseHeaderLines( headerLines );
        var header = this.volume.header;
        var dataLineStart = headerInfo.dataLineStart;

        var reWhitespace = /\s+/;
        var size = header.nx * header.ny * header.nz;
        var data = new Float32Array( size );
        var count = 0;
        var lineNo = 0;

        function _parseChunkOfLines( _i, _n, lines ){

            for( var i = _i; i < _n; ++i ){

                if( count < size && lineNo > dataLineStart ){

                    var line = lines[ i ].trim();

                    if( line !== "" ){

                        var ls = line.split( reWhitespace );

                        for( var j = 0, lj = ls.length; j < lj; ++j ){
                            data[ count ] = parseFloat( ls[ j ] );
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

        v.setData( data, header.nz, header.ny, header.nx );

        if( Debug ) Log.timeEnd( "DxParser._parse " + this.name );

    },

    parseHeaderLines: function( headerLines ){

        var header = {};
        var reWhitespace = /\s+/;
        var n = headerLines.length;

        var dataLineStart = 0;
        var headerByteCount = 0;
        var deltaLineCount = 0;

        for( var i = 0; i < n; ++i ){

            var ls;
            var line = headerLines[ i ];

            if( line.startsWith( "object 1" ) ){

                ls = line.split( reWhitespace );

                header.nx = parseInt( ls[ 5 ] );
                header.ny = parseInt( ls[ 6 ] );
                header.nz = parseInt( ls[ 7 ] );

            }else if( line.startsWith( "origin" ) ){

                ls = line.split( reWhitespace );

                header.xmin = parseFloat( ls[ 1 ] );
                header.ymin = parseFloat( ls[ 2 ] );
                header.zmin = parseFloat( ls[ 3 ] );

            }else if( line.startsWith( "delta" ) ){

                ls = line.split( reWhitespace );

                if( deltaLineCount === 0 ){
                    header.hx = parseFloat( ls[ 1 ] );
                }else if( deltaLineCount === 1 ){
                    header.hy = parseFloat( ls[ 2 ] );
                }else if( deltaLineCount === 2 ){
                    header.hz = parseFloat( ls[ 3 ] );
                }

                deltaLineCount += 1;

            }else if( line.startsWith( "object 3" ) ){

                dataLineStart = i;
                headerByteCount += line.length + 1;
                break;

            }

            headerByteCount += line.length + 1;

        }

        this.volume.header = header;

        return {
            dataLineStart: dataLineStart,
            headerByteCount: headerByteCount
        };

    },

    getMatrix: function(){

        var h = this.volume.header;
        var matrix = new Matrix4();

        matrix.multiply(
            new Matrix4().makeRotationY( degToRad( 90 ) )
        );

        matrix.multiply(
            new Matrix4().makeTranslation(
                -h.zmin, h.ymin, h.xmin
            )
        );

        matrix.multiply(
            new Matrix4().makeScale(
                -h.hz, h.hy, h.hx
            )
        );

        return matrix;

    }

} );

ParserRegistry.add( "dx", DxParser );


export default DxParser;
