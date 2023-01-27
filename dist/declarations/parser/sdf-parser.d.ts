/**
 * @file Sdf Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import StructureParser from './structure-parser';
declare class SdfParser extends StructureParser {
    get type(): string;
    _parse(): void;
    _postProcess(): void;
}
export default SdfParser;
