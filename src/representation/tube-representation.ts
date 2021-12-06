/**
 * @file Tube Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { RepresentationRegistry } from '../globals'
import { defaults } from '../utils'
import CartoonRepresentation, {CartoonRepresentationParameters} from './cartoon-representation'
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';

/**
 * Tube Representation
 */
class TubeRepresentation extends CartoonRepresentation {
  constructor (structure: Structure, viewer: Viewer, params: Partial<CartoonRepresentationParameters>) {
    super(structure, viewer, params)

    this.type = 'tube'

    this.parameters = Object.assign(
      {}, this.parameters, { aspectRatio: null }
    )
  }

  init (params: Partial<CartoonRepresentationParameters>) {
    var p = params || {}
    p.aspectRatio = 1.0
    p.radiusScale = defaults(p.radiusScale, 2.0)

    if (p.quality === 'low') {
      this.radialSegments = 5
    }

    super.init(p)
  }

  getSplineParams (/* params */) {
    return super.getSplineParams({
      directional: false
    })
  }
}

RepresentationRegistry.add('tube', TubeRepresentation)

export default TubeRepresentation
