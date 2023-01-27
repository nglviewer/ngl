/**
 * @file Dxbin Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import DxParser from './dx-parser';
declare class DxbinParser extends DxParser {
    get type(): string;
    get isBinary(): boolean;
    _parse(): void;
}
export default DxbinParser;
