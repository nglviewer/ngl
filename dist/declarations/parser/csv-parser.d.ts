/**
 * @file Csv Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Parser, { ParserParameters } from './parser';
import Streamer from '../streamer/streamer';
export interface CsvParserParameters extends ParserParameters {
    delimiter: string;
    comment: string;
    columnNames: boolean;
}
/**
 * CSV parser
 */
declare class CsvParser extends Parser {
    /**
       * [constructor description]
       * @param  {Streamer} streamer - the streamer object
       * @param  {Object} params - parameter object
       * @param  {Char} params.delimiter - delimiter character
       * @param  {Char} params.comment - comment character
       * @param  {Boolean} params.columnNames - use first data line as column names
       */
    constructor(streamer: Streamer, params?: Partial<CsvParserParameters>);
    get type(): string;
    get __objName(): string;
    _parse(): void;
}
export default CsvParser;
