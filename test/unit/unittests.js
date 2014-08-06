

QUnit.module( "selection" );


QUnit.test( "selection chain", function( assert ) {

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


QUnit.test( "selection chain resno range", function( assert ) {

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


QUnit.test( "selection parens", function( assert ) {

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


QUnit.test( "selection no parens", function( assert ) {

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


QUnit.test( "selection outer parens", function( assert ) {

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


QUnit.test( "selection parsing error resi", function( assert ) {

    var sele = "( foobar )";

    var selection = new NGL.Selection( sele );

    var selectionObj = {
        "error": "resi must be an integer"
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "selection parsing error atomname", function( assert ) {

    var sele = ".FOOBAR";

    var selection = new NGL.Selection( sele );

    var selectionObj = {
        "error": "atomname must be one to four characters"
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "selection parsing error chain", function( assert ) {

    var sele = ":FOO";

    var selection = new NGL.Selection( sele );

    var selectionObj = {
        "error": "chain identifier must be one character"
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "selection parsing error model", function( assert ) {

    var sele = "/Q";

    var selection = new NGL.Selection( sele );

    var selectionObj = {
        "error": "model must be an integer"
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "selection parsing error resi range", function( assert ) {

    var sele = "1-2-3";

    var selection = new NGL.Selection( sele );

    var selectionObj = {
        "error": "resi range must contain one '-'"
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "selection negate simple", function( assert ) {

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


QUnit.test( "selection negate or", function( assert ) {

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


QUnit.test( "selection negate parens", function( assert ) {

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
                    { "resno": [ 10, 15 ] }
                ]
            }
        ]
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "selection negate parens 2", function( assert ) {

    var sele = "MET or not ( 10-15 and 15-20 )";

    var selection = new NGL.Selection( sele );

    var selectionObj = {
        "operator": "OR",
        "rules": [
            { "resname": "MET" },
            {
                "operator": "AND",
                "negate": true,
                "rules": [
                    { "resno": [ 10, 15 ] },
                    { "resno": [ 15, 20 ] }
                ]
            }
        ]
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "selection negate parens 3", function( assert ) {

    var sele = "MET or not ( 10-15 and 15-20 ) or GLU";

    var selection = new NGL.Selection( sele );

    var selectionObj = {
        "operator": "OR",
        "rules": [
            { "resname": "MET" },
            {
                "operator": "AND",
                "negate": true,
                "rules": [
                    { "resno": [ 10, 15 ] },
                    { "resno": [ 15, 20 ] }
                ]
            },
            { "resname": "GLU" },
        ]
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "selection negate parens 4", function( assert ) {

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
                        "operator": "AND",
                        "negate": true,
                        "rules": [
                            { "resno": [ 10, 15 ] },
                            { "resno": [ 15, 20 ] }
                        ]
                    },
                    { "resname": "GLU" }
                ]
            }
        ]
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


QUnit.test( "selection negate parens 5", function( assert ) {

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
                        "operator": "OR",
                        "negate": true,
                        "rules": [
                            { "resname": "MET" },
                            { "resname": "GLU" }
                        ]
                    }
                ]
            },
            { "resno": [ 300, 330 ] }
        ]
    };

    assert.deepEqual( selection.selection, selectionObj, "Passed!" );

});


