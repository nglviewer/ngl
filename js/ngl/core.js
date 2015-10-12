/**
 * @file Core
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


////////
// NGL

var NGL = {

    REVISION: '0.6',
    EPS: 0.0000001,
    disableImpostor: false,
    useWorker: true,
    indexUint16: false,
    debug: false,
    develop: (
        self.location.pathname.indexOf( "core.js" ) !== -1 ||
        self.location.pathname.indexOf( "dev.html" ) !== -1
    ),
    mainScriptFilePath: "../js/build/ngl.full.min.js",
    cssDirectory: "../css/",
    assetsDirectory: "../"

};


// set default log handlers
NGL.log = Function.prototype.bind.call( console.log, console );
NGL.info = Function.prototype.bind.call( console.info, console );
NGL.warn = Function.prototype.bind.call( console.warn, console );
NGL.error = Function.prototype.bind.call( console.error, console );
NGL.time = Function.prototype.bind.call( console.time, console );
NGL.timeEnd = Function.prototype.bind.call( console.timeEnd, console );


NGL.LeftMouseButton = 1;
NGL.MiddleMouseButton = 2;
NGL.RightMouseButton = 3;


if( typeof importScripts === 'function' ){

    if( NGL.develop ){

        importScripts(

            "../three/three.js",
            "../three/Detector.js",
            "../three/TypedArrayUtils.js",
            "../three/controls/TrackballControls.js",
            "../three/loaders/OBJLoader.js",
            "../three/loaders/PLYLoader.js",

            "../lib/async.js",
            "../lib/promise.min.js",
            "../lib/sprintf.min.js",
            "../lib/jszip.min.js",
            "../lib/pako.min.js",
            "../lib/lzma.min.js",
            "../lib/bzip2.min.js",
            "../lib/chroma.min.js",
            "../lib/svd.js",
            "../lib/signals.min.js",

            "../ngl/shims.js",
            // "../ngl/core.js",
            "../ngl/worker.js",
            "../ngl/utils.js",
            "../ngl/symmetry.js",
            "../ngl/alignment.js",
            "../ngl/geometry.js",
            "../ngl/selection.js",
            "../ngl/superposition.js",
            "../ngl/structure.js",
            "../ngl/trajectory.js",
            "../ngl/surface.js",
            "../ngl/script.js",
            "../ngl/streamer.js",
            "../ngl/parser.js",
            "../ngl/writer.js",
            "../ngl/loader.js",
            "../ngl/viewer.js",
            "../ngl/buffer.js",
            "../ngl/representation.js",
            "../ngl/stage.js"

        );

    }

}


// Registry

NGL.PluginRegistry = {

    dict: {},

    add: function( name, path ){
        this.dict[ name ] = path;
    },

    get: function( name ){
        if( name in this.dict ){
            return this.dict[ name ];
        }else{
            throw "NGL.PluginRegistry '" + name + "' not defined";
        }
    },

    get names(){
        return Object.keys( this.dict );
    },

    get count(){
        return this.names.length;
    },

    load: function( name, stage ){
        var path = this.get( name );
        stage.loadFile( path, { name: name + " plugin" } );
    }

};


NGL.ExampleRegistry = {

    dict: {},

    add: function( name, fn ){
        this.dict[ name ] = fn;
    },

    addDict: function( dict ){
        Object.keys( dict ).forEach( function( name ){
            this.add( name, dict[ name ] );
        }.bind( this ) );
    },

    get: function( name ){
        return this.dict[ name ];
    },

    get names(){
        return Object.keys( this.dict );
    },

    get count(){
        return this.names.length;
    },

    load: function( name, stage ){
        var fn = this.get( name );
        if( typeof fn === "function" ){
            fn( stage );
        }else{
            NGL.warn( "NGL.ExampleRegistry.load not available:", name );
        }
    }

};
