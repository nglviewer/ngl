/**
 * @file Licorice Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { RepresentationRegistry } from '../globals'
import BallAndStickRepresentation, { BallAndStickRepresentationParameters } from './ballandstick-representation'
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';

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
  constructor (structure: Structure, viewer: Viewer, params: Partial<BallAndStickRepresentationParameters>) {
    super(structure, viewer, params)

    this.type = 'licorice'

    this.parameters = Object.assign(
      {}, this.parameters, { aspectRatio: null }
    )
  }

  init (params: Partial<BallAndStickRepresentationParameters>) {
    var p = params || {}
    p.aspectRatio = 1.0

    super.init(p)
  }
}

RepresentationRegistry.add('licorice', LicoriceRepresentation)

export default LicoriceRepresentation
