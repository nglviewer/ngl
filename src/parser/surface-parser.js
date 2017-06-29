/**
 * @file Surface Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Parser from './parser.js'
import Surface from '../surface/surface.js'

class SurfaceParser extends Parser {
  constructor (streamer, params) {
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
