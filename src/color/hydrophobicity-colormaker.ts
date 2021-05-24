/**
 * @file Hydrophobicity Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals'
import Colormaker, { ColormakerParameters, ColormakerScale, manageColor } from './colormaker'
import AtomProxy from '../proxy/atom-proxy'

import {
    ResidueHydrophobicity, DefaultResidueHydrophobicity
} from '../structure/structure-constants'

/**
 * Color by hydrophobicity
 */
class HydrophobicityColormaker extends Colormaker {
  hfScale: ColormakerScale
  resHF: { [k: string]: number } = {}
  defaultResidueHydrophobicity: number

  constructor (params: ColormakerParameters) {
    super(params)

    if (!params.scale) {
      this.parameters.scale = 'RdYlGn'
    }

    const idx = 0  // 0: DGwif, 1: DGwoct, 2: Oct-IF

    for (const name in ResidueHydrophobicity) {
      this.resHF[ name ] = ResidueHydrophobicity[ name ][ idx ]
    }
    this.defaultResidueHydrophobicity = DefaultResidueHydrophobicity[idx]

    if (!params.domain) {
      let min = Infinity
      let max = -Infinity

      for (const name in this.resHF) {
        const val = this.resHF[ name ]
        min = Math.min(min, val)
        max = Math.max(max, val)
      }

      this.parameters.domain = [ min, 0, max ]
    }

    this.hfScale = this.getScale()
  }

  @manageColor
  atomColor (a: AtomProxy) {
    return this.hfScale(this.resHF[ a.resname ] || this.defaultResidueHydrophobicity)
  }
}

ColormakerRegistry.add('hydrophobicity', HydrophobicityColormaker as any)

export default HydrophobicityColormaker
