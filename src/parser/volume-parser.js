/**
 * @file Volume Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Matrix4 } from 'three'

import { defaults } from '../utils'
import Parser from './parser'
import Volume from '../surface/volume'

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
