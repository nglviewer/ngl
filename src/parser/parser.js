/**
 * @file Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log } from '../globals.js'
import { defaults } from '../utils.js'

class Parser {
  constructor (streamer, params) {
    var p = params || {}

    this.streamer = streamer

    this.name = defaults(p.name, '')
    this.path = defaults(p.path, '')
  }

  get type () { return '' }
  get __objName () { return '' }
  get isBinary () { return false }
  get isJson () { return false }
  get isXml () { return false }

  parse () {
    return this.streamer.read().then(() => {
      this._beforeParse()
      this._parse()
      this._afterParse()
      return this[ this.__objName ]
    })
  }

  _parse () {}

  _beforeParse () {}

  _afterParse () {
    if (Debug) Log.log(this[ this.__objName ])
  }
}

export default Parser
