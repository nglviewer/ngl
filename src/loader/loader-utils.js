/**
 * @file Loader Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import ParserLoader from "./parser-loader.js";
import ScriptLoader from "./script-loader.js";
import PluginLoader from "./plugin-loader.js";

import { getDataInfo } from "./datasource-utils.js";


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


autoLoad = function( file, params ){

    var p = Object.assign( getDataInfo( file ), params );
    var loader = new loaderMap[ p.ext ]( p.src, p );

    if( loader ){
        return loader.load();
    }else{
        return Promise.reject( "autoLoad: ext '" + p.ext + "' unknown" );
    }

};


export {
	autoLoad
};
