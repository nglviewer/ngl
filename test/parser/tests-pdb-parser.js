
import StringStreamer from "../../src/streamer/string-streamer.js";
import PdbParser from "../../src/parser/pdb-parser.js";

import { assert } from 'chai';
import fs from 'fs';


describe('parser/pdb-parser', function() {


describe('parsing', function () {
    it('double bonds', function () {
        var path = __dirname + "/../data/doubleBonds.pdb";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var pdbParser = new PdbParser( streamer );
        pdbParser.parse( function( structure ){
            var bs = structure.bondStore;
            assert.strictEqual( bs.atomIndex1[ 0 ], 0 );
            assert.strictEqual( bs.atomIndex2[ 0 ], 1 );
            assert.strictEqual( bs.bondOrder[ 0 ], 1 );
            assert.strictEqual( bs.atomIndex1[ 25 ], 18 );
            assert.strictEqual( bs.atomIndex2[ 25 ], 19 );
            assert.strictEqual( bs.bondOrder[ 25 ], 1 );
            assert.strictEqual( bs.atomIndex1[ 26 ], 19 );
            assert.strictEqual( bs.atomIndex2[ 26 ], 20 );
            assert.strictEqual( bs.bondOrder[ 26 ], 2 );
        } );
    });
});


});
