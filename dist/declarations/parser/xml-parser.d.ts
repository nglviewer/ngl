/**
 * @file Xml Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { XMLNode } from '../utils/parse-xml';
import Parser, { ParserParameters } from './parser';
import Streamer from '../streamer/streamer';
export interface XmlParserParameters extends ParserParameters {
    useDomParser: boolean;
}
declare class XmlParser extends Parser {
    xml: {
        name: string;
        path: string;
        data: any;
    };
    constructor(streamer: Streamer, params?: Partial<XmlParserParameters>);
    get type(): string;
    get __objName(): string;
    get isXml(): boolean;
    __xmlParser(xml: string): {
        declaration: XMLNode | undefined;
        root: XMLNode | undefined;
    };
    __domParser(xml: string): Document;
    _parse(): void;
}
export default XmlParser;
