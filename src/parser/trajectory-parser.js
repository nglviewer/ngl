/**
 * @file Trajectory Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Parser from "./parser.js";
import Frames from "../trajectory/frames.js";


function TrajectoryParser( streamer, params ){

    Parser.call( this, streamer, params );

    this.frames = new Frames( this.name, this.path );

}

TrajectoryParser.prototype = Object.assign( Object.create(

    Parser.prototype ), {

    constructor: TrajectoryParser,
    type: "trajectory",

    __objName: "frames"

} );


export default TrajectoryParser;
