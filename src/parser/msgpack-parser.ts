/**
 * @file Msgpack Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log, ParserRegistry } from '../globals'
import Parser, { ParserParameters } from './parser'

import { decodeMsgpack } from '../../lib/mmtf.es6'
import Streamer from '../streamer/streamer';

class MsgpackParser extends Parser {
  constructor (streamer: Streamer, params?: Partial<ParserParameters>) {
    const p = params || {}

    super(streamer, p)

    this.msgpack = {
      name: this.name,
      path: this.path,
      data: undefined
    }
  }

  get type () { return 'msgpack' }
  get __objName () { return 'msgpack' }
  get isBinary () { return true }

  _parse () {
    if (Debug) Log.time('MsgpackParser._parse ' + this.name)

    this.msgpack.data = decodeMsgpack(this.streamer.data)

    if (Debug) Log.timeEnd('MsgpackParser._parse ' + this.name)
  }
}

ParserRegistry.add('msgpack', MsgpackParser)

export default MsgpackParser
