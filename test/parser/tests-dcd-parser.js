
import BinaryStreamer from "../../src/streamer/binary-streamer.js";
import DcdParser from "../../src/parser/dcd-parser.js";

import { assert } from 'chai';
import fs from 'fs';


describe('parser/dcd-parser', function() {


describe('parsing', function () {
    it('basic', function () {
        var path = __dirname + "/../data/ala3.dcd";
        var bin = fs.readFileSync( path );
        var streamer = new BinaryStreamer( bin );
        var dcdParser = new DcdParser( streamer );
        dcdParser.parse( function( frames ){
            assert.strictEqual( frames.coordinates.length, 256 );
            assert.strictEqual( frames.coordinates[ 0 ].length, 126 );
            assert.strictEqual( frames.boxes.length, 0 );
        } );
    });
});


});
