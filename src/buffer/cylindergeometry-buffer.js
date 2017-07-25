/**
 * @file Cylinder Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Matrix4, Vector3, CylinderBufferGeometry } from '../../lib/three.es6.js'

import { defaults } from '../utils.js'
import { calculateCenterArray, serialBlockArray } from '../math/array-utils.js'
import GeometryBuffer from './geometry-buffer.js'

const scale = new Vector3()
const eye = new Vector3()
const target = new Vector3()
const up = new Vector3(0, 1, 0)

/**
 * Cylinder geometry buffer.
 *
 * @example
 * var cylinderGeometryBuffer = new CylinderGeometryBuffer({
 *   position1: new Float32Array([ 0, 0, 0 ]),
 *   position2: new Float32Array([ 1, 1, 1 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   color2: new Float32Array([ 0, 1, 0 ]),
 *   radius: new Float32Array([ 1 ])
 * });
 */
class CylinderGeometryBuffer extends GeometryBuffer {
  /**
   * @param {Object} data - buffer data
   * @param {Float32Array} data.position1 - from positions
   * @param {Float32Array} data.position2 - to positions
   * @param {Float32Array} data.color - from colors
   * @param {Float32Array} data.color2 - to colors
   * @param {Float32Array} data.radius - radii
   * @param {Picker} [data.picking] - picking ids
   * @param {BufferParameters} [params] - parameters object
   */
  constructor (data, params) {
    const d = data || {}
    const p = params || {}

    const radialSegments = defaults(p.radialSegments, 10)
    const openEnded = defaults(p.openEnded, true)
    const matrix = new Matrix4().makeRotationX(Math.PI / 2)

    const geo = new CylinderBufferGeometry(
      1,  // radiusTop,
      1,  // radiusBottom,
      1,  // height,
      radialSegments,  // radialSegments,
      1,  // heightSegments,
      openEnded  // openEnded
    )
    geo.applyMatrix(matrix)

    const n = d.position1.length
    const m = d.radius.length

    //

    const geoLength = geo.attributes.position.array.length / 3
    const count = n / 3
    const primitiveId = new Float32Array(count * 2 * geoLength)
    serialBlockArray(count, geoLength, 0, primitiveId)
    serialBlockArray(count, geoLength, count * geoLength, primitiveId)

    //

    const position = new Float32Array(n * 2)
    const color = new Float32Array(n * 2)

    super({
      position: position,
      color: color,
      primitiveId: primitiveId,
      picking: d.picking
    }, p, geo)

    this.__center = new Float32Array(n)

    this._position = position
    this._color = color
    this._from = new Float32Array(n * 2)
    this._to = new Float32Array(n * 2)
    this._radius = new Float32Array(m * 2)

    this.setAttributes(d, true)
  }

  applyPositionTransform (matrix, i, i3) {
    eye.fromArray(this._from, i3)
    target.fromArray(this._to, i3)
    matrix.lookAt(eye, target, up)

    const r = this._radius[ i ]
    scale.set(r, r, eye.distanceTo(target))
    matrix.scale(scale)
  }

  setAttributes (data, initNormals) {
    const meshData = {}

    if (data.position1 && data.position2) {
      calculateCenterArray(
        data.position1, data.position2, this.__center
      )
      calculateCenterArray(
        data.position1, this.__center, this._position
      )
      calculateCenterArray(
        this.__center, data.position2, this._position, data.position1.length
      )
      this._from.set(data.position1)
      this._from.set(this.__center, data.position1.length)
      this._to.set(this.__center)
      this._to.set(data.position2, this.__center.length)
      meshData.position = this._position
    }

    if (data.color && data.color2) {
      this._color.set(data.color)
      this._color.set(data.color2, data.color.length)
      meshData.color = this._color
    }

    if (data.radius) {
      this._radius.set(data.radius)
      this._radius.set(data.radius, data.radius.length)
      meshData.radius = this._radius
    }

    super.setAttributes(meshData, initNormals)
  }

  get updateNormals () { return true }
}

export default CylinderGeometryBuffer
