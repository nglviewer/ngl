
import StringStreamer from "../../src/streamer/string-streamer.js";
import SdfParser from "../../src/parser/sdf-parser.js";

import { assert } from 'chai';
import fs from 'fs';


describe('parser/sdf-parser', function() {


describe('parsing', function () {
    it('basic', function () {
        var path = __dirname + "/../data/adrenalin.sdf";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var sdfParser = new SdfParser( streamer );
        sdfParser.parse( function( structure ){
            assert.strictEqual( structure.atomCount, 26 );
            assert.strictEqual( structure.bondCount, 26 );
        } );
    });
});


});
