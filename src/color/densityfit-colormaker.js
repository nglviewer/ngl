/**
 * @file Densityfit Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals.js'
import Colormaker from './colormaker.js'

/**
 * Color by validation density fit
 */
class DensityfitColormaker extends Colormaker {
  constructor (params) {
    super(params)

    if (!params.scale) {
      this.scale = 'RdYlBu'
    }

    this.rsrzScale = this.getScale({ domain: [ 2, 0 ] })
    this.rsccScale = this.getScale({ domain: [ 0.678, 1.0 ] })

    const val = params.structure.validation || {}
    this.rsrzDict = val.rsrzDict || {}
    this.rsccDict = val.rsccDict || {}
  }

  atomColor (atom) {
    let sele = atom.resno
    if (atom.inscode) sele += '^' + atom.inscode
    if (atom.chainname) sele += ':' + atom.chainname
    sele += '/' + atom.modelIndex

    const rsrz = this.rsrzDict[ sele ]
    if (rsrz !== undefined) {
      return this.rsrzScale(rsrz)
    }

    const rscc = this.rsccDict[ sele ]
    if (rscc !== undefined) {
      return this.rsccScale(rscc)
    }

    return 0x909090
  }
}

ColormakerRegistry.add('densityfit', DensityfitColormaker)

export default DensityfitColormaker
