
import TextParser from "../../src/parser/text-parser.js";
import { autoLoad } from "../../src/loader/loader-utils.js";

import { assert } from 'chai';


describe('parser/text-parser', function() {


describe('parsing', function () {
    it('basic async', function () {
        var path = "../../data/sample.txt";
        var sampleText = "Moin world!";
        return autoLoad( path ).then( function( text ){
            assert.strictEqual( sampleText, text.data, "Passed!" );
        } );
    });
});


});
