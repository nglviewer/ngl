/**
 * @file Cif Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Paul Pillot <paul.pillot@tandemai.com>
 * @private
 */
import StructureParser from './structure-parser';
declare class CifParser extends StructureParser {
    get type(): string;
    get isBinary(): boolean;
    _parse(): Promise<void>;
}
export default CifParser;
