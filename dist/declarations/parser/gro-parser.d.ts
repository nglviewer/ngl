/**
 * @file Gro Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import StructureParser from './structure-parser';
declare class GroParser extends StructureParser {
    get type(): string;
    _parse(): void;
}
export default GroParser;
