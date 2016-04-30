/**
 * @file Core
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


////////
// NGL

var NGL = {

    REVISION: '0.7dev',
    EPS: 0.0000001,
    useWorker: true,
    indexUint16: false,
    debug: false,
    develop: (
        self.location.pathname.indexOf( "core.js" ) !== -1 ||
        self.location.pathname.indexOf( "dev.html" ) !== -1
    ),
    mainScriptFilePath: "../js/build/ngl.full.min.js",
    cssDirectory: "../css/",
    assetsDirectory: "../",
    documentationUrl: "../doc/index.html",

    webglErrorMessage: "<div style=\"display:flex; align-items:center; justify-content:center; height:100%;\"><p style=\"padding:15px; text-align:center;\">Your browser/graphics card does not seem to support <a target=\"_blank\" href=\"https://en.wikipedia.org/wiki/WebGL\">WebGL</a>.<br /><br />Find out how to get it <a target=\"_blank\" href=\"http://get.webgl.org/\">here</a>.</p></div>"

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
            "../three/TypedArrayUtils.js",
            "../three/controls/TrackballControls.js",
            "../three/loaders/OBJLoader.js",
            "../three/loaders/PLYLoader.js",

            "../lib/promise.min.js",
            "../lib/sprintf.min.js",
            "../lib/pako_inflate.min.js",
            "../lib/chroma.min.js",
            "../lib/svd.js",
            "../lib/signals.min.js",
            "../lib/TypedFastBitSet.js",
            "../lib/msgpack-decode.js",
            "../lib/mmtf-decode.js",

            "../ngl/shims.js",
            // "../ngl/core.js",
            "../ngl/worker.js",
            "../ngl/utils.js",
            "../ngl/proxy.js",
            "../ngl/store.js",
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


NGL.GET = function( id ){

    var a = new RegExp( id + "=([^&#=]*)" );
    var m = a.exec( window.location.search );

    if( m ){
        return decodeURIComponent( m[1] );
    }else{
        return undefined;
    }

};


NGL.boolean = function( value ){

    if( !value ){
        return false;
    }

    if( typeof value === "string" ){
        return /^1|true|t|yes|y$/i.test( value );
    }

    return true;

};


if( typeof importScripts !== 'function' ){

    ( function(){

        var debug = NGL.GET( "debug" );
        if( debug !== undefined ) NGL.debug = NGL.boolean( debug );

    } )();

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
