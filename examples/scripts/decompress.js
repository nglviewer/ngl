
stage.loadFile( "data://1CRN.cif.gz" ).then( function( o ){

    o.addRepresentation( "cartoon" );
    o.autoView();

} );
