/**
 * @file Remote Trajectory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Structure from '../structure/structure';
import Trajectory, { TrajectoryParameters } from './trajectory';
/**
 * Remote trajectory class. Gets data from an MDsrv instance.
 */
declare class RemoteTrajectory extends Trajectory {
    atomIndices: number[][];
    constructor(trajPath: string, structure: Structure, params: TrajectoryParameters);
    get type(): string;
    _makeAtomIndices(): void;
    _loadFrame(i: number, callback?: Function): void;
    _loadFrameCount(): void;
}
export default RemoteTrajectory;
