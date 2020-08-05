/**
 * @file Chainid Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals'
import Colormaker, { StuctureColormakerParams, ColormakerScale, manageColor } from './colormaker'
import AtomProxy from '../proxy/atom-proxy'
import ChainProxy from '../proxy/chain-proxy'
import ModelProxy from '../proxy/model-proxy'

export type ChainidDict = { [k: string]: number }

/**
 * Color by chain id
 */
class ChainidColormaker extends Colormaker {
  chainidDictPerModel: { [k: number]: ChainidDict } = {}
  scalePerModel: { [k: number]: ColormakerScale } = {}

  constructor (params: StuctureColormakerParams) {
    super(params)

    if (!params.scale) {
      this.parameters.scale = 'Spectral'
    }

    params.structure.eachModel((mp: ModelProxy) => {
      let i = 0
      const chainidDict: ChainidDict = {}
      mp.eachChain(function (cp: ChainProxy) {
        if (chainidDict[ cp.chainid ] === undefined) {
          chainidDict[ cp.chainid ] = i
          i += 1
        }
      })
      this.parameters.domain = [ 0, i - 1 ]
      this.chainidDictPerModel[ mp.index ] = chainidDict
      this.scalePerModel[ mp.index ] = this.getScale()
    })
  }

  @manageColor
  atomColor (a: AtomProxy) {
    const chainidDict = this.chainidDictPerModel[ a.modelIndex ]
    return this.scalePerModel[ a.modelIndex ](chainidDict[ a.chainid ])
  }
}

ColormakerRegistry.add('chainid', ChainidColormaker as any)

export default ChainidColormaker
