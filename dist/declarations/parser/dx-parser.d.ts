/**
 * @file Dx Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Matrix4 } from 'three';
import VolumeParser from './volume-parser';
declare class DxParser extends VolumeParser {
    get type(): string;
    _parse(): void;
    parseHeaderLines(headerLines: string[]): {
        dataLineStart: number;
        headerByteCount: number;
    };
    getMatrix(): Matrix4;
}
export default DxParser;
