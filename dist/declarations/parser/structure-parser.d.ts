/**
 * @file Structure Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Parser, { ParserParameters } from './parser';
import Streamer from '../streamer/streamer';
export interface StructureParserParameters extends ParserParameters {
    firstModelOnly: boolean;
    asTrajectory: boolean;
    cAlphaOnly: boolean;
}
declare class StructureParser extends Parser {
    constructor(streamer: Streamer, params?: Partial<StructureParserParameters>);
    get type(): string;
    get __objName(): string;
}
export default StructureParser;
