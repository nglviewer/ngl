
stage.loadFile( "data://1crn_apbs.pqr" ).then( function( o ){

    o.addRepresentation( "cartoon" );
    o.addRepresentation( "licorice", {
    	colorScheme: "bfactor",
    	colorScale: "rwb"
    } );
    o.autoView();

} );
