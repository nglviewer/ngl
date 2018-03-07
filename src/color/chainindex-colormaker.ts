/**
 * @file Chainindex Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals'
import Colormaker, { StuctureColormakerParams, ColormakerScale } from './colormaker'
import AtomProxy from '../proxy/atom-proxy'
import ModelProxy from '../proxy/model-proxy'

/**
 * Color by chain index
 */
class ChainindexColormaker extends Colormaker {
  scalePerModel: { [k: number]: ColormakerScale } = {}

  constructor (params: StuctureColormakerParams) {
    super(params)

    if (!params.scale) {
      this.parameters.scale = 'Spectral'
    }

    params.structure.eachModel((mp: ModelProxy) => {
      this.parameters.domain = [ mp.chainOffset, mp.chainEnd ]
      this.scalePerModel[ mp.index ] = this.getScale()
    })
  }

  atomColor (a: AtomProxy) {
    return this.scalePerModel[ a.modelIndex ](a.chainIndex)
  }
}

ColormakerRegistry.add('chainindex', ChainindexColormaker as any)

export default ChainindexColormaker
