/**
 * @file Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


///////////
// Loader

NGL.Loader = function( src, params ){

    var p = Object.assign( {}, params );

    this.compressed = p.compressed || false;
    this.name = p.name || "";
    this.ext = p.ext || "";
    this.dir = p.dir || "";
    this.path = p.path || "";
    this.protocol = p.protocol || "";

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

    if( typeof p.onProgress === "function" ){

        this.streamer.onprogress = p.onprogress;

    }

};

NGL.Loader.prototype = {

    constructor: NGL.Loader,

    load: function(){

        return new Promise( function( resolve, reject ){

            this.streamer.onerror = reject;

            try{

                this._load( resolve, reject );

            }catch( e ){

                reject( e );

            }

        }.bind( this ) );

    },

    _load: function( resolve, reject ){

        reject( "not implemented" );

    }

};


NGL.ParserLoader = function( src, params ){

    NGL.Loader.call( this, src, params );

};

NGL.ParserLoader.prototype = NGL.createObject(

    NGL.Loader.prototype, {

    constructor: NGL.ParserLoader,

    _load: function( resolve, reject ){

        var parsersClasses = {

            "gro": NGL.GroParser,
            "pdb": NGL.PdbParser,
            "ent": NGL.PdbParser,
            "pqr": NGL.PqrParser,
            "cif": NGL.CifParser,
            "mcif": NGL.CifParser,
            "mmcif": NGL.CifParser,
            "sdf": NGL.SdfParser,
            "mol2": NGL.Mol2Parser,

            "mrc": NGL.MrcParser,
            "ccp4": NGL.MrcParser,
            "map": NGL.MrcParser,

            "cube": NGL.CubeParser,
            "dx": NGL.DxParser,

            "ply": NGL.PlyParser,
            "obj": NGL.ObjParser,

            "txt": NGL.TextParser,
            "text": NGL.TextParser,
            "csv": NGL.CsvParser,
            "json": NGL.JsonParser

        };

        var parser = new parsersClasses[ this.ext ](
            this.streamer, this.params
        );

        parser.parseWorker( resolve );

    }

} );


NGL.ScriptLoader = function( src, params ){

    NGL.Loader.call( this, src, params );

};

NGL.ScriptLoader.prototype = NGL.createObject(

    NGL.Loader.prototype, {

    constructor: NGL.ScriptLoader,

    _load: function( resolve, reject ){

        this.streamer.read( function(){

            var text = NGL.Uint8ToString( this.streamer.data );

            var script = new NGL.Script( text, this.name, this.path );

            resolve( script );

        }.bind( this ) );

    }

} );


NGL.PluginLoader = function( src, params ){

    NGL.Loader.call( this, src, params );

};

NGL.PluginLoader.prototype = NGL.createObject(

    NGL.Loader.prototype, {

    constructor: NGL.PluginLoader,

    _load: function( resolve, reject ){

        var basePath = this.protocol + "://" + this.dir;

        this.streamer.read( function(){

            var text = NGL.Uint8ToString( this.streamer.data );
            var manifest = JSON.parse( text );
            var promiseList = [];

            manifest.files.map( function( name ){

                promiseList.push(
                    NGL.autoLoad( basePath + name, { ext: "text" } )
                );

            } );

            Promise.all( promiseList ).then( function( dataList ){

                var text = dataList.reduce( function( text, value ){
                    return text + "\n\n" + value.data;
                }, "" );
                text += manifest.source || "";

                var script = new NGL.Script( text, this.name, this.path );
                resolve( script );

            }.bind( this ) );

        }.bind( this ) );

    }

} );


NGL.loaderMap = {

    "gro": NGL.ParserLoader,
    "pdb": NGL.ParserLoader,
    "ent": NGL.ParserLoader,
    "pqr": NGL.ParserLoader,
    "cif": NGL.ParserLoader,
    "mcif": NGL.ParserLoader,
    "mmcif": NGL.ParserLoader,
    "sdf": NGL.ParserLoader,
    "mol2": NGL.ParserLoader,

    "mrc": NGL.ParserLoader,
    "ccp4": NGL.ParserLoader,
    "map": NGL.ParserLoader,
    "cube": NGL.ParserLoader,
    "dx": NGL.ParserLoader,

    "obj": NGL.ParserLoader,
    "ply": NGL.ParserLoader,

    "txt": NGL.ParserLoader,
    "text": NGL.ParserLoader,
    "csv": NGL.ParserLoader,
    "json": NGL.ParserLoader,

    "ngl": NGL.ScriptLoader,
    "plugin": NGL.PluginLoader,

};


NGL.autoLoad = function( file, params ){

    var fileInfo = NGL.getFileInfo( file );

    var path = fileInfo.path;
    var name = fileInfo.name;
    var ext = fileInfo.ext;
    var dir = fileInfo.dir;
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

    var p = Object.assign( {}, params );

    // deprecated
    if( typeof params === "function" ){
        console.warn( "NGL.autoLoad: function param deprecated" )
        p = {};
    }else{
        if( p.onLoad ) console.warn( "NGL.autoLoad onLoad param deprecated" )
        if( p.onError ) console.warn( "NGL.autoLoad onError param deprecated" )
    }

    p.name = p.name !== undefined ? p.name : name;
    p.ext = p.ext !== undefined ? p.ext : ext;
    p.compressed = p.compressed !== undefined ? p.compressed : compressed;
    p.path = p.path !== undefined ? p.path : path;
    p.protocol = protocol;
    p.dir = dir;

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

    if( p.ext in NGL.loaderMap ){

        var loader = new NGL.loaderMap[ p.ext ]( src, p );
        return loader.load();

    }else{

        return Promise.reject( "NGL.autoLoading: ext '" + p.ext + "' unknown" );

    }

};
