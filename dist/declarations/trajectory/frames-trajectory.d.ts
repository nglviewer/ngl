/**
 * @file Frames Trajectory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Structure from '../structure/structure';
import Frames from './frames';
import Trajectory, { TrajectoryParameters } from './trajectory';
/**
 * Frames trajectory class. Gets data from a frames object.
 */
declare class FramesTrajectory extends Trajectory {
    path: string;
    frames: ArrayLike<number>[];
    boxes: ArrayLike<number>[];
    atomIndices?: ArrayLike<number>;
    constructor(frames: Frames, structure: Structure, params: TrajectoryParameters);
    get type(): string;
    _makeAtomIndices(): void;
    _loadFrame(i: number, callback?: Function): void;
    _loadFrameCount(): void;
}
export default FramesTrajectory;
