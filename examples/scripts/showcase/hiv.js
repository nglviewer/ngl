
stage.loadFile( "rcsb://3j3q.mmtf" ).then( function( o ){

    o.addRepresentation( "surface", {
        surfaceType: "sas",
        smooth: 2,
        scaleFactor: 0.2,
        colorScheme: "chainindex"
    } );

    o.addRepresentation( "cartoon", {
        sele: ":f0 or :f1 or :f2 or :f3 or :f4 or :f5",
        colorScheme: "chainindex"
    } );

    o.addRepresentation( "ball+stick", {
        sele: ":f0",
        colorScheme: "element"
    } );

    o.addRepresentation( "rocket", {
        sele: ":f0",
        colorScheme: "chainindex"
    } );

    stage.tasks.onZeroOnce( function(){ stage.autoView(); } );

} );
