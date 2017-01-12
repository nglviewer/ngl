
// eslint-disable-next-line no-unused-vars
import StructureView from "../../src/structure/structure-view.js";
import StringStreamer from "../../src/streamer/string-streamer.js";
import PdbParser from "../../src/parser/pdb-parser.js";
import GroParser from "../../src/parser/gro-parser.js";
import CifParser from "../../src/parser/cif-parser.js";
import Selection from "../../src/selection.js";

import { assert } from 'chai';
import fs from 'fs';


describe('structure/structure-view', function() {


describe('initialization', function () {

    var _BaceCgProteinAtomistic;

    before(function() {
        _BaceCgProteinAtomistic = fs.readFileSync(
            __dirname + "/../data/BaceCgProteinAtomistic.pdb", "utf-8"
        );
    });

    it('basic selection', function () {
        var streamer = new StringStreamer( _BaceCgProteinAtomistic );
        var pdbParser = new PdbParser( streamer );
        pdbParser.parse( function( structure ){
            var selection = new Selection( "10-30" );
            var sview = structure.getView( selection );
            assert.strictEqual( structure.atomStore.count, 774, "Passed!" );
            assert.strictEqual( sview.atomCount, 211, "Passed!" );
        } );
    });

    it('selection with not', function () {
        var streamer = new StringStreamer( _BaceCgProteinAtomistic );
        var pdbParser = new PdbParser( streamer );
        pdbParser.parse( function( structure ){
            var selection = new Selection( "not 10-30" );
            var sview = structure.getView( selection );
            assert.strictEqual( structure.atomStore.count, 774, "Passed!" );
            assert.strictEqual( sview.atomCount, 563, "Passed!" );
        } );
    });

    it('selection relying on automatic chain names', function () {
        var path = __dirname + "/../data/Bace1Trimer-inDPPC.gro";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var groParser = new GroParser( streamer );
        groParser.parse( function( structure ){
            var selection = new Selection( ":A" );
            var sview = structure.getView( selection );
            assert.strictEqual( structure.atomStore.count, 52661, "Passed!" );
            assert.strictEqual( sview.atomCount, 258, "Passed!" );
        } );
    });

    it('selection with chains', function () {
        var path = __dirname + "/../data/3SN6.cif";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var cifParser = new CifParser( streamer );
        cifParser.parse( function( structure ){
            var selection = new Selection( "30-341:R or 384-394:A" );
            var sview = structure.getView( selection );
            assert.strictEqual( structure.atomStore.count, 10274, "Passed!" );
            assert.strictEqual( sview.atomCount, 2292, "Passed!" );
        } );
    });
});


});
