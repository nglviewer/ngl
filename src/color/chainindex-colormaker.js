/**
 * @file Chainindex Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals.js'
import Colormaker from './colormaker.js'

/**
 * Color by chain index
 */
class ChainindexColormaker extends Colormaker {
  constructor (params) {
    super(params)

    if (!params.scale) {
      this.scale = 'Spectral'
    }
    if (!params.domain) {
      var scalePerModel = {}

      this.structure.eachModel(function (mp) {
        this.domain = [ mp.chainOffset, mp.chainEnd ]
        scalePerModel[ mp.index ] = this.getScale()
      }.bind(this))

      this.atomColor = function (a) {
        return scalePerModel[ a.modelIndex ](a.chainIndex)
      }
    } else {
      var chainindexScale = this.getScale()

      this.atomColor = function (a) {
        return chainindexScale(a.chainIndex)
      }
    }
  }
}

ColormakerRegistry.add('chainindex', ChainindexColormaker)

export default ChainindexColormaker
