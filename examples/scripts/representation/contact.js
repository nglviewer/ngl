
// stage.loadFile( "data://3SN6.cif" ).then( function( o ){
// stage.loadFile( "data://4UJD.cif.gz" ).then( function( o ){
// stage.loadFile( "data://3l5q.pdb" ).then( function( o ){
// stage.loadFile( "data://1blu.pdb" ).then( function( o ){
// stage.loadFile( "data://3pqr.pdb" ).then( function( o ){
stage.loadFile( "data://1crn.pdb" ).then( function( o ){

    o.addRepresentation( "cartoon", {
        colorScheme: "sstruc", flatShaded: true
    } );
    o.addRepresentation( "contact", { contactType: "polarBackbone" } );
    o.addRepresentation( "line" );
    o.autoView();

} );
