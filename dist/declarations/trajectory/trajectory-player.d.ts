/**
 * @file Trajectory Player
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Signal } from 'signals';
import Trajectory from './trajectory';
export declare type TrajectoryPlayerInterpolateType = '' | 'linear' | 'spline';
export declare type TrajectoryPlayerMode = 'loop' | 'once';
export declare type TrajectoryPlayerDirection = 'forward' | 'backward' | 'bounce';
export declare const TrajectoryPlayerDefaultParameters: {
    step: number;
    timeout: number;
    start: number;
    end: number;
    interpolateType: TrajectoryPlayerInterpolateType;
    interpolateStep: number;
    mode: TrajectoryPlayerMode;
    direction: TrajectoryPlayerDirection;
};
export declare type TrajectoryPlayerParameters = typeof TrajectoryPlayerDefaultParameters;
export interface TrajectoryPlayerSignals {
    startedRunning: Signal;
    haltedRunning: Signal;
}
/**
 * Trajectory player for animating coordinate frames
 * @example
 * var player = new TrajectoryPlayer(trajectory, {step: 1, timeout: 50});
 * player.play();
 */
declare class TrajectoryPlayer {
    signals: TrajectoryPlayerSignals;
    parameters: TrajectoryPlayerParameters;
    traj: Trajectory;
    private _run;
    private _previousTime;
    private _currentTime;
    private _currentStep;
    private _currentFrame;
    private _direction;
    /**
     * make trajectory player
     * @param {Trajectory} traj - the trajectory
     * @param {TrajectoryPlayerParameters} [params] - parameter object
     */
    constructor(traj: Trajectory, params?: Partial<TrajectoryPlayerParameters>);
    get isRunning(): boolean;
    /**
     * set player parameters
     * @param {TrajectoryPlayerParameters} [params] - parameter object
     */
    setParameters(params?: Partial<TrajectoryPlayerParameters>): void;
    _animate(): void;
    _next(): number;
    _nextInterpolated(): [number, number, number, number];
    /**
     * toggle between playing and pausing the animation
     * @return {undefined}
     */
    toggle(): void;
    /**
     * start the animation
     * @return {undefined}
     */
    play(): void;
    /**
     * pause the animation
     * @return {undefined}
     */
    pause(): void;
    /**
     * stop the animation (pause and go to start-frame)
     * @return {undefined}
     */
    stop(): void;
}
export default TrajectoryPlayer;
