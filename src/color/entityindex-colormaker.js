/**
 * @file Entityindex Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals.js'
import Colormaker from './colormaker.js'

/**
 * Color by entiry index
 */
class EntityindexColormaker extends Colormaker {
  constructor (params) {
    super(params)

    if (!params.scale) {
      this.scale = 'Spectral'
    }
    if (!params.domain) {
      this.domain = [ 0, this.structure.entityList.length - 1 ]
    }
    var entityindexScale = this.getScale()

    this.atomColor = function (a) {
      return entityindexScale(a.entityIndex)
    }
  }
}

ColormakerRegistry.add('entityindex', EntityindexColormaker)

export default EntityindexColormaker
