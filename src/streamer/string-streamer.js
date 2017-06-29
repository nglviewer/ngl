/**
 * @file String Streamer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Streamer from './streamer.js'

class StringStreamer extends Streamer {
  get type () { return 'string' }

  get __srcName () { return 'str' }

  _chunk (start, end) {
    return this.data.substr(start, end)
  }
}

export default StringStreamer
