
import TextParser from "../../../src/parser/text-parser.js";
import { autoLoad } from "../../../src/loader/loader-utils.js";


describe('parser/text-parser', function() {


describe('parsing', function () {
    it('basic async', function (done) {
        var path = "../../data/sample.txt";
        var sampleText = "Moin world!";
        autoLoad( path ).then( function( text ){
            assert.equal( sampleText, text.data, "Passed!" );
            done();
        } );
    });
});


});
