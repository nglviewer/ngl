

QUnit.module( "selection" );


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


