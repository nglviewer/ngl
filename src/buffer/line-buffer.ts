/**
 * @file Line Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import '../shader/Line.vert'
import '../shader/Line.frag'

import Buffer, { BufferParameters, BufferData } from './buffer'

function getSize(data: LineBufferData){
  const size = data.position1.length / 3
  const attrSize = size * 4
  return attrSize * 3
}

export interface LineBufferData extends BufferData {
  position1: Float32Array
  position2: Float32Array
  color2: Float32Array
}

/**
 * Line buffer. Draws lines with a fixed width in pixels.
 *
 * @example
 * var lineBuffer = new LineBuffer({
 *   position1: new Float32Array([ 0, 0, 0 ]),
 *   position2: new Float32Array([ 1, 1, 1 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   color2: new Float32Array([ 0, 1, 0 ])
 * });
 */
class LineBuffer extends Buffer {
  isLine = true
  vertexShader = 'Line.vert'
  fragmentShader = 'Line.frag'

  /**
   * @param  {Object} data - attribute object
   * @param  {Float32Array} data.position1 - from positions
   * @param  {Float32Array} data.position2 - to positions
   * @param  {Float32Array} data.color - from colors
   * @param  {Float32Array} data.color2 - to colors
   * @param  {BufferParameters} params - parameter object
   */
  constructor (data: LineBufferData, params: Partial<BufferParameters> = {}) {
    super({
      position: new Float32Array(getSize(data)),
      color: new Float32Array(getSize(data))
    }, params)

    this.setAttributes(data)
  }

  setAttributes (data: Partial<LineBufferData> = {}) {
    let position1, position2, color, color2
    let aPosition, aColor

    const attributes = this.geometry.attributes as any  // TODO

    if (data.position1 && data.position2) {
      position1 = data.position1
      position2 = data.position2
      aPosition = attributes.position.array
      attributes.position.needsUpdate = true
    }

    if (data.color && data.color2) {
      color = data.color
      color2 = data.color2
      aColor = attributes.color.array
      attributes.color.needsUpdate = true
    }

    const n = this.size

    let i, j
    let x, y, z, x1, y1, z1, x2, y2, z2

    for (let v = 0; v < n; v++) {
      j = v * 3
      i = v * 4 * 3

      if (position1 && position2) {
        x1 = position1[ j ]
        y1 = position1[ j + 1 ]
        z1 = position1[ j + 2 ]

        x2 = position2[ j ]
        y2 = position2[ j + 1 ]
        z2 = position2[ j + 2 ]

        x = (x1 + x2) / 2.0
        y = (y1 + y2) / 2.0
        z = (z1 + z2) / 2.0

        aPosition[ i ] = x1
        aPosition[ i + 1 ] = y1
        aPosition[ i + 2 ] = z1
        aPosition[ i + 3 ] = x
        aPosition[ i + 4 ] = y
        aPosition[ i + 5 ] = z

        aPosition[ i + 6 ] = x
        aPosition[ i + 7 ] = y
        aPosition[ i + 8 ] = z
        aPosition[ i + 9 ] = x2
        aPosition[ i + 10 ] = y2
        aPosition[ i + 11 ] = z2
      }

      if (color && color2) {
        aColor[ i ] = aColor[ i + 3 ] = color[ j ]
        aColor[ i + 1 ] = aColor[ i + 4 ] = color[ j + 1 ]
        aColor[ i + 2 ] = aColor[ i + 5 ] = color[ j + 2 ]

        aColor[ i + 6 ] = aColor[ i + 9 ] = color2[ j ]
        aColor[ i + 7 ] = aColor[ i + 10 ] = color2[ j + 1 ]
        aColor[ i + 8 ] = aColor[ i + 11 ] = color2[ j + 2 ]
      }
    }
  }
}

export default LineBuffer
