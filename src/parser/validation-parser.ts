/**
 * @file Validation Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log, ParserRegistry } from '../globals'
import XmlParser, { XmlParserParameters } from './xml-parser'
import Validation from '../structure/validation'
import Streamer from '../streamer/streamer';

class ValidationParser extends XmlParser {
  constructor (streamer: Streamer, params?: Partial<XmlParserParameters>) {
    const p = params || {}

    super(streamer, p)

    this.useDomParser = true
    this.validation = new Validation(this.name, this.path)
  }

  get __objName () { return 'validation' }
  get isXml () { return true }

  _parse () {
    super._parse()

    if (Debug) Log.time('ValidationParser._parse ' + this.name)

    this.validation.fromXml(this.xml.data)

    if (Debug) Log.timeEnd('ValidationParser._parse ' + this.name)
  }
}

ParserRegistry.add('validation', ValidationParser)

export default ValidationParser
