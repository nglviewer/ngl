
import PdbParser from "../../../src/parser/pdb-parser.js";
import { autoLoad } from "../../../src/loader/loader-utils.js";


describe('parser/pdb-parser', function() {


describe('parsing', function () {
    it('double bonds', function (done) {
        var path = "../data/doubleBonds.pdb";
        autoLoad( path ).then( function( structure ){
            var bs = structure.bondStore;
            assert.equal( bs.atomIndex1[ 0 ], 0 );
            assert.equal( bs.atomIndex2[ 0 ], 1 );
            assert.equal( bs.bondOrder[ 0 ], 1 );
            assert.equal( bs.atomIndex1[ 25 ], 8 );
            assert.equal( bs.atomIndex2[ 25 ], 13 );
            assert.equal( bs.bondOrder[ 25 ], 2 );
            assert.equal( bs.atomIndex1[ 26 ], 9 );
            assert.equal( bs.atomIndex2[ 26 ], 8 );
            assert.equal( bs.bondOrder[ 26 ], 1 );
            done();
        } );
    });
});


});
