/**
 * @file Loader Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { DatasourceRegistry, ParserRegistry } from "../globals.js";
import { getFileInfo } from "../utils.js";
import ParserLoader from "./parser-loader.js";
import ScriptLoader from "./script-loader.js";
import PluginLoader from "./plugin-loader.js";


function getDataInfo( src ){

    var info = getFileInfo( src );
    var datasource = DatasourceRegistry.get( info.protocol );
    if( datasource ){
        info = getFileInfo( datasource.getUrl( info.src ) );
        if( !info.ext && datasource.getExt ){
            info.ext = datasource.getExt( src );
        }
    }
    return info;
}


/**
 * Load a file
 *
 * @example
 * // load from URL
 * NGL.autoLoad( "http://files.rcsb.org/download/5IOS.cif" );
 *
 * @example
 * // load binary data in CCP4 format via a Blob
 * var binaryBlob = new Blob( [ ccp4Data ], { type: 'application/octet-binary'} );
 * NGL.autoLoad( binaryBlob, { ext: "ccp4" } );
 *
 * @example
 * // load string data in PDB format via a Blob
 * var stringBlob = new Blob( [ pdbData ], { type: 'text/plain'} );
 * NGL.autoLoad( stringBlob, { ext: "pdb" } );
 *
 * @example
 * // load a File object
 * NGL.autoLoad( file );
 *
 * @param  {String|File|Blob} file - either a URL or an object containing the file data
 * @param  {Object} params - loading parameters
 * @param  {String} params.ext - file extension, determines file type
 * @return {Promise} Promise resolves to the loaded data
 */
function autoLoad( file, params ){

    var p = Object.assign( getDataInfo( file ), params );

    var loaderClass;
    if( ParserRegistry.names.includes( p.ext ) ){
        loaderClass = ParserLoader;
    }else if( p.ext === "ngl" ){
        loaderClass = ScriptLoader;
    }else if( p.ext === "plugin" ){
        loaderClass = PluginLoader;
    }

    if( loaderClass ){
        var loader = new loaderClass( p.src, p );
        return loader.load();
    }else{
        return Promise.reject( "autoLoad: ext '" + p.ext + "' unknown" );
    }

}


export {
    getDataInfo,
	autoLoad
};
