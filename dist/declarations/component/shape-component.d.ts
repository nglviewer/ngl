/**
 * @file Shape Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Component, { ComponentParameters } from './component';
import Stage from '../stage/stage';
import Shape from '../geometry/shape';
import { Vector3, Box3 } from 'three';
import RepresentationElement from './representation-element';
export declare type ShapeRepresentationType = 'buffer';
/**
 * Component wrapping a {@link Shape} object
 *
 * @example
 * // get a shape component by adding a shape object to the stage
 * var shape = new NGL.Shape( "shape" );
 * shape.addSphere( [ 0, 0, 0 ], [ 1, 0, 0 ], 1.5 );
 * var shapeComponent = stage.addComponentFromObject( shape );
 * shapeComponent.addRepresentation( "buffer" );
 */
declare class ShapeComponent extends Component {
    readonly shape: Shape;
    constructor(stage: Stage, shape: Shape, params?: Partial<ComponentParameters>);
    /**
     * Component type
     * @type {String}
     */
    get type(): string;
    /**
     * Add a new shape representation to the component
     * @param {String} type - the name of the representation, one of:
     *                        buffer.
     * @param {BufferRepresentationParameters} params - representation parameters
     * @return {RepresentationComponent} the created representation wrapped into
     *                                   a representation component object
     */
    addRepresentation(type: ShapeRepresentationType, params?: {
        [k: string]: any;
    }): RepresentationElement;
    getBoxUntransformed(): Box3;
    getCenterUntransformed(): Vector3;
    dispose(): void;
}
export default ShapeComponent;
