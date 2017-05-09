
stage.loadFile( "rcsb://4w93.mmtf" ).then( function( o ){

    o.addRepresentation( "licorice", { sele: "[3L9]" } );

    // Get ring atoms for residue with name 3L9
    var ringAtomNames = [];
    o.structure.eachAtom( function( ap ) {
        if( ap.isRing() ){
            ringAtomNames.push( "." + ap.atomname );
        }
    }, new NGL.Selection( "[3L9]" ) );

    o.addRepresentation("spacefill", {
        sele: "[3L9] and ( " + ringAtomNames.join( " " ) + ")",
        scale: 0.25
    } );

    stage.autoView();

} );
