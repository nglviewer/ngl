
import PdbParser from "../../src/parser/pdb-parser.js";
import { autoLoad } from "../../src/loader/loader-utils.js";

import { assert } from 'chai';


describe('structure/structure', function() {


describe('iteration', function () {
    it('polymer no chains', function () {
        var path = "../../data/BaceCgProteinAtomistic.pdb";
        return autoLoad( path ).then( function( structure ){
            var i = 0;
            structure.eachPolymer( function( p ){
                i += 1;
            } );
            assert.strictEqual( i, 3, "Passed!" );
        } );
    });
});


});
