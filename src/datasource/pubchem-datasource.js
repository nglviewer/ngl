/**
 * @file PubChem Datasource
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Log, DatasourceRegistry } from "../globals.js";
import { getFileInfo, getProtocol } from "../utils.js";


var baseUrl = "//pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/";
var suffixUrl = "/SDF?record_type=3d";


function PubchemDatasource(){

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


DatasourceRegistry.add( "pubchem", new PubchemDatasource() );


export default PubchemDatasource;
