
import StringStreamer from "../../src/streamer/string-streamer.js";
import PlyParser from "../../src/parser/ply-parser.js";

import { assert } from 'chai';
import fs from 'fs';


describe('parser/ply-parser', function() {


describe('parsing', function () {
    it('basic', function () {
        var path = __dirname + "/../data/cube.ply";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var plyParser = new PlyParser( streamer );
        plyParser.parse( function( surface ){
            assert.strictEqual( surface.size, 36 );
            assert.strictEqual( surface.position.length, 108 );
            assert.strictEqual( surface.normal.length, 108 );
        } );
    });
});


});
