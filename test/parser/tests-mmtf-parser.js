
import BinaryStreamer from "../../src/streamer/binary-streamer.js";
import MmtfParser from "../../src/parser/mmtf-parser.js";

import { assert } from 'chai';
import fs from 'fs';


describe('parser/mmtf-parser', function() {


describe('parsing', function () {
    it('basic', function () {
        var path = __dirname + "/../data/1crn.mmtf";
        var bin = fs.readFileSync( path );
        var streamer = new BinaryStreamer( bin );
        var mmtfParser = new MmtfParser( streamer );
        mmtfParser.parse( function( structure ){
            assert.strictEqual( structure.atomCount, 327 );
            assert.strictEqual( structure.bondCount, 337 );
        } );
    });
});


});
