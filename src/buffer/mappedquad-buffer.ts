/**
 * @file Mapped Quad Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { BufferParameters, BufferData } from './buffer'
import MappedBuffer from './mapped-buffer'

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
  constructor(data: BufferData, params: Partial<BufferParameters> = {}) {
    super('v2', data, params)
  }
  get mapping () { return mapping }
  get mappingIndices () { return mappingIndices }
  get mappingIndicesSize () { return 6 }
  get mappingSize () { return 4 }
  get mappingItemSize () { return 2 }
}

export default MappedQuadBuffer
