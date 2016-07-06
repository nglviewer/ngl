/**
 * @file Datasource Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Log } from "../globals.js";
import { getFileInfo, getAbsolutePath } from "../utils.js";


function PassThroughDatasource(){

    this.getUrl = function( path ){
        return path;
    };

}


function StaticDatasource( baseUrl ){

    baseUrl = baseUrl || "";

    this.getUrl = function( src ){
        var info = getFileInfo( src );
        return getAbsolutePath( baseUrl + info.path );
    };

}


function RcsbDatasource(){

    var baseUrl = "//files.rcsb.org/download/";
    var mmtfBaseUrl = "//mmtf.rcsb.org/v0.2/full/";
    var bbMmtfBaseUrl = "//mmtf.rcsb.org/v0.2/reduced/";

    this.getUrl = function( src ){
        // valid path are
        // XXXX.pdb, XXXX.pdb.gz, XXXX.cif, XXXX.cif.gz, XXXX.mmtf, XXXX.bb.mmtf
        // XXXX defaults to XXXX.cif
        var info = getFileInfo( src );
        var protocol = window.location.protocol;
        var url;
        if( [ "pdb", "cif" ].indexOf( info.ext ) !== -1 &&
            ( info.compressed === false || info.compressed === "gz" )
        ){
            url = baseUrl + info.path;
        }else if( info.ext === "mmtf" ){
            protocol = "http:";
            if( info.base.endsWith( ".bb" ) ){
                url = bbMmtfBaseUrl + info.name;
            }else{
                url = mmtfBaseUrl + info.name;
            }
        }else if( !info.ext ){
            url = baseUrl + info.name + ".cif";
            // url = mmtfBaseUrl + info.name + ".mmtf";
        }else{
            Log.warn( "unsupported ext", info.ext );
            url = mmtfBaseUrl + info.name;
        }
        return protocol + url;
    };

    this.getExt = function( src ){
        var info = getFileInfo( src );
        if( info.ext === "mmtf" || !info.ext ){
            return "mmtf";
        }
    };

}


export {
    PassThroughDatasource,
    StaticDatasource,
    RcsbDatasource,
    getDataInfo
};
