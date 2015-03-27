
NGL = {};
THREE = {
    OBJLoader: { prototype: null },
    PLYLoader: { prototype: null }
};

importScripts(
    '../lib/pako.min.js',
    '../lib/bzip2.min.js',
    '../lib/jszip.min.js',
    '../lib/lzma.min.js',
    '../ngl/core.js',
    '../ngl/loader.js'
);

onmessage = function( e ){

    var d = e.data;

    self.postMessage(
        NGL.decompress( d.data, d.file, d.asBinary )
    );

}
