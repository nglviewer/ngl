/**
 * @file Wide Line Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector2, Matrix4 } from '../../lib/three.es6.js'

import '../shader/WideLine.vert'
import '../shader/WideLine.frag'

import { defaults } from '../utils.js'
import MappedQuadBuffer from './mappedquad-buffer.js'

/**
 * Wide Line buffer. Draws lines with a fixed width in pixels.
 *
 * @example
 * var lineBuffer = new WideLineBuffer({
 *   position1: new Float32Array([ 0, 0, 0 ]),
 *   position2: new Float32Array([ 1, 1, 1 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   color2: new Float32Array([ 0, 1, 0 ])
 * });
 */
class WideLineBuffer extends MappedQuadBuffer {
  /**
   * @param  {Object} data - attribute object
   * @param  {Float32Array} data.position1 - from positions
   * @param  {Float32Array} data.position2 - to positions
   * @param  {Float32Array} data.color - from colors
   * @param  {Float32Array} data.color2 - to colors
   * @param  {BufferParameters} params - parameter object
   */
  constructor (data, params) {
    super(data, params)

    var p = params || {}

    this.linewidth = defaults(p.linewidth, 2)

    this.addUniforms({
      'linewidth': { value: this.linewidth },
      'resolution': { value: new Vector2() },
      'projectionMatrixInverse': { value: new Matrix4() }
    })

    this.addAttributes({
      'position1': { type: 'v3', value: null },
      'position2': { type: 'v3', value: null },
      'color2': { type: 'c', value: null }
    })

    this.setAttributes(data)
    this.makeMapping()
  }

  get parameters () {
    return Object.assign({

      linewidth: { uniform: true }

    }, super.parameters)
  }

  get vertexShader () { return 'WideLine.vert' }
  get fragmentShader () { return 'WideLine.frag' }
}

export default WideLineBuffer
