/**
 * @file Cylinder Impostor Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Matrix4 } from '../../lib/three.es6.js'

import '../shader/CylinderImpostor.vert'
import '../shader/CylinderImpostor.frag'

import { defaults } from '../utils.js'
import MappedAlignedBoxBuffer from './mappedalignedbox-buffer.js'

/**
 * Cylinder impostor buffer.
 *
 * @example
 * var cylinderimpostorBuffer = new CylinderImpostorBuffer({
 *     position1: new Float32Array([ 0, 0, 0 ]),
 *     position2: new Float32Array([ 1, 1, 1 ]),
 *     color: new Float32Array([ 1, 0, 0 ]),
 *     color2: new Float32Array([ 0, 1, 0 ]),
 *     radius: new Float32Array([ 1 ])
 * });
 */
class CylinderImpostorBuffer extends MappedAlignedBoxBuffer {
  /**
   * make cylinder impostor buffer
   * @param  {Object} data - attribute object
   * @param  {Float32Array} data.position1 - from positions
   * @param  {Float32Array} data.position2 - to positions
   * @param  {Float32Array} data.color - from colors
   * @param  {Float32Array} data.color2 - to colors
   * @param  {Float32Array} data.radius - radii
   * @param  {Picker} data.picking - picking ids
   * @param  {BufferParameters} params - parameter object
   */
  constructor (data, params) {
    super(data, params)

    var p = params || {}

    this.openEnded = defaults(p.openEnded, false)

    this.addUniforms({
      'modelViewMatrixInverse': { value: new Matrix4() },
      'ortho': { value: 0.0 }
    })

    this.addAttributes({
      'position1': { type: 'v3', value: null },
      'position2': { type: 'v3', value: null },
      'color2': { type: 'c', value: null },
      'radius': { type: 'f', value: null }
    })

    this.setAttributes(data)
    this.makeMapping()
  }

  get parameters () {
    return Object.assign({

      openEnded: { updateShader: true }

    }, super.parameters)
  }

  getDefines (type) {
    var defines = MappedAlignedBoxBuffer.prototype.getDefines.call(this, type)

    if (!this.openEnded) {
      defines.CAP = 1
    }

    return defines
  }

  get isImpostor () { return true }
  get vertexShader () { return 'CylinderImpostor.vert' }
  get fragmentShader () { return 'CylinderImpostor.frag' }
}

export default CylinderImpostorBuffer
