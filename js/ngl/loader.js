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


NGL.decompress = function( data, file, asBinary ){

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

    return asBinary ? binData : decompressedData;

}


///////////
// Loader

NGL.XHRLoader = function ( manager ) {

    /**
     * @author mrdoob / http://mrdoob.com/
     */

    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.XHRLoader.prototype = {

    constructor: NGL.XHRLoader,

    load: function ( url, onLoad, onProgress, onError ) {

        var scope = this;

        var cached = THREE.Cache.get( url );

        if ( cached !== undefined ) {

            if ( onLoad ) onLoad( cached );
            return;

        }

        var request = new XMLHttpRequest();
        request.open( 'GET', url, true );

        request.addEventListener( 'load', function ( event ) {

            if ( request.status === 200 || request.status === 304 ) {

                var data = this.response;

                if( scope.compressed ){

                    data = NGL.decompress( data, url, scope.asBinary );

                }

                THREE.Cache.add( url, data );

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

    setAsBinary: function ( value ) {

        this.asBinary = value;

    },

    setCompressed: function( value ){

        if( value ){
            this.setResponseType( "arraybuffer" );
        }

        this.compressed = value;

    },

    setResponseType: function ( value ) {

        this.responseType = value.toLowerCase();

    },

    setCrossOrigin: function ( value ) {

        this.crossOrigin = value;

    }

};


NGL.FileLoader = function( manager ){

    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.FileLoader.prototype = {

    constructor: NGL.FileLoader,

    load: function ( file, onLoad, onProgress, onError ) {

        var scope = this;

        var cached = THREE.Cache.get( file );

        if ( cached !== undefined ) {

            onLoad( cached );
            return;

        }

        var reader = new FileReader();

        reader.onload = function( event ){

            var data = event.target.result;

            if( scope.compressed ){

                data = NGL.decompress( data, file, scope.asBinary );

            }

            // THREE.Cache.add( file, data );

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

        if( this.asBinary ){

            reader.readAsArrayBuffer( file );

        }else{

            reader.readAsText( file );

        }

        scope.manager.itemStart( file );

    },

    setAsBinary: function ( value ) {

        this.asBinary = value;

    },

    setCompressed: function( value ){

        if( value ){
            this.setResponseType( "arraybuffer" );
        }

        this.compressed = value;

    },

    setResponseType: function ( value ) {

        this.responseType = value.toLowerCase();

    }

};


NGL.StructureLoader = function( manager ){

    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.StructureLoader.prototype = Object.create( NGL.XHRLoader.prototype );

NGL.StructureLoader.prototype.constructor = NGL.StructureLoader;

NGL.StructureLoader.prototype.init = function( str, name, path, ext, callback, params ){

    params = params || {};

    var parsersClasses = {

        "gro": NGL.GroParser,
        "pdb": NGL.PdbParser,
        "ent": NGL.PdbParser,
        "cif": NGL.CifParser,
        "mmcif": NGL.CifParser,

    };

    var parser = new parsersClasses[ ext ](
        name, path, params
    );

    return parser.parse( str, callback );

};


NGL.VolumeLoader = function( manager ){

    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

    this.setAsBinary( true );
    this.setResponseType( "arraybuffer" );

};

NGL.VolumeLoader.prototype = Object.create( NGL.XHRLoader.prototype );

NGL.VolumeLoader.prototype.constructor = NGL.VolumeLoader;

NGL.VolumeLoader.prototype.init = function( bin, name, path, ext, callback, params ){

    params = params || {};

    var parsersClasses = {

        "mrc": NGL.MrcParser,
        "ccp4": NGL.MrcParser,
        "map": NGL.MrcParser,

        "cube": NGL.CubeParser,

    };

    var parser = new parsersClasses[ ext ](
        name, path, params
    );

    return parser.parse( bin, callback );

};


NGL.ObjLoader = function( manager ){

    THREE.PLYLoader.call( this, manager );

};

NGL.ObjLoader.prototype = Object.create( THREE.OBJLoader.prototype );

NGL.ObjLoader.prototype.constructor = NGL.ObjLoader;

NGL.ObjLoader.prototype.init = function( data, name, path, ext, callback ){

    var geometry;

    if( typeof data === "string" ){

        geometry = this.parse( data );

    }else{

        geometry = data;

    }

    var surface = new NGL.Surface( name, path, geometry )

    if( typeof callback === "function" ) callback( surface );

    return surface;

};


NGL.PlyLoader = function(){

    THREE.PLYLoader.call( this );

};

NGL.PlyLoader.prototype = Object.create( THREE.PLYLoader.prototype );

NGL.PlyLoader.prototype.constructor = NGL.PlyLoader;

NGL.PlyLoader.prototype.init = NGL.ObjLoader.prototype.init;


NGL.ScriptLoader = function( manager ){

    NGL.XHRLoader.call( this, manager );

};

NGL.ScriptLoader.prototype = Object.create( NGL.XHRLoader.prototype );

NGL.ScriptLoader.prototype.constructor = NGL.ScriptLoader;

NGL.ScriptLoader.prototype.init = function( data, name, path, ext, callback ){

    var script = new NGL.Script( data, name, path );

    if( typeof callback === "function" ) callback( script );

    return script;

};


NGL.autoLoad = function(){

    var loaders = {

        "gro": NGL.StructureLoader,
        "pdb": NGL.StructureLoader,
        "ent": NGL.StructureLoader,
        "cif": NGL.StructureLoader,
        "mmcif": NGL.StructureLoader,

        "mrc": NGL.VolumeLoader,
        "ccp4": NGL.VolumeLoader,
        "map": NGL.VolumeLoader,
        "cube": NGL.VolumeLoader,

        "obj": NGL.ObjLoader,
        "ply": NGL.PlyLoader,

        "ngl": NGL.ScriptLoader,

    };

    var binary = [ "mrc", "ccp4", "map" ];

    return function( file, onLoad, onProgress, onError, params ){

        var object, rcsb, loader;

        var fileInfo = NGL.getFileInfo( file );

        // NGL.log( fileInfo );

        var path = fileInfo.path;
        var name = fileInfo.name;
        var ext = fileInfo.ext;
        var compressed = fileInfo.compressed;
        var protocol = fileInfo.protocol;

        if( protocol === "rcsb" ){

            // ext = "pdb";
            // file = "www.rcsb.org/pdb/files/" + name + ".pdb";
            ext = "cif";
            compressed = "gz";
            path = "www.rcsb.org/pdb/files/" + name + ".cif.gz";
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

                    NGL.error( e );
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

                NGL.error( e );

            }

        }

        if( file instanceof File ){

            var fileLoader = new NGL.FileLoader();
            if( compressed ) fileLoader.setCompressed( true );
            if( binary.indexOf( ext ) !== -1 ) fileLoader.setAsBinary( true );
            fileLoader.load( file, init, onProgress, error );

        }else if( [ "http", "https", "ftp" ].indexOf( protocol ) !== -1 ){

            loader.setCrossOrigin( true );

            if( compressed ) loader.setCompressed( true );
            loader.load( protocol + "://" + path, init, onProgress, error );

        }else if( protocol === "data" ){

            if( compressed ) loader.setCompressed( true );
            loader.load( "../data/" + path, init, onProgress, error );

        }else{ // default: protocol === "file"

            if( compressed ) loader.setCompressed( true );
            loader.load( "../file/" + path, init, onProgress, error );

        }

        return object;

    }

}();
