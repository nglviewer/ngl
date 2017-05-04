
stage.loadFile( "data://BaceCgProteinAtomistic.pdb" ).then( function( o ){

    o.addRepresentation( "cartoon", { sele: "10-20" } );
    o.addRepresentation( "tube", {
        sele: "not 11-19", radius: 0.07, subdiv: 25, radialSegments: 25
    } );
    o.addRepresentation( "licorice", { sele: "sidechainAttached" } );
    o.autoView();

} );
