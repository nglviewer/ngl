/**
 * @file Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Streamer from '../streamer/streamer';
export interface ParserParameters {
    name: string;
    path: string;
}
declare class Parser {
    streamer: Streamer;
    name: string;
    path: string;
    [k: string]: any;
    constructor(streamer: Streamer, params?: Partial<ParserParameters>);
    get type(): string;
    get __objName(): string;
    get isBinary(): boolean;
    get isJson(): boolean;
    get isXml(): boolean;
    parse(): Promise<any>;
    _parse(): void;
    _beforeParse(): void;
    _afterParse(): void;
}
export default Parser;
