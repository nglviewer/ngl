
// stage.loadFile( "data://acrolein.pdb" ).then( function( o ){
stage.loadFile( "data://1crn.pdb" ).then( function( o ){
// stage.loadFile( "data://3pqr.pdb" ).then( function( o ){
// stage.loadFile( "data://3sn6.pdb" ).then( function( o ){
// stage.loadFile( "data://3l5q.pdb" ).then( function( o ){

    o.addRepresentation( "licorice" );
    // o.addRepresentation( "spacefill" );
    o.addRepresentation( "surface", {
        surfaceType: "ms",
        smooth: 2,
        probeRadius: 1.4,
        scaleFactor: 2.0,
        flatShaded: false,
        opacity: 0.7,
        lowResolution: false,
        colorScheme: "element"
    } );
    stage.autoView();

} );
