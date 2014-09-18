/**
 * @file Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


///////////
// Loader

NGL.FileLoader = function( manager ){

    this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.FileLoader.prototype = {

    constructor: NGL.FileLoader,

    load: function ( file, onLoad ) {

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

        // TODO binary?
        reader.readAsText( file );

        scope.manager.itemStart( file );

    }

};


NGL.PdbLoader = function( manager ){

    this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.PdbLoader.prototype = Object.create( THREE.XHRLoader.prototype );

NGL.PdbLoader.prototype.init = function( str, name, path, callback ){

    var pdb = new NGL.PdbStructure( name, path );

    pdb.parse( str, callback );

    return pdb

};


NGL.GroLoader = function( manager ){

    this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.GroLoader.prototype = Object.create( THREE.XHRLoader.prototype );

NGL.GroLoader.prototype.init = function( str, name, path, callback ){

    var gro = new NGL.GroStructure( name, path );

    gro.parse( str, callback );

    return gro

};


NGL.ObjLoader = function( manager ){

    // this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.ObjLoader.prototype = Object.create( THREE.OBJLoader.prototype );

NGL.ObjLoader.prototype.init = function( data, name, path, callback ){

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

NGL.PlyLoader.prototype.init = function( data, name, path, callback ){

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

NGL.ScriptLoader.prototype = Object.create( THREE.XHRLoader.prototype );

NGL.ScriptLoader.prototype.init = function( data, name, path, callback ){

    var script = new NGL.Script( data, name, path );

    if( typeof callback === "function" ) callback( script );

    return script;

};


NGL.autoLoad = function(){

    var loaders = {

        "gro": NGL.GroLoader,
        "pdb": NGL.PdbLoader,

        "obj": NGL.ObjLoader,
        "ply": NGL.PlyLoader,

        "ngl": NGL.ScriptLoader,

    }

    return function( file, onLoad ){

        var object, rcsb;

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

        var loader = new loaders[ ext ];

        if( !loader ){

            console.error( "NGL.autoLoading: ext '" + ext + "' unknown" );
            return null;

        }

        function init( data ){

            object = loader.init( data, name, path, function( _object ){

                if( typeof onLoad === "function" ) onLoad( _object );

            } );

        }

        if( file instanceof File ){

            name = file.name;

            var fileLoader = new NGL.FileLoader();
            fileLoader.load( file, init )

        }else if( rcsb ){

            loader.load( file, init );

        }else{

            loader.load( "../data/" + file, init );

        }

        return object;

    }

}();
