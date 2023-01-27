/**
 * @file Xplor Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Matrix4 } from 'three';
import VolumeParser from './volume-parser';
declare class XplorParser extends VolumeParser {
    get type(): string;
    _parse(): void;
    getMatrix(): Matrix4;
}
export default XplorParser;
