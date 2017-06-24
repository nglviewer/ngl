/**
 * @file Chainname Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals.js'
import Colormaker from './colormaker.js'

/**
 * Color by chain name
 */
class ChainnameColormaker extends Colormaker {
  constructor (params) {
    super(params)

    if (!params.scale) {
      this.scale = 'Spectral'
    }

    var chainnameDictPerModel = {}
    var scalePerModel = {}

    this.structure.eachModel(function (mp) {
      var i = 0
      var chainnameDict = {}
      mp.eachChain(function (cp) {
        if (chainnameDict[ cp.chainname ] === undefined) {
          chainnameDict[ cp.chainname ] = i
          i += 1
        }
      })
      this.domain = [ 0, i - 1 ]
      chainnameDictPerModel[ mp.index ] = chainnameDict
      scalePerModel[ mp.index ] = this.getScale()
    }.bind(this))

    this.atomColor = function (a) {
      var chainnameDict = chainnameDictPerModel[ a.modelIndex ]
      return scalePerModel[ a.modelIndex ](chainnameDict[ a.chainname ])
    }
  }
}

ColormakerRegistry.add('chainname', ChainnameColormaker)

export default ChainnameColormaker
