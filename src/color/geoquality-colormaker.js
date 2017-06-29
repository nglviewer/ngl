/**
 * @file Geoquality Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals.js'
import Colormaker from './colormaker.js'
import { countSetBits } from '../math/math-utils.js'

/**
 * Color by validation gometry quality
 */
class GeoqualityColormaker extends Colormaker {
  constructor (params) {
    super(params)

    var val = params.structure.validation || {}
    this.geoAtomDict = val.geoAtomDict || {}
    this.geoDict = val.geoDict || {}
  }

  atomColor (atom) {
    let sele = atom.resno
    if (atom.inscode) sele += '^' + atom.inscode
    if (atom.chainname) sele += ':' + atom.chainname
    sele += '/' + atom.modelIndex

    let geoProblemCount
    const geoAtom = this.geoAtomDict[ sele ]
    if (geoAtom !== undefined) {
      let atomProblems = geoAtom[ atom.atomname ] || 0
      geoProblemCount = countSetBits(atomProblems)
    } else {
      geoProblemCount = this.geoDict[ sele ] || 0
    }

    if (geoProblemCount === 0) {
      return 0x2166ac
    } else if (geoProblemCount === 1) {
      return 0xfee08b
    } else if (geoProblemCount === 2) {
      return 0xf46d43
    } else if (geoProblemCount >= 3) {
      return 0xa50026
    }
    return 0x909090
  }
}

ColormakerRegistry.add('geoquality', GeoqualityColormaker)

export default GeoqualityColormaker
