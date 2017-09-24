/**
 * @file Mesh Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import '../shader/Mesh.vert'
import '../shader/Mesh.frag'

import { serialArray } from '../math/array-utils.js'
import Buffer from './buffer.js'

/**
 * Mesh buffer. Draws a triangle mesh.
 *
 * @example
 * var meshBuffer = new MeshBuffer( {
 *     position: new Float32Array(
 *         [ 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1 ]
 *     ),
 *     color: new Float32Array(
 *         [ 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0 ]
 *     )
 * } );
 */
class MeshBuffer extends Buffer {
    /**
     * @param  {Object} data - attribute object
     * @param  {Float32Array} data.position - positions
     * @param  {Float32Array} data.color - colors
     * @param  {Float32Array} [data.index] - triangle indices
     * @param  {Float32Array} [data.normal] - radii
     * @param  {BufferParameters} params - parameter object
     */
  constructor (data, params) {
    var d = data || {}

    if (!d.primitiveId && d.position) {
      d.primitiveId = serialArray(d.position.length / 3)
    }

    super(d, params)

    this.addAttributes({
      'normal': { type: 'v3', value: d.normal }
    })

    if (d.normal === undefined) {
      this.geometry.computeVertexNormals()
    }
  }

  get vertexShader () { return 'Mesh.vert' }
  get fragmentShader () { return 'Mesh.frag' }
}

export default MeshBuffer
