/**
 * @file Licorice Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { RepresentationRegistry } from '../globals.js'
import BallAndStickRepresentation from './ballandstick-representation.js'

/**
 * Licorice representation object ({@link BallAndStickRepresentation} with `aspectRatio` fixed at 1.0)
 */
class LicoriceRepresentation extends BallAndStickRepresentation {
    /**
     * Create Licorice representation object
     * @param {Structure} structure - the structure to be represented
     * @param {Viewer} viewer - a viewer object
     * @param {BallAndStickRepresentationParameters} params - ball and stick representation parameters
     */
  constructor (structure, viewer, params) {
    super(structure, viewer, params)

    this.type = 'licorice'

    this.parameters = Object.assign(
      {}, this.parameters, { aspectRatio: null }
    )
  }

  init (params) {
    var p = params || {}
    p.aspectRatio = 1.0

    super.init(p)
  }
}

RepresentationRegistry.add('licorice', LicoriceRepresentation)

export default LicoriceRepresentation
