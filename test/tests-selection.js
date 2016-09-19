
import StringStreamer from "../src/streamer/string-streamer.js";
import PdbParser from "../src/parser/pdb-parser.js";
import CifParser from "../src/parser/cif-parser.js";
// eslint-disable-next-line no-unused-vars
import StructureView from "../src/structure/structure-view.js";
import Selection from "../src/selection.js";
import { kwd } from "../src/selection.js";

import { assert } from 'chai';
import fs from 'fs';


describe('selection', function() {


describe('parsing', function () {
    it('chain', function () {
        var sele = ":A";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": undefined,
            "rules": [
                { "chainname": "A" }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('chain resno range', function () {
        var sele = "1-100:A";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": "AND",
            "rules": [
                { "chainname": "A" },
                { "resno": [ 1, 100 ] }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('HOH or .OH', function () {
        var sele = "HOH or .OH";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": "OR",
            "rules": [
                { "resname": "HOH" },
                { "atomname": "OH" }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('modelindex', function () {
        var sele = "/1";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": undefined,
            "rules": [
                { "model": 1 }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('altloc', function () {
        var sele = "%A";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": undefined,
            "rules": [
                { "altloc": "A" }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('inscode', function () {
        var sele = "^C";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": undefined,
            "rules": [
                { "inscode": "C" }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('parens', function () {
        var sele = "10-15 or ( backbone and ( 30-35 or 40-45 ) )";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": "OR",
            "rules": [
                { "resno": [ 10, 15 ] },
                {
                    "operator": "AND",
                    "rules": [
                        { "keyword": kwd.BACKBONE },
                        {
                            "operator": "OR",
                            "rules": [
                                { "resno": [ 30, 35 ] },
                                { "resno": [ 40, 45 ] }
                            ]
                        }
                    ]
                }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('no parens', function () {
        var sele = "10-15 or backbone and 30-35 or 40-45";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": "OR",
            "rules": [
                { "resno": [ 10, 15 ] },
                {
                    "operator": "AND",
                    "rules": [
                        { "keyword": kwd.BACKBONE },
                        { "resno": [ 30, 35 ] }
                    ]
                },
                { "resno": [ 40, 45 ] }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('outer parens', function () {
        var sele = "( 10-15 or backbone )";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": "OR",
            "rules": [
                { "resno": [ 10, 15 ] },
                { "keyword": kwd.BACKBONE }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('parsing error resi', function () {
        var sele = "( foobar )";
        var selection = new Selection( sele );
        var selectionObj = {
            "error": "resi must be an integer"
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('parsing error atomname', function () {
        var sele = ".FOOBAR";
        var selection = new Selection( sele );
        var selectionObj = {
            "error": "atomname must be one to four characters"
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('parsing multi-char chain', function () {
        var sele = ":ABJ/0";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": "AND",
            "rules": [
                { "model": 0 },
                { "chainname": "ABJ" }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('parsing error model', function () {
        var sele = "/Q";
        var selection = new Selection( sele );
        var selectionObj = {
            "error": "model must be an integer"
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('parsing error resi range', function () {
        var sele = "1-2-3";
        var selection = new Selection( sele );
        var selectionObj = {
            "error": "resi range must contain one '-'"
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('negate simple', function () {
        var sele = "not 10-15";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": undefined,
            "negate": true,
            "rules": [
                { "resno": [ 10, 15 ] }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('negate or', function () {
        var sele = "MET or not 10-15";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": "OR",
            "rules": [
                { "resname": "MET" },
                {
                    "operator": undefined,
                    "negate": true,
                    "rules": [
                        { "resno": [ 10, 15 ] }
                    ]
                }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('negate parens', function () {
        var sele = "MET or not ( 10-15 )";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": "OR",
            "rules": [
                { "resname": "MET" },
                {
                    "operator": undefined,
                    "negate": true,
                    "rules": [
                        {
                            "operator": undefined,
                            "rules": [
                                { "resno": [ 10, 15 ] }
                            ]
                        }
                    ]
                }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('negate parens 2', function () {
        var sele = "MET or not ( 10-15 and 15-20 )";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": "OR",
            "rules": [
                { "resname": "MET" },
                {
                    "operator": undefined,
                    "negate": true,
                    "rules": [
                        {
                            "operator": "AND",
                            "rules": [
                                { "resno": [ 10, 15 ] },
                                { "resno": [ 15, 20 ] }
                            ]
                        }
                    ]
                }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('negate parens 3', function () {
        var sele = "MET or not ( 10-15 and 15-20 ) or GLU";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": "OR",
            "rules": [
                { "resname": "MET" },
                {
                    "operator": undefined,
                    "negate": true,
                    "rules": [
                        {
                            "operator": "AND",
                            "rules": [
                                { "resno": [ 10, 15 ] },
                                { "resno": [ 15, 20 ] }
                            ]
                        }
                    ]
                },
                { "resname": "GLU" },
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('negate parens 4', function () {
        var sele = "MET or not ( 10-15 and 15-20 ) and GLU";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": "OR",
            "rules": [
                { "resname": "MET" },
                {
                    "operator": "AND",
                    "rules": [
                        {
                            "operator": undefined,
                            "negate": true,
                            "rules": [
                                {
                                    "operator": "AND",
                                    "rules": [
                                        { "resno": [ 10, 15 ] },
                                        { "resno": [ 15, 20 ] }
                                    ]
                                },
                            ]
                        },
                        { "resname": "GLU" }
                    ]
                }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('negate parens 5', function () {
        var sele = "1-100 and not ( MET or GLU ) or 300-330";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": "OR",
            "rules": [
                {
                    "operator": "AND",
                    "rules": [
                        { "resno": [ 1, 100 ] },
                        {
                            "operator": undefined,
                            "negate": true,
                            "rules": [
                                {
                                    "operator": "OR",
                                    "rules": [
                                        { "resname": "MET" },
                                        { "resname": "GLU" }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                { "resno": [ 300, 330 ] }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('not backbone or .CA', function () {
        var sele = "not backbone or .CA";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": "OR",
            "rules": [
                {
                    "operator": undefined,
                    "negate": true,
                    "rules": [
                        { "keyword": kwd.BACKBONE }
                    ]
                },
                { "atomname": "CA" }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('.CA or not backbone', function () {
        var sele = ".CA or not backbone";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": "OR",
            "rules": [
                { "atomname": "CA" },
                {
                    "operator": undefined,
                    "negate": true,
                    "rules": [
                        { "keyword": kwd.BACKBONE }
                    ]
                }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('MET or GLY', function () {
        var sele = "MET or GLY";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": "OR",
            "rules": [
                { "resname": "MET" },
                { "resname": "GLY" }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('not ( MET ) or GLY', function () {
        var sele = "not ( MET ) or GLY";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": "OR",
            "rules": [
                {
                    "operator": undefined,
                    "negate": true,
                    "rules": [
                        {
                            "operator": undefined,
                            "rules": [
                                { "resname": "MET" }
                            ]
                        }
                    ]
                },
                { "resname": "GLY" }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('not ( MET or GLY )', function () {
        var sele = "not ( MET or GLY )";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": undefined,
            "negate": true,
            "rules": [
                {
                    "operator": "OR",
                    "rules": [
                        { "resname": "MET" },
                        { "resname": "GLY" }
                    ]
                }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('not ( MET )', function () {
        var sele = "not ( MET )";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": undefined,
            "negate": true,
            "rules": [
                {
                    "operator": undefined,
                    "rules": [
                        { "resname": "MET" }
                    ]
                }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('not not MET', function () {
        var sele = "not not MET";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": undefined,
            "negate": true,
            "rules": [
                {
                    "operator": undefined,
                    "negate": true,
                    "rules": [
                        { "resname": "MET" }
                    ]
                }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('not not not MET', function () {
        var sele = "not not not MET";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": undefined,
            "negate": true,
            "rules": [
                {
                    "operator": undefined,
                    "negate": true,
                    "rules": [
                        {
                            "operator": undefined,
                            "negate": true,
                            "rules": [
                                { "resname": "MET" }
                            ]
                        }
                    ]
                }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('MET or sidechain', function () {
        var sele = "MET or sidechain";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": "OR",
            "rules": [
                { "resname": "MET" },
                { "keyword": kwd.SIDECHAIN }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('MET or not sidechain', function () {
        var sele = "MET or not sidechain";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": "OR",
            "rules": [
                { "resname": "MET" },
                {
                    "operator": undefined,
                    "negate": true,
                    "rules": [
                        { "keyword": kwd.SIDECHAIN }
                    ]
                }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('element H', function () {
        var sele = "#H";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": undefined,
            "rules": [
                { "element": "H" }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('(CYS and .CA) or (CYS and hydrogen)', function () {
        var sele = "(CYS and .CA) or (CYS and hydrogen)";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": "OR",
            "rules": [
                {
                    "operator": "AND",
                    "rules": [
                        { "resname": "CYS" },
                        { "atomname": "CA" }
                    ]
                },
                {
                    "operator": "AND",
                    "rules": [
                        { "resname": "CYS" },
                        { "element": "H" }
                    ]
                }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('atomindex @1,2,3', function () {
        var sele = "@1,2,3";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": undefined,
            "rules": [
                {
                    "atomindex": [ 1, 2, 3 ],
                    "atomindexFirst": 1,
                    "atomindexLast": 3
                }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('atomindex @1,13,2 OR protein', function () {
        var sele = "@1,13,2 OR protein";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": "OR",
            "rules": [
                {
                    "atomindex": [ 1, 2, 13 ],
                    "atomindexFirst": 1,
                    "atomindexLast": 13
                },
                { "keyword": kwd.PROTEIN }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('atomindex @0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19', function () {
        var sele = "@0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": undefined,
            "rules": [
                {
                    "atomindex": [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19 ],
                    "atomindexFirst": 0,
                    "atomindexLast": 19
                }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('[123]', function () {
        var sele = "[123]";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": undefined,
            "rules": [
                { "resname": "123" }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('15^C:A.N%A/0', function () {
        var sele = "15^C:A.N%A/0";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": "AND",
            "rules": [
                { "model": 0 },
                { "altloc": "A" },
                { "atomname": "N" },
                { "chainname": "A" },
                { "inscode": "C" },
                { "resno": 15 }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('negative resno -143', function () {
        var sele = "-143";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": undefined,
            "rules": [
                { "resno": -143 }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('negative resno range -12-14', function () {
        var sele = "-12-14";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": undefined,
            "rules": [
                { "resno": [ -12, 14 ] }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });

    it('negative resno range -12--8', function () {
        var sele = "-12--8";
        var selection = new Selection( sele );
        var selectionObj = {
            "operator": undefined,
            "rules": [
                { "resno": [ -12, -8 ] }
            ]
        };
        assert.deepEqual( selection.selection, selectionObj );
    });
});


function getNthSelectedAtom( structure, nth ){
    var i = 0;
    var atomProxy = structure.getAtomProxy();
    structure.eachAtom( function( ap ){
        if( i === nth ) atomProxy.index = ap.index;
        ++i;
    } );
    return atomProxy;
}


describe('selection', function () {

    var _1crnPdb;

    before(function() {
        _1crnPdb = fs.readFileSync( __dirname + "/data/1crn.pdb", "utf-8" );
    });

    it('backbone', function () {
        var sele = "backbone";
        var selection = new Selection( sele );
        var streamer = new StringStreamer( _1crnPdb );
        var pdbParser = new PdbParser( streamer );
        pdbParser.parse( function( structure ){
            var sview = structure.getView( selection );
            var ap = getNthSelectedAtom( sview, 0 );
            assert.strictEqual( sview.atomCount, 185, "Passed!" );
            assert.strictEqual( ap.atomname, "N", "Passed!" );
        } );
    });

    it('.CA', function () {
        var sele = ".CA";
        var selection = new Selection( sele );
        var streamer = new StringStreamer( _1crnPdb );
        var pdbParser = new PdbParser( streamer );
        pdbParser.parse( function( structure ){
            var sview = structure.getView( selection );
            var ap = getNthSelectedAtom( sview, 30 );
            assert.strictEqual( sview.atomCount, 46, "Passed!" );
            assert.strictEqual( ap.atomname, "CA", "Passed!" );
        } );
    });

    it('ARG or .N', function () {
        var sele = "ARG or .N";
        var selection = new Selection( sele );
        var streamer = new StringStreamer( _1crnPdb );
        var pdbParser = new PdbParser( streamer );
        pdbParser.parse( function( structure ){
            var sview = structure.getView( selection );
            assert.strictEqual( sview.atomCount, 22 + 46 - 2, "Passed!" );
        } );
    });

    it('not backbone', function () {
        var sele = "not backbone";
        var selection = new Selection( sele );
        var streamer = new StringStreamer( _1crnPdb );
        var pdbParser = new PdbParser( streamer );
        pdbParser.parse( function( structure ){
            var sview = structure.getView( selection );
            var ap = getNthSelectedAtom( sview, 0 );
            assert.strictEqual( sview.atomCount, 142, "Passed!" );
            assert.strictEqual( ap.atomname, "CB", "Passed!" );
        } );
    });

    it('sidechain', function () {
        var sele = "sidechain";
        var selection = new Selection( sele );
        var streamer = new StringStreamer( _1crnPdb );
        var pdbParser = new PdbParser( streamer );
        pdbParser.parse( function( structure ){
            var sview = structure.getView( selection );
            var ap = getNthSelectedAtom( sview, 0 );
            assert.strictEqual( sview.atomCount, 142, "Passed!" );
            assert.strictEqual( ap.atomname, "CB", "Passed!" );
        } );
    });

    it('not backbone or .CA', function () {
        var sele = "not backbone or .CA";
        var selection = new Selection( sele );
        var streamer = new StringStreamer( _1crnPdb );
        var pdbParser = new PdbParser( streamer );
        pdbParser.parse( function( structure ){
            var sview = structure.getView( selection );
            var ap1 = getNthSelectedAtom( sview, 0 );
            var ap2 = getNthSelectedAtom( sview, 1 );
            assert.strictEqual( sview.atomCount, 188, "Passed!" );
            assert.strictEqual( ap1.atomname, "CA", "Passed!" );
            assert.strictEqual( ap2.atomname, "CB", "Passed!" );
        } );
    });

    it('TYR vs not not TYR', function () {
        var selection1 = new Selection( "TYR" );
        var selection2 = new Selection( "not not TYR" );
        var streamer = new StringStreamer( _1crnPdb );
        var pdbParser = new PdbParser( streamer );
        pdbParser.parse( function( structure ){
            var sview1 = structure.getView( selection1 );
            var sview2 = structure.getView( selection2 );
            assert.strictEqual( sview1.atomCount, sview2.atomCount, "Passed!" );
        } );
    });

    it('not ( 12 and .CA ) vs not ( 12.CA )', function () {
        var selection1 = new Selection( "not ( 12 and .CA )" );
        var selection2 = new Selection( "not ( 12.CA )" );
        var streamer = new StringStreamer( _1crnPdb );
        var pdbParser = new PdbParser( streamer );
        pdbParser.parse( function( structure ){
            var sview1 = structure.getView( selection1 );
            var sview2 = structure.getView( selection2 );
            assert.strictEqual( sview1.atomCount, sview2.atomCount, "Passed!" );
        } );
    });

    it('/1 PDB', function () {
        var sele = "/1";
        var selection = new Selection( sele );
        var path = __dirname + "/data/1LVZ.pdb";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var pdbParser = new PdbParser( streamer );
        pdbParser.parse( function( structure ){
            var sview = structure.getView( selection );
            var ap1 = getNthSelectedAtom( sview, 0 );
            var ap2 = getNthSelectedAtom( sview, sview.atomCount - 1 );
            assert.strictEqual( ap1.modelIndex, 1, "Passed!" );
            assert.strictEqual( ap2.modelIndex, 1, "Passed!" );
        } );
    });

    it('/1 CIF', function () {
        var sele = "/1";
        var selection = new Selection( sele );
        var path = __dirname + "/data/1LVZ.cif";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var cifParser = new CifParser( streamer );
        cifParser.parse( function( structure ){
            var sview = structure.getView( selection );
            var ap1 = getNthSelectedAtom( sview, 0 );
            var ap2 = getNthSelectedAtom( sview, sview.atomCount - 1 );
            assert.strictEqual( ap1.modelIndex, 1, "Passed!" );
            assert.strictEqual( ap2.modelIndex, 1, "Passed!" );
        } );
    });

    it('atomindex', function () {
        var sele = "@1,8,12";
        var selection = new Selection( sele );
        var streamer = new StringStreamer( _1crnPdb );
        var pdbParser = new PdbParser( streamer );
        pdbParser.parse( function( structure ){
            var sview = structure.getView( selection );
            var ap1 = getNthSelectedAtom( sview, 0 );
            var ap2 = getNthSelectedAtom( sview, 1 );
            var ap3 = getNthSelectedAtom( sview, 2 );
            assert.strictEqual( sview.atomCount, 3, "Passed!" );
            assert.strictEqual( ap1.index, 1, "Passed!" );
            assert.strictEqual( ap2.index, 8, "Passed!" );
            assert.strictEqual( ap3.index, 12, "Passed!" );
        } );
    });

    it('lowercase resname', function () {
        var sele = "phe";
        var selection = new Selection( sele );
        var path = __dirname + "/data/lowerCaseResname.pdb";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var pdbParser = new PdbParser( streamer );
        pdbParser.parse( function( structure ){
            var sview = structure.getView( selection );
            assert.strictEqual( sview.atomCount, 13, "Passed!" );
        } );
    });
});


});
