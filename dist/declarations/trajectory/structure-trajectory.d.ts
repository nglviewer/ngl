/**
 * @file Structure Trajectory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Structure from '../structure/structure';
import Trajectory, { TrajectoryParameters } from './trajectory';
/**
 * Structure trajectory class. Gets data from a structure object.
 */
declare class StructureTrajectory extends Trajectory {
    atomIndices?: ArrayLike<number>;
    constructor(trajPath: string, structure: Structure, params: TrajectoryParameters);
    get type(): string;
    _makeAtomIndices(): void;
    _loadFrame(i: number, callback?: Function): void;
    _loadFrameCount(): void;
}
export default StructureTrajectory;
