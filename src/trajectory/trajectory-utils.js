/**
 * @file Trajectory Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import FramesTrajectory from "./frames-trajectory.js";
import StructureTrajectory from "./structure-trajectory.js";
import RemoteTrajectory from "./remote-trajectory.js";


function makeTrajectory( trajSrc, structure, params ){

    var traj;

    if( trajSrc && trajSrc.type === "Frames" ){

        traj = new FramesTrajectory( trajSrc, structure, params );

    }else if( !trajSrc && structure.frames ){

        traj = new StructureTrajectory( trajSrc, structure, params );

    }else{

        traj = new RemoteTrajectory( trajSrc, structure, params );

    }

    return traj;

}


export {
	makeTrajectory
};
