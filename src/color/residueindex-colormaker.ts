/**
 * @file Residueindex Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals'
import { defaults } from '../utils'
import Colormaker, { StuctureColormakerParams, ColormakerScale, manageColor } from './colormaker'
import AtomProxy from '../proxy/atom-proxy'
import ChainProxy from '../proxy/chain-proxy'

/**
 * Color by residue index
 */
class ResidueindexColormaker extends Colormaker {
  scalePerChain: { [k: number]: ColormakerScale } = {}

  constructor (params: StuctureColormakerParams) {
    super(params)

    if (!params.scale) {
      this.parameters.scale = 'rainbow'
      this.parameters.reverse = defaults(params.reverse, true)
    }

    params.structure.eachChain((cp: ChainProxy) => {
      this.parameters.domain = [ cp.residueOffset, cp.residueEnd ]
      this.scalePerChain[ cp.index ] = this.getScale()
    })
  }

  @manageColor
  atomColor (a: AtomProxy) {
    return this.scalePerChain[ a.chainIndex ](a.residueIndex)
  }
}

ColormakerRegistry.add('residueindex', ResidueindexColormaker as any)

export default ResidueindexColormaker
