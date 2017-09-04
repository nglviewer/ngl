/**
 * @file Sphere Impostor Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Matrix4 } from '../../lib/three.es6.js'

import '../shader/SphereImpostor.vert'
import '../shader/SphereImpostor.frag'

import MappedQuadBuffer from './mappedquad-buffer.js'

/**
 * Sphere impostor buffer.
 *
 * @example
 * var sphereImpostorBuffer = new SphereImpostorBuffer({
 *   position: new Float32Array([ 0, 0, 0 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   radius: new Float32Array([ 1 ])
 * });
 */
class SphereImpostorBuffer extends MappedQuadBuffer {
  /**
   * @param  {Object} data - attribute object
   * @param  {Float32Array} data.position - positions
   * @param  {Float32Array} data.color - colors
   * @param  {Float32Array} data.radius - radii
   * @param {Picker} [data.picking] - picking ids
   * @param  {BufferParameters} params - parameter object
   */
  constructor (data, params) {
    super(data, params)

    this.addUniforms({
      'projectionMatrixInverse': { value: new Matrix4() },
      'ortho': { value: 0.0 }
    })

    this.addAttributes({
      'radius': { type: 'f', value: null }
    })

    this.setAttributes(data)
    this.makeMapping()
  }

  get isImpostor () { return true }
  get vertexShader () { return 'SphereImpostor.vert' }
  get fragmentShader () { return 'SphereImpostor.frag' }
}

export default SphereImpostorBuffer
