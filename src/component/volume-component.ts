/**
 * @file Volume Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ComponentRegistry } from '../globals'
import Component, { ComponentParameters } from './component'
import Stage from '../stage/stage'
import Volume from '../surface/volume'
import { Box3, Vector3 } from 'three';
import RepresentationElement from './representation-element';

export type VolumeRepresentationType = 'surface'|'slice'|'dot'

/**
 * Component wrapping a {@link Volume} object
 *
 * @example
 * // get a volume component by loading a volume file into the stage
 * stage.loadFile( "url/for/volume" ).then(function(volumeComponent){
 *   volumeComponent.addRepresentation('surface');
 *   volumeComponent.autoView();
 * });
 */
class VolumeComponent extends Component {
  /**
   * @param {Stage} stage - stage object the component belongs to
   * @param {Volume} volume - volume object to wrap
   * @param {ComponentParameters} params - component parameters
   */
  constructor (stage: Stage, readonly volume: Volume, params: Partial<ComponentParameters> = {}) {
    super(stage, volume, Object.assign({ name: volume.name }, params))
  }

  /**
   * Component type
   * @type {String}
   */
  get type () { return 'volume' }

  /**
   * Add a new volume representation to the component
   */
  addRepresentation (type: VolumeRepresentationType, params: { [k: string]: any } = {}): RepresentationElement {
    return this._addRepresentation(type, this.volume, params)
  }

  getBoxUntransformed (): Box3 {
    return this.volume.boundingBox
  }

  getCenterUntransformed (): Vector3 {
    return this.volume.center
  }

  dispose () {
    this.volume.dispose()

    super.dispose()
  }
}

ComponentRegistry.add('volume', VolumeComponent)

export default VolumeComponent
