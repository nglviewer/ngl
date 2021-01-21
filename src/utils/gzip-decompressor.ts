/**
 * @file Gzip Decompressor
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ungzip } from '../../lib/pako_inflate.es6'

import { DecompressorRegistry } from '../globals'

function gzipDecompress (data: ArrayBuffer|Uint8Array) {
  let decompressedData

  if (data instanceof ArrayBuffer) {
    data = new Uint8Array(data)
  }

  try {
    decompressedData = ungzip(data as Uint8Array)
  } catch (e) {
    decompressedData = data  // assume it is already uncompressed
  }

  return decompressedData
}

DecompressorRegistry.add('gz', gzipDecompress)
