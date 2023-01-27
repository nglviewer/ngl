/**
 * @file Trajectory Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Parser, { ParserParameters } from './parser';
import Streamer from '../streamer/streamer';
declare class TrajectoryParser extends Parser {
    constructor(streamer: Streamer, params?: Partial<ParserParameters>);
    get type(): string;
    get __objName(): string;
}
export default TrajectoryParser;
