/**
 * @file Densityfit Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals'
import Colormaker, { StuctureColormakerParams, ColormakerScale, manageColor } from './colormaker'
import AtomProxy from '../proxy/atom-proxy'

/**
 * Color by validation density fit
 */
class DensityfitColormaker extends Colormaker {
  rsrzScale: ColormakerScale
  rsccScale: ColormakerScale

  rsrzDict: { [k: string]: number|undefined } = {}
  rsccDict: { [k: string]: number|undefined } = {}

  constructor (params: StuctureColormakerParams) {
    super(params)

    if (!params.scale) {
      this.parameters.scale = 'RdYlBu'
    }

    this.rsrzScale = this.getScale({ domain: [ 2, 0 ] })
    this.rsccScale = this.getScale({ domain: [ 0.678, 1.0 ] })

    const val = params.structure.validation
    if (val) {
      this.rsrzDict = val.rsrzDict
      this.rsccDict = val.rsccDict
    }

  }

  @manageColor
  atomColor (atom: AtomProxy) {
    let sele = atom.resno + ''
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

ColormakerRegistry.add('densityfit', DensityfitColormaker as any)

export default DensityfitColormaker
