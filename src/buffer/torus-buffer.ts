/**
 * @file Tetrahedron Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { TorusBufferGeometry, Vector3, Matrix4 } from 'three'

import { BufferRegistry } from '../globals'
import { defaults } from '../utils'
import GeometryBuffer from './geometry-buffer'
import { BufferDefaultParameters, BufferData } from './buffer'

const scale = new Vector3()
const target = new Vector3()
const up = new Vector3()
const eye = new Vector3(0, 0, 0)

export interface TorusBufferData extends BufferData {
  majorAxis: Float32Array
  minorAxis: Float32Array
  radius: Float32Array
}

export const TorusBufferDefaultParameters = Object.assign({
  radiusRatio: 0.2,
  radialSegments: 16,
  tubularSegments: 32
}, BufferDefaultParameters)
export type TorusBufferParameters = typeof TorusBufferDefaultParameters

/**
 * Torus geometry buffer. Draws torii.
 *
 * @example
 * var torusBuffer = new TorusBuffer({
 *   position: new Float32Array([ 0, 0, 0 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   radius: new Float32Array([ 1 ]),
 *   majorAxis: new Float32Array([ 1, 1, 0 ]),
 *   minorAxis: new Float32Array([ 0.5, 0, 0.5 ]),
 * });
 */
class TorusBuffer extends GeometryBuffer {
  updateNormals = true

  get defaultParameters() { return TorusBufferDefaultParameters }
  parameters: TorusBufferParameters

  _majorAxis: Float32Array
  _minorAxis: Float32Array
  _radius: Float32Array

  constructor (data: TorusBufferData, params: Partial<TorusBufferParameters> = {}) {
    super(data, params, new TorusBufferGeometry(
      1,
      defaults(params.radiusRatio, 0.2),
      defaults(params.radialSegments, 16),
      defaults(params.tubularSegments, 32)
    ))

    this.setAttributes(data, true)
  }

  applyPositionTransform (matrix: Matrix4, i: number, i3: number) {
    target.fromArray(this._majorAxis as any, i3)
    up.fromArray(this._minorAxis as any, i3)
    matrix.lookAt(eye, target, up)

    const r = this._radius[ i ]
    scale.set(r, r, r)
    matrix.scale(scale)
  }

  setAttributes (data: Partial<TorusBufferData> = {}, initNormals?: boolean) {
    if (data.radius) this._radius = data.radius
    if (data.majorAxis) this._majorAxis = data.majorAxis
    if (data.minorAxis) this._minorAxis = data.minorAxis

    super.setAttributes(data, initNormals)
  }
}

BufferRegistry.add('torus', TorusBuffer)

export default TorusBuffer
