/**
 * @file Wide Line Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector2, Matrix4 } from 'three'

import '../shader/WideLine.vert'
import '../shader/WideLine.frag'

import MappedQuadBuffer from './mappedquad-buffer'
import { BufferDefaultParameters, BufferData } from './buffer'

interface WideLineBufferData extends BufferData {
  position1: Float32Array
  position2: Float32Array
  color2: Float32Array
}

const WideLineBufferDefaultParameters = Object.assign({
  linewidth: 2
}, BufferDefaultParameters)
type WideLineBufferParameters = typeof WideLineBufferDefaultParameters

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
  get defaultParameters() { return WideLineBufferDefaultParameters }
  parameters: WideLineBufferParameters

  vertexShader = 'WideLine.vert'
  fragmentShader ='WideLine.frag'

  /**
   * @param  {Object} data - attribute object
   * @param  {Float32Array} data.position1 - from positions
   * @param  {Float32Array} data.position2 - to positions
   * @param  {Float32Array} data.color - from colors
   * @param  {Float32Array} data.color2 - to colors
   * @param  {BufferParameters} params - parameter object
   */
  constructor (data: WideLineBufferData, params: Partial<WideLineBufferParameters> = {}) {
    super(data, params)

    this.addUniforms({
      'linewidth': { value: this.parameters.linewidth },
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
}

export default WideLineBuffer
