
import StringStreamer from "../../src/streamer/string-streamer.js";
import CubeParser from "../../src/parser/cube-parser.js";

import { assert } from 'chai';
import fs from 'fs';


describe('parser/cube-parser', function() {


describe('parsing', function () {
    it('basic', function () {
        var path = __dirname + "/../data/h2o-elf.cube";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var cubeParser = new CubeParser( streamer );
        cubeParser.parse( function( volume ){
            assert.strictEqual( volume.nx, 40 );
            assert.strictEqual( volume.ny, 40 );
            assert.strictEqual( volume.nz, 40 );
        } );
    });
});


});
