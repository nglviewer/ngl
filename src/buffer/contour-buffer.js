/**
 * @file Contour Buffer
 * @author Fred ludlow <fred.ludlow@gmail.com>
 * @private
 */

import '../shader/Line.vert'
import '../shader/Line.frag'

import Buffer from './buffer.js'

/**
 * Contour buffer. A buffer that draws lines (instead of triangle meshes).
 */
class ContourBuffer extends Buffer {
  get isLine () { return true }
  get vertexShader () { return 'Line.vert' }
  get fragmentShader () { return 'Line.frag' }
}

export default ContourBuffer
