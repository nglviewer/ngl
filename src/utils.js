/**
 * @file Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { Log, Debug } from "./globals.js";


function GET( id ){

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


function getBrowser(){

    var ua = window.navigator.userAgent;

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

    if( !data ){
        Log.warn( "download: no data given." );
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

}


function submit( url, data, callback, onerror ){

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

        Log.warn( "submit: type not supported.", data  );

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

    if( ( self.File && file instanceof File ) ||
        ( self.Blob && file instanceof self.Blob )
    ){
        path = file.name || "";
    }else{
        path = file
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

    if( compressedExtList.indexOf( ext ) !== -1 ){
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


function fromJSON( input ){

    // TODO
    return new NGL[ input.metadata.type ]().fromJSON( input );

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

    return function(){

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


var binarySearchIndexOf = function(){
    function _compareFunction( elm1, elm2 ){
        if( elm1 < elm2 ) return -1;
        if( elm1 > elm2 ) return 1;
        return 0;
    }
    return function( array, element, compareFunction ){
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
    }
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

    log.time( "uint8ToLines" );

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

    log.timeEnd( "uint8ToLines" );

    return lines;

}


function decompress( data ){

    var decompressedData;

    Log.time( "decompress" );

    if( data instanceof ArrayBuffer ){
        data = new Uint8Array( data );
    }

    try{
        decompressedData = pako.ungzip( data );
    }catch( e ){
        if( Debug ) Log.warn( e );
        decompressedData = data;  // assume it is already uncompressed
    }

    Log.timeEnd( "decompress" );

    return decompressedData;

}


export {
    GET,
    boolean,
    defaults,
    getBrowser,
    getAbsolutePath,
    deepCopy,
    download,
    submit,
    open,
    unicodeHelper,
    getFileInfo,
    fromJSON, // FIXME
    throttle,
    binarySearchIndexOf,
    dataURItoImage,
    uniqueArray,
    uint8ToString,
    uint8ToLines,
    decompress
};
