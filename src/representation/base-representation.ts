/**
 * @file Base Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { RepresentationRegistry } from '../globals'
import { defaults } from '../utils'
import BallAndStickRepresentation, { BallAndStickRepresentationParameters } from './ballandstick-representation'
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import StructureView from '../structure/structure-view';
import { AtomDataFields, AtomDataParams, BondDataFields, BondDataParams, BondData, AtomData } from '../structure/structure-data';

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
  constructor (structure: Structure, viewer: Viewer, params: Partial<BallAndStickRepresentationParameters>) {
    super(structure, viewer, params)

    this.type = 'base'

    this.parameters = Object.assign({

    }, this.parameters, {

      multipleBond: null,
      bondSpacing: null

    })
  }

  init (params: Partial<BallAndStickRepresentationParameters>) {
    let p = params || {}
    p.aspectRatio = defaults(p.aspectRatio, 1.0)
    p.radiusSize = defaults(p.radiusSize, 0.3)

    super.init(p)
  }

  getAtomData (sview: StructureView, what?: AtomDataFields, params?: AtomDataParams): AtomData {
    return sview.getRungAtomData(this.getAtomParams(what, params))
  }

  getBondData (sview: StructureView, what?: BondDataFields, params?: BondDataParams): BondData {
    let p = this.getBondParams(what, params)
    Object.assign(p.colorParams, {rung: true})

    return sview.getRungBondData(p)
  }
}

RepresentationRegistry.add('base', BaseRepresentation)

export default BaseRepresentation
