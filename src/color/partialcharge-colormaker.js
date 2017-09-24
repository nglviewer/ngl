/**
 * @file Partialcharge Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals.js'
import Colormaker from './colormaker.js'

/**
 * Color by partial charge. The {@link AtomProxy.partialCharge} property is used for coloring.
 * The default domain is [-1, 1].
 *
 * __Name:__ _partialCharge_
 *
 * @example
 * stage.loadFile("rcsb://1crn").then(function (o) {
 *   o.addRepresentation("ball+stick", {colorScheme: "partialCharge"});
 *   o.autoView();
 * });
 */
class PartialchargeColormaker extends Colormaker {
  constructor (params) {
    super(params)

    if (!params.scale) {
      this.scale = 'rwb'
    }

    if (!params.domain) {
      this.domain = [-1, 1]
    }

    this.partialchargeScale = this.getScale()
  }

  atomColor (a) {
    return this.partialchargeScale(a.partialCharge)
  }
}

ColormakerRegistry.add('partialcharge', PartialchargeColormaker)

export default PartialchargeColormaker
