/**
 * @file Surface Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ComponentRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import Component from './component.js'

/**
 * Component wrapping a {@link Surface} object
 *
 * @example
 * // get a surface component by loading a surface file into the stage
 * stage.loadFile( "url/for/surface" ).then( function( surfaceComponent ){
 *     surfaceComponent.addRepresentation( "surface" );
 *     surfaceComponent.autoView();
 * } );
 */
class SurfaceComponent extends Component {
    /**
     * @param {Stage} stage - stage object the component belongs to
     * @param {Surface} surface - surface object to wrap
     * @param {ComponentParameters} params - component parameters
     */
  constructor (stage, surface, params) {
    var p = params || {}
    p.name = defaults(p.name, surface.name)

    super(stage, p)

    this.surface = surface
  }

    /**
     * Component type
     * @type {String}
     */
  get type () { return 'surface' }

    /**
     * Add a new surface representation to the component
     * @param {String} type - the name of the representation, one of:
     *                        surface, dot.
     * @param {SurfaceRepresentationParameters} params - representation parameters
     * @return {RepresentationComponent} the created representation wrapped into
     *                                   a representation component object
     */
  addRepresentation (type, params) {
    return super.addRepresentation(type, this.surface, params)
  }

  getBoxUntransformed () {
    return this.surface.boundingBox
  }

  getCenterUntransformed () {
    return this.surface.center
  }

  dispose () {
    this.surface.dispose()
    super.dispose()
  }
}

ComponentRegistry.add('surface', SurfaceComponent)

export default SurfaceComponent
