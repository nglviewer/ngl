/**
 * @file Animation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3, Quaternion } from 'three';
import ViewerControls from '../controls/viewer-controls';
import Stats from '../viewer/stats';
/**
 * Animation. Base animation class.
 * @interface
 */
declare abstract class Animation {
    duration: number;
    controls: ViewerControls;
    alpha: number;
    startTime: number;
    pausedTime: number;
    elapsedDuration: number;
    pausedDuration: number;
    ignoreGlobalToggle: boolean;
    private _paused;
    private _resolveList;
    private _hold;
    constructor(duration: number | undefined, controls: ViewerControls, ...args: any[]);
    /**
     * True when animation has finished
     */
    get done(): boolean;
    /**
     * True when animation is paused
     */
    get paused(): boolean;
    /**
     * init animation
     */
    abstract _init(...args: any[]): void;
    /**
     * called on every tick
     */
    abstract _tick(stats?: Stats): void;
    tick(stats: Stats): boolean | undefined;
    /**
     * Pause animation
     * @param {boolean} [hold] - put animation on a hold which
     *                           must be release before it can be resumed
     */
    pause(hold?: boolean): void;
    /**
     * Resume animation
     * @param {Boolean} [releaseHold] - release a hold on the animation
     */
    resume(releaseHold?: boolean): void;
    /**
     * Toggle animation
     */
    toggle(): void;
    /**
     * Promise-like interface
     */
    then(callback: Function): Promise<any>;
}
export default Animation;
/**
 * Spin animation. Spin around an axis.
 */
export declare class SpinAnimation extends Animation {
    axis: Vector3;
    angle: number;
    constructor(duration: number | undefined, controls: ViewerControls, ...args: any[]);
    _init(axis: number[] | Vector3, angle: number): void;
    _tick(stats: Stats): void;
}
/**
 * Rock animation. Rock around an axis.
 */
export declare class RockAnimation extends Animation {
    axis: Vector3;
    angleStep: number;
    angleEnd: number;
    angleSum: number;
    direction: number;
    constructor(duration: number | undefined, controls: ViewerControls, ...args: any[]);
    _init(axis: number[] | Vector3, angleStep: number, angleEnd: number): void;
    _tick(stats: Stats): void;
}
/**
 * Move animation. Move from one position to another.
 */
export declare class MoveAnimation extends Animation {
    moveFrom: Vector3;
    moveTo: Vector3;
    _init(moveFrom: number[] | Vector3, moveTo: number[] | Vector3): void;
    _tick(): void;
}
/**
 * Zoom animation. Gradually change the zoom level.
 */
export declare class ZoomAnimation extends Animation {
    zoomFrom: number;
    zoomTo: number;
    _init(zoomFrom: number, zoomTo: number): void;
    _tick(): void;
}
/**
 * Rotate animation. Rotate from one orientation to another.
 */
export declare class RotateAnimation extends Animation {
    rotateFrom: Quaternion;
    rotateTo: Quaternion;
    private _currentRotation;
    _init(rotateFrom: number[] | Quaternion, rotateTo: number[] | Quaternion): void;
    _tick(): void;
}
/**
 * Value animation. Call callback with interpolated value.
 */
export declare class ValueAnimation extends Animation {
    valueFrom: number;
    valueTo: number;
    callback: Function;
    _init(valueFrom: number, valueTo: number, callback: Function): void;
    _tick(): void;
}
/**
 * Timeout animation. Call callback after duration.
 */
export declare class TimeoutAnimation extends Animation {
    callback: Function;
    _init(callback: Function): void;
    _tick(): void;
}
/**
 * Animation list.
 */
export declare class AnimationList {
    _list: Animation[];
    _resolveList: Function[];
    constructor(list?: Animation[]);
    /**
     * True when all animations have finished
     */
    get done(): boolean;
    /**
     * Promise-like interface
     */
    then(callback: Function): Promise<any>;
}
