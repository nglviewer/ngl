/**
 * @file Trajectory Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Structure from '../structure/structure'
import Frames from './frames'
import { TrajectoryParameters } from './trajectory'
import FramesTrajectory from './frames-trajectory'
import StructureTrajectory from './structure-trajectory'
import RemoteTrajectory from './remote-trajectory'
import CallbackTrajectory from './callback-trajectory'

export function makeTrajectory (trajSrc: string|Frames, structure: Structure, params: TrajectoryParameters) {
  let traj

  if (trajSrc && trajSrc instanceof Frames) {
    traj = new FramesTrajectory(trajSrc, structure, params)
  } else if (!trajSrc && structure.frames) {
    traj = new StructureTrajectory(trajSrc, structure, params)
  } else if (trajSrc && typeof trajSrc === 'function') {
    traj = new CallbackTrajectory(trajSrc, structure, params)
  } else {
    traj = new RemoteTrajectory(trajSrc, structure, params)
  }

  return traj
}

