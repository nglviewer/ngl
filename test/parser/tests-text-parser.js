
import StringStreamer from "../../src/streamer/string-streamer.js";
import TextParser from "../../src/parser/text-parser.js";

import { assert } from 'chai';
import fs from 'fs';


describe('parser/text-parser', function() {


describe('parsing', function () {
    it('basic', function () {
        var sampleText = "Moin world!";
        var path = __dirname + "/../data/sample.txt";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var textParser = new TextParser( streamer );
        textParser.parse( function( text ){
            assert.strictEqual( sampleText, text.data, "Passed!" );
        } );
    });
});


});
