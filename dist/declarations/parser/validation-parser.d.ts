/**
 * @file Validation Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import XmlParser, { XmlParserParameters } from './xml-parser';
import Streamer from '../streamer/streamer';
declare class ValidationParser extends XmlParser {
    constructor(streamer: Streamer, params?: Partial<XmlParserParameters>);
    get __objName(): string;
    get isXml(): boolean;
    _parse(): void;
}
export default ValidationParser;
