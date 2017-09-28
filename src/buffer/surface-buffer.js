/**
 * @file Surface Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import MeshBuffer from './mesh-buffer.js'

/**
 * Surface buffer. Like a {@link MeshBuffer}, but with `.isSurface` set to `true`.
 */
class SurfaceBuffer extends MeshBuffer {
  get isSurface () { return true }
}

export default SurfaceBuffer
