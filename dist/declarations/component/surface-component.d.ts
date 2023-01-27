/**
 * @file Surface Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Component, { ComponentParameters } from './component';
import Stage from '../stage/stage';
import Surface from '../surface/surface';
import { Vector3, Box3 } from 'three';
import RepresentationElement from './representation-element';
export declare type SurfaceRepresentationType = 'surface' | 'dot';
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
declare class SurfaceComponent extends Component {
    readonly surface: Surface;
    /**
     * @param {Stage} stage - stage object the component belongs to
     * @param {Surface} surface - surface object to wrap
     * @param {ComponentParameters} params - component parameters
     */
    constructor(stage: Stage, surface: Surface, params?: Partial<ComponentParameters>);
    /**
     * Component type
     * @type {String}
     */
    get type(): string;
    /**
     * Add a new surface representation to the component
     * @param {String} type - the name of the representation, one of:
     *                        surface, dot.
     * @param {SurfaceRepresentationParameters} params - representation parameters
     * @return {RepresentationComponent} the created representation wrapped into
     *                                   a representation component object
     */
    addRepresentation(type: SurfaceRepresentationType, params?: {
        [k: string]: any;
    }): RepresentationElement;
    getBoxUntransformed(): Box3;
    getCenterUntransformed(): Vector3;
    dispose(): void;
}
export default SurfaceComponent;
