/**
 * @file Octahedron Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { OctahedronBufferGeometry, Vector3 } from '../../lib/three.es6.js'

import { BufferRegistry } from '../globals.js'
import GeometryBuffer from './geometry-buffer.js'

const scale = new Vector3()
const target = new Vector3()
const up = new Vector3()
const eye = new Vector3(0, 0, 0)

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
  constructor (data, params) {
    const p = params || {}
    const geo = new OctahedronBufferGeometry(1, 0)

    super(data, p, geo)

    this.setAttributes(data, true)
  }

  applyPositionTransform (matrix, i, i3) {
    target.fromArray(this._heightAxis, i3)
    up.fromArray(this._depthAxis, i3)
    matrix.lookAt(eye, target, up)

    scale.set(this._size[ i ], up.length(), target.length())
    matrix.scale(scale)
  }

  setAttributes (data, initNormals) {
    if (data.size) this._size = data.size
    if (data.heightAxis) this._heightAxis = data.heightAxis
    if (data.depthAxis) this._depthAxis = data.depthAxis

    super.setAttributes(data, initNormals)
  }

  get updateNormals () { return true }
}

BufferRegistry.add('octahedron', OctahedronBuffer)

export default OctahedronBuffer
