/**
 * @file Occupancy Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals'
import Colormaker, { ColormakerParameters, ColormakerScale, manageColor } from './colormaker'
import AtomProxy from '../proxy/atom-proxy'

/**
 * Color by occupancy
 */
class OccupancyColormaker extends Colormaker {
  occupancyScale: ColormakerScale

  constructor (params: ColormakerParameters) {
    super(params)

    if (!params.scale) {
      this.parameters.scale = 'PuBu'
    }

    if (!params.domain) {
      this.parameters.domain = [ 0.0, 1.0 ]
    }

    this.occupancyScale = this.getScale()
  }

  @manageColor
  atomColor (a: AtomProxy) {
    return this.occupancyScale(a.occupancy)
  }
}

ColormakerRegistry.add('occupancy', OccupancyColormaker as any)

export default OccupancyColormaker
