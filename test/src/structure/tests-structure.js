
import { autoLoad } from "../../../src/loader/loader-utils.js";


describe('structure/structure', function() {


describe('iteration', function () {
    it('polymer no chains', function (done) {
        var path = "../../data/BaceCgProteinAtomistic.pdb";
        autoLoad( path ).then( function( structure ){
            var i = 0;
            structure.eachPolymer( function( p ){
                i += 1;
            } );
            assert.equal( i, 3, "Passed!" );
            done();
        } );
    });
});


});
