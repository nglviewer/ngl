/**
 * @file Tube Mesh Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3 } from '../../lib/three.es6.js'

import { defaults, getUintArray } from '../utils.js'
import { serialArray } from '../math/array-utils.js'
import MeshBuffer from './mesh-buffer.js'

var vTangent = new Vector3()
var vMeshNormal = new Vector3()

/**
 * Tube mesh buffer. Draws a tube.
 */
class TubeMeshBuffer extends MeshBuffer {
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
  constructor (data, params) {
    var d = data || {}
    var p = params || {}

    var radialSegments = defaults(p.radialSegments, 4)
    var capped = defaults(p.capped, false)

    var capVertices = capped ? radialSegments : 0
    var capTriangles = capped ? radialSegments - 2 : 0

    var n = d.position.length / 3
    var n1 = n - 1
    var x = n * radialSegments * 3 + 2 * capVertices * 3
    var xi = n1 * 2 * radialSegments * 3 + 2 * capTriangles * 3

    var meshPosition = new Float32Array(x)
    var meshColor = new Float32Array(x)
    var meshNormal = new Float32Array(x)
    var meshIndex = getUintArray(xi, x / 3)

    super({
      position: meshPosition,
      color: meshColor,
      index: meshIndex,
      normal: meshNormal,
      picking: d.picking
    }, p)

        //

    this.aspectRatio = defaults(p.aspectRatio, 1.0)
    this.radialSegments = radialSegments
    this.capped = capped

    this.capVertices = capVertices
    this.capTriangles = capTriangles
    this.size2 = n

    d.primitiveId = serialArray(n)
    this.setAttributes(d)

    this.meshIndex = meshIndex
    this.makeIndex()
  }

  setAttributes (data) {
    var aspectRatio = this.aspectRatio

    var n = this.size2
    var n1 = n - 1
    var radialSegments = this.radialSegments

    var attributes = this.geometry.attributes

    var position, normal, binormal, tangent, color, size, primitiveId
    var meshPosition, meshColor, meshNormal, meshPrimitiveId

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

    var i, j, k, l, s, t
    var v, cx, cy
    var cx1, cy1, cx2, cy2
    var radius

    var normX, normY, normZ
    var biX, biY, biZ
    var posX, posY, posZ

    var cxArr = []
    var cyArr = []
    var cx1Arr = []
    var cy1Arr = []
    var cx2Arr = []
    var cy2Arr = []

    if (position) {
      for (j = 0; j < radialSegments; ++j) {
        v = (j / radialSegments) * 2 * Math.PI

        cxArr[ j ] = aspectRatio * Math.cos(v)
        cyArr[ j ] = Math.sin(v)

        cx1Arr[ j ] = aspectRatio * Math.cos(v - 0.01)
        cy1Arr[ j ] = Math.sin(v - 0.01)
        cx2Arr[ j ] = aspectRatio * Math.cos(v + 0.01)
        cy2Arr[ j ] = Math.sin(v + 0.01)
      }
    }

    for (i = 0; i < n; ++i) {
      k = i * 3
      l = k * radialSegments

      if (position) {
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

      for (j = 0; j < radialSegments; ++j) {
        s = l + j * 3

        if (position) {
          cx = -radius * cxArr[ j ] // TODO: Hack: Negating it so it faces outside.
          cy = radius * cyArr[ j ]

          cx1 = -radius * cx1Arr[ j ]
          cy1 = radius * cy1Arr[ j ]
          cx2 = -radius * cx2Arr[ j ]
          cy2 = radius * cy2Arr[ j ]

          meshPosition[ s ] = posX + cx * normX + cy * biX
          meshPosition[ s + 1 ] = posY + cx * normY + cy * biY
          meshPosition[ s + 2 ] = posZ + cx * normZ + cy * biZ

                    // TODO half of these are symmetric
          vMeshNormal.set(
                        // ellipse tangent approximated as vector from/to adjacent points
                        (cx2 * normX + cy2 * biX) -
                            (cx1 * normX + cy1 * biX),
                        (cx2 * normY + cy2 * biY) -
                            (cx1 * normY + cy1 * biY),
                        (cx2 * normZ + cy2 * biZ) -
                            (cx1 * normZ + cy1 * biZ)
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

    for (j = 0; j < radialSegments; ++j) {
      s = k + j * 3
      t = l + j * 3

      if (position) {
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

    for (j = 0; j < radialSegments; ++j) {
      s = k + j * 3
      t = l + j * 3

      if (position) {
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
    var meshIndex = this.meshIndex

    var n = this.size2
    var n1 = n - 1
    var capTriangles = this.capTriangles
    var radialSegments = this.radialSegments
    var radialSegments1 = this.radialSegments + 1

    var i, k, irs, irs1, l, j

    for (i = 0; i < n1; ++i) {
      k = i * radialSegments * 3 * 2

      irs = i * radialSegments
      irs1 = (i + 1) * radialSegments

      for (j = 0; j < radialSegments; ++j) {
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

    var strip = [ 0 ]

    for (j = 1; j < radialSegments1 / 2; ++j) {
      strip.push(j)
      if (radialSegments - j !== j) {
        strip.push(radialSegments - j)
      }
    }

        // front cap

    l = n1 * radialSegments * 3 * 2
    k = n * radialSegments

    for (j = 0; j < strip.length - 2; ++j) {
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

    for (j = 0; j < strip.length - 2; ++j) {
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
