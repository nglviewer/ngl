

QUnit.module( "selection parse" );


QUnit.test( "chain", function( assert ) {

    var sele = ":A";

    var selection = new NGL.Selection( sele );

    var selectionObj = {
        "operator": undefined,
        "rules": [
            { "chainname": "A" }
        ]
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "chain resno range", function( assert ) {

    var sele = "1-100:A";

    var selection = new NGL.Selection( sele );

    var selectionObj = {
        "operator": undefined,
        "rules": [
            {
                "chainname": "A",
                "resno": [ 1, 100 ]
            }
        ]
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "parens", function( assert ) {

    var sele = "10-15 or ( backbone and ( 30-35 or 40-45 ) )";

    var selection = new NGL.Selection( sele );

    var selectionObj = {
        "operator": "OR",
        "rules": [
            { "resno": [ 10, 15 ] },
            {
                "operator": "AND",
                "rules": [
                    { "keyword": "BACKBONE" },
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

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "no parens", function( assert ) {

    var sele = "10-15 or backbone and 30-35 or 40-45";

    var selection = new NGL.Selection( sele );

    var selectionObj = {
        "operator": "OR",
        "rules": [
            { "resno": [ 10, 15 ] },
            {
                "operator": "AND",
                "rules": [
                    { "keyword": "BACKBONE" },
                    { "resno": [ 30, 35 ] }
                ]
            },
            { "resno": [ 40, 45 ] }
        ]
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "outer parens", function( assert ) {

    var sele = "( 10-15 or backbone )";

    var selection = new NGL.Selection( sele );

    var selectionObj = {
        "operator": "OR",
        "rules": [
            { "resno": [ 10, 15 ] },
            { "keyword": "BACKBONE" }
        ]
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "parsing error resi", function( assert ) {

    var sele = "( foobar )";

    var selection = new NGL.Selection( sele );

    var selectionObj = {
        "error": "resi must be an integer"
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "parsing error atomname", function( assert ) {

    var sele = ".FOOBAR";

    var selection = new NGL.Selection( sele );

    var selectionObj = {
        "error": "atomname must be one to four characters"
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "parsing error chain", function( assert ) {

    var sele = ":FOO";

    var selection = new NGL.Selection( sele );

    var selectionObj = {
        "error": "chain identifier must be one character"
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "parsing error model", function( assert ) {

    var sele = "/Q";

    var selection = new NGL.Selection( sele );

    var selectionObj = {
        "error": "model must be an integer"
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "parsing error resi range", function( assert ) {

    var sele = "1-2-3";

    var selection = new NGL.Selection( sele );

    var selectionObj = {
        "error": "resi range must contain one '-'"
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "negate simple", function( assert ) {

    var sele = "not 10-15";

    var selection = new NGL.Selection( sele );

    var selectionObj = {
        "operator": undefined,
        "negate": true,
        "rules": [
            { "resno": [ 10, 15 ] }
        ]
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "negate or", function( assert ) {

    var sele = "MET or not 10-15";

    var selection = new NGL.Selection( sele );

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

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "negate parens", function( assert ) {

    var sele = "MET or not ( 10-15 )";

    var selection = new NGL.Selection( sele );

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

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "negate parens 2", function( assert ) {

    var sele = "MET or not ( 10-15 and 15-20 )";

    var selection = new NGL.Selection( sele );

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

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "negate parens 3", function( assert ) {

    var sele = "MET or not ( 10-15 and 15-20 ) or GLU";

    var selection = new NGL.Selection( sele );

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

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "negate parens 4", function( assert ) {

    var sele = "MET or not ( 10-15 and 15-20 ) and GLU";

    var selection = new NGL.Selection( sele );

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

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "negate parens 5", function( assert ) {

    var sele = "1-100 and not ( MET or GLU ) or 300-330";

    var selection = new NGL.Selection( sele );

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

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "not backbone or .CA", function( assert ) {

    var sele = "not backbone or .CA";

    var selection = new NGL.Selection( sele );

    var selectionObj = {
        "operator": "OR",
        "rules": [
            {
                "operator": undefined,
                "negate": true,
                "rules": [
                    { "keyword": "BACKBONE" }
                ]
            },
            { "atomname": "CA" }
        ]
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( ".CA or not backbone", function( assert ) {

    var sele = ".CA or not backbone";

    var selection = new NGL.Selection( sele );

    var selectionObj = {
        "operator": "OR",
        "rules": [
            { "atomname": "CA" },
            {
                "operator": undefined,
                "negate": true,
                "rules": [
                    { "keyword": "BACKBONE" }
                ]
            }
        ]
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "MET or GLY", function( assert ) {

    var sele = "MET or GLY";

    var selection = new NGL.Selection( sele );

    var selectionObj = {
        "operator": "OR",
        "rules": [
            { "resname": "MET" },
            { "resname": "GLY" }
        ]
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "not ( MET ) or GLY", function( assert ) {

    var sele = "not ( MET ) or GLY";

    var selection = new NGL.Selection( sele );

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

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "not ( MET or GLY )", function( assert ) {

    var sele = "not ( MET or GLY )";

    var selection = new NGL.Selection( sele );

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

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "not ( MET )", function( assert ) {

    var sele = "not ( MET )";

    var selection = new NGL.Selection( sele );

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

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "not not MET", function( assert ) {

    var sele = "not not MET";

    var selection = new NGL.Selection( sele );

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

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "not not not MET", function( assert ) {

    var sele = "not not not MET";

    var selection = new NGL.Selection( sele );

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

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "MET or sidechain", function( assert ) {

    var sele = "MET or sidechain";

    var selection = new NGL.Selection( sele );

    var selectionObj = {
        "operator": "OR",
        "rules": [
            { "resname": "MET" },
            {
                "operator": undefined,
                "negate": true,
                "rules": [
                    { "keyword": "BACKBONE" }
                ]
            }
        ]
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "MET or not sidechain", function( assert ) {

    var sele = "MET or not sidechain";

    var selection = new NGL.Selection( sele );

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
                        "negate": true,
                        "rules": [
                            { "keyword": "BACKBONE" }
                        ]
                    }
                ]
            }
        ]
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "element H", function( assert ) {

    var sele = "#H";

    var selection = new NGL.Selection( sele );

    var selectionObj = {
        "operator": undefined,
        "rules": [
            { "element": "H" }
        ]
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.module( "selection test" );


QUnit.asyncTest( "backbone", function( assert ) {

    var sele = "backbone";

    var selection = new NGL.Selection( sele );

    var path = "../../data/__example__/1crn.pdb";

    NGL.autoLoad( path, function( structure ){

        var atomSet = new NGL.AtomSet( structure, selection );

        assert.equal( atomSet.atomCount, 184, "Passed!" );
        assert.equal( atomSet.atoms[ 0 ].atomname, "N", "Passed!" );
        
        QUnit.start()

    } );

});


QUnit.asyncTest( ".CA", function( assert ) {

    var sele = ".CA";

    var selection = new NGL.Selection( sele );

    var path = "../../data/__example__/1crn.pdb";

    NGL.autoLoad( path, function( structure ){

        var atomSet = new NGL.AtomSet( structure, selection );

        assert.equal( atomSet.atomCount, 46, "Passed!" );
        assert.equal( atomSet.atoms[ 30 ].atomname, "CA", "Passed!" );
        
        QUnit.start()

    } );

});


QUnit.asyncTest( "not backbone", function( assert ) {

    var sele = "not backbone";

    var selection = new NGL.Selection( sele );

    var path = "../../data/__example__/1crn.pdb";

    NGL.autoLoad( path, function( structure ){

        var atomSet = new NGL.AtomSet( structure, selection );

        assert.equal( atomSet.atomCount, 143, "Passed!" );
        assert.equal( atomSet.atoms[ 0 ].atomname, "CB", "Passed!" );
        
        QUnit.start()

    } );

});


QUnit.asyncTest( "not backbone or .CA", function( assert ) {

    var sele = "not backbone or .CA";

    var selection = new NGL.Selection( sele );

    var path = "../../data/__example__/1crn.pdb";

    NGL.autoLoad( path, function( structure ){

        var atomSet = new NGL.AtomSet( structure, selection );

        assert.equal( atomSet.atomCount, 189, "Passed!" );
        assert.equal( atomSet.atoms[ 0 ].atomname, "CA", "Passed!" );
        assert.equal( atomSet.atoms[ 1 ].atomname, "CB", "Passed!" );
        
        QUnit.start()

    } );

});


QUnit.asyncTest( "TYR vs not not TYR", function( assert ) {

    var selection1 = new NGL.Selection( "TYR" );
    var selection2 = new NGL.Selection( "not not TYR" );

    var path = "../../data/__example__/1crn.pdb";

    NGL.autoLoad( path, function( structure ){

        var atomSet1 = new NGL.AtomSet( structure, selection1 );
        var atomSet2 = new NGL.AtomSet( structure, selection2 );

        assert.equal( atomSet1.atomCount, atomSet2.atomCount, "Passed!" );
        
        QUnit.start()

    } );

});


QUnit.module( "structure" );


QUnit.asyncTest( "structure subset", function( assert ) {

    var path = "../../data/__example__/BaceCgProteinAtomistic.pdb";

    NGL.autoLoad( path, function( structure ){

        var subset = new NGL.StructureSubset( structure, "10-30" );

        assert.equal( structure.atomCount, 774, "Passed!" );
        assert.equal( subset.atomCount, 211, "Passed!" );

        QUnit.start()

    } );

});


QUnit.asyncTest( "structure subset not", function( assert ) {

    var path = "../../data/__example__/BaceCgProteinAtomistic.pdb";

    NGL.autoLoad( path, function( structure ){

        var subset = new NGL.StructureSubset( structure, "not 10-30" );
        
        assert.equal( structure.atomCount, 774, "Passed!" );
        assert.equal( subset.atomCount, 563, "Passed!" );

        QUnit.start()

    } );

});
