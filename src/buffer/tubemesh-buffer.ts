/**
 * @file Tube Mesh Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

// @ts-ignore: unused import Matrix4 required for declaration only
import { Vector3, Matrix4 } from 'three'

import { defaults, getUintArray } from '../utils'
import { serialArray } from '../math/array-utils'
import MeshBuffer from './mesh-buffer'
import { BufferDefaultParameters, BufferData } from './buffer'
import {Log} from "../globals";

const vTangent = new Vector3()
const vMeshNormal = new Vector3()

export interface TubeMeshBufferData extends BufferData {
  binormal: Float32Array
  tangent: Float32Array
  size: Float32Array
}

export const TubeMeshBufferDefaultParameters = Object.assign({
  radialSegments: 4,
  capped: false,
  aspectRatio: 1.0
}, BufferDefaultParameters)
export type TubeMeshBufferParameters = typeof TubeMeshBufferDefaultParameters

function getData (data: TubeMeshBufferData, params: Partial<TubeMeshBufferParameters> = {}) {
  const radialSegments = defaults(params.radialSegments, 4)
  const capped = defaults(params.capped, false)

  const capVertices = capped ? radialSegments : 0
  const capTriangles = capped ? radialSegments - 2 : 0

  const n = data.position!.length / 3
  const n1 = n - 1
  const x = n * radialSegments * 3 + 2 * capVertices * 3
  const xi = n1 * 2 * radialSegments * 3 + 2 * capTriangles * 3

  return {
    position: new Float32Array(x),
    color: new Float32Array(x),
    index: getUintArray(xi, x / 3),
    normal: new Float32Array(x),
    picking: data.picking
  }
}

/**
 * Tube mesh buffer. Draws a tube.
 */
class TubeMeshBuffer extends MeshBuffer {
  get defaultParameters() { return TubeMeshBufferDefaultParameters }
  parameters: TubeMeshBufferParameters

  capVertices: number
  capTriangles: number
  size2: number

  /**
   * @param  {Object} data - attribute object
   * @param  {Float32Array} data.position - positions
   * @param  {Float32Array} data.normal - normals
   * @param  {Float32Array} data.binormal - binormals
   * @param  {Float32Array} data.tangent - tangents
   * @param  {Float32Array} data.color - colors
   * @param  {Float32Array} data.size - sizes
   * @param  {Picker} data.picking - picking ids
   * @param  {BufferParameters} params - parameter object
   */
  constructor (data: TubeMeshBufferData, params: Partial<TubeMeshBufferParameters> = {}) {
    super(getData(data, params), params)

    this.capVertices = this.parameters.capped ? this.parameters.radialSegments : 0
    this.capTriangles = this.parameters.capped ? this.parameters.radialSegments - 2 : 0

    this.size2 = data.position!.length / 3
    data.primitiveId = serialArray(this.size2)

    this.setAttributes(data)
    this.makeIndex()
  }

  setAttributes (data: Partial<TubeMeshBufferData> = {}) {
    const aspectRatio = this.parameters.aspectRatio

    const n = this.size2
    const n1 = n - 1
    const radialSegments = this.parameters.radialSegments

    const attributes = this.geometry.attributes as any

    let position, normal, binormal, tangent, color, size, primitiveId
    let meshPosition, meshColor, meshNormal, meshPrimitiveId

    if (data.position) {
      position = data.position
      normal = data.normal
      binormal = data.binormal
      tangent = data.tangent
      size = data.size

      meshPosition = attributes.position.array
      meshNormal = attributes.normal.array

      attributes.position.needsUpdate = true
      attributes.normal.needsUpdate = true
    }

    if (data.color) {
      color = data.color
      meshColor = attributes.color.array
      attributes.color.needsUpdate = true
    }

    if (data.primitiveId) {
      primitiveId = data.primitiveId
      meshPrimitiveId = attributes.primitiveId.array
      attributes.primitiveId.needsUpdate = true
    }

    let k, l
    let radius = 0

    let normX = 0
    let normY = 0
    let normZ = 0
    let biX = 0
    let biY = 0
    let biZ = 0
    let posX = 0
    let posY = 0
    let posZ = 0

    const cxArr = []
    const cyArr = []
    const cx1Arr = []
    const cy1Arr = []
    const cx2Arr = []
    const cy2Arr = []

    if (position) {
      for (let j = 0; j < radialSegments; ++j) {
        const v = (j / radialSegments) * 2 * Math.PI

        cxArr[ j ] = aspectRatio * Math.cos(v)
        cyArr[ j ] = Math.sin(v)

        cx1Arr[ j ] = aspectRatio * Math.cos(v - 0.01)
        cy1Arr[ j ] = Math.sin(v - 0.01)
        cx2Arr[ j ] = aspectRatio * Math.cos(v + 0.01)
        cy2Arr[ j ] = Math.sin(v + 0.01)
      }
    }

    for (let i = 0; i < n; ++i) {
      k = i * 3
      l = k * radialSegments

      if (position && tangent && normal && binormal && size) {
        vTangent.set(
          tangent[ k ], tangent[ k + 1 ], tangent[ k + 2 ]
        )

        normX = normal[ k ]
        normY = normal[ k + 1 ]
        normZ = normal[ k + 2 ]

        biX = binormal[ k ]
        biY = binormal[ k + 1 ]
        biZ = binormal[ k + 2 ]

        posX = position[ k ]
        posY = position[ k + 1 ]
        posZ = position[ k + 2 ]

        radius = size[ i ]
      }

      for (let j = 0; j < radialSegments; ++j) {
        const s = l + j * 3

        if (position) {
          const cx = -radius * cxArr[ j ] // TODO: Hack: Negating it so it faces outside.
          const cy = radius * cyArr[ j ]

          const cx1 = -radius * cx1Arr[ j ]
          const cy1 = radius * cy1Arr[ j ]
          const cx2 = -radius * cx2Arr[ j ]
          const cy2 = radius * cy2Arr[ j ]

          meshPosition[ s ] = posX + cx * normX + cy * biX
          meshPosition[ s + 1 ] = posY + cx * normY + cy * biY
          meshPosition[ s + 2 ] = posZ + cx * normZ + cy * biZ

                    // TODO half of these are symmetric
          vMeshNormal.set(
            // ellipse tangent approximated as vector from/to adjacent points
            (cx2 * normX + cy2 * biX) - (cx1 * normX + cy1 * biX),
            (cx2 * normY + cy2 * biY) - (cx1 * normY + cy1 * biY),
            (cx2 * normZ + cy2 * biZ) - (cx1 * normZ + cy1 * biZ)
          ).cross(vTangent)

          meshNormal[ s ] = vMeshNormal.x
          meshNormal[ s + 1 ] = vMeshNormal.y
          meshNormal[ s + 2 ] = vMeshNormal.z
        }

        if (color) {
          meshColor[ s ] = color[ k ]
          meshColor[ s + 1 ] = color[ k + 1 ]
          meshColor[ s + 2 ] = color[ k + 2 ]
        }

        if (primitiveId) {
          meshPrimitiveId[ i * radialSegments + j ] = primitiveId[ i ]
        }
      }
    }

        // front cap

    k = 0
    l = n * 3 * radialSegments

    for (let j = 0; j < radialSegments; ++j) {
      const s = k + j * 3
      const t = l + j * 3

      if (position && tangent) {
        meshPosition[ t ] = meshPosition[ s ]
        meshPosition[ t + 1 ] = meshPosition[ s + 1 ]
        meshPosition[ t + 2 ] = meshPosition[ s + 2 ]

        meshNormal[ t ] = tangent[ k ]
        meshNormal[ t + 1 ] = tangent[ k + 1 ]
        meshNormal[ t + 2 ] = tangent[ k + 2 ]
      }

      if (color) {
        meshColor[ t ] = meshColor[ s ]
        meshColor[ t + 1 ] = meshColor[ s + 1 ]
        meshColor[ t + 2 ] = meshColor[ s + 2 ]
      }

      if (primitiveId) {
        meshPrimitiveId[ n * radialSegments + j ] = meshPrimitiveId[ 0 + j ]
      }
    }

        // back cap

    k = (n - 1) * 3 * radialSegments
    l = (n + 1) * 3 * radialSegments

    for (let j = 0; j < radialSegments; ++j) {
      const s = k + j * 3
      const t = l + j * 3

      if (position && tangent) {
        meshPosition[ t ] = meshPosition[ s ]
        meshPosition[ t + 1 ] = meshPosition[ s + 1 ]
        meshPosition[ t + 2 ] = meshPosition[ s + 2 ]

        meshNormal[ t ] = tangent[ n1 * 3 ]
        meshNormal[ t + 1 ] = tangent[ n1 * 3 + 1 ]
        meshNormal[ t + 2 ] = tangent[ n1 * 3 + 2 ]
      }

      if (color) {
        meshColor[ t ] = meshColor[ s ]
        meshColor[ t + 1 ] = meshColor[ s + 1 ]
        meshColor[ t + 2 ] = meshColor[ s + 2 ]
      }

      if (primitiveId) {
        meshPrimitiveId[ (n + 1) * radialSegments + j ] = meshPrimitiveId[ (n - 1) * radialSegments + j ]
      }
    }
  }

  makeIndex () {
    const index = this.geometry.getIndex()
    if (!index) { Log.error('Index is null'); return; }
    const meshIndex = index.array as Uint32Array|Uint16Array

    const n = this.size2
    const n1 = n - 1
    const capTriangles = this.capTriangles
    const radialSegments = this.parameters.radialSegments
    const radialSegments1 = this.parameters.radialSegments + 1

    let k, l

    for (let i = 0; i < n1; ++i) {
      const k = i * radialSegments * 3 * 2

      const irs = i * radialSegments
      const irs1 = (i + 1) * radialSegments

      for (let j = 0; j < radialSegments; ++j) {
        l = k + j * 3 * 2

        // meshIndex[ l + 0 ] = irs + ( ( j + 0 ) % radialSegments );
        meshIndex[ l ] = irs + j
        meshIndex[ l + 1 ] = irs + ((j + 1) % radialSegments)
        // meshIndex[ l + 2 ] = irs1 + ( ( j + 0 ) % radialSegments );
        meshIndex[ l + 2 ] = irs1 + j

        // meshIndex[ l + 3 ] = irs1 + ( ( j + 0 ) % radialSegments );
        meshIndex[ l + 3 ] = irs1 + j
        meshIndex[ l + 4 ] = irs + ((j + 1) % radialSegments)
        meshIndex[ l + 5 ] = irs1 + ((j + 1) % radialSegments)
      }
    }

    // capping

    const strip = [ 0 ]

    for (let j = 1; j < radialSegments1 / 2; ++j) {
      strip.push(j)
      if (radialSegments - j !== j) {
        strip.push(radialSegments - j)
      }
    }

    // front cap

    l = n1 * radialSegments * 3 * 2
    k = n * radialSegments

    for (let j = 0; j < strip.length - 2; ++j) {
      if (j % 2 === 0) {
        meshIndex[ l + j * 3 + 0 ] = k + strip[ j + 0 ]
        meshIndex[ l + j * 3 + 1 ] = k + strip[ j + 1 ]
        meshIndex[ l + j * 3 + 2 ] = k + strip[ j + 2 ]
      } else {
        meshIndex[ l + j * 3 + 0 ] = k + strip[ j + 2 ]
        meshIndex[ l + j * 3 + 1 ] = k + strip[ j + 1 ]
        meshIndex[ l + j * 3 + 2 ] = k + strip[ j + 0 ]
      }
    }

    // back cap

    l = n1 * radialSegments * 3 * 2 + 3 * capTriangles
    k = n * radialSegments + radialSegments

    for (let j = 0; j < strip.length - 2; ++j) {
      if (j % 2 === 0) {
        meshIndex[ l + j * 3 + 0 ] = k + strip[ j + 0 ]
        meshIndex[ l + j * 3 + 1 ] = k + strip[ j + 1 ]
        meshIndex[ l + j * 3 + 2 ] = k + strip[ j + 2 ]
      } else {
        meshIndex[ l + j * 3 + 0 ] = k + strip[ j + 2 ]
        meshIndex[ l + j * 3 + 1 ] = k + strip[ j + 1 ]
        meshIndex[ l + j * 3 + 2 ] = k + strip[ j + 0 ]
      }
    }
  }
}

export default TubeMeshBuffer
