/**
 * @file Backbone Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { RepresentationRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import BallAndStickRepresentation from './ballandstick-representation.js'

/**
 * Backbone representation. Show cylinders (or lines) connecting .CA (protein)
 * or .C4'/.C3' (RNA/DNA) of polymers.
 *
 * __Name:__ _backbone_
 *
 * @example
 * stage.loadFile( "rcsb://1sfi" ).then( function( o ){
 *     o.addRepresentation( "backbone" );
 *     o.autoView();
 * } );
 */
class BackboneRepresentation extends BallAndStickRepresentation {
  /**
   * @param  {Structure} structure - the structure object
   * @param  {Viewer} viewer - the viewer object
   * @param  {BallAndStickRepresentationParameters} params - parameters object
   */
  constructor (structure, viewer, params) {
    super(structure, viewer, params)

    this.type = 'backbone'

    this.parameters = Object.assign({

    }, this.parameters, {

      multipleBond: null,
      bondSpacing: null

    })

    this.init(params)
  }

  init (params) {
    var p = params || {}
    p.aspectRatio = defaults(p.aspectRatio, 1.0)
    p.radius = defaults(p.radius, 0.25)

    super.init(p)
  }

  getAtomData (sview, what, params) {
    return sview.getBackboneAtomData(this.getAtomParams(what, params))
  }

  getBondData (sview, what, params) {
    return sview.getBackboneBondData(this.getBondParams(what, params))
  }
}

RepresentationRegistry.add('backbone', BackboneRepresentation)

export default BackboneRepresentation
