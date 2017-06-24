/**
 * @file Binary Streamer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Streamer from './streamer.js'

class BinaryStreamer extends Streamer {
  constructor (bin, params) {
    if (bin instanceof ArrayBuffer) bin = new Uint8Array(bin)
    super(bin, params)
  }

  get type () { return 'binary' }

  get __srcName () { return 'bin' }
}

export default BinaryStreamer
