
stage.loadFile( "data://1crn.pdb" ).then( function( o ){

    o.addRepresentation( "cartoon", { sele: "*" } );
    o.addRepresentation( "ball+stick", { sele: "hetero" } );
    stage.autoView();

} );

stage.loadFile( "data://3pqr.pdb" ).then( function( o ){

    o.addRepresentation( "cartoon", { sele: "*" } );
    o.addRepresentation( "ball+stick", { sele: "hetero" } );
    stage.autoView();

} );
