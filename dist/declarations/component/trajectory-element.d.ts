/**
 * @file Trajectory Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Signal } from 'signals';
import Element, { ElementSignals } from './element';
import Stage from '../stage/stage';
import Trajectory, { TrajectoryParameters } from '../trajectory/trajectory';
import { TrajectoryPlayerDirection, TrajectoryPlayerMode, TrajectoryPlayerInterpolateType } from '../trajectory/trajectory-player';
/**
 * Trajectory component parameter object.
 * @typedef {Object} TrajectoryComponentParameters - component parameters
 *
 * @property {String} name - component name
 * @property {Integer} initialFrame - initial frame the trajectory is set to
 * @property {Integer} defaultStep - default step size to be used by trajectory players
 * @property {Integer} defaultTimeout - default timeout to be used by trajectory players
 * @property {String} defaultInterpolateType - one of "" (empty string), "linear" or "spline"
 * @property {Integer} defaultInterpolateStep - window size used for interpolation
 * @property {String} defaultMode - either "loop" or "once"
 * @property {String} defaultDirection - either "forward" or "backward"
 */
export declare const TrajectoryElementDefaultParameters: {
    defaultStep: number;
    defaultTimeout: number;
    defaultInterpolateType: TrajectoryPlayerInterpolateType;
    defaultInterpolateStep: number;
    defaultMode: TrajectoryPlayerMode;
    defaultDirection: TrajectoryPlayerDirection;
    initialFrame: number;
} & {
    name: string;
    status: string;
};
export declare type TrajectoryElementParameters = typeof TrajectoryElementDefaultParameters;
export interface TrajectoryElementSignals extends ElementSignals {
    frameChanged: Signal;
    playerChanged: Signal;
    countChanged: Signal;
    parametersChanged: Signal;
}
/**
 * Component wrapping a {@link Trajectory} object
 */
declare class TrajectoryElement extends Element {
    readonly trajectory: Trajectory;
    signals: TrajectoryElementSignals;
    parameters: TrajectoryElementParameters;
    get defaultParameters(): {
        defaultStep: number;
        defaultTimeout: number;
        defaultInterpolateType: TrajectoryPlayerInterpolateType;
        defaultInterpolateStep: number;
        defaultMode: TrajectoryPlayerMode;
        defaultDirection: TrajectoryPlayerDirection;
        initialFrame: number;
    } & {
        name: string;
        status: string;
    };
    /**
     * @param {Stage} stage - stage object the component belongs to
     * @param {Trajectory} trajectory - the trajectory object
     * @param {TrajectoryComponentParameters} params - component parameters
     * @param {StructureComponent} parent - the parent structure
     */
    constructor(stage: Stage, trajectory: Trajectory, params?: Partial<TrajectoryElementParameters>);
    /**
     * Component type
     * @type {String}
     */
    get type(): string;
    /**
     * Set the frame of the trajectory
     * @param {Integer} i - frame number
     * @return {undefined}
     */
    setFrame(i: number): void;
    /**
     * Set trajectory parameters
     * @param {TrajectoryParameters} params - trajectory parameters
     * @return {undefined}
     */
    setParameters(params?: Partial<TrajectoryParameters>): void;
    dispose(): void;
}
export default TrajectoryElement;
