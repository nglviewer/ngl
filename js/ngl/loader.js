/**
 * @file Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


NGL.Uint8ToString = function( u8a ){
    // from http://stackoverflow.com/a/12713326/1435042
    var CHUNK_SZ = 0x8000;
    var c = [];
    for( var i = 0; i < u8a.length; i += CHUNK_SZ ){
        c.push( String.fromCharCode.apply(
            null, u8a.subarray( i, i + CHUNK_SZ )
        ) );
    }
    return c.join("");
}


NGL.decompress = function( data, file, callback ){

    var binData, decompressedData;
    var ext = NGL.getFileInfo( file ).compressed;

    console.time( "decompress " + ext );

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

        var bitstream = bzip2.array( data );
        decompressedData = bzip2.simple( bitstream )

    }else{

        console.warn( "no decompression method available for '" + ext + "'" );
        decompressedData = data;

    }

    if( typeof callback === "function" ){

        if( decompressedData === undefined ){

            NGL.Uint8ToString( binData, callback );

        }else{

            callback( decompressedData );

        }

    }else{

        if( decompressedData === undefined ){

            decompressedData = NGL.Uint8ToString( binData );

        }

    }

    console.timeEnd( "decompress " + ext );

    return decompressedData;

}


///////////
// Loader

NGL.XHRLoader = function ( manager ) {

    /**
     * @author mrdoob / http://mrdoob.com/
     */

    this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.XHRLoader.prototype = {

    constructor: NGL.XHRLoader,

    load: function ( url, onLoad, onProgress, onError ) {

        var scope = this;

        var cached = scope.cache.get( url );

        if ( cached !== undefined ) {

            if ( onLoad ) onLoad( cached );
            return;

        }

        var request = new XMLHttpRequest();
        request.open( 'GET', url, true );

        request.addEventListener( 'load', function ( event ) {

            if ( request.status === 200 || request.status === 304 ) {

                var data = this.response;

                if( scope.responseType === "arraybuffer" ){

                    data = NGL.decompress( data, url );

                }

                scope.cache.add( url, data );

                if ( onLoad ) onLoad( data );

            } else {

                if ( onError ) onError( request.status );

            }

            scope.manager.itemEnd( url );

        }, false );

        if ( onProgress !== undefined ) {

            request.addEventListener( 'progress', function ( event ) {

                onProgress( event );

            }, false );

        }

        if ( onError !== undefined ) {

            request.addEventListener( 'error', function ( event ) {

                onError( event );

            }, false );

        }

        if ( this.crossOrigin !== undefined ) request.crossOrigin = this.crossOrigin;
        if ( this.responseType !== undefined ) request.responseType = this.responseType;

        request.send( null );

        scope.manager.itemStart( url );

    },

    setResponseType: function ( value ) {

        this.responseType = value;

    },

    setCrossOrigin: function ( value ) {

        this.crossOrigin = value;

    }

};


NGL.FileLoader = function( manager ){

    this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.FileLoader.prototype = {

    constructor: NGL.FileLoader,

    load: function ( file, onLoad, onProgress, onError ) {

        var scope = this;

        var cached = scope.cache.get( file );

        if ( cached !== undefined ) {

            onLoad( cached );
            return;

        }

        var reader = new FileReader();

        reader.onload = function( event ){

            // scope.cache.add( file, this.response );

            var data = event.target.result;

            if( scope.responseType === "arraybuffer" ){

                data = NGL.decompress( data, file );

            }

            onLoad( data );
            scope.manager.itemEnd( file );

        }

        if ( onProgress !== undefined ) {

            reader.onprogress = function ( event ) {

                onProgress( event );

            }

        }

        if ( onError !== undefined ) {

            reader.onerror = function ( event ) {

                onError( event );

            }

        }

        if( this.responseType === "arraybuffer" ){

            reader.readAsArrayBuffer( file );

        }else{

            reader.readAsText( file );

        }

        scope.manager.itemStart( file );

    },

    setResponseType: function ( value ) {

        this.responseType = value.toLowerCase();

    }

};


NGL.StructureLoader = function( manager ){

    this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.StructureLoader.prototype = Object.create( NGL.XHRLoader.prototype );

NGL.StructureLoader.prototype.constructor = NGL.StructureLoader;

NGL.StructureLoader.prototype.init = function( str, name, path, ext, callback, params ){

    params = params || {};

    var parsersClasses = {

        "gro": NGL.GroParser,
        "pdb": NGL.PdbParser,
        "cif": NGL.CifParser,

    };

    var parser = new parsersClasses[ ext ](
        name, path, params
    );

    return parser.parse( str, callback );

};


NGL.ObjLoader = function( manager ){

    // this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.ObjLoader.prototype = Object.create( THREE.OBJLoader.prototype );

NGL.StructureLoader.prototype.constructor = NGL.ObjLoader;

NGL.ObjLoader.prototype.init = function( data, name, path, ext, callback ){

    if( typeof data === "string" ){

        data = this.parse( data );

    }

    var obj = new NGL.Surface( data, name, path )

    if( typeof callback === "function" ) callback( obj );

    return obj;

};


NGL.PlyLoader = function( manager ){

    // this.cache = new THREE.Cache();
    // this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.PlyLoader.prototype = Object.create( THREE.PLYLoader.prototype );

NGL.StructureLoader.prototype.constructor = NGL.PlyLoader;

NGL.PlyLoader.prototype.init = function( data, name, path, ext, callback ){

    if( typeof data === "string" ){

        data = this.parse( data );

    }

    var ply = new NGL.Surface( data, name, path );

    if( typeof callback === "function" ) callback( ply );

    return ply;

};


NGL.ScriptLoader = function( manager ){

    this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.ScriptLoader.prototype = Object.create( NGL.XHRLoader.prototype );

NGL.StructureLoader.prototype.constructor = NGL.ScriptLoader;

NGL.ScriptLoader.prototype.init = function( data, name, path, ext, callback ){

    var script = new NGL.Script( data, name, path );

    if( typeof callback === "function" ) callback( script );

    return script;

};


NGL.autoLoad = function(){

    var loaders = {

        "gro": NGL.StructureLoader,
        "pdb": NGL.StructureLoader,
        "cif": NGL.StructureLoader,

        "obj": NGL.ObjLoader,
        "ply": NGL.PlyLoader,

        "ngl": NGL.ScriptLoader,

    }

    return function( file, onLoad, onProgress, onError, params ){

        var object, rcsb, loader;

        var fileInfo = NGL.getFileInfo( file );

        // console.log( fileInfo );

        var path = fileInfo.path;
        var name = fileInfo.name;
        var ext = fileInfo.ext;
        var compressed = fileInfo.compressed;
        var protocol = fileInfo.protocol;

        if( protocol === "rcsb" ){

            // ext = "pdb";
            // file = "http://www.rcsb.org/pdb/files/" + name + ".pdb";
            ext = "cif";
            compressed = "gz";
            path = "http://www.rcsb.org/pdb/files/" + name + ".cif.gz";
            protocol = "http";

        }

        if( ext in loaders ){

            loader = new loaders[ ext ];

        }else{

            error( "NGL.autoLoading: ext '" + ext + "' unknown" );

            return null;

        }

        function init( data ){

            if( data ){

                try{

                    object = loader.init( data, name, file, ext, function( _object ){

                        if( typeof onLoad === "function" ) onLoad( _object );

                    }, params );

                }catch( e ){

                    console.error( e );
                    error( "initialization failed" );

                }

            }else{

                error( "empty response" );

            }

        }

        function error( e ){

            if( typeof onError === "function" ){

                onError( e );

            }else{

                console.error( e );

            }

        }

        if( file instanceof File ){

            var fileLoader = new NGL.FileLoader();
            if( compressed ) fileLoader.setResponseType( "arraybuffer" );
            fileLoader.load( file, init, onProgress, error );

        }else if( [ "http", "https", "ftp" ].indexOf( protocol ) !== -1 ){

            if( compressed ) loader.setResponseType( "arraybuffer" );
            loader.load( path, init, onProgress, error );

        }else if( protocol === "data" ){

            if( compressed ) loader.setResponseType( "arraybuffer" );
            loader.load( "../data/" + path, init, onProgress, error );

        }else{ // default: protocol === "file"

            if( compressed ) loader.setResponseType( "arraybuffer" );
            loader.load( "../file/" + path, init, onProgress, error );

        }

        return object;

    }

}();
