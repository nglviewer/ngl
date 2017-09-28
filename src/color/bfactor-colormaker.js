/**
 * @file Bfactor Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals.js'
import Colormaker from './colormaker.js'
import Selection from '../selection/selection.js'

/**
 * Color by b-factor. The {@link AtomProxy.bfactor} property is used for coloring.
 * By default the min and max b-factor values are used for the scale`s domain.
 *
 * __Name:__ _bfactor_
 *
 * @example
 * stage.loadFile( "rcsb://1crn" ).then( function( o ){
 *     o.addRepresentation( "ball+stick", { colorScheme: "bfactor" } );
 *     o.autoView();
 * } );
 */
class BfactorColormaker extends Colormaker {
  constructor (params) {
    super(params)

    if (!params.scale) {
      this.scale = 'OrRd'
    }

    if (!params.domain) {
      var selection
      var min = Infinity
      var max = -Infinity

      if (params.sele) {
        selection = new Selection(params.sele)
      }

      this.structure.eachAtom(function (a) {
        var bfactor = a.bfactor
        min = Math.min(min, bfactor)
        max = Math.max(max, bfactor)
      }, selection)

      this.domain = [ min, max ]
    }

    this.bfactorScale = this.getScale()
  }

  atomColor (a) {
    return this.bfactorScale(a.bfactor)
  }
}

ColormakerRegistry.add('bfactor', BfactorColormaker)

export default BfactorColormaker
