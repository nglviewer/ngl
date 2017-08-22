/**
 * @file Tube Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { RepresentationRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import CartoonRepresentation from './cartoon-representation.js'

/**
 * Tube Representation
 */
class TubeRepresentation extends CartoonRepresentation {
  constructor (structure, viewer, params) {
    super(structure, viewer, params)

    this.type = 'tube'

    this.parameters = Object.assign(
      {}, this.parameters, { aspectRatio: null }
    )
  }

  init (params) {
    var p = params || {}
    p.aspectRatio = 1.0
    p.scale = defaults(p.scale, 2.0)

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
