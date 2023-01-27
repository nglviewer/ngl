/**
 * @file Pdb Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import StructureParser from './structure-parser';
import Streamer from '../streamer/streamer';
import { ParserParameters } from './parser';
declare const HelixTypes: {
    [k: number]: string;
};
export interface PdbParserParameters extends ParserParameters {
    hex: boolean;
}
declare class PdbParser extends StructureParser {
    /**
     * Create a pdb parser
     * @param  {Streamer} streamer - streamer object
     * @param  {Object} params - params object
     * @param  {Boolean} params.hex - hexadecimal parsing of
     *                                atom numbers >99.999 and
     *                                residue numbers >9.999
     * @return {undefined}
     */
    constructor(streamer: Streamer, params?: Partial<PdbParserParameters>);
    get type(): string;
    _parse(): void;
}
export default PdbParser;
export { HelixTypes };
