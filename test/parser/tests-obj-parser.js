
import StringStreamer from "../../src/streamer/string-streamer.js";
import ObjParser from "../../src/parser/obj-parser.js";

import { assert } from 'chai';
import fs from 'fs';


describe('parser/obj-parser', function() {


describe('parsing', function () {
    it('basic', function () {
        var path = __dirname + "/../data/cube.obj";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var objParser = new ObjParser( streamer );
        objParser.parse( function( surface ){
            assert.strictEqual( surface.size, 36 );
            assert.strictEqual( surface.position.length, 108 );
            assert.strictEqual( surface.normal.length, 108 );
        } );
    });
});


});
