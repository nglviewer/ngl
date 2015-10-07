/**
 * @file Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


///////////////
// Datasource

NGL.DatasourceRegistry = {

    sourceDict: {},

    listing: undefined,
    trajectory: undefined,

    __passThrough: {
        getUrl: function( path ){
            return path;
        }
    },

    add: function( name, datasource ){
        name = name.toLowerCase();
        if( name in this.sourceDict ){
            NGL.warn( "overwriting datasource named '" + name + "'" );
        }
        this.sourceDict[ name ] = datasource;
    },

    get: function( name ){
        name = name || "";
        name = name.toLowerCase();
        if( name in this.sourceDict ){
            return this.sourceDict[ name ];
        }else if( [ "http", "https", "ftp" ].indexOf( name ) !== -1 ){
            return this.__passThrough;
        }else if( !name ){
            return this.__passThrough;
        }else{
            NGL.error( "no datasource named '" + name + "' found" );
        }
    }

};


NGL.getDataInfo = function( src ){

    var info = NGL.getFileInfo( src );
    var datasource = NGL.DatasourceRegistry.get( info.protocol );
    var url = datasource.getUrl( info.src );

    return NGL.getFileInfo( url );

};


NGL.StaticDatasource = function( baseUrl ){

    baseUrl = baseUrl || "";

    this.getUrl = function( src ){
        var info = NGL.getFileInfo( src );
        return NGL.getAbsolutePath( baseUrl + info.path );
    };

};


NGL.RcsbDatasource = function(){

    var baseUrl = "http://www.rcsb.org/pdb/files/";

    this.getUrl = function( src ){
        // valid path are
        // XXXX.pdb, XXXX.pdb.gz, XXXX.cif, XXXX.cif.gz
        // XXXX defaults to XXXX.cif.gz
        var info = NGL.getFileInfo( src );
        var file;
        if( [ "pdb", "cif" ].indexOf( info.ext ) !== -1 &&
            ( info.compressed === false || info.compressed === "gz" )
        ){
            file = info.path;
        }else{
            file = info.name + ".cif.gz";
        }
        return baseUrl + file;
    };

};

NGL.DatasourceRegistry.add(
    "rcsb", new NGL.RcsbDatasource()
);


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

    this.noWorker = this.params.noWorker || false;

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
            "json": NGL.JsonParser,
            "xml": NGL.XmlParser

        };

        var parser = new parsersClasses[ this.ext ](
            this.streamer, this.params
        );

        if( this.noWorker ){

            parser.parse( resolve );

        }else{

            parser.parseWorker( resolve );

        }

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

        var basePath;
        if( this.protocol ){
            basePath = this.protocol + "://" + this.dir;
        }else{
            basePath = this.dir;
        }

        this.streamer.read( function(){

            var text = NGL.Uint8ToString( this.streamer.data );
            var manifest = JSON.parse( text );
            var promiseList = [];

            manifest.files.map( function( name ){

                promiseList.push(
                    NGL.autoLoad( basePath + name, {
                        ext: "text", noWorker: true
                    } )
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
    "xml": NGL.ParserLoader,

    "ngl": NGL.ScriptLoader,
    "plugin": NGL.PluginLoader,

};


NGL.autoLoad = function( file, params ){

    var p = Object.assign( NGL.getDataInfo( file ), params );
    var loader = new NGL.loaderMap[ p.ext ]( p.src, p );

    if( loader ){
        return loader.load();
    }else{
        return Promise.reject( "NGL.autoLoading: ext '" + p.ext + "' unknown" );
    }

};
