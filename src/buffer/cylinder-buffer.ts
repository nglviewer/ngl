/**
 * @file Cylinder Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { BufferRegistry, ExtensionFragDepth } from '../globals'
import CylinderGeometryBuffer, { CylinderGeometryBufferDefaultParameters } from './cylindergeometry-buffer'
import CylinderImpostorBuffer, { CylinderImpostorBufferDefaultParameters } from './cylinderimpostor-buffer'
import { BufferData } from './buffer'

export interface CylinderBufferData extends BufferData {
  position1: Float32Array
  position2: Float32Array
  color2: Float32Array
  radius: Float32Array
}

const CylinderBufferDefaultParameters = Object.assign({
  disableImpostor: false
}, CylinderGeometryBufferDefaultParameters, CylinderImpostorBufferDefaultParameters)
type CylinderBufferParameters = typeof CylinderBufferDefaultParameters

/**
 * Cylinder buffer. Depending on the value {@link ExtensionFragDepth} and
 * `params.disableImpostor` the constructor returns either a
 * {@link CylinderGeometryBuffer} or a {@link CylinderImpostorBuffer}
 * @implements {Buffer}
 *
 * @example
 * var cylinderBuffer = new CylinderBuffer( {
 *     position1: new Float32Array( [ 0, 0, 0 ] ),
 *     position2: new Float32Array( [ 1, 1, 1 ] ),
 *     color: new Float32Array( [ 1, 0, 0 ] ),
 *     color2: new Float32Array( [ 0, 1, 0 ] ),
 *     radius: new Float32Array( [ 1 ] )
 * } );
 */
class CylinderBuffer {
  /**
   * @param {Object} data - buffer data
   * @param {Float32Array} data.position1 - from positions
   * @param {Float32Array} data.position2 - to positions
   * @param {Float32Array} data.color - from colors
   * @param {Float32Array} [data.color2] - to colors
   * @param {Float32Array} data.radius - radii
   * @param {Picker} [data.picking] - picking ids
   * @param {BufferParameters} [params] - parameters object
   * @return {CylinderGeometryBuffer|CylinderImpostorBuffer} the buffer object
   */
  constructor (data: CylinderBufferData, params: Partial<CylinderBufferParameters> = {}) {
    if (!ExtensionFragDepth || (params && params.disableImpostor)) {
      return new CylinderGeometryBuffer(data, params)
    } else {
      return new CylinderImpostorBuffer(data, params)
    }
  }
}

BufferRegistry.add('cylinder', CylinderBuffer)

export default CylinderBuffer
