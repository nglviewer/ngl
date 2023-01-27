/**
 * @file Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3, Quaternion, Matrix4, Euler, Box3 } from 'three';
import { Signal } from 'signals';
import Annotation, { AnnotationParams } from '../component/annotation';
import ComponentControls from '../controls/component-controls';
import RepresentationElement from './representation-element';
import Stage from '../stage/stage';
import Viewer from '../viewer/viewer';
export declare const ComponentDefaultParameters: {
    name: string;
    status: string;
    visible: boolean;
};
export declare type ComponentParameters = typeof ComponentDefaultParameters;
export interface ComponentSignals {
    representationAdded: Signal;
    representationRemoved: Signal;
    visibilityChanged: Signal;
    matrixChanged: Signal;
    statusChanged: Signal;
    nameChanged: Signal;
    disposed: Signal;
}
/**
 * Base class for components
 */
declare abstract class Component {
    readonly stage: Stage;
    readonly object: any;
    /**
     * Events emitted by the component
     */
    readonly signals: ComponentSignals;
    readonly parameters: ComponentParameters;
    get defaultParameters(): {
        name: string;
        status: string;
        visible: boolean;
    };
    readonly uuid: string;
    readonly viewer: Viewer;
    reprList: RepresentationElement[];
    annotationList: Annotation[];
    matrix: Matrix4;
    position: Vector3;
    quaternion: Quaternion;
    scale: Vector3;
    transform: Matrix4;
    controls: ComponentControls;
    /**
     * @param {Stage} stage - stage object the component belongs to
     * @param {ComponentParameters} params - parameter object
     */
    constructor(stage: Stage, object: any, params?: Partial<ComponentParameters>);
    abstract get type(): string;
    get name(): string;
    get status(): string;
    get visible(): boolean;
    /**
     * Set position transform
     *
     * @example
     * // translate by 25 angstrom along x axis
     * component.setPosition([ 25, 0, 0 ]);
     *
     * @param {Vector3|Array} p - the coordinates
     * @return {Component} this object
     */
    setPosition(p: [number, number, number] | Vector3): this;
    /**
     * Set local rotation transform
     * (for global rotation use setTransform)
     *
     * @example
     * // rotate by 2 degree radians on x axis
     * component.setRotation( [ 2, 0, 0 ] );
     *
     * @param {Quaternion|Euler|Array} r - the rotation
     * @return {Component} this object
     */
    setRotation(r: [number, number, number] | Euler | Quaternion): this;
    /**
     * Set scale transform
     *
     * @example
     * // scale by factor of two
     * component.setScale( 2 );
     *
     * @param {Number} s - the scale
     * @return {Component} this object
     */
    setScale(s: number): this;
    /**
     * Set general transform. Is applied before and in addition
     * to the position, rotation and scale transformations
     *
     * @example
     * component.setTransform( matrix );
     *
     * @param {Matrix4} m - the matrix
     * @return {Component} this object
     */
    setTransform(m: Matrix4): this;
    updateMatrix(): void;
    /**
     * Propogates our matrix to each representation
     */
    updateRepresentationMatrices(): void;
    /**
     * Add an anotation object
     * @param {Vector3} position - the 3d position
     * @param {String|Element} content - the HTML content
     * @param {Object} [params] - parameters
     * @param {Integer} params.offsetX - 2d offset in x direction
     * @param {Integer} params.offsetY - 2d offset in y direction
     * @return {Annotation} the added annotation object
     */
    addAnnotation(position: Vector3, content: string | HTMLElement, params: AnnotationParams): Annotation;
    /**
     * Iterator over each annotation and executing the callback
     * @param  {Function} callback - function to execute
     * @return {undefined}
     */
    eachAnnotation(callback: (a: Annotation) => void): void;
    /**
     * Remove the give annotation from the component
     * @param {Annotation} annotation - the annotation to remove
     * @return {undefined}
     */
    removeAnnotation(annotation: Annotation): void;
    /**
     * Remove all annotations from the component
     * @return {undefined}
     */
    removeAllAnnotations(): void;
    /**
     * Add a new representation to the component
     * @param {String} type - the name of the representation
     * @param {Object} object - the object on which the representation should be based
     * @param {RepresentationParameters} [params] - representation parameters
     * @return {RepresentationElement} the created representation wrapped into
     *                                   a representation element object
     */
    protected _addRepresentation(type: string, object: any, params: any, hidden?: boolean): RepresentationElement;
    abstract addRepresentation(type: any, params: any): any;
    addBufferRepresentation(buffer: any, params: any): any;
    hasRepresentation(repr: RepresentationElement): boolean;
    /**
     * Iterator over each representation and executing the callback
     * @param  {Function} callback - function to execute
     * @return {undefined}
     */
    eachRepresentation(callback: (repr: RepresentationElement) => void): void;
    /**
     * Removes a representation component
     * @param {RepresentationElement} repr - the representation element
     * @return {undefined}
     */
    removeRepresentation(repr: RepresentationElement): void;
    updateRepresentations(what: any): void;
    /**
     * Removes all representation components
     * @return {undefined}
     */
    removeAllRepresentations(): void;
    dispose(): void;
    /**
     * Set the visibility of the component, including added representations
     * @param {Boolean} value - visibility flag
     * @return {Component} this object
     */
    setVisibility(value: boolean): this;
    setStatus(value: string): this;
    setName(value: string): this;
    /**
     * @return {Box3} the component's bounding box
     */
    getBox(...args: any[]): Box3;
    /**
     * @return {Vector3} the component's center position
     */
    getCenter(...args: any[]): Vector3;
    getZoom(...args: any[]): number;
    /**
     * @abstract
     * @return {Box3} the untransformed component's bounding box
     */
    getBoxUntransformed(...args: any[]): Box3;
    getCenterUntransformed(...args: any[]): Vector3;
    /**
     * Automatically center and zoom the component
     * @param  {Integer} [duration] - duration of the animation, defaults to 0
     * @return {undefined}
     */
    autoView(duration?: number): void;
}
export default Component;
