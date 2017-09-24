/**
 * @file Cone Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Matrix4, Vector3, ConeBufferGeometry } from '../../lib/three.es6.js'

import { defaults } from '../utils.js'
import { calculateCenterArray } from '../math/array-utils.js'
import GeometryBuffer from './geometry-buffer.js'

const scale = new Vector3()
const eye = new Vector3()
const target = new Vector3()
const up = new Vector3(0, 1, 0)

/**
 * Cone geometry buffer.
 *
 * @example
 * var coneGeometryBuffer = new ConeGeometryBuffer({
 *   position1: new Float32Array([ 0, 0, 0 ]),
 *   position2: new Float32Array([ 1, 1, 1 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   color2: new Float32Array([ 0, 1, 0 ]),
 *   radius: new Float32Array([ 1 ])
 * });
 */
class ConeGeometryBuffer extends GeometryBuffer {
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
    const p = params || {}

    const radialSegments = defaults(p.radialSegments, 60)
    const openEnded = defaults(p.openEnded, false)
    const matrix = new Matrix4().makeRotationX(-Math.PI / 2)

    const geo = new ConeBufferGeometry(
      1,  // radius
      1,  // height
      radialSegments,  // radialSegments
      1,  // heightSegments
      openEnded  // openEnded
    )
    geo.applyMatrix(matrix)

    const position = new Float32Array(data.position1.length)

    super({
      position: position,
      color: data.color,
      picking: data.picking
    }, p, geo)

    this._position = position

    this.setAttributes(data, true)
  }

  applyPositionTransform (matrix, i, i3) {
    eye.fromArray(this._position1, i3)
    target.fromArray(this._position2, i3)
    matrix.lookAt(eye, target, up)

    const r = this._radius[ i ]
    scale.set(r, r, eye.distanceTo(target))
    matrix.scale(scale)
  }

  setAttributes (data, initNormals) {
    if (data.position1 && data.position2) {
      calculateCenterArray(data.position1, data.position2, this._position)
      this._position1 = data.position1
      this._position2 = data.position2
      data.position = this._position
    }
    if (data.radius) this._radius = data.radius

    super.setAttributes(data, initNormals)
  }

  get updateNormals () { return true }
}

export default ConeGeometryBuffer
