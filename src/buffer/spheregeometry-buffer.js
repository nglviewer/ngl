/**
 * @file Sphere Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { IcosahedronBufferGeometry, Vector3 } from '../../lib/three.es6.js'

import { defaults } from '../utils.js'
import GeometryBuffer from './geometry-buffer.js'

const scale = new Vector3()

/**
 * Sphere geometry buffer.
 *
 * @example
 * var sphereGeometryBuffer = new SphereGeometryBuffer({
 *   position: new Float32Array([ 0, 0, 0 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   radius: new Float32Array([ 1 ])
 * });
 */
class SphereGeometryBuffer extends GeometryBuffer {
  /**
   * @param {Object} data - attribute object
   * @param {Float32Array} data.position - positions
   * @param {Float32Array} data.color - colors
   * @param {Float32Array} data.radius - radii
   * @param {Picker} [data.picking] - picking ids
   * @param {BufferParameters} params - parameter object
   */
  constructor (data, params) {
    const p = params || {}
    const detail = defaults(p.sphereDetail, 1)
    const geo = new IcosahedronBufferGeometry(1, detail)

    super(data, p, geo)

    this.setAttributes(data, true)
  }

  applyPositionTransform (matrix, i) {
    const r = this._radius[ i ]
    scale.set(r, r, r)
    matrix.scale(scale)
  }

  setAttributes (data, initNormals) {
    if (data.radius) this._radius = data.radius

    super.setAttributes(data, initNormals)
  }
}

export default SphereGeometryBuffer
