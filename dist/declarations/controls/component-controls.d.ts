/**
 * @file Component Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3, Quaternion } from 'three';
import * as signalsWrapper from 'signals';
import Component from '../component/component';
import Stage from '../stage/stage';
import Viewer from '../viewer/viewer';
/**
 * Component controls
 */
declare class ComponentControls {
    readonly component: Component;
    signals: {
        changed: signalsWrapper.Signal<any>;
    };
    stage: Stage;
    viewer: Viewer;
    /**
     * @param  {Component} component - the component object
     */
    constructor(component: Component);
    /**
     * component center position
     * @type {Vector3}
     */
    get position(): Vector3;
    /**
     * component rotation
     * @type {Quaternion}
     */
    get rotation(): Quaternion;
    /**
     * Trigger render and emit changed event
     * @emits {ComponentControls.signals.changed}
     * @return {undefined}
     */
    changed(): void;
    /**
     * spin component on axis
     * @param  {Vector3|Array} axis - rotation axis
     * @param  {Number} angle - amount to spin
     * @return {undefined}
     */
    spin(axis: Vector3, angle: number): void;
}
export default ComponentControls;
