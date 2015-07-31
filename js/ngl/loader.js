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

    this.params = params;

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
            "mcif": NGL.CifParser,
            "mmcif": NGL.CifParser,
            "sdf": NGL.SdfParser,
            "mol2": NGL.Mol2Parser,

            "mrc": NGL.MrcParser,
            "ccp4": NGL.MrcParser,
            "map": NGL.MrcParser,

            "cube": NGL.CubeParser,

            "ply": NGL.PlyParser,
            "obj": NGL.ObjParser,

            "txt": NGL.TextParser,
            "csv": NGL.CsvParser,
            "json": NGL.JsonParser

        };

        var parser = new parsersClasses[ this.ext ](
            this.streamer, this.params
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
        "mcif": NGL.ParserLoader,
        "mmcif": NGL.ParserLoader,
        "sdf": NGL.ParserLoader,
        "mol2": NGL.ParserLoader,

        "mrc": NGL.ParserLoader,
        "ccp4": NGL.ParserLoader,
        "map": NGL.ParserLoader,
        "cube": NGL.ParserLoader,

        "obj": NGL.ParserLoader,
        "ply": NGL.ParserLoader,

        "txt": NGL.ParserLoader,
        "csv": NGL.ParserLoader,
        "json": NGL.ParserLoader,

        "ngl": NGL.ScriptLoader,

    };

    return function( file, params ){

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

        //

        var _onLoad;
        var p = params || {};

        // allow loadFile( path, onLoad ) method signature
        if( typeof params === "function" ){

            _onLoad = params;
            p = {};

        }else{

            _onLoad = p.onLoad;

        }

        p.name = p.name !== undefined ? p.name : name;
        p.ext = p.ext !== undefined ? p.ext : ext;
        p.compressed = p.compressed !== undefined ? p.compressed : compressed;
        p.path = p.path !== undefined ? p.path : path;

        p.onLoad = function( object ){

            // relay params
            if( typeof _onLoad === "function" ) _onLoad( object, p );

        };

        //

        var src;

        if( file instanceof File ){

            src = file;

        }else if( [ "http", "https", "ftp" ].indexOf( protocol ) !== -1 ){

            src = protocol + "://" + path;

        }else if( protocol === "data" ){

            src = NGL.getAbsolutePath( NGL.dataProtocolRelativePath + path );

        }else{

            src = NGL.getAbsolutePath( NGL.fileProtocolRelativePath + path );

        }

        //

        if( p.ext in loaders ){

            var loader = new loaders[ p.ext ]( src, p );

            loader.load();

        }else{

            var e = "NGL.autoLoading: ext '" + p.ext + "' unknown";

            if( typeof p.onError === "function" ){

                p.onError( e );

            }else{

                NGL.error( e );

            }

            return null;

        }

    }

}();
