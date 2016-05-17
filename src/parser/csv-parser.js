/**
 * @file Csv Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import Parser from "./parser.js";


 function CsvParser( streamer, params ){

    var p = params || {};

    Parser.call( this, streamer, p );

    this.table = {

        name: this.name,
        path: this.path,
        colNames: [],
        data: []

    };

}

CsvParser.prototype = Object.assign( Object.create(

    Parser.prototype ), {

    constructor: CsvParser,
    type: "csv",

    __objName: "table",

    _parse: function( callback ){

        var data = this.table.data;
        var reDelimiter = /\s*,\s*/;

        this.streamer.eachChunkOfLines( function( chunk, chunkNo, chunkCount ){

            var n = chunk.length;

            for( var i = 0; i < n; ++i ){

                var line = chunk[ i ].trim();
                var values = line.split( reDelimiter );

                if( chunkNo === 0 && i === 0 ){

                    this.table.colNames = values;

                }else if( line ){

                    data.push( values );

                }

            }

        }.bind( this ) );

        callback();

    }

} );


export default CsvParser;
