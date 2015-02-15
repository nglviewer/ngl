/**
 * @file Core
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


//////////////
// Polyfills

if( typeof importScripts !== 'function' && !HTMLCanvasElement.prototype.toBlob ){

    HTMLCanvasElement.prototype.toBlob = function(){

        function dataURLToBlob( dataURL ){

            // https://github.com/ebidel/filer.js/blob/master/src/filer.js

            var base64Marker = ';base64,';

            if( dataURL.indexOf( base64Marker ) === -1) {
                var parts = dataURL.split( ',' );
                var contentType = parts[ 0 ].split( ':' )[ 1 ];
                var raw = decodeURIComponent( parts[ 1 ] );

                return new Blob( [ raw ], { type: contentType } );
            }

            var parts = dataURL.split( base64Marker );
            var contentType = parts[ 0 ].split( ':' )[ 1 ];
            var raw = window.atob( parts[ 1 ] );
            var rawLength = raw.length;

            var uInt8Array = new Uint8Array( rawLength );

            for( var i = 0; i < rawLength; ++i ){
                uInt8Array[ i ] = raw.charCodeAt( i );
            }

            return new Blob( [ uInt8Array ], { type: contentType } );

        }

        return function( callback, type, quality ){

            callback( dataURLToBlob( this.toDataURL( type, quality ) ) );

        }

    }();

}


if ( !Number.isInteger ) {

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger

    Number.isInteger = function isInteger( nVal ){
        return typeof nVal === "number" && isFinite( nVal ) && nVal > -9007199254740992 && nVal < 9007199254740992 && Math.floor( nVal ) === nVal;
    };

}


if ( !Number.isNaN ) {

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN

    Number.isNaN = function isNaN( value ){
        return value !== value;
    };

}



if ( !Object.assign ) {

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


////////////////
// Workarounds

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


///////////////
// Extensions

Object.values = function ( obj ){

    var valueList = [];

    for( var key in obj ) {

        if ( obj.hasOwnProperty( key ) ) {
            valueList.push( obj[ key ] );
        }

    }

    return valueList;

}


////////
// NGL

var NGL = {

    REVISION: '1dev',
    EPS: 0.0000001,
    disableImpostor: false,
    indexUint16: false

};


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


NGL.download = function( data, downloadName ){

    if( !data ){
        console.warn( "NGL.download: no data given" );
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

    var protoMatch = path.match( /^(.+):\/\/(.+)$/ );
    if( protoMatch ){
        protocol = protoMatch[ 1 ].toLowerCase();
        path = protoMatch[ 2 ];
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
