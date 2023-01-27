/**
 * @file Mmtf Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import StructureParser from './structure-parser';
declare class MmtfParser extends StructureParser {
    get type(): string;
    get isBinary(): boolean;
    _parse(): void;
}
export default MmtfParser;
