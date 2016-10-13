
import StringStreamer from "../../src/streamer/string-streamer.js";
import PdbParser from "../../src/parser/pdb-parser.js";
import PdbWriter from "../../src/writer/pdb-writer.js";

import { assert } from 'chai';
import fs from 'fs';


describe('writer/pdb-writer', function() {


describe('writing', function () {
    it('getString', function () {
        var path = __dirname + "/../data/1crn.pdb";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var pdbParser = new PdbParser( streamer );
        pdbParser.parse( function( structure ){
            var pdbWriter = new PdbWriter( structure );
            var string = pdbWriter.getString();
            assert.strictEqual( string.length, 26156 );
            var lines = string.split( "\n" );
            assert.strictEqual( lines.length, 331 );
        } );
    });

    it.skip('getBlob', function () {
        var path = __dirname + "/../data/1crn.pdb";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var pdbParser = new PdbParser( streamer );
        pdbParser.parse( function( structure ){
            var pdbWriter = new PdbWriter( structure );
            var blob = pdbWriter.getBlob();
            assert.strictEqual( blob.type, "text/plain" );
            assert.strictEqual( blob.size, 26156 );
        } );
    });
});


});
