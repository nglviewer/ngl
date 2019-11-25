/**
 * @file Surface Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ComponentRegistry } from '../globals'
import Component, { ComponentParameters } from './component'
import Stage from '../stage/stage'
import Surface from '../surface/surface'
import { Vector3, Box3 } from 'three';
import RepresentationElement from './representation-element';

export type SurfaceRepresentationType = 'surface'|'dot'

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
  constructor (stage: Stage, readonly surface: Surface, params: Partial<ComponentParameters> = {}) {
    super(stage, surface, Object.assign({ name: surface.name }, params))
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
  addRepresentation (type: SurfaceRepresentationType, params: { [k: string]: any } = {}): RepresentationElement {
    return this._addRepresentation(type, this.surface, params)
  }

  getBoxUntransformed (): Box3 {
    return this.surface.boundingBox
  }

  getCenterUntransformed (): Vector3 {
    return this.surface.center
  }

  dispose () {
    this.surface.dispose()
    super.dispose()
  }
}

ComponentRegistry.add('surface', SurfaceComponent)

export default SurfaceComponent
