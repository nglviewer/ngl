/**
 * @file Shims
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
