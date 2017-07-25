/**
 * @file Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Matrix4, Matrix3 } from '../../lib/three.es6.js'

import { getUintArray } from '../utils.js'
import { serialBlockArray } from '../math/array-utils.js'
import { applyMatrix3toVector3array, applyMatrix4toVector3array } from '../math/vector-utils.js'
import MeshBuffer from './mesh-buffer.js'

const matrix = new Matrix4()
const normalMatrix = new Matrix3()

/**
 * Geometry buffer. Base class for geometry-based buffers. Used to draw
 * geometry primitives given a mesh.
 * @interface
 */
class GeometryBuffer extends MeshBuffer {
  /**
   * @param {Object} data - buffer data
   * @param {Float32Array} data.position - positions
   * @param {Float32Array} data.color - colors
   * @param {Float32Array} data.radius - radii
   * @param {Picker} [data.picking] - picking ids
   * @param {BufferParameters} [params] - parameters object
   * @param {BufferGeometry} geo - geometry object
   */
  constructor (data, params, geo) {
    const d = data || {}
    const p = params || {}

    const geoPosition = geo.attributes.position.array
    const geoNormal = geo.attributes.normal.array
    const geoIndex = geo.index ? geo.index.array : undefined

    const n = d.position.length / 3
    const m = geoPosition.length / 3

    const size = n * m

    const meshPosition = new Float32Array(size * 3)
    const meshNormal = new Float32Array(size * 3)
    const meshColor = new Float32Array(size * 3)

    let meshIndex
    if (geoIndex) {
      meshIndex = getUintArray(n * geoIndex.length, size)
    }

    super({
      position: meshPosition,
      color: meshColor,
      index: meshIndex,
      normal: meshNormal,
      primitiveId: d.primitiveId || serialBlockArray(n, m),
      picking: d.picking
    }, p)

    this.setAttributes(d)

    this.geoPosition = geoPosition
    this.geoNormal = geoNormal
    this.geoIndex = geoIndex

    this.positionCount = n
    this.geoPositionCount = m

    this.transformedGeoPosition = new Float32Array(m * 3)
    this.transformedGeoNormal = new Float32Array(m * 3)

    this.meshPosition = meshPosition
    this.meshColor = meshColor
    this.meshIndex = meshIndex
    this.meshNormal = meshNormal

    this.meshIndex = meshIndex
    this.makeIndex()
  }

  applyPositionTransform () {}

  setAttributes (data, initNormals) {
    const attributes = this.geometry.attributes

    let position, color
    let geoPosition, geoNormal
    let transformedGeoPosition, transformedGeoNormal
    let meshPosition, meshColor, meshNormal

    const updateNormals = this.updateNormals

    if (data.position) {
      position = data.position
      geoPosition = this.geoPosition
      meshPosition = this.meshPosition
      transformedGeoPosition = this.transformedGeoPosition
      attributes.position.needsUpdate = true
      if (updateNormals || initNormals) {
        geoNormal = this.geoNormal
        meshNormal = this.meshNormal
        transformedGeoNormal = this.transformedGeoNormal
        attributes.normal.needsUpdate = true
      }
    }

    if (data.color) {
      color = data.color
      meshColor = this.meshColor
      attributes.color.needsUpdate = true
    }

    const n = this.positionCount
    const m = this.geoPositionCount

    for (let i = 0; i < n; ++i) {
      let j, l
      const k = i * m * 3
      const i3 = i * 3

      if (position) {
        transformedGeoPosition.set(geoPosition)
        matrix.makeTranslation(
          position[ i3 ], position[ i3 + 1 ], position[ i3 + 2 ]
        )
        this.applyPositionTransform(matrix, i, i3)
        applyMatrix4toVector3array(matrix.elements, transformedGeoPosition)

        meshPosition.set(transformedGeoPosition, k)

        if (updateNormals) {
          transformedGeoNormal.set(geoNormal)
          normalMatrix.getNormalMatrix(matrix)
          applyMatrix3toVector3array(normalMatrix.elements, transformedGeoNormal)

          meshNormal.set(transformedGeoNormal, k)
        } else if (initNormals) {
          meshNormal.set(geoNormal, k)
        }
      }

      if (color) {
        for (j = 0; j < m; ++j) {
          l = k + 3 * j

          meshColor[ l ] = color[ i3 ]
          meshColor[ l + 1 ] = color[ i3 + 1 ]
          meshColor[ l + 2 ] = color[ i3 + 2 ]
        }
      }
    }
  }

  makeIndex () {
    const geoIndex = this.geoIndex
    const meshIndex = this.meshIndex

    if (!geoIndex) return

    const n = this.positionCount
    const m = this.geoPositionCount
    const o = geoIndex.length / 3

    const o3 = o * 3

    for (let i = 0; i < n; ++i) {
      const j = i * o3
      const q = j + o3

      meshIndex.set(geoIndex, j)
      for (let p = j; p < q; ++p) meshIndex[ p ] += i * m
    }
  }

  get updateNormals () { return false }
}

export default GeometryBuffer
