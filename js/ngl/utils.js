/**
 * @file Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

NGL.defaults = function( value, defaultValue ){

    return value !== undefined ? value : defaultValue;

};


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


NGL.getAbsolutePath = function( relativePath ){

    var loc = window.location;
    var pn = loc.pathname;
    var basePath = pn.substring( 0, pn.lastIndexOf("/") + 1 );

    return loc.origin + basePath + relativePath;

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

    var compressedExtList = [ "gz" ];

    var path, compressed, protocol;

    if( ( self.File && file instanceof File ) ||
        ( self.Blob && file instanceof self.Blob )
    ){
        path = file.name || "";
    }else{
        path = file
    }

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

};


NGL.fromJSON = function( input ){

    return new NGL[ input.metadata.type ]().fromJSON( input );

};


NGL.processArray = function( array, fn, callback, chunkSize ){

    var n = array.length;
    chunkSize = chunkSize !== undefined ? chunkSize : 1000000;

    if( typeof importScripts === 'function' || chunkSize >= n ){

        // no chunking required when inside a web worker
        fn( 0, n, array );
        callback();

    }else{

        var _i = 0;
        var _step = chunkSize;
        var _n = Math.min( _step, n );

        var fn2 = function(){
            var stop = fn( _i, _n, array );
            if( stop ){
                _i = n;
            }else{
                _i += _step;
                _n = Math.min( _n + _step, n );
            }
            if( _i >= n ){
                callback();
            }else{
                setTimeout( fn2 );
            }
        };

        fn2();

    }

};


NGL.throttle = function( func, wait, options ){

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

};


NGL.binarySearchIndexOf = function(){
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


NGL.dataURItoImage = function( dataURI ){

    if( typeof importScripts !== 'function' ){
        var img = document.createElement( "img" );
        img.src = dataURI;
        return img;
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


// Decompress

NGL.decompress = function( data ){

    var decompressedData;

    NGL.time( "NGL.decompress" );

    if( data instanceof ArrayBuffer ){
        data = new Uint8Array( data );
    }

    try{
        decompressedData = pako.ungzip( data );
    }catch( e ){
        if( NGL.debug ) NGL.warn( e );
        decompressedData = data;  // assume it is already uncompressed
    }

    NGL.timeEnd( "NGL.decompress" );

    return decompressedData;

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


// Queue

NGL.Queue = function( fn, argList ){

    var queue = [];
    var pending = false;

    if( argList ){
        for( var i = 0, il = argList.length; i < il; ++i ){
            queue.push( argList[ i ] );
        }
        next();
    }

    function run( arg ){
        fn( arg, next );
    }

    function next(){
        var arg = queue.shift();
        if( arg !== undefined ){
            pending = true;
            setTimeout( function(){ run( arg ); } );
        }else{
            pending = false;
        }
    }

    // API

    this.push = function( arg ){
        queue.push( arg );
        if( !pending ) next();
    }

    this.kill = function( arg ){
        queue.length = 0;
    };

    this.length = function(){
        return queue.length;
    };

};
