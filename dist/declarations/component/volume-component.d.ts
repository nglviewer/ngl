/**
 * @file Volume Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Component, { ComponentParameters } from './component';
import Stage from '../stage/stage';
import Volume from '../surface/volume';
import { Box3, Vector3 } from 'three';
import RepresentationElement from './representation-element';
export declare type VolumeRepresentationType = 'surface' | 'slice' | 'dot';
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
declare class VolumeComponent extends Component {
    readonly volume: Volume;
    /**
     * @param {Stage} stage - stage object the component belongs to
     * @param {Volume} volume - volume object to wrap
     * @param {ComponentParameters} params - component parameters
     */
    constructor(stage: Stage, volume: Volume, params?: Partial<ComponentParameters>);
    /**
     * Component type
     * @type {String}
     */
    get type(): string;
    /**
     * Add a new volume representation to the component
     */
    addRepresentation(type: VolumeRepresentationType, params?: {
        [k: string]: any;
    }): RepresentationElement;
    getBoxUntransformed(): Box3;
    getCenterUntransformed(): Vector3;
    dispose(): void;
}
export default VolumeComponent;
