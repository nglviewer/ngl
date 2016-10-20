/**
 * @file Xplor Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Matrix4 } from "../../lib/three.es6.js";

import { Debug, Log, ParserRegistry } from "../globals.js";
import VolumeParser from "./volume-parser.js";


function XplorParser( streamer, params ){

    VolumeParser.call( this, streamer, params );

}

XplorParser.prototype = Object.assign( Object.create(

    VolumeParser.prototype ), {

    constructor: XplorParser,
    type: "xplor",

    _parse: function(){

        // http://hincklab.uthscsa.edu/html/soft_packs/msi_docs/insight980/xplor/formats.html
        // http://www.mrc-lmb.cam.ac.uk/public/xtal/doc/cns/cns_1.3/tutorial/formats/maps/text.html

        if( Debug ) Log.time( "XplorParser._parse " + this.name );

        var v = this.volume;
        var headerLines = this.streamer.peekLines( 8 );
        var header = {};
        var reWhitespace = /\s+/;

        function parseNumberLine( line ){
            return line.trim().split( reWhitespace ).map( parseFloat );
        }

        var infoStart;
        if( headerLines[ 2 ].startsWith( "REMARKS" ) ){
            infoStart = parseInt( headerLines[ 1 ].substring( 0, 8 ) ) + 2;
        }else{
            infoStart = 5;
        }
        var dataStart = infoStart + 3;

        var gridInfo = parseNumberLine( headerLines[ infoStart ] );
        header.NA = gridInfo[ 0 ];
        header.AMIN = gridInfo[ 1 ];
        header.AMAX = gridInfo[ 2 ];
        header.NB = gridInfo[ 3 ];
        header.BMIN = gridInfo[ 4 ];
        header.BMAX = gridInfo[ 5 ];
        header.NC = gridInfo[ 6 ];
        header.CMIN = gridInfo[ 7 ];
        header.CMAX = gridInfo[ 8 ];

        var cellInfo = parseNumberLine( headerLines[ infoStart + 1 ] );
        header.a = cellInfo[ 0 ];
        header.b = cellInfo[ 1 ];
        header.c = cellInfo[ 2 ];
        header.alpha = cellInfo[ 3 ];
        header.beta = cellInfo[ 4 ];
        header.gamma = cellInfo[ 5 ];

        var na = header.AMAX - header.AMIN + 1;
        var nb = header.BMAX - header.BMIN + 1;
        var nc = header.CMAX - header.CMIN + 1;
        var n = na * nb * nc;

        var data = new Float32Array( n );
        var count = 0;
        var lineNo = 0;
        var lineSection = 1 + ( na * nb ) / 6;

        function _parseChunkOfLines( _i, _n, lines ){

            for( var i = _i; i < _n; ++i ){

                var line = lines[ i ];

                if( lineNo >= dataStart && ( lineNo - dataStart ) % lineSection !== 0 && count < n ){

                    for( var j = 0, lj = 6; j < lj; ++j ){
                        data[ count ] = parseFloat( line.substr( 12 * j, 12 ) );
                        ++count;
                    }

                }

                ++lineNo;

            }

        }

        this.streamer.eachChunkOfLines( function( lines/*, chunkNo, chunkCount*/ ){
            _parseChunkOfLines( 0, lines.length, lines );
        } );

        v.header = header;
        v.setData( data, na, nb, nc );

        if( Debug ) Log.timeEnd( "XplorParser._parse " + this.name );

    },

    getMatrix: function(){

        var h = this.volume.header;

        var basisX = [
            h.a,
            0,
            0
        ];

        var basisY = [
            h.b * Math.cos( Math.PI / 180.0 * h.gamma ),
            h.b * Math.sin( Math.PI / 180.0 * h.gamma ),
            0
        ];

        var basisZ = [
            h.c * Math.cos( Math.PI / 180.0 * h.beta ),
            h.c * (
                    Math.cos( Math.PI / 180.0 * h.alpha ) -
                    Math.cos( Math.PI / 180.0 * h.gamma ) *
                    Math.cos( Math.PI / 180.0 * h.beta )
                ) / Math.sin( Math.PI / 180.0 * h.gamma ),
            0
        ];
        basisZ[ 2 ] = Math.sqrt(
            h.c * h.c * Math.sin( Math.PI / 180.0 * h.beta ) *
            Math.sin( Math.PI / 180.0 * h.beta ) - basisZ[ 1 ] * basisZ[ 1 ]
        );

        var basis = [ 0, basisX, basisY, basisZ ];
        var nxyz = [ 0, h.NA, h.NB, h.NC ];
        var mapcrs = [ 0, 1, 2, 3 ];

        var matrix = new Matrix4();

        matrix.set(

            basis[ mapcrs[1] ][0] / nxyz[ mapcrs[1] ],
            basis[ mapcrs[2] ][0] / nxyz[ mapcrs[2] ],
            basis[ mapcrs[3] ][0] / nxyz[ mapcrs[3] ],
            0,

            basis[ mapcrs[1] ][1] / nxyz[ mapcrs[1] ],
            basis[ mapcrs[2] ][1] / nxyz[ mapcrs[2] ],
            basis[ mapcrs[3] ][1] / nxyz[ mapcrs[3] ],
            0,

            basis[ mapcrs[1] ][2] / nxyz[ mapcrs[1] ],
            basis[ mapcrs[2] ][2] / nxyz[ mapcrs[2] ],
            basis[ mapcrs[3] ][2] / nxyz[ mapcrs[3] ],
            0,

            0, 0, 0, 1

        );

        matrix.multiply( new Matrix4().makeTranslation(
            h.AMIN, h.BMIN, h.CMIN
        ) );

        return matrix;

    }

} );

ParserRegistry.add( "xplor", XplorParser );
ParserRegistry.add( "cns", XplorParser );


export default XplorParser;
