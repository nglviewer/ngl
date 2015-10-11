/**
 * @file Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


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

    var compressedExtList = [ "gz", "zip", "lzma", "bz2" ];

    var path, compressed, protocol;

    if( file instanceof File ){
        path = file.name;
    }else{
        path = file
    }

    var name = path.replace( /^.*[\\\/]/, '' );
    var base = name.substring( 0, name.lastIndexOf( '.' ) );

    var pathSplit = path.split( '.' );
    var ext = pathSplit.length > 1 ? pathSplit.pop().toLowerCase() : "";

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

        var worker = new NGL.Worker( "decompress" ).post(

            { data: data, file: file, asBinary: asBinary },

            [ data.buffer ? data.buffer : data ],

            function( e ){

                worker.terminate();
                callback( e.data );

            },

            function( e ){

                console.warn(
                    "NGL.decompressWorker error - trying without worker", e
                );
                worker.terminate();

                NGL.decompress( data, file, asBinary, callback );

            }

        );

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
