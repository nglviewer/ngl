/**
 * @file Json Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Parser, { ParserParameters } from './parser';
import Streamer from '../streamer/streamer';
export interface JsonParserParameters extends ParserParameters {
    string: boolean;
}
declare class JsonParser extends Parser {
    constructor(streamer: Streamer, params?: Partial<JsonParserParameters>);
    get type(): string;
    get __objName(): string;
    get isJson(): boolean;
    _parse(): void;
}
export default JsonParser;
