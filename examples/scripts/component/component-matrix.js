
stage.loadFile( "data://1crn.pdb" ).then( function( o ){
    o.addRepresentation( "cartoon" );
    stage.autoView();
} );

stage.loadFile( "data://1crn.pdb" ).then( function( o ){
    o.setPosition( new NGL.Vector3( 10, 0, 0) );
    o.addRepresentation( "cartoon", { color: "orange" } );
    stage.autoView();
} );
