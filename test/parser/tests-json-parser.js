
import JsonParser from "../../src/parser/json-parser.js";
import { autoLoad } from "../../src/loader/loader-utils.js";

import { assert } from 'chai';


describe('parser/json-parser', function() {


describe('parsing', function () {
    it('basic async', function () {
        var path = "../../data/sample.json";
        return autoLoad( path ).then( function( json ){
            assert.strictEqual( 42, json.data.foo, "Passed!" );
        } );
    });

    it('binary async', function () {
        var path = "../../data/sample.json";
        return autoLoad( path, { binary: true } ).then( function( json ){
           assert. strictEqual( 42, json.data.foo, "Passed!" );
        } );
    });
});


});
