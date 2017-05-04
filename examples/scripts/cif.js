
stage.loadFile( "data://3SN6.cif" ).then( function( o ){
// stage.loadFile( "data://1CRN.cif", function( o ){

    o.addRepresentation( "cartoon", { radius: "sstruc" } );
    // o.addRepresentation( "ball+stick", { sele: "sidechainAttached" } );
    o.autoView();

} );
