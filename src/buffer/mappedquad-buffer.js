/**
 * @file Mapped Quad Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import MappedBuffer from './mapped-buffer.js'

const mapping = new Float32Array([
  -1.0, 1.0,
  -1.0, -1.0,
  1.0, 1.0,
  1.0, -1.0
])

const mappingIndices = new Uint16Array([
  0, 1, 2,
  1, 3, 2
])

/**
 * Mapped Quad buffer. Draws screen-aligned quads. Used to render impostors.
 * @interface
 */
class MappedQuadBuffer extends MappedBuffer {
  get mapping () { return mapping }
  get mappingIndices () { return mappingIndices }
  get mappingIndicesSize () { return 6 }
  get mappingType () { return 'v2' }
  get mappingSize () { return 4 }
  get mappingItemSize () { return 2 }
}

export default MappedQuadBuffer
