/**
 * @file Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

// @ts-ignore: unused import Vector3 required for declaration only
 import {  Vector3, Matrix4, Matrix3, BufferGeometry } from 'three'

import { getUintArray } from '../utils'
import { serialBlockArray } from '../math/array-utils'
import { applyMatrix3toVector3array, applyMatrix4toVector3array } from '../math/vector-utils'
import MeshBuffer from './mesh-buffer'
import { BufferParameters, BufferData } from './buffer'
import {Log} from "../globals";

const matrix = new Matrix4()
const normalMatrix = new Matrix3()

function getData(data: BufferData, geo: BufferGeometry){
  const geoPosition = (geo.attributes as any).position.array
  const geoIndex = geo.index ? geo.index.array : undefined

  const n = data.position!.length / 3
  const m = geoPosition.length / 3

  const size = n * m

  const meshPosition = new Float32Array(size * 3)
  const meshNormal = new Float32Array(size * 3)
  const meshColor = new Float32Array(size * 3)

  let meshIndex
  if (geoIndex) {
    meshIndex = getUintArray(n * geoIndex.length, size)
  }

  return {
    position: meshPosition,
    color: meshColor,
    index: meshIndex,
    normal: meshNormal,
    primitiveId: data.primitiveId || serialBlockArray(n, m) as Float32Array,
    picking: data.picking
  }
}

/**
 * Geometry buffer. Base class for geometry-based buffers. Used to draw
 * geometry primitives given a mesh.
 * @interface
 */
abstract class GeometryBuffer extends MeshBuffer {
  updateNormals = false

  geoPosition: Float32Array
  geoNormal: Float32Array
  geoIndex?: Uint32Array|Uint16Array

  positionCount: number
  geoPositionCount: number

  transformedGeoPosition: Float32Array
  transformedGeoNormal: Float32Array

  meshPosition: Float32Array
  meshColor: Float32Array
  meshIndex: Uint32Array|Uint16Array
  meshNormal: Float32Array

  /**
   * @param {Object} data - buffer data
   * @param {Float32Array} data.position - positions
   * @param {Float32Array} data.color - colors
   * @param {Float32Array} data.radius - radii
   * @param {Picker} [data.picking] - picking ids
   * @param {BufferParameters} [params] - parameters object
   * @param {BufferGeometry} geo - geometry object
   */
  constructor (data: BufferData, params: Partial<BufferParameters> = {}, geo: BufferGeometry) {
    super(getData(data, geo), params)

    const geoPosition = (geo.attributes as any).position.array
    const geoNormal = (geo.attributes as any).normal.array
    const geoIndex = geo.index ? (geo.index.array as Uint32Array|Uint16Array) : undefined

    this.geoPosition = geoPosition
    this.geoNormal = geoNormal
    this.geoIndex = geoIndex

    this.positionCount = data.position!.length / 3
    this.geoPositionCount = geoPosition.length / 3

    this.transformedGeoPosition = new Float32Array(this.geoPositionCount * 3)
    this.transformedGeoNormal = new Float32Array(this.geoPositionCount * 3)

    const attributes = this.geometry.attributes as any  // TODO
    this.meshPosition = attributes.position.array
    this.meshColor = attributes.color.array
    this.meshNormal = attributes.normal.array

    this.setAttributes(data)

    if (geoIndex) {
      const index = this.geometry.getIndex()
      if (!index) { Log.error('Index is null'); return; }
      this.meshIndex = index.array as Uint32Array|Uint16Array
      this.makeIndex()
    }
  }

  abstract applyPositionTransform (matrix: Matrix4, i: number, i3?: number): void

  setAttributes (data: Partial<BufferData> = {}, initNormals = false) {
    const attributes = this.geometry.attributes as any  // TODO

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

      if (position && transformedGeoPosition && meshPosition && meshNormal && geoPosition && geoNormal) {
        transformedGeoPosition.set(geoPosition)
        matrix.makeTranslation(
          position[ i3 ], position[ i3 + 1 ], position[ i3 + 2 ]
        )
        this.applyPositionTransform(matrix, i, i3)
        applyMatrix4toVector3array(matrix.elements as unknown as Float32Array,
                                   transformedGeoPosition)

        meshPosition.set(transformedGeoPosition, k)

        if (updateNormals && transformedGeoNormal) {
          transformedGeoNormal.set(geoNormal)
          normalMatrix.getNormalMatrix(matrix)
          applyMatrix3toVector3array(normalMatrix.elements as unknown as Float32Array,
                                     transformedGeoNormal)

          meshNormal.set(transformedGeoNormal, k)
        } else if (initNormals) {
          meshNormal.set(geoNormal, k)
        }
      }

      if (color && meshColor) {
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
}

export default GeometryBuffer
