
stage.loadFile( "data://1crn.pdb" ).then( function( o ){

    o.addRepresentation( "cartoon" );
    o.addRepresentation( "ball+stick" );
    stage.viewer.setClip( 42, 100 );
    o.autoView();

} );

stage.loadFile( "data://1crn.ply" ).then( function( o ){

    o.addRepresentation( "surface", {
        opacity: 0.3, side: "double"
    } );

} );
