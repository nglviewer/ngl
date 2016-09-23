
import StringStreamer from "../../src/streamer/string-streamer.js";
import JsonParser from "../../src/parser/json-parser.js";

import { assert } from 'chai';
import fs from 'fs';


describe('parser/json-parser', function() {


describe('parsing', function () {
    it('basic', function () {
        var path = __dirname + "/../data/sample.json";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var jsonParser = new JsonParser( streamer, { string: true } );
        return jsonParser.parse( function( json ){
            assert.strictEqual( 42, json.data.foo, "Passed!" );
        } );
    });
});


});
