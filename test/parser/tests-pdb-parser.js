
import PdbParser from "../../src/parser/pdb-parser.js";
import { autoLoad } from "../../src/loader/loader-utils.js";

import { assert } from 'chai';


describe('parser/pdb-parser', function() {


describe('parsing', function () {
    it('double bonds', function () {
        var path = "../data/doubleBonds.pdb";
        return autoLoad( path ).then( function( structure ){
            var bs = structure.bondStore;
            assert.strictEqual( bs.atomIndex1[ 0 ], 0 );
            assert.strictEqual( bs.atomIndex2[ 0 ], 1 );
            assert.strictEqual( bs.bondOrder[ 0 ], 1 );
            assert.strictEqual( bs.atomIndex1[ 25 ], 8 );
            assert.strictEqual( bs.atomIndex2[ 25 ], 13 );
            assert.strictEqual( bs.bondOrder[ 25 ], 2 );
            assert.strictEqual( bs.atomIndex1[ 26 ], 9 );
            assert.strictEqual( bs.atomIndex2[ 26 ], 8 );
            assert.strictEqual( bs.bondOrder[ 26 ], 1 );
        } );
    });
});


});
