/**
 * @file Tetrahedron Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { TorusBufferGeometry, Vector3 } from '../../lib/three.es6.js'

import { BufferRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import GeometryBuffer from './geometry-buffer.js'

const scale = new Vector3()
const target = new Vector3()
const up = new Vector3()
const eye = new Vector3(0, 0, 0)

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
  constructor (data, params) {
    const p = params || {}
    const radiusRatio = defaults(p.radiusRatio, 0.2)
    const radialSegments = defaults(p.radialSegments, 16)
    const tubularSegments = defaults(p.tubularSegments, 32)
    const geo = new TorusBufferGeometry(
      1, radiusRatio, radialSegments, tubularSegments
    )

    super(data, params, geo)

    this.setAttributes(data, true)
  }

  applyPositionTransform (matrix, i, i3) {
    target.fromArray(this._majorAxis, i3)
    up.fromArray(this._minorAxis, i3)
    matrix.lookAt(eye, target, up)

    const r = this._radius[ i ]
    scale.set(r, r, r)
    matrix.scale(scale)
  }

  setAttributes (data, initNormals) {
    if (data.radius) this._radius = data.radius
    if (data.majorAxis) this._majorAxis = data.majorAxis
    if (data.minorAxis) this._minorAxis = data.minorAxis

    super.setAttributes(data, initNormals)
  }

  get updateNormals () { return true }
}

BufferRegistry.add('torus', TorusBuffer)

export default TorusBuffer
