
var pdbs = [ "1stm", "3nap", "1sid", "2ft1", "4cwu" ];
var colors = [ "red", "yellow", "green", "lightblue", "violet" ];

Promise.all( pdbs.map( function( id ){
    return stage.loadFile( "rcsb://" + id )
} ) ).then( function( ol ){

    ol.map( function( o, i ){
        var s = o.structure;
        var bu1 = s.biomolDict.BU1;
        o.setPosition( bu1.getCenter( s ).negate() );
        o.addRepresentation( "surface", {
            sele: "polymer",
            assembly: "BU1",
            color: colors[ i ],
            scaleFactor: 0.10,
            surfaceType: "sas"
        } );
    } );

    stage.tasks.onZeroOnce( function(){ stage.autoView(); } );
    stage.setParameters( { clipNear: 50 } );

} );
