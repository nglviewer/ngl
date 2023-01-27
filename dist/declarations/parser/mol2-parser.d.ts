/**
 * @file Mol2 Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import StructureParser from './structure-parser';
declare class Mol2Parser extends StructureParser {
    get type(): string;
    _parse(): void;
}
export default Mol2Parser;
