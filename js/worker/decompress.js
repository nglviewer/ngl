
onmessage = function( e ){

    importScripts(
        '../lib/pako.min.js',
        '../lib/bzip2.min.js',
        '../lib/jszip.min.js',
        '../lib/lzma.min.js',
        '../ngl/core.js'
    );

    var d = e.data;

    var value = NGL.decompress( d.data, d.file, d.asBinary );
    var transferable = [];

    if( d.asBinary ){
        transferable.push( value.buffer );
    }

    self.postMessage( value, transferable );

}
