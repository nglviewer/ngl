
var pdbs = [ "1stm", "3nap", "1sid", "2ft1", "4cwu" ];
var colors = [ "red", "yellow", "green", "lightblue", "violet" ];

Promise.all( pdbs.map( function( id ){
    return stage.loadFile( "rcsb://" + id )
} ) ).then( function( ol ){

    ol[ 1 ].setPosition( [ -169.65, -178.95, -90.31 ] );

    ol.map( function( o, i ){
        o.addRepresentation( "surface", {
            assembly: "BU1",
            color: colors[ i ],
            scaleFactor: 0.15,
            surfaceType: "sas"
        } );
    } );

    stage.tasks.onZeroOnce( function(){ stage.autoView(); } );
    stage.setParameters( { clipNear: 50 } );

} );
