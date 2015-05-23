
NGL = {};
THREE = {};

importScripts(
    '../three/three.min.js',
    '../ngl/core.js',
    '../ngl/surface.js'
);

var vol = new NGL.Volume();

onmessage = function( e ){

    NGL.time( "WORKER surf" );

    var d = e.data;
    var p = d.params;

    if( d.vol ){

        vol.fromJSON( d.vol );

    }

    vol.generateSurface( p.isolevel, p.smooth );

    NGL.timeEnd( "WORKER surf" );

    var meshData = {
        position: vol.position,
        index: vol.index,
        normal: vol.normal
    };

    var transferable = [
        vol.position.buffer,
        vol.index.buffer
    ];

    if( vol.normal ) transferable.push( vol.normal.buffer );

    self.postMessage( meshData, transferable );

}
