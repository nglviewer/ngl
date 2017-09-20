/**
 * @file Radius Factory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { NucleicBackboneAtoms } from '../structure/structure-constants'
import AtomProxy from '../proxy/atom-proxy'


const RadiusFactoryTypes = {
  '': '',
  'vdw': 'by vdW radius',
  'covalent': 'by covalent radius',
  'sstruc': 'by secondary structure',
  'bfactor': 'by bfactor',
  'size': 'size'
}
type RadiusType = keyof typeof RadiusFactoryTypes

class RadiusFactory {
  max = 10

  static types = RadiusFactoryTypes

  constructor (readonly type: RadiusType, readonly scale = 1.0) {}

  atomRadius (a: AtomProxy) {
    const type = this.type
    const scale = this.scale

    let r

    switch (type) {
      case 'vdw':
        r = a.vdw
        break

      case 'covalent':
        r = a.covalent
        break

      case 'bfactor':
        r = a.bfactor || 1.0
        break

      case 'sstruc':
        const sstruc = a.sstruc
        if (sstruc === 'h') {
          r = 0.25
        } else if (sstruc === 'g') {
          r = 0.25
        } else if (sstruc === 'i') {
          r = 0.25
        } else if (sstruc === 'e') {
          r = 0.25
        } else if (sstruc === 'b') {
          r = 0.25
        } else if (NucleicBackboneAtoms.includes(a.atomname)) {
          r = 0.4
        } else {
          r = 0.1
        }
        break

      default:
        r = (type as any) || 1.0  // TODO
        break
    }

    return Math.min(r * scale, this.max)
  }

}

export default RadiusFactory
