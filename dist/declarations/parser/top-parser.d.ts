/**
 * @file Top Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import StructureParser from './structure-parser';
declare class TopParser extends StructureParser {
    get type(): string;
    _parse(): void;
}
export default TopParser;
