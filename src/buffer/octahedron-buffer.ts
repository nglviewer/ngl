/**
 * @file Octahedron Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { OctahedronBufferGeometry, Vector3, Matrix4 } from 'three'
import { BufferRegistry } from '../globals'
import GeometryBuffer from './geometry-buffer'
import { BufferData, BufferParameters } from './buffer'

const scale = new Vector3()
const target = new Vector3()
const up = new Vector3()
const eye = new Vector3(0, 0, 0)

export interface OctahedronBufferData extends BufferData {
  heightAxis: Float32Array
  depthAxis: Float32Array
  size: Float32Array
}

/**
 * Octahedron buffer. Draws octahedrons.
 *
 * @example
 * var octahedronBuffer = new OctahedronBuffer({
 *   position: new Float32Array([ 0, 3, 0, -2, 0, 0 ]),
 *   color: new Float32Array([ 1, 0, 1, 0, 1, 0 ]),
 *   size: new Float32Array([ 2, 1.5 ]),
 *   heightAxis: new Float32Array([ 0, 1, 1, 0, 2, 0 ]),
 *   depthAxis: new Float32Array([ 1, 0, 1, 0, 0, 2 ])
 * })
 */
class OctahedronBuffer extends GeometryBuffer {
  updateNormals = true

  _heightAxis: Float32Array
  _depthAxis: Float32Array
  _size: Float32Array

  constructor (data: OctahedronBufferData, params: Partial<BufferParameters> = {}) {
    super(data, params, new OctahedronBufferGeometry(1, 0))

    this.setAttributes(data, true)
  }

  applyPositionTransform (matrix: Matrix4, i: number, i3: number) {
    target.fromArray(this._heightAxis as any, i3)
    up.fromArray(this._depthAxis as any, i3)
    matrix.lookAt(eye, target, up)

    scale.set(this._size[ i ], up.length(), target.length())
    matrix.scale(scale)
  }

  setAttributes (data: Partial<OctahedronBufferData> = {}, initNormals?: boolean) {
    if (data.size) this._size = data.size
    if (data.heightAxis) this._heightAxis = data.heightAxis
    if (data.depthAxis) this._depthAxis = data.depthAxis

    super.setAttributes(data, initNormals)
  }
}

BufferRegistry.add('octahedron', OctahedronBuffer)

export default OctahedronBuffer
