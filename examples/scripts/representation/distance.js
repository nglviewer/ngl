
stage.loadFile( "data://1blu.pdb" ).then( function( o ){

    var atomPair = [
        [ "1.CA", "10.CA" ],
        [ "1.CA", "30.CA" ]
    ];

    o.addRepresentation( "cartoon" );
    o.addRepresentation( "distance", {
        atomPair: atomPair,
        color: "skyblue",
        labelUnit: "nm"
    } );

    o.autoView();

} );
