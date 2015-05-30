/**
 * @file Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


///////////
// Loader

NGL.Loader = function( src, params ){

    var p = params || {};

    if( typeof p.onLoad === "function" ) this.onload = p.onLoad;
    if( typeof p.onProgress === "function" ) this.onprogress = p.onProgress;
    if( typeof p.onError === "function" ) this.onerror = p.onError;

    this.compressed = p.compressed || false;
    this.name = p.name || "";
    this.ext = p.ext || "";
    this.path = p.path || "";

    //

    var streamerParams = {

        compressed: this.compressed

    };

    if( src instanceof File ){

        this.streamer = new NGL.FileStreamer( src, streamerParams );

    }else{

        this.streamer = new NGL.NetworkStreamer( src, streamerParams );

    }

    this.streamer.onerror = this.onError;
    this.streamer.onprogress = this.onProgress;

};

NGL.Loader.prototype = {

    constructor: NGL.Loader,

    onload: function(){},

    onprogress: function(){},

    onerror: function( e ){

        NGL.error( e );

    },

    load: function(){

        try{

            this._load();

        }catch( e ){

            NGL.error( e );
            this.onerror( "loading failed" );

        }

    },

    _load: function(){}

};


NGL.ParserLoader = function( src, params ){

    NGL.Loader.call( this, src, params );

};

NGL.ParserLoader.prototype = NGL.createObject(

    NGL.Loader.prototype, {

    constructor: NGL.ParserLoader,

    _load: function(){

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

        var params = {
            name: this.name,
            path: this.path
        };

        var parser = new parsersClasses[ this.ext ](
            this.streamer, params
        );

        parser.parseWorker( this.onload );

    }

} );


NGL.ScriptLoader = function( src, params ){

    NGL.Loader.call( this, src, params );

};

NGL.ScriptLoader.prototype = NGL.createObject(

    NGL.Loader.prototype, {

    constructor: NGL.ScriptLoader,

    _load: function(){

        this.streamer.read( function(){

            var text = NGL.Uint8ToString( this.streamer.data );

            var script = new NGL.Script( text, this.name, this.path );

            this.onload( script );

        }.bind( this ) );

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

        if( ext in loaders ){

            loader = new loaders[ ext ]( src, {

                onLoad: onLoad,
                onProgress: onProgress,
                onError: onError,

                compressed: compressed,
                name: name,
                ext: ext,
                path: path

            } );

        }else{

            var e = "NGL.autoLoading: ext '" + ext + "' unknown";

            if( typeof onError === "function" ){

                onError( e );

            }else{

                NGL.error( e );

            }

            return null;

        }

        loader.load();

    }

}();
