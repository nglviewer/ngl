/**
 * @file Surface Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Parser, { ParserParameters } from './parser'
import Surface from '../surface/surface'
import Streamer from '../streamer/streamer';

class SurfaceParser extends Parser {
  constructor (streamer: Streamer, params?:Partial<ParserParameters>) {
    super(streamer, params)

    this.loader = this.getLoader()
    this.surface = new Surface(this.name, this.path)
  }

  get type () { return 'surface' }
  get __objName () { return 'surface' }

  _parse () {
    var geometry = this.loader.parse(this.streamer.asText())

    this.surface.fromGeometry(geometry)
  }
}

export default SurfaceParser
