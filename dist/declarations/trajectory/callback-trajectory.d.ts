/**
 * @file Callback Trajectory
 * @author Tarn W. Burton <twburton@gmail.com>
 * @private
 */
import Structure from '../structure/structure';
import Trajectory, { TrajectoryParameters } from './trajectory';
declare type RequestCallback = (responseCallback: Function, i?: number, atomIndices?: number[][]) => void;
/**
 * Callback trajectory class. Gets data from an JavaScript function.
 */
declare class CallbackTrajectory extends Trajectory {
    atomIndices: number[][];
    requestCallback: RequestCallback;
    constructor(requestCallback: RequestCallback, structure: Structure, params: TrajectoryParameters);
    get type(): string;
    _makeAtomIndices(): void;
    _loadFrame(i: number, callback?: Function): void;
    _loadFrameCount(): void;
}
export default CallbackTrajectory;
