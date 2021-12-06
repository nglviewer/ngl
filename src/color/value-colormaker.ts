/**
 * @file Value Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals'
import Colormaker, { VolumeColormakerParams, ColormakerScale, manageColor } from './colormaker'

/**
 * Color by volume value
 */
class ValueColormaker extends Colormaker {
  valueScale: ColormakerScale

  constructor (params: VolumeColormakerParams) {
    super(params)
    this.valueScale = this.getScale()
  }

  /**
   * return the color for a volume cell
   * @param  {Integer} index - volume cell index
   * @return {Integer} hex cell color
   */
  @manageColor
  volumeColor (index: number) {
    return this.valueScale((this.parameters.volume! as any).data[ index ])  // TODO
  }
}

ColormakerRegistry.add('value', ValueColormaker as any)

export default ValueColormaker
