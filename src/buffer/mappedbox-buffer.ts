/**
 * @file Mapped Box Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { BufferParameters, BufferData } from './buffer'
import MappedBuffer from './mapped-buffer'

const mapping = new Float32Array([
  -1.0, -1.0, -1.0,
  1.0, -1.0, -1.0,
  1.0, -1.0, 1.0,
  -1.0, -1.0, 1.0,
  -1.0, 1.0, -1.0,
  1.0, 1.0, -1.0,
  1.0, 1.0, 1.0,
  -1.0, 1.0, 1.0
])

const mappingIndices = new Uint16Array([
  0, 1, 2,
  0, 2, 3,
  1, 5, 6,
  1, 6, 2,
  4, 6, 5,
  4, 7, 6,
  0, 7, 4,
  0, 3, 7,
  0, 5, 1,
  0, 4, 5,
  3, 2, 6,
  3, 6, 7
])

/**
 * Mapped Box buffer. Draws boxes. Used to render general imposters.
 * @interface
 */
class MappedBoxBuffer extends MappedBuffer {
  constructor(data: BufferData, params: Partial<BufferParameters> = {}) {
    super('v3', data, params)
  }
  get mapping () { return mapping }
  get mappingIndices () { return mappingIndices }
  get mappingIndicesSize () { return 36 }
  get mappingSize () { return 8 }
  get mappingItemSize () { return 3 }
}

export default MappedBoxBuffer
