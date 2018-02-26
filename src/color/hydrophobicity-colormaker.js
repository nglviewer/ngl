/**
 * @file Hydrophobicity Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals.js'
import Colormaker from './colormaker.js'

import {
    ResidueHydrophobicity, DefaultResidueHydrophobicity
} from '../structure/structure-constants.js'

/**
 * Color by hydrophobicity
 */
class HydrophobicityColormaker extends Colormaker {
  constructor (params) {
    super(params)

    if (!params.scale) {
      this.scale = 'RdYlGn'
    }

    var name
    var idx = 0  // 0: DGwif, 1: DGwoct, 2: Oct-IF

    var resHF = {}
    for (name in ResidueHydrophobicity) {
      resHF[ name ] = ResidueHydrophobicity[ name ][ idx ]
    }

    if (!params.domain) {
      var val
      var min = Infinity
      var max = -Infinity

      for (name in resHF) {
        val = resHF[ name ]
        min = Math.min(min, val)
        max = Math.max(max, val)
      }

      this.domain = [ min, 0, max ]
    }

    var hfScale = this.getScale()

    this.atomColor = function (a) {
      return hfScale(resHF[ a.resname ] || DefaultResidueHydrophobicity)
    }
  }
}

ColormakerRegistry.add('hydrophobicity', HydrophobicityColormaker)

export default HydrophobicityColormaker
