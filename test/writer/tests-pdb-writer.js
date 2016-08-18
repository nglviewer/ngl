
import PdbParser from "../../src/parser/pdb-parser.js";
import { autoLoad } from "../../src/loader/loader-utils.js";
import PdbWriter from "../../src/writer/pdb-writer.js";

import { assert } from 'chai';


describe('writer/pdb-writer', function() {


describe('writing', function () {
    it('getString', function () {
        var path = "../../data/1crn.pdb";
        return autoLoad( path ).then( function( structure ){
            var pdbWriter = new PdbWriter( structure );
            var string = pdbWriter.getString();
            assert.strictEqual( string.length, 26156 );
            var lines = string.split( "\n" );
            assert.strictEqual( lines.length, 331 );
        } );
    });

    it('getBlob', function () {
        var path = "../../data/1crn.pdb";
        return autoLoad( path ).then( function( structure ){
            var pdbWriter = new PdbWriter( structure );
            var blob = pdbWriter.getBlob();
            assert.strictEqual( blob.type, "text/plain" );
            assert.strictEqual( blob.size, 26156 );
        } );
    });
});


});
