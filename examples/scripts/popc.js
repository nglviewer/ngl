
stage.loadFile( "data://popc.gro" ).then( function( o ){

    o.addRepresentation( "hyperball", { sele: "popc" } );
    o.addRepresentation( "line", { sele: "water" } );
    o.autoView();

} );
