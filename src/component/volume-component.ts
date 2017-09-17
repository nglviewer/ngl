/**
 * @file Volume Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ComponentRegistry } from '../globals'
import Component, { ComponentParameters } from './component'
import Stage from '../stage/stage'
import Volume from '../surface/volume'

type VolumeRepresentationType = 'surface'|'slice'|'dot'

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
    super(stage, Object.assign({ name: volume.name }, params))
  }

  /**
   * Add a new volume representation to the component
   */
  addRepresentation (type: VolumeRepresentationType, params: { [k: string]: any } = {}) {
    return this._addRepresentation(type, this.volume, params)
  }

  getBoxUntransformed () {
    return this.volume.boundingBox
  }

  getCenterUntransformed () {
    return this.volume.center
  }

  dispose () {
    this.volume.dispose()

    super.dispose()
  }
}

ComponentRegistry.add('volume', VolumeComponent)

export default VolumeComponent
