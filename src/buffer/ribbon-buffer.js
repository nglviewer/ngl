/**
 * @file Ribbon Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import '../shader/Ribbon.vert'

import { getUintArray } from '../utils.js'
import { serialArray } from '../math/array-utils.js'
import MeshBuffer from './mesh-buffer.js'

const quadIndices = new Uint16Array([
  0, 1, 2,
  1, 3, 2
])

/**
 * Ribbon buffer. Draws a thin ribbon.
 */
class RibbonBuffer extends MeshBuffer {
    /**
     * @param  {Object} data - attribute object
     * @param  {Float32Array} data.position - positions
     * @param  {Float32Array} data.normal - normals
     * @param  {Float32Array} data.dir - binormals
     * @param  {Float32Array} data.color - colors
     * @param  {Float32Array} data.size - sizes
     * @param  {Picker} data.picking - picking ids
     * @param  {BufferParameters} params - parameter object
     */
  constructor (data, params) {
    var d = data || {}

    var n = (d.position.length / 3) - 1
    var n4 = n * 4
    var x = n4 * 3

    var meshPosition = new Float32Array(x)
    var meshColor = new Float32Array(x)
    var meshNormal = new Float32Array(x)
    var meshIndex = getUintArray(x, x / 3)

    super({
      position: meshPosition,
      color: meshColor,
      index: meshIndex,
      normal: meshNormal,
      picking: d.picking
    }, params)

    this.addAttributes({
      'dir': { type: 'v3', value: new Float32Array(x) }
    })
    this.addAttributes({
      'size': { type: 'f', value: new Float32Array(n4) }
    })

    d.primitiveId = serialArray(n)
    this.setAttributes(d)

    this.meshIndex = meshIndex
    this.makeIndex()
  }

  setAttributes (data) {
    var n4 = this.size
    var n = n4 / 4

    var attributes = this.geometry.attributes

    var position, normal, size, dir, color, primitiveId
    var aPosition, aNormal, aSize, aDir, aColor, aPrimitiveId

    if (data.position) {
      position = data.position
      aPosition = attributes.position.array
      attributes.position.needsUpdate = true
    }

    if (data.normal) {
      normal = data.normal
      aNormal = attributes.normal.array
      attributes.normal.needsUpdate = true
    }

    if (data.size) {
      size = data.size
      aSize = attributes.size.array
      attributes.size.needsUpdate = true
    }

    if (data.dir) {
      dir = data.dir
      aDir = attributes.dir.array
      attributes.dir.needsUpdate = true
    }

    if (data.color) {
      color = data.color
      aColor = attributes.color.array
      attributes.color.needsUpdate = true
    }

    if (data.primitiveId) {
      primitiveId = data.primitiveId
      aPrimitiveId = attributes.primitiveId.array
      attributes.primitiveId.needsUpdate = true
    }

    var v, i, k, p, l, v3
    var currSize
    var prevSize = size ? size[ 0 ] : null

    for (v = 0; v < n; ++v) {
      v3 = v * 3
      k = v * 3 * 4
      l = v * 4

      if (position) {
        aPosition[ k ] = aPosition[ k + 3 ] = position[ v3 ]
        aPosition[ k + 1 ] = aPosition[ k + 4 ] = position[ v3 + 1 ]
        aPosition[ k + 2 ] = aPosition[ k + 5 ] = position[ v3 + 2 ]

        aPosition[ k + 6 ] = aPosition[ k + 9 ] = position[ v3 + 3 ]
        aPosition[ k + 7 ] = aPosition[ k + 10 ] = position[ v3 + 4 ]
        aPosition[ k + 8 ] = aPosition[ k + 11 ] = position[ v3 + 5 ]
      }

      if (normal) {
        aNormal[ k ] = aNormal[ k + 3 ] = -normal[ v3 ]
        aNormal[ k + 1 ] = aNormal[ k + 4 ] = -normal[ v3 + 1 ]
        aNormal[ k + 2 ] = aNormal[ k + 5 ] = -normal[ v3 + 2 ]

        aNormal[ k + 6 ] = aNormal[ k + 9 ] = -normal[ v3 + 3 ]
        aNormal[ k + 7 ] = aNormal[ k + 10 ] = -normal[ v3 + 4 ]
        aNormal[ k + 8 ] = aNormal[ k + 11 ] = -normal[ v3 + 5 ]
      }

      for (i = 0; i < 4; ++i) {
        p = k + 3 * i

        if (color) {
          aColor[ p ] = color[ v3 ]
          aColor[ p + 1 ] = color[ v3 + 1 ]
          aColor[ p + 2 ] = color[ v3 + 2 ]
        }

        if (primitiveId) {
          aPrimitiveId[ l + i ] = primitiveId[ v ]
        }
      }

      if (size) {
        currSize = size[ v ]

        if (prevSize !== size[ v ]) {
          aSize[ l ] = prevSize
          aSize[ l + 1 ] = prevSize
          aSize[ l + 2 ] = currSize
          aSize[ l + 3 ] = currSize
        } else {
          aSize[ l ] = currSize
          aSize[ l + 1 ] = currSize
          aSize[ l + 2 ] = currSize
          aSize[ l + 3 ] = currSize
        }

        prevSize = currSize
      }

      if (dir) {
        aDir[ k ] = dir[ v3 ]
        aDir[ k + 1 ] = dir[ v3 + 1 ]
        aDir[ k + 2 ] = dir[ v3 + 2 ]

        aDir[ k + 3 ] = -dir[ v3 ]
        aDir[ k + 4 ] = -dir[ v3 + 1 ]
        aDir[ k + 5 ] = -dir[ v3 + 2 ]

        aDir[ k + 6 ] = dir[ v3 + 3 ]
        aDir[ k + 7 ] = dir[ v3 + 4 ]
        aDir[ k + 8 ] = dir[ v3 + 5 ]

        aDir[ k + 9 ] = -dir[ v3 + 3 ]
        aDir[ k + 10 ] = -dir[ v3 + 4 ]
        aDir[ k + 11 ] = -dir[ v3 + 5 ]
      }
    }
  }

  makeIndex () {
    var meshIndex = this.meshIndex
    var n = meshIndex.length / 4 / 3

    var s, v, ix, it

    for (v = 0; v < n; ++v) {
      ix = v * 6
      it = v * 4

      meshIndex.set(quadIndices, ix)
      for (s = 0; s < 6; ++s) {
        meshIndex[ ix + s ] += it
      }
    }
  }

  get vertexShader () { return 'Ribbon.vert' }
}

export default RibbonBuffer
