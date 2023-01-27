/**
 * @file Viewer Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector2, Vector3, Matrix4, Quaternion } from 'three';
import * as signalsWrapper from 'signals';
import Stage from '../stage/stage';
import Viewer from '../viewer/viewer';
/**
 * Viewer controls
 */
declare class ViewerControls {
    readonly stage: Stage;
    signals: {
        changed: signalsWrapper.Signal<any>;
    };
    viewer: Viewer;
    /**
     * @param  {Stage} stage - the stage object
     */
    constructor(stage: Stage);
    /**
     * scene center position
     * @type {Vector3}
     */
    get position(): Vector3;
    /**
     * scene rotation
     * @type {Quaternion}
     */
    get rotation(): Quaternion;
    /**
     * Trigger render and emit changed event
     * @emits {ViewerControls.signals.changed}
     * @return {undefined}
     */
    changed(): void;
    getPositionOnCanvas(position: Vector3, optionalTarget?: Vector2): any;
    getCanvasScaleFactor(z?: number): number;
    /**
     * get scene orientation
     * @param {Matrix4} optionalTarget - pre-allocated target matrix
     * @return {OrientationMatrix} scene orientation
     */
    getOrientation(optionalTarget?: Matrix4): any;
    /**
     * set scene orientation
     * @param {OrientationMatrix|Array} orientation - scene orientation
     * @return {undefined}
     */
    orient(orientation?: Matrix4): void;
    /**
     * translate scene
     * @param  {Vector3|Array} vector - translation vector
     * @return {undefined}
     */
    translate(vector: Vector3 | number[]): void;
    /**
     * center scene
     * @param  {Vector3|Array} position - center position
     * @return {undefined}
     */
    center(position: Vector3 | number[]): void;
    /**
     * "zoom" scene by moving camera closer to origin
     * @param  {Number} delta - zoom change
     * @return {undefined}
     */
    zoom(delta: number): void;
    /**
     * get camera distance
     */
    getCameraDistance(): number;
    /**
     * camera distance
     * @param  {Number} z - distance
     * @return {undefined}
     */
    distance(distance: number): void;
    /**
     * spin scene on axis
     * @param  {Vector3|Array} axis - rotation axis
     * @param  {Number} angle - amount to spin
     * @return {undefined}
     */
    spin(axis: Vector3 | number[], angle: number): void;
    /**
     * rotate scene
     * @param  {Quaternion|Array} quaternion - rotation quaternion
     * @return {undefined}
     */
    rotate(quaternion: Quaternion | number[]): void;
    /**
     * align scene to basis matrix
     * @param  {Matrix4|Array} basis - basis matrix
     * @return {undefined}
     */
    align(basis: Matrix4 | number[]): void;
    /**
     * apply rotation matrix to scene
     * @param  {Matrix4|Array} matrix - rotation matrix
     * @return {undefined}
     */
    applyMatrix(matrix: Matrix4 | number[]): void;
}
export default ViewerControls;
