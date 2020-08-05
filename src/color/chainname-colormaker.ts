/**
 * @file Chainname Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals'
import Colormaker, { StuctureColormakerParams, ColormakerScale, manageColor } from './colormaker'
import AtomProxy from '../proxy/atom-proxy'
import ChainProxy from '../proxy/chain-proxy'
import ModelProxy from '../proxy/model-proxy'

export type ChainnameDict = { [k: string]: number }

/**
 * Color by chain name
 */
class ChainnameColormaker extends Colormaker {
  chainnameDictPerModel: { [k: number]: ChainnameDict } = {}
  scalePerModel: { [k: number]: ColormakerScale } = {}

  constructor (params: StuctureColormakerParams) {
    super(params)

    if (!params.scale) {
      this.parameters.scale = 'Spectral'
    }

    params.structure.eachModel((mp: ModelProxy) => {
      let i = 0
      const chainnameDict: ChainnameDict = {}
      mp.eachChain(function (cp: ChainProxy) {
        if (chainnameDict[ cp.chainname ] === undefined) {
          chainnameDict[ cp.chainname ] = i
          i += 1
        }
      })
      this.parameters.domain = [ 0, i - 1 ]
      this.chainnameDictPerModel[ mp.index ] = chainnameDict
      this.scalePerModel[ mp.index ] = this.getScale()
    })
  }

  @manageColor
  atomColor (a: AtomProxy) {
    const chainnameDict = this.chainnameDictPerModel[ a.modelIndex ]
    return this.scalePerModel[ a.modelIndex ](chainnameDict[ a.chainname ])
  }
}

ColormakerRegistry.add('chainname', ChainnameColormaker as any)

export default ChainnameColormaker
