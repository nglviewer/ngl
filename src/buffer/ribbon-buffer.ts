/**
 * @file Ribbon Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import '../shader/Ribbon.vert'

import { getUintArray } from '../utils'
import { serialArray } from '../math/array-utils'
import MeshBuffer from './mesh-buffer'
import { BufferParameters, BufferData } from './buffer'
import {Log} from "../globals";

const quadIndices = new Uint16Array([
  0, 1, 2,
  1, 3, 2
])

export interface RibbonBufferData extends BufferData {
  normal: Float32Array
  dir: Float32Array
  size: Float32Array
}

function getSize(data: RibbonBufferData){
  const n = (data.position!.length / 3) - 1
  const n4 = n * 4
  const x = n4 * 3
  return x
}

/**
 * Ribbon buffer. Draws a thin ribbon.
 */
class RibbonBuffer extends MeshBuffer {
  vertexShader = 'Ribbon.vert'

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
  constructor (data: RibbonBufferData, params: Partial<BufferParameters> = {}) {
    super({
      position: new Float32Array(getSize(data)),
      color: new Float32Array(getSize(data)),
      index: getUintArray(getSize(data), getSize(data) / 3),
      normal: new Float32Array(getSize(data)),
      picking: data.picking
    }, params)

    const n = (data.position!.length / 3) - 1
    const n4 = n * 4
    const x = n4 * 3

    this.addAttributes({
      'dir': { type: 'v3', value: new Float32Array(x) }
    })
    this.addAttributes({
      'size': { type: 'f', value: new Float32Array(n4) }
    })

    data.primitiveId = serialArray(n)
    this.setAttributes(data)

    this.makeIndex()
  }

  setAttributes (data: Partial<RibbonBufferData> = {}) {
    const n4 = this.size
    const n = n4 / 4

    const attributes = this.geometry.attributes as any  // TODO

    let position, normal, size, dir, color, primitiveId
    let aPosition, aNormal, aSize, aDir, aColor, aPrimitiveId

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

    let v, i, k, p, l, v3
    let currSize
    let prevSize = size ? size[ 0 ] : null

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
    const index = this.geometry.getIndex()
    if (!index) { Log.error('Index is null'); return; }
    const meshIndex = index.array as Uint32Array|Uint16Array
    const n = meshIndex.length / 4 / 3

    for (let v = 0; v < n; ++v) {
      const ix = v * 6
      const it = v * 4

      meshIndex.set(quadIndices, ix)
      for (let s = 0; s < 6; ++s) {
        meshIndex[ ix + s ] += it
      }
    }
  }
}

export default RibbonBuffer
