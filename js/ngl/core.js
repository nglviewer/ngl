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
    dataProtocolRelativePath: "../data/",
    fileProtocolRelativePath: "../file/"

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


NGL.browser = function(){

    var ua = navigator.userAgent;

    if ( /Arora/i.test( ua ) ) {

        return 'Arora';

    } else if ( /Opera|OPR/.test( ua ) ) {

        return 'Opera';

    } else if ( /Chrome/i.test( ua ) ) {

        return 'Chrome';

    } else if ( /Epiphany/i.test( ua ) ) {

        return 'Epiphany';

    } else if ( /Firefox/i.test( ua ) ) {

        return 'Firefox';

    } else if ( /Mobile(\/.*)? Safari/i.test( ua ) ) {

        return 'Mobile Safari';

    } else if ( /MSIE/i.test( ua ) ) {

        return 'Internet Explorer';

    } else if ( /Midori/i.test( ua ) ) {

        return 'Midori';

    } else if ( /Safari/i.test( ua ) ) {

        return 'Safari';

    }

    return false;

}();


NGL.GET = function( id ){

    var a = new RegExp( id + "=([^&#=]*)" );
    var m = a.exec( window.location.search );

    if( m ){
        return decodeURIComponent( m[1] );
    }else{
        return undefined;
    }

};


NGL.getAbsolutePath = function( path ){

    var loc = window.location;
    var pn = loc.pathname;
    var base = pn.substring( 0, pn.lastIndexOf("/") + 1 );

    return loc.origin + base + path;

};


NGL.createObject = function( prototype, properties ){

    var object = Object.create( prototype );

    for( var key in properties ) {

        if ( properties.hasOwnProperty( key ) ) {

            object[ key ] = properties[ key ];

        }

    }

    return object;

};


NGL.deepCopy = function( src ){

    if( typeof src !== "object" ){
        return src;
    }

    var dst = Array.isArray( src ) ? [] : {};

    for( var key in src ){
        dst[ key ] = NGL.deepCopy( src[ key ] );
    }

    return dst;

}


NGL.download = function( data, downloadName ){

    if( !data ){
        NGL.warn( "NGL.download: no data given." );
        return;
    }

    downloadName = downloadName || "download";

    var a = document.createElement( 'a' );
    a.style.display = "hidden";
    document.body.appendChild( a );
    if( data instanceof Blob ){
        a.href = URL.createObjectURL( data );
    }else{
        a.href = data;
    }
    a.download = downloadName;
    a.target = "_blank";
    a.click();

    document.body.removeChild( a );
    if( data instanceof Blob ){
        URL.revokeObjectURL( data );
    }

};


NGL.submit = function( url, data, callback, onerror ){

    if( data instanceof FormData ){

        var xhr = new XMLHttpRequest();
        xhr.open( "POST", url );

        xhr.addEventListener( 'load', function ( event ) {

            if ( xhr.status === 200 || xhr.status === 304 ) {

                callback( xhr.response );

            } else {

                if( typeof onerror === "function" ){

                    onerror( xhr.status );

                }

            }

        }, false );

        xhr.send( data );

    }else{

        NGL.warn( "NGL.submit: type not supported.", data  );

    }

};


NGL.open = function( callback, extensionList ){

    extensionList = extensionList || [ "*" ];

    var fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = true;
    fileInput.style.display = "hidden";
    document.body.appendChild( fileInput );
    fileInput.accept = "." + extensionList.join( ",." );
    fileInput.addEventListener( 'change', function( e ){

        callback( e.target.files );

    }, false );

    fileInput.click();

};


NGL.unicodeHelper = function(){

    var replace_map = {
        "{alpha}": "\u03B1",
        "{beta}": "\u03B2",
        "{gamma}": "\u03B3",
        "{dot}": "\u00B7",
        "{bullet}": "\u2022",
    }

    var keys = Object.keys( replace_map ).join('|');

    var rg = new RegExp( '(' + keys + ')', 'gi' );

    return function( str ){

        return str.replace(
            rg, function( s, p1, p2, offset, sx ){
                return replace_map[ String( s ) ];
            }
        );

    };

}();


NGL.getFileInfo = function( file ){

    var compressedExtList = [ "gz", "zip", "lzma", "bz2" ];

    var path, compressed, protocol;

    if( file instanceof File ){

        path = file.name;

    }else{

        path = file

    }

    var name = path.replace( /^.*[\\\/]/, '' );
    var base = name.substring( 0, name.lastIndexOf('.') );
    var ext = path.split('.').pop().toLowerCase();

    var protocolMatch = path.match( /^(.+):\/\/(.+)$/ );
    if( protocolMatch ){
        protocol = protocolMatch[ 1 ].toLowerCase();
        path = protocolMatch[ 2 ];
    }

    if( compressedExtList.indexOf( ext ) !== -1 ){

        compressed = ext;

        var n = path.length - ext.length - 1;
        ext = path.substr( 0, n ).split('.').pop().toLowerCase();

        var m = base.length - ext.length - 1;
        base = base.substr( 0, m );

    }else{

        compressed = false;

    }

    return {
        "path": path,
        "name": name,
        "ext": ext,
        "base": base,
        "compressed": compressed,
        "protocol": protocol
    };

};


NGL.fromJSON = function( input ){

    return new NGL[ input.metadata.type ]().fromJSON( input );

};


NGL.processArray = function( array, fn, callback, chunkSize ){

    var n = array.length;

    if( typeof importScripts === 'function' ){

        // no chunking required when inside a web worker
        fn( 0, n, array );
        callback();

    }else{

        chunkSize = chunkSize !== undefined ? chunkSize : 10000;

        var _i = 0;
        var _step = chunkSize;
        var _n = Math.min( _step, n );

        async.until(

            function(){

                return _i >= n;

            },

            function( wcallback ){

                requestAnimationFrame( function(){

                    // NGL.log( _i, _n, n );

                    var stop = fn( _i, _n, array );

                    if( stop ){

                        _i = n;

                    }else{

                        _i += _step;
                        _n = Math.min( _n + _step, n );

                    }

                    wcallback();

                } );

            },

            callback

        );

    }

};


// String/arraybuffer conversion

NGL.Uint8ToString = function( u8a ){

    // from http://stackoverflow.com/a/12713326/1435042

    var CHUNK_SZ = 0x1000;
    var c = [];

    for( var i = 0; i < u8a.length; i += CHUNK_SZ ){

        c.push( String.fromCharCode.apply(

            null, u8a.subarray( i, i + CHUNK_SZ )

        ) );

    }

    return c.join("");

};


NGL.Uint8ToLines = function( u8a, chunkSize, newline ){

    NGL.time( "NGL.Uint8ToLines" );

    chunkSize = chunkSize !== undefined ? chunkSize : 1024 * 1024 * 10;
    newline = newline !== undefined ? newline : "\n";

    var partialLine = "";
    var lines = [];

    for( var i = 0; i < u8a.length; i += chunkSize ){

        var str = NGL.Uint8ToString( u8a.subarray( i, i + chunkSize ) );
        var idx = str.lastIndexOf( newline );

        if( idx === -1 ){

            partialLine += str;

        }else{

            var str2 = partialLine + str.substr( 0, idx );
            lines = lines.concat( str2.split( newline ) );

            if( idx === str.length - newline.length ){

                partialLine = "";

            }else{

                partialLine = str.substr( idx + newline.length );

            }

        }

    }

    if( partialLine !== "" ){

        lines.push( partialLine );

    }

    NGL.timeEnd( "NGL.Uint8ToLines" );

    return lines;

};


// Worker

NGL.WorkerRegistry = {

    activeWorkerCount: 0,

    funcDict: {},

    add: function( name, func ){

        NGL.WorkerRegistry.funcDict[ name ] = func;

    },

};


NGL.Worker = function( name, params ){

    params = params || {};

    this.name = name;

    if( NGL.develop ){
        this.worker = new Worker( "../js/ngl/core.js" );
    }else{
        this.worker = new Worker( NGL.mainScriptFilePath );
    }

    this.worker.onmessage = function( event ){

        NGL.timeEnd( "NGL.Worker.postMessage " + this.name + " #" + event.data.__postId );

        if( typeof params.onmessage === "function" ){
            params.onmessage.apply( this.worker, arguments );
        };
        if( this.__onmessageDict[ event.data.__postId ] ){
            this.__onmessageDict[ event.data.__postId ].apply( this.worker, arguments );
        }

        return this.onmessage.call( this.worker, event );

    }.bind( this );

    this.worker.onerror = function( event ){

        if( typeof params.onerror === "function" ){
            params.onerror.apply( this.worker, arguments );
        };
        if( this.__onerrorDict[ event.data.__postId ] ){
            this.__onerrorDict[ event.data.__postId ].apply( this.worker, arguments );
        }

        return this.onerror.call( this.worker, event );

    }.bind( this );

    NGL.WorkerRegistry.activeWorkerCount += 1;

    if( params.messageData !== undefined ){

        this.postMessage.apply( this, params.messageData );

    }

};

NGL.Worker.prototype = {

    constructor: NGL.Worker,

    __postCount: 0,

    __onmessageDict: {},

    __onerrorDict: {},

    onmessage: function( event ){

    },

    onerror: function( event ){

    },

    postMessage: function( aMessage, transferList ){

        aMessage = aMessage || {};
        aMessage.__name = this.name;
        aMessage.__postId = this.__postCount;

        NGL.time( "NGL.Worker.postMessage " + this.name + " #" + this.__postCount );

        this.worker.postMessage.call( this.worker, aMessage, transferList );

        this.__postCount += 1;

    },

    terminate: function(){

        if( this.worker ){

            this.worker.terminate();
            delete this.worker;
            NGL.WorkerRegistry.activeWorkerCount -= 1;

        }else{

            console.log( "no worker to terminate" );

        }

    },

    post: function( aMessage, transferList, onmessage, onerror ){

        this.__onmessageDict[ this.__postCount ] = onmessage;
        this.__onerrorDict[ this.__postCount ] = onerror;

        this.postMessage( aMessage, transferList );

    }

};


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
            "../lib/promise-6.0.0.min.js",
            "../lib/sprintf.min.js",
            "../lib/jszip.min.js",
            "../lib/pako.min.js",
            "../lib/lzma.min.js",
            "../lib/bzip2.min.js",
            "../lib/chroma.min.js",
            "../lib/svd.js",
            "../lib/signals.min.js",

            // "../ngl/core.js",
            "../ngl/symmetry.js",
            "../ngl/geometry.js",
            "../ngl/structure.js",
            "../ngl/trajectory.js",
            "../ngl/surface.js",
            "../ngl/script.js",
            "../ngl/streamer.js",
            "../ngl/parser.js",
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

                self.postMessage( aMessage, transferList );

            };

            NGL.WorkerRegistry.funcDict[ name ]( e, callback );

        }

    }

}


// Decompress

NGL.decompress = function( data, file, asBinary, callback ){

    var binData, decompressedData;
    var ext = NGL.getFileInfo( file ).compressed;

    NGL.time( "NGL.decompress " + ext );

    if( data instanceof ArrayBuffer ){

        data = new Uint8Array( data );

    }

    if( ext === "gz" ){

        binData = pako.ungzip( data );

    }else if( ext === "zip" ){

        var zip = new JSZip( data );
        var name = Object.keys( zip.files )[ 0 ];
        binData = zip.files[ name ].asUint8Array();

    }else if( ext === "lzma" ){

        var inStream = {
            data: data,
            offset: 0,
            readByte: function(){
                return this.data[ this.offset++ ];
            }
        };

        var outStream = {
            data: [ /* Uncompressed data will be putted here */ ],
            offset: 0,
            writeByte: function( value ){
                this.data[ this.offset++ ] = value;
            }
        };

        LZMA.decompressFile( inStream, outStream );
        binData = new Uint8Array( outStream.data );

    }else if( ext === "bz2" ){

        // FIXME need to get binData
        var bitstream = bzip2.array( data );
        decompressedData = bzip2.simple( bitstream )

    }else{

        NGL.warn( "no decompression method available for '" + ext + "'" );
        decompressedData = data;

    }

    if( !asBinary && decompressedData === undefined ){

        decompressedData = NGL.Uint8ToString( binData );

    }

    NGL.timeEnd( "NGL.decompress " + ext );

    var returnData = asBinary ? binData : decompressedData;

    if( typeof callback === "function" ){

        callback( returnData );

    }

    return returnData;

};


NGL.WorkerRegistry.add( "decompress", function( e, callback ){

    var d = e.data;

    var value = NGL.decompress( d.data, d.file, d.asBinary );
    var transferable = [];

    if( d.asBinary ){
        transferable.push( value.buffer );
    }

    callback( value, transferable );

} );


NGL.decompressWorker = function( data, file, asBinary, callback ){

    if( NGL.useWorker && typeof Worker !== "undefined" &&
        typeof importScripts !== 'function'
    ){

        var worker = new NGL.Worker( "decompress", {

            onmessage: function( e ){

                worker.terminate();
                callback( e.data );

            },

            onerror: function( e ){

                console.warn(
                    "NGL.decompressWorker error - trying without worker", e
                );
                worker.terminate();

                NGL.decompress( data, file, asBinary, callback );

            },

            messageData: [

                { data: data, file: file, asBinary: asBinary },
                [ data.buffer ? data.buffer : data ]

            ]

        } );

    }else{

        NGL.decompress( data, file, asBinary, callback );

    }

};


// Counter

NGL.Counter = function(){

    var SIGNALS = signals;

    this.count = 0;

    this.signals = {

        countChanged: new SIGNALS.Signal(),

    }

};

NGL.Counter.prototype = {

    clear: function(){

        this.change( -this.count );

    },

    change: function( delta ){

        this.count += delta;
        this.signals.countChanged.dispatch( delta, this.count );

        if( this.count < 0 ){

            NGL.warn( "NGL.Counter.count below zero", this.count );

        }

    },

    increment: function(){

        this.change( 1 );

    },

    decrement: function(){

        this.change( -1 );

    },

    listen: function( counter ){

        // incorporate changes of another counter

        this.change( counter.count );

        counter.signals.countChanged.add( function( delta, count ){

            this.change( delta );

        }.bind( this ) );

    },

    onZeroOnce: function( callback, context ){

        if( this.count === 0 ){

            callback.call( context, 0, 0 );

        }else{

            var fn = function(){

                if( this.count === 0 ){

                    this.signals.countChanged.remove( fn, this );

                    callback.apply( context, arguments );

                }

            }

            this.signals.countChanged.add( fn, this );

        }

    },

    dispose: function(){

        this.clear();

    }

};
