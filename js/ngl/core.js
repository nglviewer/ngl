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

        return function(){

            if( NGL.debug ){

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


///////////////
// Extensions

Object.values = function( obj ){

    var valueList = [];

    for( var key in obj ) {

        if ( obj.hasOwnProperty( key ) ) {
            valueList.push( obj[ key ] );
        }

    }

    return valueList;

};


////////
// NGL

var NGL = {

    REVISION: '0.6dev',
    EPS: 0.0000001,
    disableImpostor: false,
    indexUint16: false

};


// set default log handlers
NGL.log = function() { console.log.apply( console, arguments ); }
NGL.info = function() { console.info.apply( console, arguments ); }
NGL.warn = function() { console.warn.apply( console, arguments ); }
NGL.error = function() { console.error.apply( console, arguments ); }
NGL.time = function() { console.time.apply( console, arguments ); }
NGL.timeEnd = function() { console.timeEnd.apply( console, arguments ); }


NGL.LeftMouseButton = 1;
NGL.MiddleMouseButton = 2;
NGL.RightMouseButton = 3;


NGL.SideTypes = {};
NGL.SideTypes[ THREE.FrontSide ] = "front";
NGL.SideTypes[ THREE.BackSide ] = "back";
NGL.SideTypes[ THREE.DoubleSide ] = "double";


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

    if( m ) return decodeURIComponent( m[1] );

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
        NGL.warn( "NGL.download: no data given" );
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


///////////
// Object

NGL.makeObjectSignals = function( object ){

    var s = {};

    Object.keys( object.signals ).forEach( function( name ){

        s[ name ] = new signals.Signal();

    } );

    return s;

};


NGL.ObjectMetadata = function(){};

NGL.ObjectMetadata.test = function( what, repr, comp ){

    what = what || {};

    if( repr && what[ "repr" ] &&
        (
            (
                Array.isArray( what[ "repr" ] ) &&
                what[ "repr" ].indexOf( repr.name ) === -1
            )
            ||
            (
                !Array.isArray( what[ "repr" ] ) &&
                what[ "repr" ] !== repr.name
            )
        )
    ){
        return false;
    }

    if( what[ "tag" ] &&
        (
            (
                Array.isArray( what[ "tag" ] ) &&
                what[ "tag" ].indexOf( repr.name ) === -1
            )
            ||
            (
                !Array.isArray( what[ "tag" ] ) &&
                what[ "tag" ] !== repr.name
            )
        )
    ){
        return false;
    }

    if( comp && what[ "comp" ] &&
            what[ "comp" ] !== comp.name &&
            what[ "comp" ] !== comp.id
    ){
        return false;
    }

    return true;

};

NGL.ObjectMetadata.prototype = {

    constructor: NGL.ObjectMetadata,

    apply: function( object ){

        object.setName = NGL.ObjectMetadata.prototype.setName;
        object.addTag = NGL.ObjectMetadata.prototype.addTag;
        object.removeTag = NGL.ObjectMetadata.prototype.removeTag;
        object.setTags = NGL.ObjectMetadata.prototype.setTags;

        object.tags = [];

        object.signals[ "nameChanged" ] = null;

    },

    setName: function( value ){

        this.name = value;
        this.signals.nameChanged.dispatch( value );

    },

    addTag: function( value ){

    },

    removeTag: function( value ){

    },

    setTags: function( value ){

        this.tags = arguments || [];

    },

};
