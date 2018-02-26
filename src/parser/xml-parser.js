/**
 * @file Xml Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log, ParserRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import { parseXml } from '../utils/parse-xml.js'
import Parser from './parser.js'

class XmlParser extends Parser {
  constructor (streamer, params) {
    const p = params || {}

    super(streamer, p)

    this.useDomParser = defaults(p.useDomParser, false)

    this.xml = {
      name: this.name,
      path: this.path,
      data: {}
    }
  }

  get type () { return 'xml' }
  get __objName () { return 'xml' }
  get isXml () { return true }

  __xmlParser (xml) {
    return parseXml(xml)
  }

  __domParser (xml) {
    const domParser = new window.DOMParser()
    return domParser.parseFromString(xml, 'text/xml')
  }

  _parse () {
    if (Debug) Log.time('XmlParser._parse ' + this.name)

    if (this.useDomParser) {
      if (this.streamer.data instanceof window.Document) {
        this.xml.data = this.streamer.data
      } else {
        this.xml.data = this.__domParser(this.streamer.asText())
      }
    } else {
      this.xml.data = this.__xmlParser(this.streamer.asText())
    }

    if (Debug) Log.timeEnd('XmlParser._parse ' + this.name)
  }
}

ParserRegistry.add('xml', XmlParser)

export default XmlParser
