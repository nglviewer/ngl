/**
 * @file Pass Through Datasource
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { DatasourceRegistry } from "../globals.js";


function PassThroughDatasource(){

    this.getUrl = function( path ){
        return path;
    };

}


DatasourceRegistry.add( "ftp", new PassThroughDatasource() );
DatasourceRegistry.add( "http", new PassThroughDatasource() );
DatasourceRegistry.add( "https", new PassThroughDatasource() );


export default PassThroughDatasource;
