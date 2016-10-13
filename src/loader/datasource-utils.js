/**
 * @file Datasource Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Log } from "../globals.js";
import { getFileInfo, getAbsolutePath, getProtocol } from "../utils.js";


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
    var mmtfBaseUrl = "//mmtf.rcsb.org/v1.0/";
    var mmtfFullUrl = mmtfBaseUrl + "full/";
    var mmtfReducedUrl = mmtfBaseUrl + "reduced/";

    this.getUrl = function( src ){
        // valid path are
        // XXXX.pdb, XXXX.pdb.gz, XXXX.cif, XXXX.cif.gz, XXXX.mmtf, XXXX.bb.mmtf
        // XXXX defaults to XXXX.cif
        var info = getFileInfo( src );
        var pdbid = info.name.substr( 0, 4 );
        var url;
        if( [ "pdb", "cif" ].includes( info.ext ) &&
            ( info.compressed === false || info.compressed === "gz" )
        ){
            url = baseUrl + info.path;
        }else if( info.ext === "mmtf" ){
            if( info.base.endsWith( ".bb" ) ){
                url = mmtfReducedUrl + pdbid;
            }else{
                url = mmtfFullUrl + pdbid;
            }
        }else if( !info.ext ){
            url = mmtfFullUrl + pdbid;
        }else{
            Log.warn( "unsupported ext", info.ext );
            url = mmtfFullUrl + pdbid;
        }
        return getProtocol() + url;
    };

    this.getExt = function( src ){
        var info = getFileInfo( src );
        if( info.ext === "mmtf" || !info.ext ){
            return "mmtf";
        }
    };

}


function PubchemDatasource(){

    var baseUrl = "//pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/";
    var suffixUrl = "/SDF?record_type=3d";

    this.getUrl = function( src ){
        var info = getFileInfo( src );
        var cid = info.name;
        var url;
        if( !info.ext || info.ext === "sdf" ){
            url = baseUrl + cid + suffixUrl;
        }else{
            Log.warn( "unsupported ext", info.ext );
            url = baseUrl + cid + suffixUrl;
        }
        return getProtocol() + url;
    };

    this.getExt = function( src ){
        var info = getFileInfo( src );
        if( !info.ext || info.ext === "sdf" ){
            return "sdf";
        }
    };

}


export {
    PassThroughDatasource,
    StaticDatasource,
    RcsbDatasource,
    PubchemDatasource
};
