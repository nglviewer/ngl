
Promise.all( [

    stage.loadFile( "data://JMJD2DA-x336_event2.ccp4.gz" ),
    stage.loadFile( "data://JMJD2DA-x336_event2.pdb" )

] ).then( function( ol ){

    var map = ol[ 0 ];
    var struc = ol[ 1 ];

    struc.autoView( "LIG" )

    map.addRepresentation( "surface", {
        boxSize: 10,
        useWorker: false,
        wrap: true,
        color: "skyblue",
        contour: true
    } );

    struc.addRepresentation( "cartoon" );
    struc.addRepresentation( "ball+stick", { sele: "hetero" } );

    stage.setFocus( 95 );

} );
