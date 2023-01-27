/**
 * @file Netcdf Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Parser, { ParserParameters } from './parser';
import Streamer from '../streamer/streamer';
declare class NetcdfParser extends Parser {
    constructor(streamer: Streamer, params?: Partial<ParserParameters>);
    get type(): string;
    get __objName(): string;
    get isBinary(): boolean;
    _parse(): void;
}
export default NetcdfParser;
