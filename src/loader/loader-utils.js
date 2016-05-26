/**
 * @file Loader Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { DatasourceRegistry } from "../globals.js";
import { getFileInfo } from "../utils.js";
import ParserLoader from "./parser-loader.js";
import ScriptLoader from "./script-loader.js";
import PluginLoader from "./plugin-loader.js";


function getDataInfo( src ){

    var info = getFileInfo( src );
    var datasource = DatasourceRegistry.get( info.protocol );
    var url = datasource.getUrl( info.src );
    var info2 = getFileInfo( url );
    if( !info2.ext && datasource.getExt ){
        info2.ext = datasource.getExt( src );
    }

    return info2;

}


var loaderMap = {

    "gro": ParserLoader,
    "pdb": ParserLoader,
    "pdb1": ParserLoader,
    "ent": ParserLoader,
    "pqr": ParserLoader,
    "cif": ParserLoader,
    "mcif": ParserLoader,
    "mmcif": ParserLoader,
    "sdf": ParserLoader,
    "mol2": ParserLoader,
    "mmtf":  ParserLoader,

    "dcd": ParserLoader,

    "mrc": ParserLoader,
    "ccp4": ParserLoader,
    "map": ParserLoader,
    "cube": ParserLoader,
    "dx": ParserLoader,
    "dxbin": ParserLoader,

    "obj": ParserLoader,
    "ply": ParserLoader,

    "txt": ParserLoader,
    "text": ParserLoader,
    "csv": ParserLoader,
    "json": ParserLoader,
    "xml": ParserLoader,

    "ngl": ScriptLoader,
    "plugin": PluginLoader,

};


function autoLoad( file, params ){

    var p = Object.assign( getDataInfo( file ), params );
    var loader = new loaderMap[ p.ext ]( p.src, p );

    if( loader ){
        return loader.load();
    }else{
        return Promise.reject( "autoLoad: ext '" + p.ext + "' unknown" );
    }

}


export {
    getDataInfo,
	autoLoad
};