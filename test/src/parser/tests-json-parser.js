
import JsonParser from "../../../src/parser/json-parser.js";
import { autoLoad } from "../../../src/loader/loader-utils.js";


describe('parser/json-parser', function() {


describe('parsing', function () {
    it('basic async', function (done) {
        var path = "../../data/sample.json";
        autoLoad( path ).then( function( json ){
            assert.equal( 42, json.data.foo, "Passed!" );
            done();
        } );
    });

    it('binary async', function (done) {
        var path = "../../data/sample.json";
        autoLoad( path, { binary: true } ).then( function( json ){
            assert.equal( 42, json.data.foo, "Passed!" );
            done();
        } );
    });
});


});
