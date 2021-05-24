/**
 * @file Atomindex Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals'
import { defaults } from '../utils'
import Colormaker, { StuctureColormakerParams, ColormakerScale, manageColor } from './colormaker'
import AtomProxy from '../proxy/atom-proxy'
import ModelProxy from '../proxy/model-proxy'

/**
 * Color by atom index. The {@link AtomProxy.index} property is used for coloring.
 * Each {@link ModelProxy} of a {@link Structure} is colored seperately. The
 * `params.domain` parameter is ignored.
 *
 * __Name:__ _atomindex_
 *
 * @example
 * stage.loadFile( "rcsb://1crn" ).then( function( o ){
 *     o.addRepresentation( "ball+stick", { colorScheme: "atomindex" } );
 *     o.autoView();
 * } );
 */
class AtomindexColormaker extends Colormaker {
  scalePerModel: { [k: number]: ColormakerScale }

  constructor (params: StuctureColormakerParams) {
    super(params)

    if (!params.scale) {
      this.parameters.scale = 'rainbow'
      this.parameters.reverse = defaults(params.reverse, true)
    }

    this.scalePerModel = {}

    params.structure.eachModel((mp: ModelProxy) => {
      this.parameters.domain = [ mp.atomOffset, mp.atomEnd ]
      this.scalePerModel[ mp.index ] = this.getScale()  // TODO
    })
  }

  /**
   * get color for an atom
   * @param  {AtomProxy} atom - atom to get color for
   * @return {Integer} hex atom color
   */
  @manageColor
  atomColor (atom: AtomProxy) {
    return this.scalePerModel[ atom.modelIndex ](atom.index)
  }
}

ColormakerRegistry.add('atomindex', AtomindexColormaker as any)  // TODO

export default AtomindexColormaker
