
import BinaryStreamer from "../../src/streamer/binary-streamer.js";
import DxbinParser from "../../src/parser/dxbin-parser.js";

import { assert } from 'chai';
import fs from 'fs';


describe('parser/dxbin-parser', function() {


describe('parsing', function () {
    it.skip('basic', function () {
        var path = __dirname + "/../data/TODO.dxbin";
        var bin = fs.readFileSync( path );
        var streamer = new BinaryStreamer( bin );
        var dxbinParser = new DxbinParser( streamer );
        dxbinParser.parse( function( volume ){
            assert.strictEqual( volume.nx, 40 );
            assert.strictEqual( volume.ny, 40 );
            assert.strictEqual( volume.nz, 40 );
        } );
    });
});


});
