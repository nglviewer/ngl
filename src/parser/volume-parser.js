/**
 * @file Volume Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Matrix4 } from '../../lib/three.es6.js'

import { defaults } from '../utils.js'
import Parser from './parser.js'
import Volume from '../surface/volume.js'

class VolumeParser extends Parser {
  constructor (streamer, params) {
    const p = params || {}

    super(streamer, p)

    this.volume = new Volume(this.name, this.path)
    this.voxelSize = defaults(p.voxelSize, 1)
  }

  get type () { return 'volume' }
  get __objName () { return 'volume' }

  _afterParse () {
    this.volume.setMatrix(this.getMatrix())
    super._afterParse()
  }

  getMatrix () {
    return new Matrix4()
  }
}

export default VolumeParser
