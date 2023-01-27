/**
 * @file Animation Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3, Quaternion, Matrix4 } from 'three';
import Animation, { AnimationList } from '../animation/animation';
import Stage from '../stage/stage';
import Component from '../component/component';
import Viewer from '../viewer/viewer';
import Stats from '../viewer/stats';
import ViewerControls from './viewer-controls';
/**
 * Animation controls
 */
declare class AnimationControls {
    readonly stage: Stage;
    viewer: Viewer;
    controls: ViewerControls;
    animationList: Animation[];
    finishedList: Animation[];
    /**
     * Create animation controls
     * @param  {Stage} stage - the stage object
     */
    constructor(stage: Stage);
    /**
     * True when all animations are paused
     * @type {Boolean}
     */
    get paused(): boolean;
    /**
     * Add an animation
     */
    add(animation: Animation): Animation;
    /**
     * Remove an animation
     */
    remove(animation: Animation): void;
    /**
     * Run all animations
     */
    run(stats: Stats): void;
    /**
     * Add a spin animation
     * @param  {Vector3} axis - axis to spin around
     * @param  {Number} angle - amount to spin per frame, radians
     * @param  {Number} duration - animation time in milliseconds
     * @return {SpinAnimation} the animation
     */
    spin(axis: Vector3 | number[], angle?: number, duration?: number): Animation;
    /**
     * Add a rock animation
     * @param  {Vector3} axis - axis to rock around
     * @param  {Number} angle - amount to spin per frame, radians
     * @param  {Number} end - maximum extend of motion, radians
     * @param  {Number} duration - animation time in milliseconds
     * @return {SpinAnimation} the animation
     */
    rock(axis: Vector3 | number[], angle?: number, end?: number, duration?: number): Animation;
    /**
     * Add a rotate animation
     * @param  {Quaternion} rotateTo - target rotation
     * @param  {Number} duration - animation time in milliseconds
     * @return {RotateAnimation} the animation
     */
    rotate(rotateTo: Quaternion | number[], duration?: number): Animation;
    /**
     * Add a move animation
     * @param  {Vector3} moveTo - target position
     * @param  {Number} duration - animation time in milliseconds
     * @return {MoveAnimation} the animation
     */
    move(moveTo: Vector3 | number[], duration?: number): Animation;
    /**
     * Add a zoom animation
     * @param  {Number} zoomTo - target distance
     * @param  {Number} duration - animation time in milliseconds
     * @return {ZoomAnimation} the animation
     */
    zoom(zoomTo: number, duration?: number): Animation;
    /**
     * Add a zoom and a move animation
     * @param  {Vector3} moveTo - target position
     * @param  {Number} zoomTo - target distance
     * @param  {Number} duration - animation time in milliseconds
     * @return {Array} the animations
     */
    zoomMove(moveTo: Vector3, zoomTo: number, duration?: number): AnimationList;
    /**
     * Add an orient animation
     * @param  {OrientationMatrix|Array} orientTo - target orientation
     * @param  {Number} duration - animation time in milliseconds
     * @return {Array} the animations
     */
    orient(orientTo: Matrix4 | number[], duration?: number): AnimationList;
    /**
     * Add a value animation
     * @param  {Number} valueFrom - start value
     * @param  {Number} valueTo - target value
     * @param  {Function} callback - called on every tick
     * @param  {Number} duration - animation time in milliseconds
     * @return {ValueAnimation} the animation
     */
    value(valueFrom: number, valueTo: number, callback: Function, duration?: number): Animation;
    /**
     * Add a timeout animation
     * @param  {Function} callback - called after duration
     * @param  {Number} duration - timeout in milliseconds
     * @return {TimeoutAnimation} the animation
     */
    timeout(callback: Function, duration?: number): Animation;
    /**
     * Add a component spin animation
     * @param  {Component} component - object to move
     * @param  {Vector3} axis - axis to spin around
     * @param  {Number} angle - amount to spin per frame, radians
     * @param  {Number} duration - animation time in milliseconds
     * @return {SpinAnimation} the animation
     */
    spinComponent(component: Component, axis?: Vector3 | number[], angle?: number, duration?: number): Animation;
    /**
     * Add a component rock animation
     * @param  {Component} component - object to move
     * @param  {Vector3} axis - axis to rock around
     * @param  {Number} angle - amount to spin per frame, radians
     * @param  {Number} end - maximum extend of motion, radians
     * @param  {Number} duration - animation time in milliseconds
     * @return {SpinAnimation} the animation
     */
    rockComponent(component: Component, axis: Vector3 | number[], angle?: number, end?: number, duration?: number): Animation;
    /**
     * Add a component move animation
     * @param  {Component} component - object to move
     * @param  {Vector3} moveTo - target position
     * @param  {Number} duration - animation time in milliseconds
     * @return {MoveAnimation} the animation
     */
    moveComponent(component: Component, moveTo: Vector3 | number[], duration?: number): Animation;
    /**
     * Pause all animations
     * @return {undefined}
     */
    pause(): void;
    /**
     * Resume all animations
     * @return {undefined}
     */
    resume(): void;
    /**
     * Toggle all animations
     * @return {undefined}
     */
    toggle(): void;
    /**
     * Clear all animations
     * @return {undefined}
     */
    clear(): void;
    dispose(): void;
}
export default AnimationControls;
