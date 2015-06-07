
NGL = {};
THREE = {};

importScripts(
    '../lib/async.min.js',
    '../lib/signals.min.js',
    '../lib/pako.min.js',
    '../three/three.min.js',
    '../three/TypedArrayUtils.js',
    '../three/loaders/PLYLoader.js',
    '../three/loaders/OBJLoader.js',
    '../ngl/core.js',
    '../ngl/symmetry.js',
    '../ngl/viewer.js',
    '../ngl/geometry.js',
    '../ngl/surface.js',
    '../ngl/structure.js',
    '../ngl/streamer.js',
    '../ngl/parser.js'
);

onmessage = function( e ){

    NGL.time( "WORKER parse" );

    var parser = NGL.fromJSON( e.data );

    parser.parse( function(){

        NGL.timeEnd( "WORKER parse" );

        // no need to return the streamer data
        parser.streamer.dispose();

        self.postMessage( parser.toJSON(), parser.getTransferable() );

    } );

}
