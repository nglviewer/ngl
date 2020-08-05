/**
 * @file Moleculetype Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals'
import Colormaker, { manageColor } from './colormaker'
import AtomProxy from '../proxy/atom-proxy'

import {
    WaterType, IonType, ProteinType, RnaType, DnaType, SaccharideType
} from '../structure/structure-constants'

/**
 * Color by molecule type
 */
class MoleculetypeColormaker extends Colormaker {
  @manageColor
  atomColor (a: AtomProxy) {
    switch (a.residueType.moleculeType) {
      case WaterType:
        return 0x386cb0
      case IonType:
        return 0xf0027f
      case ProteinType:
        return 0xbeaed4
      case RnaType:
        return 0xfdc086
      case DnaType:
        return 0xbf5b17
      case SaccharideType:
        return 0x7fc97f
      default:
        return 0xffff99
    }
  }
}

ColormakerRegistry.add('moleculetype', MoleculetypeColormaker as any)

export default MoleculetypeColormaker
