/**
 * @file Sphere Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { BufferRegistry, ExtensionFragDepth } from '../globals.js'
import SphereGeometryBuffer from './spheregeometry-buffer.js'
import SphereImpostorBuffer from './sphereimpostor-buffer.js'

/**
 * Sphere buffer. Depending on the value {@link ExtensionFragDepth} and
 * `params.disableImpostor` the constructor returns either a
 * {@link SphereGeometryBuffer} or a {@link SphereImpostorBuffer}
 * @implements {Buffer}
 *
 * @example
 * var sphereBuffer = new SphereBuffer( {
 *     position: new Float32Array( [ 0, 0, 0 ] ),
 *     color: new Float32Array( [ 1, 0, 0 ] ),
 *     radius: new Float32Array( [ 1 ] )
 * } );
 */
class SphereBuffer {
    /**
     * @param {Object} data - buffer data
     * @param {Float32Array} data.position - positions
     * @param {Float32Array} data.color - colors
     * @param {Float32Array} data.radius - radii
     * @param {Picker} [data.picking] - picking ids
     * @param {BufferParameters} params - parameters object
     * @return {SphereGeometryBuffer|SphereImpostorBuffer} the buffer object
     */
  constructor (data, params) {
    if (!ExtensionFragDepth || (params && params.disableImpostor)) {
      return new SphereGeometryBuffer(data, params)
    } else {
      return new SphereImpostorBuffer(data, params)
    }
  }
}

BufferRegistry.add('sphere', SphereBuffer)

export default SphereBuffer
