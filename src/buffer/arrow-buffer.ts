/**
 * @file Arrow Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Matrix4, Vector3, Group } from 'three'

import { BufferRegistry } from '../globals'
import { createParams, defaults } from '../utils'
import { Picker } from '../utils/picker'
import Buffer from './buffer'
import CylinderBuffer, { CylinderBufferData } from './cylinder-buffer'
import CylinderGeometryBuffer from './cylindergeometry-buffer'
import ConeBuffer, { ConeBufferData } from './cone-buffer'
import GeometryGroup from '../viewer/geometry-group'
import { BufferData, BufferDefaultParameters } from './buffer'

export interface ArrowBufferData extends BufferData {
  position1: Float32Array
  position2: Float32Array
  radius: Float32Array
}

export const ArrowBufferDefaultParameters = Object.assign({
  aspectRatio: 1.5,
  radialSegments: 50,
  openEnded: false,
  disableImpostor: false
}, BufferDefaultParameters)
export type ArrowBufferParameters = typeof ArrowBufferDefaultParameters

/**
 * Arrow buffer. Draws arrows made from a cylinder and a cone.
 * @implements {Buffer}
 *
 * @example
 * var arrowBuffer = new ArrowBuffer({
 *   position1: new Float32Array([ 0, 0, 0 ]),
 *   position2: new Float32Array([ 10, 1, 1 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   radius: new Float32Array([ 1 ])
 * });
 */
class ArrowBuffer {
  parameters: ArrowBufferParameters
  get defaultParameters() { return ArrowBufferDefaultParameters }

  cylinderBuffer: CylinderGeometryBuffer
  coneBuffer: ConeBuffer

  splitPosition: Float32Array
  cylinderRadius: Float32Array

  geometry: GeometryGroup
  picking?: Picker

  group = new Group()
  wireframeGroup = new Group()
  pickingGroup = new Group()

  visible = true

  /**
   * @param {Object} data - buffer data
   * @param {Float32Array} data.position1 - from positions
   * @param {Float32Array} data.position2 - to positions
   * @param {Float32Array} data.color - colors
   * @param {Float32Array} data.radius - radii
   * @param {Picker} [data.picking] - picking ids
   * @param {BufferParameters} [params] - parameters object
   */
  constructor (data: ArrowBufferData, params: Partial<ArrowBufferParameters> = {}) {
    this.parameters = createParams(params, this.defaultParameters)

    this.splitPosition = new Float32Array(data.position1.length)
    this.cylinderRadius = new Float32Array(data.radius.length)

    const attr = this.makeAttributes(data)
    const bufferParams = {
      radialSegments: this.parameters.radialSegments,
      openEnded: this.parameters.openEnded,
      disableImpostor: this.parameters.disableImpostor
    }

    this.cylinderBuffer = new CylinderBuffer(
      attr.cylinder as CylinderBufferData, bufferParams
    ) as CylinderGeometryBuffer
    this.coneBuffer = new ConeBuffer(
      attr.cone as ConeBufferData, bufferParams
    )

    this.geometry = new GeometryGroup([
      this.cylinderBuffer.geometry,
      this.coneBuffer.geometry
    ])

    // requires Group objects to be present
    this.matrix = defaults(params.matrix, new Matrix4())

    this.picking = data.picking
  }

  set matrix (m) {
    Buffer.prototype.setMatrix.call(this, m)
  }
  get matrix () {
    return this.group.matrix.clone()
  }

  get pickable () {
    return !!this.picking
  }

  makeAttributes (data: Partial<ArrowBufferData> = {}) {
    const splitPosition = this.splitPosition
    const cylinderRadius = this.cylinderRadius

    const aspectRatio = this.parameters.aspectRatio

    let i, il
    const cylinder: Partial<CylinderBufferData> = {}
    const cone: Partial<ConeBufferData> = {}

    if (data.radius) {
      for (i = 0, il = cylinderRadius.length; i < il; ++i) {
        cylinderRadius[ i ] = data.radius[ i ] / aspectRatio
      }
      cylinder.radius = cylinderRadius
      cone.radius = data.radius
    }

    if (data.position1 && data.position2) {
      const vFrom = new Vector3()
      const vTo = new Vector3()
      const vDir = new Vector3()
      const vSplit = new Vector3()
      for (i = 0, il = splitPosition.length; i < il; i += 3) {
        vFrom.fromArray(data.position1 as any, i)
        vTo.fromArray(data.position2 as any, i)
        vDir.subVectors(vFrom, vTo)
        const fullLength = vDir.length()
        const coneLength = cylinderRadius[ i / 3 ] * aspectRatio * 2
        const length = Math.min(fullLength, coneLength)
        vDir.setLength(length)
        vSplit.copy(vTo).add(vDir)
        vSplit.toArray(splitPosition as any, i)
      }
      cylinder.position1 = data.position1
      cylinder.position2 = splitPosition
      cone.position1 = splitPosition
      cone.position2 = data.position2
    }

    if (data.color) {
      cylinder.color = data.color
      cylinder.color2 = data.color
      cone.color = data.color
    }

    return {
      cylinder: cylinder,
      cone: cone
    }
  }

  getMesh () {
    return new Group().add(
      this.cylinderBuffer.getMesh(),
      this.coneBuffer.getMesh()
    )
  }

  getWireframeMesh () {
    return new Group().add(
      this.cylinderBuffer.getWireframeMesh(),
      this.coneBuffer.getWireframeMesh()
    )
  }

  getPickingMesh () {
    return new Group().add(
      this.cylinderBuffer.getPickingMesh(),
      this.coneBuffer.getPickingMesh()
    )
  }

  setAttributes (data: Partial<ArrowBufferData> = {}) {
    const attr = this.makeAttributes(data)

    this.cylinderBuffer.setAttributes(attr.cylinder)
    this.coneBuffer.setAttributes(attr.cone)
  }

  /**
   * Set buffer parameters
   * @param {BufferParameters} params - buffer parameters object
   * @return {undefined}
   */
  setParameters (params: Partial<ArrowBufferParameters> = {}) {
    params = Object.assign({}, params)

    if (params && params.matrix !== undefined) {
      this.matrix = params.matrix
    }
    delete params.matrix

    if (params && params.wireframe !== undefined) {
      this.parameters.wireframe = params.wireframe
      this.setVisibility(this.visible)
    }

    this.cylinderBuffer.setParameters(params)
    this.coneBuffer.setParameters(params)
  }

  setVisibility (value: boolean) {
    Buffer.prototype.setVisibility.call(this, value)
  }

  dispose () {
    this.cylinderBuffer.dispose()
    this.coneBuffer.dispose()
  }
}

BufferRegistry.add('arrow', ArrowBuffer)

export default ArrowBuffer
