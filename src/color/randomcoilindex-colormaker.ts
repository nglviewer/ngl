/**
 * @file Randomcoilindex Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals'
import Colormaker, { StuctureColormakerParams, ColormakerScale, manageColor } from './colormaker'
import AtomProxy from '../proxy/atom-proxy'

/**
 * Color by random coil index
 */
class RandomcoilindexColormaker extends Colormaker {
  rciScale: ColormakerScale
  rciDict: { [k: string]: number|undefined } = {}

  constructor (params: StuctureColormakerParams) {
    super(params)

    if (!params.scale) {
      this.parameters.scale = 'RdYlBu'
    }

    this.rciScale = this.getScale({ domain: [ 0.6, 0 ] })

    const val = params.structure.validation
    if (val) this.rciDict = val.rciDict

  }

  @manageColor
  atomColor (atom: AtomProxy) {
    let sele = `[${atom.resname}]${atom.resno}`
    if (atom.chainname) sele += ':' + atom.chainname

    const rci = this.rciDict[ sele ]
    return rci !== undefined ? this.rciScale(rci) : 0x909090
  }
}

ColormakerRegistry.add('randomcoilindex', RandomcoilindexColormaker as any)

export default RandomcoilindexColormaker
