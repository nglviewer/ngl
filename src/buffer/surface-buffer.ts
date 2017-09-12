/**
 * @file Surface Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import MeshBuffer from './mesh-buffer'

/**
 * Surface buffer. Like a {@link MeshBuffer}, but with `.isSurface` set to `true`.
 */
class SurfaceBuffer extends MeshBuffer {
  isSurface = true
}

export default SurfaceBuffer
