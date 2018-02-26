/**
 * @file Hyperball Stick Impostor Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Matrix4 } from '../../lib/three.es6.js'

import '../shader/HyperballStickImpostor.vert'
import '../shader/HyperballStickImpostor.frag'

import { defaults } from '../utils.js'
import MappedBoxBuffer from './mappedbox-buffer.js'

/**
 * Hyperball stick impostor buffer.
 *
 * @example
 * var hyperballStickImpostorBuffer = new HyperballStickImpostorBuffer( {
 *     position1: new Float32Array( [ 0, 0, 0 ] ),
 *     position2: new Float32Array( [ 2, 2, 2 ] ),
 *     color: new Float32Array( [ 1, 0, 0 ] ),
 *     color2: new Float32Array( [ 0, 1, 0 ] ),
 *     radius1: new Float32Array( [ 1 ] ),
 *     radius2: new Float32Array( [ 2 ] )
 * } );
 */
class HyperballStickImpostorBuffer extends MappedBoxBuffer {
    /**
     * @param  {Object} data - attribute object
     * @param  {Float32Array} data.position1 - from positions
     * @param  {Float32Array} data.position2 - to positions
     * @param  {Float32Array} data.color - from colors
     * @param  {Float32Array} data.color2 - to colors
     * @param  {Float32Array} data.radius1 - from radii
     * @param  {Float32Array} data.radius2 - to radii
     * @param  {Picker} data.picking - picking ids
     * @param  {BufferParameters} params - parameter object
     */
  constructor (data, params) {
    super(data, params)

    var d = data || {}
    var p = params || {}

    var shrink = defaults(p.shrink, 0.14)

    this.addUniforms({
      'modelViewProjectionMatrix': { value: new Matrix4() },
      'modelViewProjectionMatrixInverse': { value: new Matrix4() },
      'modelViewMatrixInverseTranspose': { value: new Matrix4() },
      'shrink': { value: shrink }
    })

    this.addAttributes({
      'position1': { type: 'v3', value: null },
      'position2': { type: 'v3', value: null },
      'color2': { type: 'c', value: null },
      'radius': { type: 'f', value: null },
      'radius2': { type: 'f', value: null }
    })

    this.setAttributes(d)

    this.makeMapping()
  }

  get parameters () {
    return Object.assign({

      shrink: { uniform: true }

    }, super.parameters)
  }

  get isImpostor () { return true }
  get vertexShader () { return 'HyperballStickImpostor.vert' }
  get fragmentShader () { return 'HyperballStickImpostor.frag' }
}

export default HyperballStickImpostorBuffer
