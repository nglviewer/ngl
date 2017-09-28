/**
 * @file Mapped Aligned Box Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import MappedBuffer from './mapped-buffer.js'

const mapping = new Float32Array([
  -1.0, 1.0, -1.0,
  -1.0, -1.0, -1.0,
  1.0, 1.0, -1.0,
  1.0, 1.0, 1.0,
  1.0, -1.0, -1.0,
  1.0, -1.0, 1.0
])

const mappingIndices = new Uint16Array([
  0, 1, 2,
  1, 4, 2,
  2, 4, 3,
  4, 5, 3
])

/**
 * Mapped Aligned box buffer. Draws boxes where one side is always screen-space aligned.
 * Used to render cylinder imposters.
 * @interface
 */
class MappedAlignedBoxBuffer extends MappedBuffer {
  get mapping () { return mapping }
  get mappingIndices () { return mappingIndices }
  get mappingIndicesSize () { return 12 }
  get mappingType () { return 'v3' }
  get mappingSize () { return 6 }
  get mappingItemSize () { return 3 }
}

export default MappedAlignedBoxBuffer
