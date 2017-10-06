/**
 * @file Double Sided Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Group } from 'three'

import Buffer from './buffer.js'

function setVisibilityTrue (m) { m.visible = true }
function setVisibilityFalse (m) { m.visible = false }

/**
 * A double-sided mesh buffer. Takes a buffer and renders the front and
 * the back as seperate objects to avoid some artifacts when rendering
 * transparent meshes. Also allows to render the back of a mesh opaque
 * while the front is transparent.
 * @implements {Buffer}
 *
 * @example
 * var sphereGeometryBuffer = new SphereGeometryBuffer({
 *   position: new Float32Array([ 0, 0, 0 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   radius: new Float32Array([ 1 ])
 * });
 * var doubleSidedBuffer = new DoubleSidedBuffer(sphereGeometryBuffer);
 */
class DoubleSidedBuffer {
  /**
   * Create a double sided buffer
   * @param  {Buffer} buffer - the buffer to be rendered double-sided
   */
  constructor (buffer) {
    this.size = buffer.size
    this.side = buffer.side
    this.visible = buffer.visible
    this.geometry = buffer.geometry
    this.picking = buffer.picking

    this.group = new Group()
    this.wireframeGroup = new Group()
    this.pickingGroup = new Group()

    // requires Group objects to be present
    this.matrix = buffer.matrix

    this.frontMeshes = []
    this.backMeshes = []

    var frontBuffer = buffer
    var backBuffer = new buffer.constructor({
      position: new Float32Array(0)
    })

    frontBuffer.makeMaterial()
    backBuffer.makeMaterial()

    backBuffer.picking = buffer.picking
    backBuffer.geometry = buffer.geometry
    backBuffer.wireframeGeometry = buffer.wireframeGeometry
    backBuffer.setParameters(buffer.getParameters())
    backBuffer.updateShader()

    frontBuffer.setParameters({
      side: 'front'
    })
    backBuffer.setParameters({
      side: 'back',
      opacity: backBuffer.opacity
    })

    this.buffer = buffer
    this.frontBuffer = frontBuffer
    this.backBuffer = backBuffer
  }

  set matrix (m) {
    Buffer.prototype.setMatrix.call(this, m)
  }
  get matrix () {
    return this.group.matrix.clone()
  }

  get pickable () {
    return !!this.picking && !this.parameters.disablePicking
  }

  get parameters () {
    return this.buffer.parameters
  }

  getParameters () {
    const p = Object.assign({}, this.buffer.parameters)
    p.side = this.side
    return p
  }

  getMesh (picking) {
    var front, back

    if (picking) {
      back = this.backBuffer.getPickingMesh()
      front = this.frontBuffer.getPickingMesh()
    } else {
      back = this.backBuffer.getMesh()
      front = this.frontBuffer.getMesh()
    }

    this.frontMeshes.push(front)
    this.backMeshes.push(back)

    this.setParameters({ side: this.side })

    return new Group().add(back, front)
  }

  getWireframeMesh () {
    return this.buffer.getWireframeMesh()
  }

  getPickingMesh () {
    return this.getMesh(true)
  }

  setAttributes (data) {
    this.buffer.setAttributes(data)
  }

  setParameters (data) {
    data = Object.assign({}, data)

    if (data.side === 'front') {
      this.frontMeshes.forEach(setVisibilityTrue)
      this.backMeshes.forEach(setVisibilityFalse)
    } else if (data.side === 'back') {
      this.frontMeshes.forEach(setVisibilityFalse)
      this.backMeshes.forEach(setVisibilityTrue)
    } else if (data.side === 'double') {
      this.frontMeshes.forEach(setVisibilityTrue)
      this.backMeshes.forEach(setVisibilityTrue)
    }

    if (data.side !== undefined) {
      this.side = data.side
    }
    delete data.side

    if (data.matrix !== undefined) {
      this.matrix = data.matrix
    }
    delete data.matrix

    this.frontBuffer.setParameters(data)
    this.backBuffer.setParameters(data)
  }

  dispose () {
    this.frontBuffer.dispose()
    this.backBuffer.dispose()
  }
}

DoubleSidedBuffer.prototype.setVisibility = Buffer.prototype.setVisibility

export default DoubleSidedBuffer
