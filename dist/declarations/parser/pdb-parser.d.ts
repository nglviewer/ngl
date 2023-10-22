/**
 * @file Pdb Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import StructureParser from './structure-parser';
import { InferBondsOptions } from '../structure/structure-utils';
import Streamer from '../streamer/streamer';
import { ParserParameters } from './parser';
declare const HelixTypes: {
    [k: number]: string;
};
export interface PdbParserParameters extends ParserParameters {
    hex: boolean;
    inferBonds: InferBondsOptions;
}
declare class PdbParser extends StructureParser {
    hex: boolean;
    inferBonds: InferBondsOptions;
    /**
     * Create a pdb parser
     * @param  {Streamer} streamer - streamer object
     * @param  {Object} params - params object
     * @param  {Boolean} params.hex - hexadecimal parsing of
     *                                atom numbers >99.999 and
     *                                residue numbers >9.999
     * @param  {InferBondsOptions} params.inferBonds: 'all': use explicit bonds and detect by distance
     *                                               'auto': If a hetgroup residue has explicit bonds, don't auto-detect
     *                                               'none': Don't add any bonds automatically
     * @return {undefined}
     */
    constructor(streamer: Streamer, params?: Partial<PdbParserParameters>);
    get type(): string;
    _parse(): void;
}
export default PdbParser;
export { HelixTypes };
