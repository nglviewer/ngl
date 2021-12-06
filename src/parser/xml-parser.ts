/**
 * @file Xml Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log, ParserRegistry } from '../globals'
import { defaults } from '../utils'
// @ts-ignore: unused import XMLNode required for declaration only
import { parseXml, XMLNode } from '../utils/parse-xml'
import Parser, { ParserParameters } from './parser'
import Streamer from '../streamer/streamer';

export interface XmlParserParameters extends ParserParameters {
  useDomParser: boolean
}

class XmlParser extends Parser {
  xml: {
    name: string
    path: string
    data: any
  }
  constructor (streamer: Streamer, params?: Partial<XmlParserParameters>) {
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

  __xmlParser (xml: string) {
    return parseXml(xml)
  }

  __domParser (xml: string) {
    const domParser = new (window as any).DOMParser() as DOMParser
    return domParser.parseFromString(xml, 'text/xml')
  }

  _parse () {
    if (Debug) Log.time('XmlParser._parse ' + this.name)

    if (this.useDomParser) {
      if (this.streamer.data instanceof Document) { //TS conversion: stripped the window prefix from window.Document
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
