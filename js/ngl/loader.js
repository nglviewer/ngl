/**
 * @file Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


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


NGL.ParserLoader = function(){

};

NGL.ParserLoader.prototype = {

    constructor: NGL.ParserLoader,

    init: function( data, name, path, ext, callback, params ){

        params = params || {};

        var parsersClasses = {

            "gro": NGL.GroParser,
            "pdb": NGL.PdbParser,
            "ent": NGL.PdbParser,
            "cif": NGL.CifParser,
            "mmcif": NGL.CifParser,

            "mrc": NGL.MrcParser,
            "ccp4": NGL.MrcParser,
            "map": NGL.MrcParser,

            "cube": NGL.CubeParser,

        };

        var streamer = data;

        params.name = name;
        params.path = path;

        var parser = new parsersClasses[ ext ](
            streamer, params
        );

        return parser.parseWorker( callback );

    },

    load: function ( src, onLoad, onProgress, onError, params ) {

        var streamer;

        if( src instanceof File ){

            streamer = new NGL.FileStreamer( src, params );

        }else{

            streamer = new NGL.NetworkStreamer( src, params );

        }

        streamer.onerror = onError;
        streamer.onprogress = onProgress;

        onLoad( streamer );

    }

};


NGL.autoLoad = function(){

    var loaders = {

        "gro": NGL.ParserLoader,
        "pdb": NGL.ParserLoader,
        "ent": NGL.ParserLoader,
        "cif": NGL.ParserLoader,
        "mmcif": NGL.ParserLoader,

        "mrc": NGL.ParserLoader,
        "ccp4": NGL.ParserLoader,
        "map": NGL.ParserLoader,
        "cube": NGL.ParserLoader,

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

        if( loader instanceof NGL.ParserLoader ){

            var src;
            if( file instanceof File ){
                src = file;
            }else if( [ "http", "https", "ftp" ].indexOf( protocol ) !== -1 ){
                src = protocol + "://" + path;
            }else if( protocol === "data" ){
                src = "../../data/" + path;
            }else{
                src = "../../file/" + path;
            }

            loader.load( src, init, onProgress, error, { compressed: compressed } );

        }else if( file instanceof File ){

            var fileLoader = new NGL.FileLoader();
            if( compressed ) fileLoader.setCompressed( true );
            if( binary.indexOf( ext ) !== -1 ) fileLoader.setAsBinary( true );
            fileLoader.load( file, init, onProgress, error, p );

        }else if( [ "http", "https", "ftp" ].indexOf( protocol ) !== -1 ){

            loader.setCrossOrigin( true );

            if( compressed ) loader.setCompressed( true );
            if( binary.indexOf( ext ) !== -1 ) loader.setAsBinary( true );
            loader.load( protocol + "://" + path, init, onProgress, error, p );

        }else if( protocol === "data" ){

            if( compressed ) loader.setCompressed( true );
            if( binary.indexOf( ext ) !== -1 ) loader.setAsBinary( true );
            loader.load( "../data/" + path, init, onProgress, error, p );

        }else{ // default: protocol === "file"

            if( compressed ) loader.setCompressed( true );
            if( binary.indexOf( ext ) !== -1 ) loader.setAsBinary( true );
            loader.load( "../file/" + path, init, onProgress, error, p );

        }

        return object;

    }

}();
