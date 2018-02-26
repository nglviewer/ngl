/**
 * @file Text Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ParserRegistry } from '../globals.js'
import Parser from './parser.js'

class TextParser extends Parser {
  constructor (streamer, params) {
    super(streamer, params)

    this.text = {

      name: this.name,
      path: this.path,
      data: ''

    }
  }

  get type () { return 'text' }
  get __objName () { return 'text' }

  _parse () {
    this.text.data = this.streamer.asText()
  }
}

ParserRegistry.add('txt', TextParser)
ParserRegistry.add('text', TextParser)

export default TextParser
