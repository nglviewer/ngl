/**
 * @file Mrc Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Matrix4 } from 'three';
import VolumeParser from './volume-parser';
declare class MrcParser extends VolumeParser {
    get type(): string;
    get isBinary(): boolean;
    _parse(): void;
    getMatrix(): Matrix4;
}
export default MrcParser;
