
import StringStreamer from "../../src/streamer/string-streamer.js";
import CsvParser from "../../src/parser/csv-parser.js";

import { assert } from 'chai';
import fs from 'fs';


describe('parser/csv-parser', function() {


describe('parsing', function () {
    it('basic', function () {
        var path = __dirname + "/../data/sample.csv";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var csvParser = new CsvParser( streamer );
        csvParser.parse( function( csv ){
            assert.strictEqual( "col1row1Value", csv.data[ 0 ][ 0 ], "Passed!" );
            assert.strictEqual( "col2row3Value", csv.data[ 2 ][ 1 ], "Passed!" );
        } );
    });
});


});
