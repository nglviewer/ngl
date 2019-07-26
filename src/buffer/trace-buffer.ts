/**
 * @file Trace Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import '../shader/Line.vert'
import '../shader/Line.frag'

import { Log } from '../globals'
import Buffer, { BufferParameters, BufferData } from './buffer'

function getSize(data: BufferData){
  const n = data.position!.length / 3
  const n1 = n - 1
  return n1 * 3 * 2
}

/**
 * Trace buffer. Draws a series of lines.
 */
class TraceBuffer extends Buffer {
  isLine = true
  vertexShader = 'Line.vert'
  fragmentShader = 'Line.frag'

  /**
   * @param  {Object} data - attribute object
   * @param  {Float32Array} data.position - positions
   * @param  {Float32Array} data.color - colors
   * @param  {BufferParameters} params - parameter object
   */
  constructor (data: BufferData, params: Partial<BufferParameters> = {}) {
    super({
      position: new Float32Array(getSize(data)),
      color: new Float32Array(getSize(data))
    }, params)

    this.setAttributes(data)
  }

  setAttributes (data: Partial<BufferData>) {
    let position, color
    let linePosition, lineColor

    const attributes = this.geometry.attributes as any  // TODO

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

    let v, v2
    const n = this.size
    const n1 = n - 1

    for (let i = 0; i < n1; ++i) {
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
}

export default TraceBuffer
