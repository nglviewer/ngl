/**
 * @file Vector Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Color } from '../../lib/three.es6.js'

import '../shader/Line.vert'
import '../shader/Line.frag'

import { defaults } from '../utils.js'
import { uniformArray3 } from '../math/array-utils.js'
import Buffer from './buffer.js'

/**
 * Vector buffer. Draws vectors as lines.
 */
class VectorBuffer extends Buffer {
    /**
     * @param  {Object} data - attribute object
     * @param  {Float32Array} data.position - positions
     * @param  {Float32Array} data.vector - vectors
     * @param  {BufferParameters} params - parameter object
     */
  constructor (data, params) {
    var p = params || {}

    var n = data.position.length / 3
    var n2 = n * 2

    var color = new Color(defaults(p.color, 'grey'))

    var linePosition = new Float32Array(n2 * 3)
    var lineColor = uniformArray3(n2, color.r, color.g, color.b)

    super({
      position: linePosition,
      color: lineColor
    }, p)

    this.scale = defaults(p.scale, 1)

    this.setAttributes(data)
  }

  setAttributes (data) {
    var attributes = this.geometry.attributes

    var position, vector
    var aPosition

    if (data.position && data.vector) {
      position = data.position
      vector = data.vector
      aPosition = attributes.position.array
      attributes.position.needsUpdate = true
    }

    var n = this.size / 2
    var scale = this.scale

    var i, j

    if (data.position && data.vector) {
      for (var v = 0; v < n; v++) {
        i = v * 2 * 3
        j = v * 3

        aPosition[ i + 0 ] = position[ j + 0 ]
        aPosition[ i + 1 ] = position[ j + 1 ]
        aPosition[ i + 2 ] = position[ j + 2 ]
        aPosition[ i + 3 ] = position[ j + 0 ] + vector[ j + 0 ] * scale
        aPosition[ i + 4 ] = position[ j + 1 ] + vector[ j + 1 ] * scale
        aPosition[ i + 5 ] = position[ j + 2 ] + vector[ j + 2 ] * scale
      }
    }
  }

  get isLine () { return true }
  get vertexShader () { return 'Line.vert' }
  get fragmentShader () { return 'Line.frag' }
}

export default VectorBuffer
