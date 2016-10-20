
import StringStreamer from "../../src/streamer/string-streamer.js";
import PdbParser from "../../src/parser/pdb-parser.js";

import { assert } from 'chai';
import fs from 'fs';


describe('structure/structure', function() {


describe('iteration', function () {
    it('polymer no chains', function () {
        var path = __dirname + "/../data/BaceCgProteinAtomistic.pdb";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var pdbParser = new PdbParser( streamer );
        pdbParser.parse( function( structure ){
            var i = 0;
            structure.eachPolymer( function(){
                i += 1;
            } );
            assert.strictEqual( i, 3, "Passed!" );
        } );
    });
});


});
