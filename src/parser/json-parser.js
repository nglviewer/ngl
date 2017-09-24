/**
 * @file Json Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ParserRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import Parser from './parser.js'

class JsonParser extends Parser {
  constructor (streamer, params) {
    const p = params || {}

    super(streamer, p)

    this.string = defaults(p.string, false)

    this.json = {
      name: this.name,
      path: this.path,
      data: {}
    }
  }

  get type () { return 'json' }
  get __objName () { return 'json' }
  get isJson () { return true }

  _parse () {
    if (this.streamer.isBinary() || this.string) {
      this.json.data = JSON.parse(this.streamer.asText())
    } else {
      this.json.data = this.streamer.data
    }
  }
}

ParserRegistry.add('json', JsonParser)

export default JsonParser
