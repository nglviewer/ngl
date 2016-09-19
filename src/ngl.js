/**
 * @file ngl
 * @private
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import _Promise from "../lib/promise.es6.js";
if( !window.Promise ){
    window.Promise = _Promise;
}


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

    while( ( prop = properties.pop() ) ) if( !con[ prop] ) con[ prop ] = empty;
    while( ( method = methods.pop() ) ) if( !con[ method] ) con[ method ] = dummy;

    // Using `self` for web workers while maintaining compatibility with browser
    // targeted script loaders such as Browserify or Webpack where the only way to
    // get to the global object is via `window`.

} )( typeof window === 'undefined' ? self : window );


if( !HTMLCanvasElement.prototype.toBlob ){

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

        value: function(target/*, firstSource*/) {

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
            var result;
            try {
                var object = {};
                var $defineProperty = Object.defineProperty;
                result = $defineProperty(object, object, object) && $defineProperty;
            } catch(error) {}  // eslint-disable-line no-empty
            return result;
        }());
        var toString = {}.toString;
        var startsWith = function(search) {
            if (this === null) {
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


if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}


if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/) {
    'use strict';
    if (this == null) {
      throw new TypeError('Array.prototype.includes called on null or undefined');
    }

    var O = Object(this);
    var len = parseInt(O.length, 10) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1], 10) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}


// Production steps of ECMA-262, Edition 6, 22.1.2.1
// Reference: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.from
if (!Array.from) {

    Array.from = (function () {

        var toStr = Object.prototype.toString;
        var isCallable = function (fn) {
            return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
        };
        var toInteger = function (value) {
            var number = Number(value);
            if (isNaN(number)) { return 0; }
            if (number === 0 || !isFinite(number)) { return number; }
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        var maxSafeInteger = Math.pow(2, 53) - 1;
        var toLength = function (value) {
            var len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
        };

        // The length property of the from method is 1.
        return function from(arrayLike/*, mapFn, thisArg */) {

            // 1. Let C be the this value.
            var C = this;

            // 2. Let items be ToObject(arrayLike).
            var items = Object(arrayLike);

            // 3. ReturnIfAbrupt(items).
            if (arrayLike == null) {
                throw new TypeError("Array.from requires an array-like object - not null or undefined");
            }

            // 4. If mapfn is undefined, then let mapping be false.
            var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            var T;
            if (typeof mapFn !== 'undefined') {
                // 5. else
                // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
                if (!isCallable(mapFn)) {
                    throw new TypeError('Array.from: when provided, the second argument must be a function');
                }

                // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
                if (arguments.length > 2) {
                    T = arguments[2];
                }
            }

            // 10. Let lenValue be Get(items, "length").
            // 11. Let len be ToLength(lenValue).
            var len = toLength(items.length);

            // 13. If IsConstructor(C) is true, then
            // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
            // 14. a. Else, Let A be ArrayCreate(len).
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);

            // 16. Let k be 0.
            var k = 0;
            // 17. Repeat, while k < len… (also steps a - h)
            var kValue;
            while (k < len) {
                kValue = items[k];
                if (mapFn) {
                    A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                } else {
                    A[k] = kValue;
                }
                k += 1;
            }
            // 18. Let putStatus be Put(A, "length", len, true).
            A.length = len;
            // 20. Return A.
            return A;
        };

    }());

}


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

        window.requestAnimationFrame = function( callback/*, element*/ ){

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


if ( Function.prototype.name === undefined && Object.defineProperty !== undefined ) {

    // Missing in IE9-11.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name

    Object.defineProperty( Function.prototype, 'name', {

        get: function () {

            return this.toString().match( /^\s*function\s*(\S*)\s*\(/ )[ 1 ];

        }

    } );

}


if ( self.performance === undefined ) {

    self.performance = {};

}

if ( self.performance.now === undefined ) {

    ( function () {

        var start = Date.now();

        self.performance.now = function () {

            return Date.now() - start;

        };

    } )();

}


////////////////
// Workarounds

HTMLElement.prototype.getBoundingClientRect = function(){

    // workaround for ie11 behavior with disconnected dom nodes

    var _getBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;

    return function getBoundingClientRect(){
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


if( WebGLRenderingContext ){

    // wrap WebGL debug function used by three.js and
    // ignore calls to them when the debug flag is not set

    WebGLRenderingContext.prototype.getShaderParameter = function(){

        var _getShaderParameter = WebGLRenderingContext.prototype.getShaderParameter;

        return function getShaderParameter(){

            if( Debug ){

                return _getShaderParameter.apply( this, arguments );

            }else{

                return true;

            }

        };

    }();

    WebGLRenderingContext.prototype.getShaderInfoLog = function(){

        var _getShaderInfoLog = WebGLRenderingContext.prototype.getShaderInfoLog;

        return function getShaderInfoLog(){

            if( Debug ){

                return _getShaderInfoLog.apply( this, arguments );

            }else{

                return '';

            }

        };

    }();

    WebGLRenderingContext.prototype.getProgramParameter = function(){

        var _getProgramParameter = WebGLRenderingContext.prototype.getProgramParameter;

        return function getProgramParameter( program, pname ){

            if( Debug || pname !== WebGLRenderingContext.prototype.LINK_STATUS ){

                return _getProgramParameter.apply( this, arguments );

            }else{

                return true;

            }

        };

    }();

    WebGLRenderingContext.prototype.getProgramInfoLog = function(){

        var _getProgramInfoLog = WebGLRenderingContext.prototype.getProgramInfoLog;

        return function getProgramInfoLog(){

            if( Debug ){

                return _getProgramInfoLog.apply( this, arguments );

            }else{

                return '';

            }

        };

    }();

}


/**
 * The NGL module. These members are available in the `NGL` namespace when using the {@link https://github.com/umdjs/umd|UMD} build in the `ngl.js` file.
 * @module NGL
 */

import {
    Debug, setDebug,
    DatasourceRegistry, RepresentationRegistry, ColorMakerRegistry
} from "./globals.js";
import {
    StaticDatasource, RcsbDatasource, PassThroughDatasource
} from "./loader/datasource-utils.js";
import { autoLoad, getDataInfo } from "./loader/loader-utils.js";
import Selection from "./selection.js";
import PdbWriter from "./writer/pdb-writer.js";
import Stage from "./stage/stage.js";
import Collection from "./component/collection.js";
import ComponentCollection from "./component/component-collection.js";
import RepresentationCollection from "./component/representation-collection.js";
import Assembly from "./symmetry/assembly.js";
import TrajectoryPlayer from "./trajectory/trajectory-player.js";
import { superpose } from "./align/align-utils.js";
import { guessElement } from "./structure/structure-utils.js";

import { throttle, download, getQuery, uniqueArray } from "./utils.js";
import { ColorMaker } from "./utils/color-maker.js";
import Queue from "./utils/queue.js";
import Counter from "./utils/counter.js";

//

/* eslint-disable no-unused-vars */
import AxesRepresentation from "./representation/axes-representation";
import BackboneRepresentation from "./representation/backbone-representation";
import BallAndStickRepresentation from "./representation/ballandstick-representation";
import BaseRepresentation from "./representation/base-representation";
import CartoonRepresentation from "./representation/cartoon-representation";
import ContactRepresentation from "./representation/contact-representation";
import DistanceRepresentation from "./representation/distance-representation";
import HelixorientRepresentation from "./representation/helixorient-representation";
import HyperballRepresentation from "./representation/hyperball-representation";
import LabelRepresentation from "./representation/label-representation";
import LicoriceRepresentation from "./representation/licorice-representation";
import LineRepresentation from "./representation/line-representation";
import MolecularSurfaceRepresentation from "./representation/molecularsurface-representation";
import PointRepresentation from "./representation/point-representation";
import RibbonRepresentation from "./representation/ribbon-representation";
import RocketRepresentation from "./representation/rocket-representation";
import RopeRepresentation from "./representation/rope-representation";
import SpacefillRepresentation from "./representation/spacefill-representation";
import TraceRepresentation from "./representation/trace-representation";
import TubeRepresentation from "./representation/tube-representation";
import UnitcellRepresentation from "./representation/unitcell-representation";
/* eslint-enable no-unused-vars */

import BufferRepresentation from "./representation/buffer-representation";
import ArrowBuffer from "./buffer/arrow-buffer.js";
import ConeBuffer from "./buffer/cone-buffer.js";
import CylinderBuffer from "./buffer/cylinder-buffer.js";
import EllipsoidBuffer from "./buffer/ellipsoid-buffer.js";
import SphereBuffer from "./buffer/sphere-buffer.js";

//

/* eslint-disable no-unused-vars */
import GroParser from "./parser/gro-parser.js";
import PdbParser from "./parser/pdb-parser.js";
import PqrParser from "./parser/pqr-parser.js";
import CifParser from "./parser/cif-parser.js";
import SdfParser from "./parser/sdf-parser.js";
import Mol2Parser from "./parser/mol2-parser.js";
import MmtfParser from "./parser/mmtf-parser.js";

import DcdParser from "./parser/dcd-parser.js";

import MrcParser from "./parser/mrc-parser.js";
import CubeParser from "./parser/cube-parser.js";
import DxParser from "./parser/dx-parser.js";
import DxbinParser from "./parser/dxbin-parser.js";

import PlyParser from "./parser/ply-parser.js";
import ObjParser from "./parser/obj-parser.js";

import TextParser from "./parser/text-parser.js";
import CsvParser from "./parser/csv-parser.js";
import JsonParser from "./parser/json-parser.js";
import XmlParser from "./parser/xml-parser.js";
/* eslint-enable no-unused-vars */

//

import Shape from "./geometry/shape.js";
import Kdtree from "./geometry/kdtree.js";
import SpatialHash from "./geometry/spatial-hash.js";

//

DatasourceRegistry.add( "rcsb", new RcsbDatasource() );
DatasourceRegistry.add( "ftp", new PassThroughDatasource() );
DatasourceRegistry.add( "http", new PassThroughDatasource() );
DatasourceRegistry.add( "https", new PassThroughDatasource() );

//

import Signal from "../lib/signals.es6.js";
import { Matrix3, Matrix4, Vector3, Quaternion, Plane, Color } from "../lib/three.es6.js";

//

import { version as Version } from "../package.json";


/**
 * Promise class
 * @name Promise
 * @class
 * @global
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise}
 */

/**
 * Blob class
 * @name Blob
 * @class
 * @global
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob}
 */

/**
 * File class
 * @name File
 * @class
 * @global
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/File}
 */

/**
 * Signal class, used to dispatch events
 * @name Signal
 * @class
 * @global
 * @see {@link https://millermedeiros.github.io/js-signals/docs/symbols/Signal.html}
 *
 * @example
 * function onHover( pickingData ){
 *     // ...
 * }
 * stage.signals.hovered.add( onHover );  // add listener
 * stage.signals.hovered.remove( onHover );  // remove listener
 *
 * @example
 * function onClick( pickingData ){
 *     // ...
 * }
 * // add listener that is removed after first execution
 * stage.signals.hovered.addOnce( onHover );
 */

/**
 * 3x3 matrix from three.js
 * @name Matrix3
 * @class
 * @global
 * @see {@link http://threejs.org/docs/#Reference/Math/Matrix3}
 */

/**
 * 4x4 transformation matrix from three.js
 * @name Matrix4
 * @class
 * @global
 * @see {@link http://threejs.org/docs/#Reference/Math/Matrix4}
 */

/**
 * 3d vector class from three.js
 * @name Vector3
 * @class
 * @global
 * @see {@link http://threejs.org/docs/#Reference/Math/Vector3}
 */

/**
 * Quaternion class from three.js
 * @name Quaternion
 * @class
 * @global
 * @see {@link http://threejs.org/docs/#Reference/Math/Quaternion}
 */

/**
 * Plane class from three.js
 * @name Plane
 * @class
 * @global
 * @see {@link http://threejs.org/docs/#Reference/Math/Plane}
 */

/**
 * Color class from three.js
 * @name Color
 * @class
 * @global
 * @see {@link http://threejs.org/docs/#Reference/Math/Color}
 */


export {
    /**
     * Version name
     * @static
     * @type {String}
     */
    Version,
    Debug,
    setDebug,
    DatasourceRegistry,
    StaticDatasource,
    /**
     * autoLoad function
     * @see {@link autoLoad}
     */
    autoLoad,
    RepresentationRegistry,
    ColorMakerRegistry,
    ColorMaker,
    Selection,
    PdbWriter,
    /**
     * Stage class
     * @see {@link Stage}
     */
    Stage,
    Collection,
    ComponentCollection,
    RepresentationCollection,
    /**
     * Assembly class
     * @see {@link Assembly}
     */
    Assembly,
    TrajectoryPlayer,
    /**
     * superpose function
     * @see {@link superpose}
     */
    superpose,
    guessElement,

    Queue,
    Counter,
    throttle,
    download,
    getQuery,
    getDataInfo,
    uniqueArray,

    /**
     * Buffer representation class
     * @see {@link BufferRepresentation}
     */
    BufferRepresentation,
    /**
     * Sphere buffer class
     * @see {@link SphereBuffer}
     */
    SphereBuffer,
    /**
     * Ellipsoid buffer class
     * @see {@link EllipsoidBuffer}
     */
    EllipsoidBuffer,
    /**
     * Cylinder buffer class
     * @see {@link CylinderBuffer}
     */
    CylinderBuffer,
    /**
     * Cone buffer class
     * @see {@link ConeBuffer}
     */
    ConeBuffer,
    /**
     * Arrow buffer class
     * @see {@link ArrowBuffer}
     */
    ArrowBuffer,

    /**
     * Shape class
     * @see {@link Shape}
     */
    Shape,

    Kdtree,
    SpatialHash,

    /**
     * Signal class
     * @see {@link Signal}
     */
    Signal,

    /**
     * Matrix3 class
     * @see {@link Matrix3}
     */
    Matrix3,
    /**
     * Matrix4 class
     * @see {@link Matrix4}
     */
    Matrix4,
    /**
     * Vector3 class
     * @see {@link Vector3}
     */
    Vector3,
    /**
     * Quaternion class
     * @see {@link Quaternion}
     */
    Quaternion,
    /**
     * Plane class
     * @see {@link Plane}
     */
    Plane,
    /**
     * Color class
     * @see {@link Color}
     */
    Color
};
