/**
 * @file Loader Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import {
  DatasourceRegistry, DecompressorRegistry, ParserRegistry, ScriptExtensions
} from '../globals'
import { Partial } from '../types'
import ParserLoader from './parser-loader'
import ScriptLoader from './script-loader'

export interface LoaderParameters {
 ext: string  // file extension, determines file type
 compressed: string|false  // flag data as compressed
 binary: boolean  // flag data as binary
 name: string  // set data name

 dir: string
 path: string
 protocol: string
}

export type LoaderInput = File|Blob|string

export function getFileInfo (file: LoaderInput) {
  const compressedExtList = DecompressorRegistry.names

  let path: string
  let compressed: string|false
  let protocol = ''

  if (file instanceof File) {
    path = file.name
  } else if (file instanceof Blob) {
    path = ''
  } else {
    path = file
  }
  const queryIndex = path.lastIndexOf('?')
  const query = queryIndex !== -1 ? path.substring(queryIndex) : ''
  path = path.substring(0, queryIndex === -1 ? path.length : queryIndex)

  const name = path.replace(/^.*[\\/]/, '')
  let base = name.substring(0, name.lastIndexOf('.'))

  const nameSplit = name.split('.')
  let ext = nameSplit.length > 1 ? (nameSplit.pop() || '').toLowerCase() : ''

  const protocolMatch = path.match(/^(.+):\/\/(.+)$/)
  if (protocolMatch) {
    protocol = protocolMatch[ 1 ].toLowerCase()
    path = protocolMatch[ 2 ] || ''
  }

  const dir = path.substring(0, path.lastIndexOf('/') + 1)

  if (compressedExtList.includes(ext)) {
    compressed = ext
    const n = path.length - ext.length - 1
    ext = (path.substr(0, n).split('.').pop() || '').toLowerCase()
    const m = base.length - ext.length - 1
    base = base.substr(0, m)
  } else {
    compressed = false
  }

  return { path, name, ext, base, dir, compressed, protocol, query, 'src': file }
}

export function getDataInfo (src: LoaderInput) {
  let info = getFileInfo(src)
  const datasource = DatasourceRegistry.get(info.protocol)
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
export function autoLoad (file: LoaderInput, params: Partial<LoaderParameters> = {}) {
  const p = Object.assign(getDataInfo(file), params)

  let loader
  if (ParserRegistry.names.includes(p.ext)) {
    loader = new ParserLoader(p.src, p)
  } else if (ScriptExtensions.includes(p.ext)) {
    loader = new ScriptLoader(p.src, p)
  }

  if (loader) {
    return loader.load()
  } else {
    return Promise.reject(new Error(`autoLoad: ext '${p.ext}' unknown`))
  }
}
