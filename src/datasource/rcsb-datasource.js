/**
 * @file RCSB Datasource
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Log, DatasourceRegistry } from "../globals.js";
import { getFileInfo, getProtocol } from "../utils.js";


var baseUrl = "//files.rcsb.org/download/";
var mmtfBaseUrl = "//mmtf.rcsb.org/v1.0/";
var mmtfFullUrl = mmtfBaseUrl + "full/";
var mmtfReducedUrl = mmtfBaseUrl + "reduced/";


function RcsbDatasource(){

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


DatasourceRegistry.add( "rcsb", new RcsbDatasource() );


export default RcsbDatasource;
