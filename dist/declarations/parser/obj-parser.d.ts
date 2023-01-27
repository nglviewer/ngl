/**
 * @file Obj Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import SurfaceParser from './surface-parser';
export interface _OBJLoader {
    regexp: {
        [k: string]: RegExp;
    };
}
declare class ObjParser extends SurfaceParser {
    get type(): string;
    getLoader(): _OBJLoader;
}
export default ObjParser;
