/**
 * @file Core
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


//////////////
// Polyfills

( function( global ) {

    'use strict';

    // Console-polyfill. MIT license.
    // https://github.com/paulmillr/console-polyfill
    // Make it safe to do console.log() always.

    global.console = global.console || {};
    var con = global.console;
    var prop, method;
    var empty = {};
    var dummy = function(){};
    var properties = 'memory'.split( ',' );
    var methods = (
        'assert,clear,count,debug,dir,dirxml,error,exception,group,' +
        'groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,' +
        'show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn'
    ).split(',');

    while( prop = properties.pop() ) if( !con[ prop] ) con[ prop ] = empty;
    while( method = methods.pop() ) if( !con[ method] ) con[ method ] = dummy;

    // Using `this` for web workers while maintaining compatibility with browser
    // targeted script loaders such as Browserify or Webpack where the only way to
    // get to the global object is via `window`.

} )( typeof window === 'undefined' ? this : window );


if( typeof importScripts !== 'function' && !HTMLCanvasElement.prototype.toBlob ){

    // http://code.google.com/p/chromium/issues/detail?id=67587#57

    Object.defineProperty( HTMLCanvasElement.prototype, 'toBlob', {

        value: function( callback, type, quality ){

            var bin = window.atob( this.toDataURL( type, quality ).split( ',' )[ 1 ] ),
                len = bin.length,
                len32 = len >> 2,
                a8 = new Uint8Array( len ),
                a32 = new Uint32Array( a8.buffer, 0, len32 );

            for( var i=0, j=0; i < len32; i++ ) {

                a32[i] = bin.charCodeAt( j++ ) |
                    bin.charCodeAt( j++ ) << 8 |
                    bin.charCodeAt( j++ ) << 16 |
                    bin.charCodeAt( j++ ) << 24;

            }

            var tailLength = len & 3;

            while( tailLength-- ){

                a8[ j ] = bin.charCodeAt( j++ );

            }

            callback( new Blob( [ a8 ], { 'type': type || 'image/png' } ) );

        }

    } );

}


if( !Number.isInteger ){

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger

    Number.isInteger = function isInteger( nVal ){
        return typeof nVal === "number" && isFinite( nVal ) && nVal > -9007199254740992 && nVal < 9007199254740992 && Math.floor( nVal ) === nVal;
    };

}


if( !Number.isNaN ){

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN

    Number.isNaN = function isNaN( value ){
        return value !== value;
    };

}


if( !Object.assign ){

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

    Object.defineProperty( Object, "assign", {

        enumerable: false,
        configurable: true,
        writable: true,

        value: function(target, firstSource) {

            "use strict";
            if (target === undefined || target === null)
            throw new TypeError("Cannot convert first argument to object");

            var to = Object(target);

            var hasPendingException = false;
            var pendingException;

            for (var i = 1; i < arguments.length; i++) {

                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null)
                    continue;

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {

                    var nextKey = keysArray[nextIndex];
                    try {
                        var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                        if (desc !== undefined && desc.enumerable)
                            to[nextKey] = nextSource[nextKey];
                    } catch (e) {
                        if (!hasPendingException) {
                            hasPendingException = true;
                            pendingException = e;
                        }
                    }

                }

                if (hasPendingException)
                    throw pendingException;

            }

            return to;

        }

    } );

}


if (!String.prototype.startsWith) {

    /*! https://mths.be/startswith v0.2.0 by @mathias */

    (function() {
        'use strict'; // needed to support `apply`/`call` with `undefined`/`null`
        var defineProperty = (function() {
            // IE 8 only supports `Object.defineProperty` on DOM elements
            try {
                var object = {};
                var $defineProperty = Object.defineProperty;
                var result = $defineProperty(object, object, object) && $defineProperty;
            } catch(error) {}
            return result;
        }());
        var toString = {}.toString;
        var startsWith = function(search) {
            if (this == null) {
                throw TypeError();
            }
            var string = String(this);
            if (search && toString.call(search) == '[object RegExp]') {
                throw TypeError();
            }
            var stringLength = string.length;
            var searchString = String(search);
            var searchLength = searchString.length;
            var position = arguments.length > 1 ? arguments[1] : undefined;
            // `ToInteger`
            var pos = position ? Number(position) : 0;
            if (pos != pos) { // better `isNaN`
                pos = 0;
            }
            var start = Math.min(Math.max(pos, 0), stringLength);
            // Avoid the `indexOf` call if no match is possible
            if (searchLength + start > stringLength) {
                return false;
            }
            var index = -1;
            while (++index < searchLength) {
                if (string.charCodeAt(start + index) != searchString.charCodeAt(index)) {
                    return false;
                }
            }
            return true;
        };
        if (defineProperty) {
            defineProperty(String.prototype, 'startsWith', {
                'value': startsWith,
                'configurable': true,
                'writable': true
            });
        } else {
            String.prototype.startsWith = startsWith;
        }
    }());

}


if( typeof importScripts !== 'function' ){

    ( function() {

        // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
        // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

        // requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

        // MIT license

        var lastTime = 0;
        var vendors = [ 'ms', 'moz', 'webkit', 'o' ];

        for( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x ){

            window.requestAnimationFrame = (
                window[ vendors[ x ] + 'RequestAnimationFrame' ]
            );

            window.cancelAnimationFrame = (
                window[ vendors[ x ] + 'CancelAnimationFrame' ] ||
                window[ vendors[ x ] + 'CancelRequestAnimationFrame' ]
            );

        }

        if( !window.requestAnimationFrame ){

            window.requestAnimationFrame = function( callback, element ){

                var currTime = new Date().getTime();
                var timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );

                var id = window.setTimeout( function(){

                    callback( currTime + timeToCall );

                }, timeToCall );

                lastTime = currTime + timeToCall;

                return id;

            };

        }

        if( !window.cancelAnimationFrame ){

            window.cancelAnimationFrame = function( id ){
                clearTimeout( id );
            };

        }

    }() );

}


if ( Function.prototype.name === undefined && Object.defineProperty !== undefined ) {

    // Missing in IE9-11.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name

    Object.defineProperty( Function.prototype, 'name', {

        get: function () {

            return this.toString().match( /^\s*function\s*(\S*)\s*\(/ )[ 1 ];

        }

    } );

}


////////////////
// Workarounds

if( typeof importScripts !== 'function' ){

    HTMLElement.prototype.getBoundingClientRect = function(){

        // workaround for ie11 behavior with disconnected dom nodes

        var _getBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;

        return function(){
            try{
                return _getBoundingClientRect.apply( this, arguments );
            }catch( e ){
                return {
                    top: 0,
                    left: 0,
                    width: this.width,
                    height: this.height
                };
            }
        };

    }();

}


if( typeof importScripts !== 'function' && WebGLRenderingContext ){

    // wrap WebGL debug function used by three.js and
    // ignore calls to them when the debug flag is not set

    WebGLRenderingContext.prototype.getShaderParameter = function(){

        var _getShaderParameter = WebGLRenderingContext.prototype.getShaderParameter;

        return function(){

            if( NGL.debug ){

                return _getShaderParameter.apply( this, arguments );

            }else{

                return true;

            }

        }

    }();

    WebGLRenderingContext.prototype.getShaderInfoLog = function(){

        var _getShaderInfoLog = WebGLRenderingContext.prototype.getShaderInfoLog;

        return function(){

            if( NGL.debug ){

                return _getShaderInfoLog.apply( this, arguments );

            }else{

                return '';

            }

        }

    }();

    WebGLRenderingContext.prototype.getProgramParameter = function(){

        var _getProgramParameter = WebGLRenderingContext.prototype.getProgramParameter;

        return function( program, pname ){

            if( NGL.debug || pname !== WebGLRenderingContext.prototype.LINK_STATUS ){

                return _getProgramParameter.apply( this, arguments );

            }else{

                return true;

            }

        }

    }();

    WebGLRenderingContext.prototype.getProgramInfoLog = function(){

        var _getProgramInfoLog = WebGLRenderingContext.prototype.getProgramInfoLog;

        return function(){

            if( NGL.debug ){

                return _getProgramInfoLog.apply( this, arguments );

            }else{

                return '';

            }

        }

    }();

}


////////
// NGL

var NGL = {

    REVISION: '0.6dev',
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


// Worker

NGL.WorkerRegistry = {

    activeWorkerCount: 0,

    funcDict: {},

    add: function( name, func ){

        NGL.WorkerRegistry.funcDict[ name ] = func;

    },

};


NGL.Worker = function( name ){

    var pending = 0;
    var postCount = 0;
    var onmessageDict = {};
    var onerrorDict = {};

    var worker = new Worker( NGL.mainScriptFilePath );

    NGL.WorkerRegistry.activeWorkerCount += 1;

    worker.onmessage = function( event ){

        pending -= 1;
        var postId = event.data.__postId;

        NGL.timeEnd( "NGL.Worker.postMessage " + name + " #" + postId );

        if( onmessageDict[ postId ] ){
            onmessageDict[ postId ].call( worker, event );
        }else{
            // NGL.debug( "No onmessage", postId, name );
        }

        delete onmessageDict[ postId ];
        delete onerrorDict[ postId ];

    };

    worker.onerror = function( event ){

        pending -= 1;
        var postId = event.data.__postId;

        if( onerrorDict[ postId ] ){
            onerrorDict[ postId ].call( worker, event );
        }else{
            NGL.error( "NGL.Worker.onerror", postId, name, event );
        }

        delete onmessageDict[ postId ];
        delete onerrorDict[ postId ];

    };

    // API

    this.name = name;

    this.post = function( aMessage, transferList, onmessage, onerror ){

        onmessageDict[ postCount ] = onmessage;
        onerrorDict[ postCount ] = onerror;

        aMessage = aMessage || {};
        aMessage.__name = name;
        aMessage.__postId = postCount;

        NGL.time( "NGL.Worker.postMessage " + name + " #" + postCount );

        try{
            worker.postMessage.call( worker, aMessage, transferList );
        }catch( error ){
            NGL.error( "NGL.worker.post:", error );
            worker.postMessage.call( worker, aMessage );
        }

        pending += 1;
        postCount += 1;

        return this;

    };

    this.terminate = function(){

        if( worker ){
            worker.terminate();
            NGL.WorkerRegistry.activeWorkerCount -= 1;
        }else{
            console.log( "no worker to terminate" );
        }

    };

    Object.defineProperties( this, {
        postCount: {
            get: function(){ return postCount; }
        },
        pending: {
            get: function(){ return pending; }
        }
    } );

};

NGL.Worker.prototype.constructor = NGL.Worker;


NGL.WorkerPool = function( name, maxCount ){

    maxCount = Math.min( 8, maxCount || 2 );

    var pool = [];
    var count = 0;

    // API

    this.name = name;

    this.maxCount = maxCount;

    this.post = function( aMessage, transferList, onmessage, onerror ){

        var worker = this.getNextWorker();
        worker.post( aMessage, transferList, onmessage, onerror );

        return this;

    };

    this.terminate = function(){

        pool.forEach( function( worker ){
            worker.terminate();
        } );

    };

    this.getNextWorker = function(){

        var nextWorker;
        var minPending = Infinity;

        for( var i = 0; i < maxCount; ++i ){

            if( i >= count ){

                nextWorker = new NGL.Worker( name );
                pool.push( nextWorker );
                count += 1;
                break;

            }

            var worker = pool[ i ];

            if( worker.pending === 0 ){

                minPending = worker.pending;
                nextWorker = worker;
                break;

            }else if( worker.pending < minPending ){

                minPending = worker.pending;
                nextWorker = worker;

            }

        }

        return nextWorker;

    };

    Object.defineProperties( this, {
        count: {
            get: function(){ return count; }
        }
    } );

};

NGL.WorkerPool.prototype.constructor = NGL.WorkerPool;


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

            // "../ngl/core.js",
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

    self.onmessage = function( e ){

        var name = e.data.__name;
        var postId = e.data.__postId;

        if( name === undefined ){

            NGL.error( "message __name undefined" );

        }else if( NGL.WorkerRegistry.funcDict[ name ] === undefined ){

            NGL.error( "funcDict[ __name ] undefined", name );

        }else{

            var callback = function( aMessage, transferList ){

                aMessage = aMessage || {};
                if( postId !== undefined ) aMessage.__postId = postId;

                try{
                    self.postMessage( aMessage, transferList );
                }catch( error ){
                    NGL.error( "self.postMessage:", error );
                    self.postMessage( aMessage );
                }

            };

            NGL.WorkerRegistry.funcDict[ name ]( e, callback );

        }

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
