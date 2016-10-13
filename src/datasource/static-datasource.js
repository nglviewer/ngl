/**
 * @file Static Datasource
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { getFileInfo, getAbsolutePath } from "../utils.js";


function StaticDatasource( baseUrl ){

    baseUrl = baseUrl || "";

    this.getUrl = function( src ){
        var info = getFileInfo( src );
        return getAbsolutePath( baseUrl + info.path );
    };

}


export default StaticDatasource;
