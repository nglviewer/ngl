/**
 * @file Base Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { RepresentationRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import BallAndStickRepresentation from './ballandstick-representation.js'

/**
 * Base representation. Show cylinders for RNA/DNA ladders.
 *
 * __Name:__ _base_
 *
 * @example
 * stage.loadFile( "rcsb://1d66" ).then( function( o ){
 *     o.addRepresentation( "cartoon", { sele: "nucleic" } );
 *     o.addRepresentation( "base", { color: "resname" } );
 *     o.autoView( "nucleic" );
 * } );
 */
class BaseRepresentation extends BallAndStickRepresentation {
  /**
   * @param  {Structure} structure - the structure object
   * @param  {Viewer} viewer - the viewer object
   * @param  {BallAndStickRepresentationParameters} params - parameters object
   */
  constructor (structure, viewer, params) {
    super(structure, viewer, params)

    this.type = 'base'

    this.parameters = Object.assign({

    }, this.parameters, {

      multipleBond: null,
      bondSpacing: null

    })
  }

  init (params) {
    var p = params || {}
    p.aspectRatio = defaults(p.aspectRatio, 1.0)
    p.radius = defaults(p.radius, 0.3)

    super.init(p)
  }

  getAtomData (sview, what, params) {
    return sview.getRungAtomData(this.getAtomParams(what, params))
  }

  getBondData (sview, what, params) {
    var p = this.getBondParams(what, params)
    p.colorParams.rung = true

    return sview.getRungBondData(p)
  }
}

RepresentationRegistry.add('base', BaseRepresentation)

export default BaseRepresentation
