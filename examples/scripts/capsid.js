
stage.loadFile( "data://1RB8.pdb" ).then( function( o ){

    o.addRepresentation( "surface", {
        sele: "polymer",
        assembly: "BU1",
        surfaceType: "sas",
        probeRadius: 0.1,
        scaleFactor: 0.2,
        colorScheme: "atomindex",
        colorScale: "RdYlBu",
        useWorker: false
    } );
    stage.autoView();

} );
