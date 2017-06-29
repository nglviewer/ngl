/**
 * @file Residueindex Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import Colormaker from './colormaker.js'

/**
 * Color by residue index
 */
class ResidueindexColormaker extends Colormaker {
  constructor (params) {
    super(params)

    if (!params.scale) {
      this.scale = 'rainbow'
      this.reverse = defaults(params.reverse, true)
    }
    if (!params.domain) {
      const scalePerChain = {}

      this.structure.eachChain(cp => {
        this.domain = [ cp.residueOffset, cp.residueEnd ]
        scalePerChain[ cp.index ] = this.getScale()
      })

      this.atomColor = function (a) {
        return scalePerChain[ a.chainIndex ](a.residueIndex)
      }
    } else {
      const residueindexScale = this.getScale()

      this.atomColor = function (a) {
        return residueindexScale(a.residueIndex)
      }
    }
  }
}

ColormakerRegistry.add('residueindex', ResidueindexColormaker)

export default ResidueindexColormaker
