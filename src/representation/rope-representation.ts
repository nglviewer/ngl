/**
 * @file Rope Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { RepresentationRegistry } from '../globals'
import { defaults } from '../utils'
import CartoonRepresentation, { CartoonRepresentationParameters } from './cartoon-representation'
import Helixorient from '../geometry/helixorient'
import Spline from '../geometry/spline'
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import Polymer from '../proxy/polymer';

/**
 * Rope Representation
 */
class RopeRepresentation extends CartoonRepresentation {
  protected smooth: number
  
  constructor (structure: Structure, viewer: Viewer, params: Partial<CartoonRepresentationParameters>&{smooth: number}) {
    super(structure, viewer, params)

    this.type = 'rope'

    this.parameters = Object.assign({

      smooth: {
        type: 'integer', max: 15, min: 0, rebuild: true
      }

    }, this.parameters, {
      aspectRatio: null,
      smoothSheet: null
    })
  }

  init (params: Partial<CartoonRepresentationParameters>) {
    var p = params || {}
    p.aspectRatio = 1.0
    p.tension = defaults(p.tension, 0.5)
    p.radiusScale = defaults(p.radiusScale, 5.0)
    p.smoothSheet = false

    this.smooth = defaults(p.smooth, 2)

    super.init(p)
  }

  getSpline (polymer: Polymer) {
    var helixorient = new Helixorient(polymer)

    return new Spline(polymer, this.getSplineParams({
      directional: false,
      positionIterator: helixorient.getCenterIterator(this.smooth)
    }))
  }
}

RepresentationRegistry.add('rope', RopeRepresentation)

export default RopeRepresentation
