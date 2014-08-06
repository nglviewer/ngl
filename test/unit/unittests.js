

QUnit.test( "hello test", function( assert ) {
    assert.ok( 1 == "1", "Passed!" );
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

