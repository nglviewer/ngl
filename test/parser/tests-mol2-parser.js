
import StringStreamer from "../../src/streamer/string-streamer.js";
import Mol2Parser from "../../src/parser/mol2-parser.js";

import { assert } from 'chai';
import fs from 'fs';


describe('parser/mol2-parser', function() {


describe('parsing', function () {
    it('basic', function () {
        var path = __dirname + "/../data/adrenalin.mol2";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var mol2Parser = new Mol2Parser( streamer );
        mol2Parser.parse( function( structure ){
            assert.strictEqual( structure.atomCount, 26 );
            assert.strictEqual( structure.bondCount, 26 );
        } );
    });
});


});
