/**
 * @file Double Sided Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

// @ts-ignore: unused import Vector3, Matrix4 required for declaration only
import { Group, BufferGeometry, Object3D, Mesh, LineSegments, Vector3, Matrix4 } from 'three'

import Buffer, { BufferSide } from './buffer'
import { Picker } from '../utils/picker'

function setVisibilityTrue (m: Object3D) { m.visible = true }
function setVisibilityFalse (m: Object3D) { m.visible = false }

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
  size: number
  side: BufferSide
  visible: boolean
  wireframe: boolean
  geometry: BufferGeometry

  picking?: Picker

  group = new Group()
  wireframeGroup = new Group()
  pickingGroup = new Group()

  frontMeshes: (Mesh|LineSegments)[] = []
  backMeshes: (Mesh|LineSegments)[] = []

  buffer: Buffer
  frontBuffer: Buffer
  backBuffer: Buffer

  /**
   * Create a double sided buffer
   * @param  {Buffer} buffer - the buffer to be rendered double-sided
   */
  constructor (buffer: Buffer) {
    this.size = buffer.size
    this.side = buffer.parameters.side
    this.visible = buffer.visible
    this.geometry = buffer.geometry
    this.picking = buffer.picking

    this.group = new Group()
    this.wireframeGroup = new Group()
    this.pickingGroup = new Group()

    // requires Group objects to be present
    this.matrix = buffer.matrix

    const frontBuffer = buffer
    const backBuffer = new (buffer as any).constructor({  // TODO
      position: new Float32Array(0)
    }) as Buffer

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
      opacity: backBuffer.parameters.opacity
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

  getMesh (picking: boolean) {
    let front, back

    if (picking) {
      back = this.backBuffer.getPickingMesh()
      front = this.frontBuffer.getPickingMesh()
    } else {
      back = this.backBuffer.getMesh()
      front = this.frontBuffer.getMesh()
    }

    this.frontMeshes.push(<LineSegments|Mesh>front)
    this.backMeshes.push(<LineSegments|Mesh>back)

    this.setParameters({ side: this.side })

    return new Group().add(back, front)
  }

  getWireframeMesh () {
    return this.buffer.getWireframeMesh()
  }

  getPickingMesh () {
    return this.getMesh(true)
  }

  setAttributes (data: any) {  // TODO
    this.buffer.setAttributes(data)
  }

  setParameters (data: any) {  // TODO
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

    if (data.wireframe !== undefined) {
      this.wireframe = data.wireframe
      this.setVisibility(this.visible)
    }
    delete data.wireframe

    this.backBuffer.setParameters(data)
  }

  setVisibility (value: boolean) {
    this.visible = value

    if (this.parameters.wireframe) {
      this.group.visible = false
      this.wireframeGroup.visible = value
      if (this.pickable) {
        this.pickingGroup.visible = false
      }
    } else {
      this.group.visible = value
      this.wireframeGroup.visible = false
      if (this.pickable) {
        this.pickingGroup.visible = value
      }
    }
  }

  dispose () {
    this.frontBuffer.dispose()
    this.backBuffer.dispose()
  }

  /**
   * Customize JSON serialization to avoid circular references.
   * Only export simple params which could be useful.
   */
  toJSON () {
    var result: any = {};
    for (var x in this) {
      if (['side', 'size', 'visible', 'matrix', 'parameters'].includes(x)) {
        result[x] = this[x];
      }
    }
    return result;
  }
}

export default DoubleSidedBuffer
