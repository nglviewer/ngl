/**
 * @file Surface Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Parser, { ParserParameters } from './parser';
import Streamer from '../streamer/streamer';
declare class SurfaceParser extends Parser {
    constructor(streamer: Streamer, params?: Partial<ParserParameters>);
    get type(): string;
    get __objName(): string;
    _parse(): void;
}
export default SurfaceParser;
