/**
 * @file Surface Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import MeshBuffer from './mesh-buffer';
/**
 * Surface buffer. Like a {@link MeshBuffer}, but with `.isSurface` set to `true`.
 */
declare class SurfaceBuffer extends MeshBuffer {
    isSurface: boolean;
}
export default SurfaceBuffer;
