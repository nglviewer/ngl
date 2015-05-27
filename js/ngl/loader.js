/**
 * @file Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


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


NGL.decompressWorker = function( data, file, asBinary, callback ){

    if( NGL.worker && typeof Worker !== "undefined" ){

        NGL.time( "NGL.decompressWorker" );

        var worker = new Worker( "../js/worker/decompress.js" );

        worker.onmessage = function( e ){

            NGL.timeEnd( "NGL.decompressWorker" );
            worker.terminate();
            callback( e.data );

        };

        worker.postMessage(
            { data: data, file: file, asBinary: asBinary },
            [ data.buffer ? data.buffer : data ]
        );

    }else{

        NGL.decompress( data, file, asBinary, callback );

    }

};


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

                try{

                    var data = this.response;

                    var loaded = function( d ){

                        THREE.Cache.add( url, d );
                        if ( onLoad ) onLoad( d );

                    }

                    if( scope.compressed ){

                        data = NGL.decompressWorker(
                            data, url, scope.asBinary, loaded
                        );

                    }else{

                        loaded( data );

                    }

                }catch( e ){

                    if ( onError ) onError( "decompression failed" );

                }

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

        if( value ){
            this.setResponseType( "arraybuffer" );
        }

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

            try{

                var data = event.target.result;

                var loaded = function( d ){

                    // THREE.Cache.add( file, d );
                    onLoad( d );

                }

                if( scope.compressed ){

                    NGL.decompressWorker(
                        data, file, scope.asBinary, loaded
                    );

                }else{

                    loaded( data );

                }

            }catch( e ){

                if ( onError ) onError( e, "decompression failed" );

            }

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

        if( this.asBinary || this.compressed ){

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

NGL.StructureLoader.prototype.init = function( data, name, path, ext, callback, params ){

    params = params || {};

    var parsersClasses = {

        "gro": NGL.GroParser,
        "pdb": NGL.PdbParser,
        "ent": NGL.PdbParser,
        "cif": NGL.CifParser,
        "mmcif": NGL.CifParser,

    };

    if( data instanceof ArrayBuffer ) data = new Uint8Array( data );

    data = new NGL.BinaryStreamer( data );

    var parser = new parsersClasses[ ext ](
        name, path, params
    );

    // return parser.parse( data, callback );
    return parser.parseWorker( data, callback );

};


NGL.VolumeLoader = function( manager ){

    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.VolumeLoader.prototype = Object.create( NGL.XHRLoader.prototype );

NGL.VolumeLoader.prototype.constructor = NGL.VolumeLoader;

NGL.VolumeLoader.prototype.init = function( data, name, path, ext, callback, params ){

    params = params || {};

    var parsersClasses = {

        "mrc": NGL.MrcParser,
        "ccp4": NGL.MrcParser,
        "map": NGL.MrcParser,

        "cube": NGL.CubeParser,

    };

    if( data instanceof ArrayBuffer ) data = new Uint8Array( data );

    if( ext === "cube" ) data = new NGL.BinaryStreamer( data );

    var parser = new parsersClasses[ ext ](
        name, path, params
    );

    return parser.parse( data, callback );

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

    var binary = [
        "mrc", "ccp4", "map",
        "cif", "mmcif", "gro", "pdb", "ent",
        "cube"
    ];

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

        var p = params || {};

        if( p.name !== undefined ) name = p.name;
        if( p.ext !== undefined ) ext = p.ext;
        if( p.compressed !== undefined ) compressed = p.compressed;

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
            if( binary.indexOf( ext ) !== -1 ) loader.setAsBinary( true );
            loader.load( protocol + "://" + path, init, onProgress, error );

        }else if( protocol === "data" ){

            if( compressed ) loader.setCompressed( true );
            if( binary.indexOf( ext ) !== -1 ) loader.setAsBinary( true );
            loader.load( "../data/" + path, init, onProgress, error );

        }else{ // default: protocol === "file"

            if( compressed ) loader.setCompressed( true );
            if( binary.indexOf( ext ) !== -1 ) loader.setAsBinary( true );
            loader.load( "../file/" + path, init, onProgress, error );

        }

        return object;

    }

}();
