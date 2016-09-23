
import StringStreamer from "../../src/streamer/string-streamer.js";
import CifParser from "../../src/parser/cif-parser.js";

import { assert } from 'chai';
import fs from 'fs';


describe('parser/cif-parser', function() {


describe('parsing', function () {
    it('basic/mmcif', function () {
        var path = __dirname + "/../data/1CRN.cif";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var cifParser = new CifParser( streamer );
        cifParser.parse( function( structure ){
            assert.strictEqual( structure.atomCount, 327 );
            assert.strictEqual( structure.bondCount, 337 );
        } );
    });

    it('basic/chemComp', function () {
        var path = __dirname + "/../data/PRDCC_000001.cif";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var cifParser = new CifParser( streamer );
        cifParser.parse( function( structure ){
            assert.strictEqual( structure.atomCount, 352 );
            assert.strictEqual( structure.bondCount, 364 );
        } );
    });
});


});
