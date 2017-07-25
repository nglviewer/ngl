/**
 * @file Ellipsoid Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { BufferRegistry } from '../globals.js'
import EllipsoidGeometryBuffer from './ellipsoidgeometry-buffer.js'

/**
 * Ellipsoid buffer. Returns an {@link EllipsoidGeometryBuffer}
 *
 * @example
 * var ellipsoidBuffer = new EllipsoidBuffer( {
 *     position: new Float32Array( [ 0, 0, 0 ] ),
 *     color: new Float32Array( [ 1, 0, 0 ] ),
 *     radius: new Float32Array( [ 1 ] ),
 *     majorAxis: new Float32Array( [ 1, 1, 0 ] ),
 *     minorAxis: new Float32Array( [ 0.5, 0, 0.5 ] ),
 * } );
 */
class EllipsoidBuffer {
    /**
     * @param {Object} data - buffer data
     * @param {Float32Array} data.position - center positions
     * @param {Float32Array} data.color - colors
     * @param {Float32Array} data.radius - radii
     * @param {Float32Array} data.majorAxis - major axis vectors, length defines radius in major direction
     * @param {Float32Array} data.minorAxis - minor axis vectors, length defines radius in minor direction
     * @param {Picker} [data.picking] - picking ids
     * @param {BufferParameters} [params] - parameters object
     */
  constructor (data, params) {
    return new EllipsoidGeometryBuffer(data, params)
  }
}

BufferRegistry.add('ellipsoid', EllipsoidBuffer)

export default EllipsoidBuffer
