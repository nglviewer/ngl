
stage.loadFile( "data://1blu.mmtf" ).then( function( o ){

    o.addRepresentation( "cartoon", { color: "resname" } );
    o.addRepresentation( "ball+stick", { color: "resname" } );
    o.autoView();

} );
