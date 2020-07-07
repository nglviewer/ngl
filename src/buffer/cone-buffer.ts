/**
 * @file Cone Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Matrix4, Vector3, ConeBufferGeometry } from 'three'

import { BufferRegistry } from '../globals'
import { defaults } from '../utils'
import { calculateCenterArray } from '../math/array-utils'
import GeometryBuffer from './geometry-buffer'
import { BufferData, BufferDefaultParameters } from './buffer'

const scale = new Vector3()
const eye = new Vector3()
const target = new Vector3()
const up = new Vector3(0, 1, 0)

function getGeo (params: Partial<ConeBufferParameters> = {}) {
  const geo = new ConeBufferGeometry(
    1,  // radius
    1,  // height
    defaults(params.radialSegments, 60),  // radialSegments
    1,  // heightSegments
    defaults(params.openEnded, false)  // openEnded
  )
  geo.applyMatrix4(new Matrix4().makeRotationX(-Math.PI / 2))

  return geo
}

export interface ConeBufferData extends BufferData {
  position1: Float32Array
  position2: Float32Array
  radius: Float32Array
}

export const ConeBufferDefaultParameters = Object.assign({
  radialSegments: 60,
  openEnded: false
}, BufferDefaultParameters)
export type ConeBufferParameters = typeof ConeBufferDefaultParameters


/**
 * Cone geometry buffer.
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
class ConeBuffer extends GeometryBuffer {
  updateNormals = true

  get defaultParameters() { return ConeBufferDefaultParameters }
  parameters: ConeBufferParameters

  _position: Float32Array
  _position1: Float32Array
  _position2: Float32Array
  _radius: Float32Array

  /**
   * @param {Object} data - buffer data
   * @param {Float32Array} data.position1 - from positions
   * @param {Float32Array} data.position2 - to positions
   * @param {Float32Array} data.color - colors
   * @param {Float32Array} data.radius - radii
   * @param {Picker} [data.picking] - picking ids
   * @param {BufferParameters} [params] - parameters object
   */
  constructor (data: ConeBufferData, params: Partial<ConeBufferParameters> = {}) {
    super({
      position: new Float32Array(data.position1.length),
      color: data.color,
      picking: data.picking
    }, params, getGeo(params))

    this._position = new Float32Array(data.position1.length)

    this.setAttributes(data, true)
  }

  applyPositionTransform (matrix: Matrix4, i: number, i3: number) {
    eye.fromArray(this._position1 as any, i3)
    target.fromArray(this._position2 as any, i3)
    matrix.lookAt(eye, target, up)

    const r = this._radius[ i ]
    scale.set(r, r, eye.distanceTo(target))
    matrix.scale(scale)
  }

  setAttributes (data: Partial<ConeBufferData> = {}, initNormals?: boolean) {
    if (data.position1 && data.position2) {
      calculateCenterArray(data.position1, data.position2, this._position)
      this._position1 = data.position1
      this._position2 = data.position2
      data.position = this._position
    }
    if (data.radius) this._radius = data.radius

    super.setAttributes(data, initNormals)
  }
}

BufferRegistry.add('cone', ConeBuffer)

export default ConeBuffer
