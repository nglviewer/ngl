/**
 * @file Loader Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import {
  DatasourceRegistry, ParserRegistry, ScriptExtensions
} from '../globals.js'
import { getFileInfo } from '../utils.js'
import ParserLoader from './parser-loader.js'
import ScriptLoader from './script-loader.js'
import PluginLoader from './plugin-loader.js'

function getDataInfo (src) {
  var info = getFileInfo(src)
  var datasource = DatasourceRegistry.get(info.protocol)
  if (datasource) {
    info = getFileInfo(datasource.getUrl(info.src))
    if (!info.ext && datasource.getExt) {
      info.ext = datasource.getExt(src)
    }
  }
  return info
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
 * @param  {LoaderParameters} params - loading parameters
 * @return {Promise} Promise resolves to the loaded data
 */
function autoLoad (file, params) {
  var p = Object.assign(getDataInfo(file), params)

  var LoaderClass
  if (ParserRegistry.names.includes(p.ext)) {
    LoaderClass = ParserLoader
  } else if (ScriptExtensions.includes(p.ext)) {
    LoaderClass = ScriptLoader
  } else if (p.ext === 'plugin') {
    LoaderClass = PluginLoader
  }

  if (LoaderClass) {
    var loader = new LoaderClass(p.src, p)
    return loader.load()
  } else {
    return Promise.reject(new Error("autoLoad: ext '" + p.ext + "' unknown"))
  }
}

export {
  getDataInfo,
  autoLoad
}
