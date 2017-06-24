/**
 * @file Modelindex Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals.js'
import Colormaker from './colormaker.js'

/**
 * Color by model index
 */
class ModelindexColormaker extends Colormaker {
  constructor (params) {
    super(params)

    if (!params.scale) {
      this.scale = 'rainbow'
    }
    if (!params.domain) {
      this.domain = [ 0, this.structure.modelStore.count ]
    }
    var modelindexScale = this.getScale()

    this.atomColor = function (a) {
      return modelindexScale(a.modelIndex)
    }
  }
}

ColormakerRegistry.add('modelindex', ModelindexColormaker)

export default ModelindexColormaker
