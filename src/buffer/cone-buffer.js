/**
 * @file Cone Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { BufferRegistry } from '../globals.js'
import ConeGeometryBuffer from './conegeometry-buffer.js'

/**
 * Cone buffer. Returns a {@link ConeGeometryBuffer}
 * @implements {Buffer}
 *
 * @example
 * var coneBuffer = new ConeBuffer({
 *   position1: new Float32Array([ 0, 0, 0 ]),
 *   position2: new Float32Array([ 1, 1, 1 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   color2: new Float32Array([ 0, 1, 0 ]),
 *   radius: new Float32Array([ 1 ])
 * });
 */
class ConeBuffer {
  /**
   * @param {Object} data - buffer data
   * @param {Float32Array} data.position1 - from positions
   * @param {Float32Array} data.position2 - to positions
   * @param {Float32Array} data.color - colors
   * @param {Float32Array} data.radius - radii
   * @param {Picker} [data.picking] - picking ids
   * @param {BufferParameters} [params] - parameters object
   */
  constructor (data, params) {
    return new ConeGeometryBuffer(data, params)
  }
}

BufferRegistry.add('cone', ConeBuffer)

export default ConeBuffer
