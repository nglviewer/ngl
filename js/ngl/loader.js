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

                scope.cache.add( url, this.response )

                if ( onLoad ) onLoad( this.response );

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

            scope.cache.add( file, this.response );

            onLoad( event.target.result );
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

        // TODO binary?
        reader.readAsText( file );

        scope.manager.itemStart( file );

    }

};


NGL.StructureLoader = function( manager ){

    this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.StructureLoader.prototype = Object.create( NGL.XHRLoader.prototype );

NGL.StructureLoader.prototype.init = function( str, name, path, ext, callback, params ){

    var p = params || {};

    var parsersClasses = {

        "gro": NGL.GroParser,
        "pdb": NGL.PdbParser,
        "cif": NGL.CifParser,

    };

    var parser = new parsersClasses[ ext ](
        name, path, p.firstModelOnly, p.asTrajectory
    );

    return parser.parse( str, callback );

};


NGL.ObjLoader = function( manager ){

    // this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.ObjLoader.prototype = Object.create( THREE.OBJLoader.prototype );

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

        var path = ( file instanceof File ) ? file.name : file;
        var name = path.replace( /^.*[\\\/]/, '' );
        var ext = path.split('.').pop().toLowerCase();

        // FIXME can lead to false positives
        // maybe use a fake protocoll like rcsb://
        if( name.length === 4 && name == path && name.toLowerCase() === ext ){

            ext = "pdb";
            file = "http://www.rcsb.org/pdb/files/" + name + ".pdb";

            rcsb = true;

        }

        if( ext in loaders ){

            loader = new loaders[ ext ];

        }else{

            error( "NGL.autoLoading: ext '" + ext + "' unknown" );

            return null;

        }

        function init( data ){

            if( data ){

                object = loader.init( data, name, path, ext, function( _object ){

                    if( typeof onLoad === "function" ) onLoad( _object );

                }, params );

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

            name = file.name;

            var fileLoader = new NGL.FileLoader();
            fileLoader.load( file, init, onProgress, error );

        }else if( rcsb ){

            loader.load( file, init, onProgress, error );

        }else{

            loader.load( "../data/" + file, init, onProgress, error );

        }

        return object;

    }

}();
