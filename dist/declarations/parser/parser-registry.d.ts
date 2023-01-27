/**
 * @file Parser Registry
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Registry from '../utils/registry';
declare class ParserRegistry extends Registry {
    constructor();
    __hasObjName(key: string, objName: string): any;
    isTrajectory(key: string): any;
    isStructure(key: string): any;
    isVolume(key: string): any;
    isSurface(key: string): any;
    isBinary(key: string): any;
    isXml(key: string): any;
    isJson(key: string): any;
    getTrajectoryExtensions(): string[];
    getStructureExtensions(): string[];
    getVolumeExtensions(): string[];
    getSurfaceExtensions(): string[];
}
export default ParserRegistry;
