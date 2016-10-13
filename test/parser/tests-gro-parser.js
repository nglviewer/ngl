
import StringStreamer from "../../src/streamer/string-streamer.js";
import GroParser from "../../src/parser/gro-parser.js";

import { assert } from 'chai';
import fs from 'fs';


describe('parser/gro-parser', function() {


describe('parsing', function () {
    it('basic', function () {
        var path = __dirname + "/../data/1crn.gro";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var groParser = new GroParser( streamer );
        groParser.parse( function( structure ){
            assert.strictEqual( structure.atomCount, 327 );
            assert.strictEqual( structure.bondCount, 334 );
        } );
    });
});


});
