/**
 * @file Datasource Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { Log } from "../globals.js";
import { getFileInfo, getAbsolutePath } from "../utils.js";


function DatasourceRegistry(){

}

DatasourceRegistry.prototype = {

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
            Log.warn( "overwriting datasource named '" + name + "'" );
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
            Log.error( "no datasource named '" + name + "' found" );
        }
    }

};


function StaticDatasource( baseUrl ){

    baseUrl = baseUrl || "";

    this.getUrl = function( src ){
        var info = getFileInfo( src );
        return getAbsolutePath( baseUrl + info.path );
    };

}


function RcsbDatasource(){

    var baseUrl = "http://files.rcsb.org/download/";
    var mmtfBaseUrl = "http://mmtf.rcsb.org/v0/full/";
    var bbMmtfBaseUrl = "http://mmtf.rcsb.org/reduced/";

    this.getUrl = function( src ){
        // valid path are
        // XXXX.pdb, XXXX.pdb.gz, XXXX.cif, XXXX.cif.gz, XXXX.mmtf, XXXX.bb.mmtf
        // XXXX defaults to XXXX.cif
        var info = getFileInfo( src );
        var file;
        if( [ "pdb", "cif" ].indexOf( info.ext ) !== -1 &&
            ( info.compressed === false || info.compressed === "gz" )
        ){
            return baseUrl + info.path;
        }else if( info.ext === "mmtf" ){
            if( info.base.endsWith( ".bb" ) ){
                return bbMmtfBaseUrl + info.name;
            }else{
                return mmtfBaseUrl + info.name;
            }
        }else if( !info.ext ){
            return baseUrl + info.name + ".cif";
            // return mmtfBaseUrl + info.name + ".mmtf";
        }else{
            console.warn( "unsupported ext", info.ext );
            return mmtfBaseUrl + info.name;
        }
    };

    this.getExt = function( src ){
        var info = getFileInfo( src );
        if( info.ext === "mmtf" || !info.ext ){
            return "mmtf";
        }
    };

}

DatasourceRegistry.prototype.sourceDict.rcsb = new RcsbDatasource();


export {
	DatasourceRegistry,
	getDataInfo
};
