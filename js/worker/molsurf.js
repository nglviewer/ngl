
NGL = {};
THREE = {};

importScripts(
    '../lib/signals.min.js',
    '../three/three.min.js',
    '../ngl/core.js',
    '../ngl/structure.js',
    '../ngl/surface.js'
);

var molsurf;

onmessage = function( e ){

    NGL.time( "WORKER molsurf" );

    var d = e.data;
    var p = d.params;

    if( d.atomSet ){

        molsurf = new NGL.MolecularSurface(
            new NGL.AtomSet().fromJSON( d.atomSet )
        );

    }

    molsurf.generateSurface( p.type, p.probeRadius, p.scaleFactor, p.smooth );

    NGL.timeEnd( "WORKER molsurf" );

    var meshData = {
        position: molsurf.position,
        index: molsurf.index,
        normal: molsurf.normal
    };

    var transferable = [
        molsurf.position.buffer,
        molsurf.index.buffer
    ];

    if( molsurf.normal ) transferable.push( molsurf.normal.buffer );

    self.postMessage( meshData, transferable );

}
