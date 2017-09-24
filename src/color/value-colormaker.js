/**
 * @file Value Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals.js'
import Colormaker from './colormaker.js'

/**
 * Color by volume value
 */
class ValueColormaker extends Colormaker {
  constructor (params) {
    super(params)
    this.valueScale = this.getScale()
  }

    /**
     * return the color for a volume cell
     * @param  {Integer} index - volume cell index
     * @return {Integer} hex cell color
     */
  volumeColor (index) {
    return this.valueScale(this.volume.data[ index ])
  }
}

ColormakerRegistry.add('value', ValueColormaker)

export default ValueColormaker
