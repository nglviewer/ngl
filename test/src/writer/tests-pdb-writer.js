
import { autoLoad } from "../../../src/loader/loader-utils.js";
import PdbWriter from "../../../src/writer/pdb-writer.js";


describe('writer/pdb-writer', function() {


describe('writing', function () {
    it('getString', function (done) {
        var path = "../../data/1crn.pdb";
        autoLoad( path ).then( function( structure ){
            var pdbWriter = new PdbWriter( structure );
            var string = pdbWriter.getString();
            assert.equal( string.length, 26156 );
            var lines = string.split( "\n" );
            assert.equal( lines.length, 331 );
            done();
        } );
    });

    it('getBlob', function (done) {
        var path = "../../data/1crn.pdb";
        autoLoad( path ).then( function( structure ){
            var pdbWriter = new PdbWriter( structure );
            var blob = pdbWriter.getBlob();
            assert.equal( blob.type, "text/plain" );
            assert.equal( blob.size, 26156 );
            done();
        } );
    });
});


});
