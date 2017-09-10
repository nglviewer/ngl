/**
 * @file Modelindex Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals'
import Colormaker, { StuctureColormakerParams, ColormakerScale } from './colormaker'
import AtomProxy from '../proxy/atom-proxy'

/**
 * Color by model index
 */
class ModelindexColormaker extends Colormaker {
  modelindexScale: ColormakerScale

  constructor (params: StuctureColormakerParams) {
    super(params)

    if (!params.scale) {
      this.parameters.scale = 'rainbow'
    }
    if (!params.domain) {
      this.parameters.domain = [ 0, params.structure.modelStore.count ]
    }

    this.modelindexScale = this.getScale()
  }

  atomColor (a: AtomProxy) {
    return this.modelindexScale(a.modelIndex)
  }
}

ColormakerRegistry.add('modelindex', ModelindexColormaker as any)

export default ModelindexColormaker
