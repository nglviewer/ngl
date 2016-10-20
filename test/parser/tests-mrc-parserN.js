
import BinaryStreamer from "../../src/streamer/binary-streamer.js";
import MrcParser from "../../src/parser/mrc-parser.js";

import { assert } from 'chai';
import fs from 'fs';


describe('parser/mrc-parser', function() {


describe('parsing', function () {
    it.skip('basic', function () {
        var path = __dirname + "/../data/TODO.mrc";
        var bin = fs.readFileSync( path );
        var streamer = new BinaryStreamer( bin );
        var mrcParser = new MrcParser( streamer );
        mrcParser.parse( function( volume ){
            assert.strictEqual( volume.nx, 40 );
            assert.strictEqual( volume.ny, 40 );
            assert.strictEqual( volume.nz, 40 );
        } );
    });
});


});
