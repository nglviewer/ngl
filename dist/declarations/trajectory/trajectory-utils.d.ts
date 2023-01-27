/**
 * @file Trajectory Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Structure from '../structure/structure';
import Frames from './frames';
import { TrajectoryParameters } from './trajectory';
import FramesTrajectory from './frames-trajectory';
import StructureTrajectory from './structure-trajectory';
import RemoteTrajectory from './remote-trajectory';
import CallbackTrajectory from './callback-trajectory';
export declare function makeTrajectory(trajSrc: string | Frames, structure: Structure, params: TrajectoryParameters): FramesTrajectory | StructureTrajectory | RemoteTrajectory | CallbackTrajectory;
