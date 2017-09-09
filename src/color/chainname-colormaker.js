/**
 * @file Chainname Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals'
import Colormaker from './colormaker'

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

    this.parameters.structure.eachModel((mp) => {
      var i = 0
      var chainnameDict = {}
      mp.eachChain(function (cp) {
        if (chainnameDict[ cp.chainname ] === undefined) {
          chainnameDict[ cp.chainname ] = i
          i += 1
        }
      })
      this.parameters.domain = [ 0, i - 1 ]
      chainnameDictPerModel[ mp.index ] = chainnameDict
      scalePerModel[ mp.index ] = this.getScale()
    })

    this.atomColor = function (a) {
      var chainnameDict = chainnameDictPerModel[ a.modelIndex ]
      return scalePerModel[ a.modelIndex ](chainnameDict[ a.chainname ])
    }
  }
}

ColormakerRegistry.add('chainname', ChainnameColormaker)

export default ChainnameColormaker
