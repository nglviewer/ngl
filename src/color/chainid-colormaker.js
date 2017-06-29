/**
 * @file Chainid Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals.js'
import Colormaker from './colormaker.js'

/**
 * Color by chain id
 */
class ChainidColormaker extends Colormaker {
  constructor (params) {
    super(params)

    if (!params.scale) {
      this.scale = 'Spectral'
    }

    var chainidDictPerModel = {}
    var scalePerModel = {}

    this.structure.eachModel(function (mp) {
      var i = 0
      var chainidDict = {}
      mp.eachChain(function (cp) {
        if (chainidDict[ cp.chainid ] === undefined) {
          chainidDict[ cp.chainid ] = i
          i += 1
        }
      })
      this.domain = [ 0, i - 1 ]
      chainidDictPerModel[ mp.index ] = chainidDict
      scalePerModel[ mp.index ] = this.getScale()
    }.bind(this))

    this.atomColor = function (a) {
      var chainidDict = chainidDictPerModel[ a.modelIndex ]
      return scalePerModel[ a.modelIndex ](chainidDict[ a.chainid ])
    }
  }
}

ColormakerRegistry.add('chainid', ChainidColormaker)

export default ChainidColormaker
