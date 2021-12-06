/**
 * @file Cylinder Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Matrix4, Vector3, CylinderBufferGeometry } from 'three'

import { defaults } from '../utils'
import { calculateCenterArray, serialBlockArray } from '../math/array-utils'
import GeometryBuffer from './geometry-buffer'
import { CylinderBufferData } from './cylinder-buffer'
import { BufferDefaultParameters } from './buffer'

const scale = new Vector3()
const eye = new Vector3()
const target = new Vector3()
const up = new Vector3(0, 1, 0)

export const CylinderGeometryBufferDefaultParameters = Object.assign({
  radialSegments: 1,
  openEnded: true
}, BufferDefaultParameters)
export type CylinderGeometryBufferParameters = typeof CylinderGeometryBufferDefaultParameters

function getData (data: CylinderBufferData, params: Partial<CylinderGeometryBufferParameters> = {}) {
  const geo = getGeo(params)

  const n = data.position1.length

  const geoLength = (geo.attributes as any).position.array.length / 3
  const count = n / 3
  const primitiveId = new Float32Array(count * 2 * geoLength)
  serialBlockArray(count, geoLength, 0, primitiveId)
  serialBlockArray(count, geoLength, count * geoLength, primitiveId)

  const position = new Float32Array(n * 2)
  const color = new Float32Array(n * 2)

  return {
    position, color, primitiveId, picking: data.picking
  }
}

function getGeo (params: Partial<CylinderGeometryBufferParameters> = {}) {
  const radialSegments = defaults(params.radialSegments, 10)
  const openEnded = defaults(params.openEnded, true)
  const matrix = new Matrix4().makeRotationX(Math.PI / 2)

  const geo = new CylinderBufferGeometry(
    1,  // radiusTop,
    1,  // radiusBottom,
    1,  // height,
    radialSegments,  // radialSegments,
    1,  // heightSegments,
    openEnded  // openEnded
  )
  geo.applyMatrix4(matrix)

  return geo
}

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
  updateNormals = true

  get defaultParameters() { return CylinderGeometryBufferDefaultParameters }
  parameters: CylinderGeometryBufferParameters

  __center: Float32Array
  _position: Float32Array
  _color: Float32Array
  _from: Float32Array
  _to: Float32Array
  _radius: Float32Array

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
  constructor (data: CylinderBufferData, params: Partial<CylinderGeometryBufferParameters> = {}) {
    super(getData(data, params), params, getGeo(params))

    const n = data.position1.length
    const m = data.radius.length

    this.__center = new Float32Array(n)
    this._position = new Float32Array(n * 2)
    this._color = new Float32Array(n * 2)
    this._from = new Float32Array(n * 2)
    this._to = new Float32Array(n * 2)
    this._radius = new Float32Array(m * 2)

    this.setAttributes(data, true)
  }

  applyPositionTransform (matrix: Matrix4, i: number, i3: number) {
    eye.fromArray(this._from as any, i3)
    target.fromArray(this._to as any, i3)
    matrix.lookAt(eye, target, up)

    const r = this._radius[ i ]
    scale.set(r, r, eye.distanceTo(target))
    matrix.scale(scale)
  }

  setAttributes (data: Partial<CylinderBufferData> = {}, initNormals?: boolean) {
    const meshData: Partial<CylinderBufferData> = {}

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
}

export default CylinderGeometryBuffer
