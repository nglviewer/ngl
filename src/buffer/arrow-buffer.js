/**
 * @file Arrow Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Matrix4, Vector3, Group } from '../../lib/three.es6.js'

import { BufferRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import Buffer from './buffer.js'
import CylinderBuffer from './cylinder-buffer.js'
import ConeBuffer from './cone-buffer.js'
import GeometryGroup from '../viewer/geometry-group.js'

/**
 * Arrow buffer. Draws arrows made from a cylinder and a cone.
 * @implements {Buffer}
 *
 * @example
 * var arrowBuffer = new ArrowBuffer( {
 *     position1: new Float32Array( [ 0, 0, 0 ] ),
 *     position2: new Float32Array( [ 10, 1, 1 ] ),
 *     color: new Float32Array( [ 1, 0, 0 ] ),
 *     radius: new Float32Array( [ 1 ] )
 * } );
 */
class ArrowBuffer {
    /**
     * @param {Object} data - buffer data
     * @param {Float32Array} data.position1 - from positions
     * @param {Float32Array} data.position2 - to positions
     * @param {Float32Array} data.color - colors
     * @param {Float32Array} data.radius - radii
     * @param {Picker} [data.picking] - picking ids
     * @param {BufferParameters} [params] - parameters object
     */
  constructor (data, params) {
    const d = data || {}
    const p = params || {}

    this.aspectRatio = defaults(p.aspectRatio, 1.5)
    this.wireframe = defaults(p.wireframe, false)

    this.splitPosition = new Float32Array(d.position1.length)
    this.cylinderRadius = new Float32Array(d.radius.length)

    var attr = this.makeAttributes(d)
    var bufferParams = {
      radialSegments: defaults(p.radialSegments, 50),
      openEnded: defaults(p.openEnded, false),
      disableImpostor: defaults(p.disableImpostor, false)
    }

    this.cylinderBuffer = new CylinderBuffer(
            attr.cylinder, bufferParams
        )
    this.coneBuffer = new ConeBuffer(
            attr.cone, bufferParams
        )

    this.geometry = new GeometryGroup([
      this.cylinderBuffer.geometry,
      this.coneBuffer.geometry
    ])

    this.group = new Group()
    this.wireframeGroup = new Group()
    this.pickingGroup = new Group()

        // requires Group objects to be present
    this.matrix = defaults(p.matrix, new Matrix4())

    this.picking = d.picking
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

  makeAttributes (data) {
    const splitPosition = this.splitPosition
    const cylinderRadius = this.cylinderRadius

    const aspectRatio = this.aspectRatio

    let i, il
    const cylinder = {}
    const cone = {}

    if (data.radius) {
      for (i = 0, il = cylinderRadius.length; i < il; ++i) {
        cylinderRadius[ i ] = data.radius[ i ] / aspectRatio
      }
      cylinder.radius = cylinderRadius
      cone.radius = data.radius
    }

    if (data.position1 && data.position2) {
      var vFrom = new Vector3()
      var vTo = new Vector3()
      var vDir = new Vector3()
      var vSplit = new Vector3()
      for (i = 0, il = splitPosition.length; i < il; i += 3) {
        vFrom.fromArray(data.position1, i)
        vTo.fromArray(data.position2, i)
        vDir.subVectors(vFrom, vTo)
        var fullLength = vDir.length()
        var coneLength = cylinderRadius[ i / 3 ] * aspectRatio * 2
        var length = Math.min(fullLength, coneLength)
        vDir.setLength(length)
        vSplit.copy(vTo).add(vDir)
        vSplit.toArray(splitPosition, i)
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

  getMesh (picking) {
    return new Group().add(
            this.cylinderBuffer.getMesh(picking),
            this.coneBuffer.getMesh(picking)
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

  setAttributes (data) {
    var attr = this.makeAttributes(data)

    this.cylinderBuffer.setAttributes(attr.cylinder)
    this.coneBuffer.setAttributes(attr.cone)
  }

    /**
     * Set buffer parameters
     * @param {BufferParameters} params - buffer parameters object
     * @return {undefined}
     */
  setParameters (params) {
    params = Object.assign({}, params)

    if (params && params.matrix !== undefined) {
      this.matrix = params.matrix
    }
    delete params.matrix

    if (params && params.wireframe !== undefined) {
      this.wireframe = params.wireframe
      this.setVisibility(this.visible)
    }

    this.cylinderBuffer.setParameters(params)
    this.coneBuffer.setParameters(params)
  }

  setVisibility () {
    Buffer.prototype.setVisibility.apply(this, arguments)
  }

  dispose () {
    this.cylinderBuffer.dispose()
    this.coneBuffer.dispose()
  }
}

BufferRegistry.add('arrow', ArrowBuffer)

export default ArrowBuffer
