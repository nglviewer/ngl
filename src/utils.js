/**
 * @file Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


function getQuery( id ){

    if( typeof window === "undefined" ) return undefined;

    var a = new RegExp( id + "=([^&#=]*)" );
    var m = a.exec( window.location.search );

    if( m ){
        return decodeURIComponent( m[1] );
    }else{
        return undefined;
    }

}


function boolean( value ){

    if( !value ){
        return false;
    }

    if( typeof value === "string" ){
        return /^1|true|t|yes|y$/i.test( value );
    }

    return true;

}


function defaults( value, defaultValue ){

    return value !== undefined ? value : defaultValue;

}


function getProtocol(){

    var protocol = window.location.protocol;
    return protocol.match( /http(s)?:/gi ) === null ? "http:" : protocol;

}


function getBrowser(){

    if( typeof window === "undefined" ) return false;

    var ua = window.navigator.userAgent;

    if ( /Opera|OPR/.test( ua ) ) {

        return 'Opera';

    } else if ( /Chrome/i.test( ua ) ) {

        return 'Chrome';

    } else if ( /Firefox/i.test( ua ) ) {

        return 'Firefox';

    } else if ( /Mobile(\/.*)? Safari/i.test( ua ) ) {

        return 'Mobile Safari';

    } else if ( /MSIE/i.test( ua ) ) {

        return 'Internet Explorer';

    } else if ( /Safari/i.test( ua ) ) {

        return 'Safari';

    }

    return false;

}


function getAbsolutePath( relativePath ){

    var loc = window.location;
    var pn = loc.pathname;
    var basePath = pn.substring( 0, pn.lastIndexOf("/") + 1 );

    return loc.origin + basePath + relativePath;

}


function deepCopy( src ){

    if( typeof src !== "object" ){
        return src;
    }

    var dst = Array.isArray( src ) ? [] : {};

    for( var key in src ){
        dst[ key ] = deepCopy( src[ key ] );
    }

    return dst;

}


function download( data, downloadName ){

    // using ideas from https://github.com/eligrey/FileSaver.js/blob/master/FileSaver.js

    if( !data ) return;

    downloadName = downloadName || "download";

    var isSafari = getBrowser() === "Safari";
    var isChromeIos = /CriOS\/[\d]+/.test( window.navigator.userAgent );

    var a = document.createElement( 'a' );

    function openUrl( url ){
        var opened = window.open( url, '_blank' );
        if( !opened ){
            window.location.href = url;
        }
    }

    function open( str ){
        openUrl( isChromeIos ? str : str.replace(/^data:[^;]*;/, 'data:attachment/file;') );
    }

    if( typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob ){

        // native saveAs in IE 10+
        navigator.msSaveOrOpenBlob( data, downloadName );

    }else if( ( isSafari || isChromeIos ) && window.FileReader ){

        if( data instanceof Blob ){
            // no downloading of blob urls in Safari
            var reader = new FileReader();
            reader.onloadend = function() {
                open( reader.result );
            };
            reader.readAsDataURL( data );
        }else{
            open( data );
        }

    }else{

        if( data instanceof Blob ){
            data = URL.createObjectURL( data );
        }

        if( "download" in a ){
            // download link available
            a.style.display = "hidden";
            document.body.appendChild( a );
            a.href = data;
            a.download = downloadName;
            a.target = "_blank";
            a.click();
            document.body.removeChild( a );
        }else{
            openUrl( data );
        }

        if( data instanceof Blob ){
            URL.revokeObjectURL( data );
        }

    }

}


function submit( url, data, callback, onerror ){

    if( data instanceof FormData ){

        var xhr = new XMLHttpRequest();
        xhr.open( "POST", url );

        xhr.addEventListener( 'load', function () {

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

        throw "submit: data must be a FormData instance.";

    }

}


function open( callback, extensionList ){

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

}


function getFileInfo( file ){

    var compressedExtList = [ "gz" ];

    var path, compressed, protocol;

    if( ( typeof File !== "undefined" && file instanceof File ) ||
        ( typeof Blob !== "undefined" && file instanceof Blob )
    ){
        path = file.name || "";
    }else{
        path = file;
    }
    var queryIndex = path.lastIndexOf( '?' );
    path = path.substring( 0, queryIndex === -1 ? path.length : queryIndex );

    var name = path.replace( /^.*[\\\/]/, '' );
    var base = name.substring( 0, name.lastIndexOf( '.' ) );

    var nameSplit = name.split( '.' );
    var ext = nameSplit.length > 1 ? nameSplit.pop().toLowerCase() : "";

    var protocolMatch = path.match( /^(.+):\/\/(.+)$/ );
    if( protocolMatch ){
        protocol = protocolMatch[ 1 ].toLowerCase();
        path = protocolMatch[ 2 ];
    }

    var dir = path.substring( 0, path.lastIndexOf( '/' ) + 1 );

    if( compressedExtList.includes( ext ) ){
        compressed = ext;
        var n = path.length - ext.length - 1;
        ext = path.substr( 0, n ).split( '.' ).pop().toLowerCase();
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
        "dir": dir,
        "compressed": compressed,
        "protocol": protocol,
        "src": file
    };

}


function throttle( func, wait, options ){

    // from http://underscorejs.org/docs/underscore.html

    var context, args, result;
    var timeout = null;
    var previous = 0;

    if( !options ) options = {};

    var later = function(){
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        result = func.apply( context, args );
        if( !timeout ) context = args = null;
    };

    return function throttle(){

        var now = Date.now();
        if( !previous && options.leading === false ) previous = now;
        var remaining = wait - ( now - previous );
        context = this;
        args = arguments;
        if( remaining <= 0 || remaining > wait ){
            if( timeout ){
                clearTimeout( timeout );
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if( !timeout ) context = args = null;
        }else if( !timeout && options.trailing !== false ){
            timeout = setTimeout( later, remaining );
        }

        return result;

    };

}


/**
 * Does a binary search to get the index of an element in the input array
 * @function
 * @example
 * var array = [ 1, 2, 3, 4, 5, 6 ];
 * var element = 4;
 * binarySearchIndexOf( array, element );  // returns 3
 *
 * @param {Array} array - sorted array
 * @param {Anything} element - element to search for in the array
 * @param {Function} [compareFunction] - compare function
 * @return {Number} the index of the element or -1 if not in the array
 */
var binarySearchIndexOf = function(){
    function _compareFunction( elm1, elm2 ){
        if( elm1 < elm2 ) return -1;
        if( elm1 > elm2 ) return 1;
        return 0;
    }
    return function binarySearchIndexOf( array, element, compareFunction ){
        var low = 0;
        var high = array.length - 1;
        if( !compareFunction ) compareFunction = _compareFunction;
        while( low <= high ){
            var i = ( low + high ) >> 1;
            var cmp = compareFunction( element, array[ i ] );
            if( cmp > 0 ){
                low = i + 1;
            }else if( cmp < 0 ){
                high = i - 1;
            } else {
                return i;
            }
        }
        return -low - 1;
    };
}();


function dataURItoImage( dataURI ){

    if( typeof importScripts !== 'function' ){
        var img = document.createElement( "img" );
        img.src = dataURI;
        return img;
    }

}


function uniqueArray( array ){
    return array.sort().filter( function( value, index, sorted ){
        return ( index === 0 ) || ( value !== sorted[ index - 1 ] );
    } );
}


// String/arraybuffer conversion

function uint8ToString( u8a ){

    var chunkSize = 0x7000;

    if( u8a.length > chunkSize ){

      var c = [];

      for(var i = 0; i < u8a.length; i += chunkSize) {

        c.push( String.fromCharCode.apply(
          null, u8a.subarray( i, i + chunkSize )
        ) );

      }

      return c.join("");

    }else{

      return String.fromCharCode.apply( null, u8a );

    }

}


function uint8ToLines( u8a, chunkSize, newline ){

    chunkSize = chunkSize !== undefined ? chunkSize : 1024 * 1024 * 10;
    newline = newline !== undefined ? newline : "\n";

    var partialLine = "";
    var lines = [];

    for( var i = 0; i < u8a.length; i += chunkSize ){

        var str = uint8ToString( u8a.subarray( i, i + chunkSize ) );
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

    return lines;

}


export {
    getQuery,
    boolean,
    defaults,
    getProtocol,
    getBrowser,
    getAbsolutePath,
    deepCopy,
    download,
    submit,
    open,
    getFileInfo,
    throttle,
    binarySearchIndexOf,
    dataURItoImage,
    uniqueArray,
    uint8ToString,
    uint8ToLines
};
