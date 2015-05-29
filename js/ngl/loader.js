/**
 * @file Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


///////////
// Loader

NGL.Loader = function(){

};

NGL.Loader.prototype = {

    constructor: NGL.Loader,

    init: function( data, name, path, ext, callback, params ){

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


NGL.ParserLoader = function(){

};

NGL.ParserLoader.prototype = NGL.createObject(

    NGL.Loader.prototype, {

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

            "ply": NGL.PlyParser,
            "obj": NGL.ObjParser

        };

        var streamer = data;

        params.name = name;
        params.path = path;

        var parser = new parsersClasses[ ext ](
            streamer, params
        );

        return parser.parseWorker( callback );

    }

} );


NGL.ScriptLoader = function(){

};

NGL.ScriptLoader.prototype = NGL.createObject(

    NGL.Loader.prototype, {

    constructor: NGL.ScriptLoader,

    init: function( data, name, path, ext, callback, params ){

        params = params || {};

        var script = new NGL.Script( data, name, path );

        if( typeof callback === "function" ) callback( script );

        return script;

    },

    load: function ( src, onLoad, onProgress, onError, params ) {

        function _onLoad( streamer ){

            streamer.read( function(){

                var text = NGL.Uint8ToString( streamer.data );

                onLoad( text );

            } );

        }

        NGL.Loader.prototype.load.call(

            this, src, _onLoad, onProgress, onError, params

        );

    }

} );


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

        "obj": NGL.ParserLoader,
        "ply": NGL.ParserLoader,

        "ngl": NGL.ScriptLoader,

    };

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

        var src;

        if( file instanceof File ){

            src = file;

        }else if( [ "http", "https", "ftp" ].indexOf( protocol ) !== -1 ){

            src = protocol + "://" + path;

        }else if( protocol === "data" ){

            src = "../data/" + path;

        }else{

            src = "../file/" + path;

        }

        loader.load( src, init, onProgress, error, { compressed: compressed } );

        return object;

    }

}();
