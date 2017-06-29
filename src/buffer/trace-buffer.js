/**
 * @file Trace Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import '../shader/Line.vert'
import '../shader/Line.frag'

import { Log } from '../globals.js'
import Buffer from './buffer.js'

/**
 * Trace buffer. Draws a series of lines.
 */
class TraceBuffer extends Buffer {
    /**
     * @param  {Object} data - attribute object
     * @param  {Float32Array} data.position - positions
     * @param  {Float32Array} data.color - colors
     * @param  {BufferParameters} params - parameter object
     */
  constructor (data, params) {
    var d = data || {}
    var p = params || {}

    var n = d.position.length / 3
    var n1 = n - 1

    var linePosition = new Float32Array(n1 * 3 * 2)
    var lineColor = new Float32Array(n1 * 3 * 2)

    super({
      position: linePosition,
      color: lineColor
    }, p)

    this.setAttributes(data)
  }

  setAttributes (data) {
    var position, color
    var linePosition, lineColor

    var attributes = this.geometry.attributes

    if (data.position) {
      position = data.position
      linePosition = attributes.position.array
      attributes.position.needsUpdate = true
    }

    if (data.color) {
      color = data.color
      lineColor = attributes.color.array
      attributes.color.needsUpdate = true
    }

    if (!position && !color) {
      Log.warn('TraceBuffer.prototype.setAttributes no data')
      return
    }

    var v, v2
    var n = this.size
    var n1 = n - 1

    for (var i = 0; i < n1; ++i) {
      v = 3 * i
      v2 = 3 * i * 2

      if (position) {
        linePosition[ v2 ] = position[ v ]
        linePosition[ v2 + 1 ] = position[ v + 1 ]
        linePosition[ v2 + 2 ] = position[ v + 2 ]

        linePosition[ v2 + 3 ] = position[ v + 3 ]
        linePosition[ v2 + 4 ] = position[ v + 4 ]
        linePosition[ v2 + 5 ] = position[ v + 5 ]
      }

      if (color) {
        lineColor[ v2 ] = color[ v ]
        lineColor[ v2 + 1 ] = color[ v + 1 ]
        lineColor[ v2 + 2 ] = color[ v + 2 ]

        lineColor[ v2 + 3 ] = color[ v + 3 ]
        lineColor[ v2 + 4 ] = color[ v + 4 ]
        lineColor[ v2 + 5 ] = color[ v + 5 ]
      }
    }
  }

  get isLine () { return true }
  get vertexShader () { return 'Line.vert' }
  get fragmentShader () { return 'Line.frag' }
}

export default TraceBuffer
