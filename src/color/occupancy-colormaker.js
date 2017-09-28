/**
 * @file Occupancy Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals.js'
import Colormaker from './colormaker.js'

/**
 * Color by occupancy
 */
class OccupancyColormaker extends Colormaker {
  constructor (params) {
    super(params)

    if (!params.scale) {
      this.scale = 'PuBu'
    }

    if (!params.domain) {
      this.domain = [ 0.0, 1.0 ]
    }

    var occupancyScale = this.getScale()

    this.atomColor = function (a) {
      return occupancyScale(a.occupancy)
    }
  }
}

ColormakerRegistry.add('occupancy', OccupancyColormaker)

export default OccupancyColormaker
