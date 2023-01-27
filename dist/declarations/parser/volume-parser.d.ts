/**
 * @file Volume Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Matrix4 } from 'three';
import Parser, { ParserParameters } from './parser';
import Streamer from '../streamer/streamer';
export interface VolumeParserParameters extends ParserParameters {
    voxelSize: number;
}
declare class VolumeParser extends Parser {
    constructor(streamer: Streamer, params?: Partial<VolumeParserParameters>);
    get type(): string;
    get __objName(): string;
    _afterParse(): void;
    getMatrix(): Matrix4;
}
export default VolumeParser;
