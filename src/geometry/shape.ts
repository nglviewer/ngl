/**
 * @file Shape
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

// @ts-ignore: unused import Matrix4 required for declaration only
import { Box3, Vector3, Color, Matrix4 } from 'three'

import { createParams, ensureFloat32Array, getUintArray } from '../utils'
import {
  ArrowPrimitive, BoxPrimitive, ConePrimitive, CylinderPrimitive, EllipsoidPrimitive,
  OctahedronPrimitive, SpherePrimitive, TetrahedronPrimitive, TextPrimitive,
  TorusPrimitive, PointPrimitive, WidelinePrimitive
} from './primitive'
import { MeshPicker } from '../utils/picker'
import Buffer from '../buffer/buffer'
import MeshBuffer from '../buffer/mesh-buffer'
import { TextBufferParameters } from '../buffer/text-buffer'

const tmpBox = new Box3()

const Primitives = [
  ArrowPrimitive, BoxPrimitive, ConePrimitive, CylinderPrimitive,
  EllipsoidPrimitive, OctahedronPrimitive, SpherePrimitive, TetrahedronPrimitive,
  TextPrimitive, TorusPrimitive, PointPrimitive, WidelinePrimitive
]

export const ShapeDefaultParameters = {
  aspectRatio: 1.5,
  sphereDetail: 2,
  radialSegments: 50,
  disableImpostor: false,
  openEnded: false,
  dashedCylinder: false,
  labelParams: {} as Partial<TextBufferParameters>,
  pointSize: 2,
  sizeAttenuation: false,
  useTexture: true,
  linewidth: 2
}
export type ShapeParameters = typeof ShapeDefaultParameters

/**
 * Class for building custom shapes.
 *
 * @example
 * var shape = new NGL.Shape('shape', { disableImpostor: true });
 * shape.addSphere([ 0, 0, 9 ], [ 1, 0, 0 ], 1.5 );
 * shape.addEllipsoid([ 6, 0, 0 ], [ 1, 0, 0 ], 1.5, [ 3, 0, 0 ], [ 0, 2, 0 ]);
 * shape.addCylinder([ 0, 2, 7 ], [ 0, 0, 9 ], [ 1, 1, 0 ], 0.5);
 * shape.addCone([ 0, 2, 7 ], [ 0, 3, 3 ], [ 1, 1, 0 ], 1.5);
 * shape.addArrow([ 1, 2, 7 ], [ 30, 3, 3 ], [ 1, 0, 1 ], 1.0);
 * shape.addBox([ 0, 3, 0 ], [ 1, 0, 1 ], 2, [ 0, 1, 1 ], [ 1, 0, 1 ]);
 * var shapeComp = stage.addComponentFromObject(shape);
 * geoComp.addRepresentation('buffer');
 */
class Shape {
  name: string
  parameters: ShapeParameters

  boundingBox = new Box3()
  bufferList: Buffer[] = []
  meshCount = 0

  _center?: Vector3
  _primitiveData: { [k: string]: any } = {}

  /**
   * @param {String} name - name
   * @param {Object} params - parameter object
   * @param {Integer} params.aspectRatio - arrow aspect ratio, used for cylinder radius and cone length
   * @param {Integer} params.sphereDetail - sphere quality (icosahedron subdivisions)
   * @param {Integer} params.radialSegments - cylinder quality (number of segments)
   * @param {Boolean} params.disableImpostor - disable use of raycasted impostors for rendering
   * @param {Boolean} params.openEnded - capped or not
   * @param {TextBufferParameters} params.labelParams - label parameters
   */
  constructor (name = 'shape', params: Partial<ShapeParameters> = {}) {
    this.name = name

    this.parameters = createParams(params, ShapeDefaultParameters)

    Primitives.forEach(P => {
      Object.keys(P.fields).forEach(name => {
        this._primitiveData[ P.getShapeKey(name) ] = []
      })
      this._primitiveData[ P.getShapeKey('name') ] = []
    })
  }

  /**
   * Add a buffer
   * @param {Buffer} buffer - buffer object
   * @return {Shape} this object
   */
  addBuffer (buffer: Buffer) {
    this.bufferList.push(buffer)

    const geometry = (buffer as any).geometry  // TODO
    if (!geometry.boundingBox) {
      geometry.computeBoundingBox()
    }
    this.boundingBox.union(geometry.boundingBox)

    return this
  }

  /**
   * Add a mesh
   * @example
   * shape.addMesh(
   *   [ 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1 ],
   *   [ 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0 ]
   * );
   *
   * @param {Float32Array|Array} position - positions
   * @param {Float32Array|Array} color - colors
   * @param {Uint32Array|Uint16Array|Array} [index] - indices
   * @param {Float32Array|Array} [normal] - normals
   * @param {String} [name] - text
   * @return {Shape} this object
   */
  addMesh (position: Float32Array|number[], color:Float32Array|number[], index: Uint32Array|Uint16Array|number[], normal?: Float32Array|number[], name?: string) {
    position = ensureFloat32Array(position)
    color = ensureFloat32Array(color)

    if (Array.isArray(index)) {
      index = getUintArray(index, position.length)
    }
    if (normal) {
      normal = ensureFloat32Array(normal)
    }

    let data
    if (normal === undefined || normal.length == 0 ) {
      data = { position, color, index }
    } else {
      data = { position, color, index, normal }
    }
    //const data = { position, color, index, normal }
    const picking = new MeshPicker(
      this, Object.assign({ serial: this.meshCount, name }, data)
    )
    const meshBuffer = new MeshBuffer(
      Object.assign({ picking }, data) as any
    )
    this.bufferList.push(meshBuffer)

    tmpBox.setFromArray(position)
    this.boundingBox.union(tmpBox)
    this.meshCount += 1

    return this
  }

  /**
   * Add a sphere
   * @example
   * shape.addSphere([ 0, 0, 9 ], [ 1, 0, 0 ], 1.5);
   *
   * @param {Vector3|Array} position - position vector or array
   * @param {Color|Array} color - color object or array
   * @param {Float} radius - radius value
   * @param {String} [name] - text
   * @return {Shape} this object
   */
  addSphere (position: Vector3|[number, number, number], color: Color|[number, number, number], radius: number, name: string) {
    SpherePrimitive.objectToShape(
      this, { position, color, radius, name }
    )
    return this
  }

  /**
   * Add an ellipsoid
   * @example
   * shape.addEllipsoid([ 6, 0, 0 ], [ 1, 0, 0 ], 1.5, [ 3, 0, 0 ], [ 0, 2, 0 ]);
   *
   * @param {Vector3|Array} position - position vector or array
   * @param {Color|Array} color - color object or array
   * @param {Float} radius - radius value
   * @param {Vector3|Array} majorAxis - major axis vector or array
   * @param {Vector3|Array} minorAxis - minor axis vector or array
   * @param {String} [name] - text
   * @return {Shape} this object
   */
  addEllipsoid (position: Vector3|[number, number, number], color: Color|[number, number, number], radius: number, majorAxis: Vector3|[number, number, number], minorAxis: Vector3|[number, number, number], name: string) {
    EllipsoidPrimitive.objectToShape(
      this, { position, color, radius, majorAxis, minorAxis, name }
    )
    return this
  }

  /**
   * Add a torus
   * @example
   * shape.addTorus([ 6, 0, 0 ], [ 1, 0, 0 ], 1.5, [ 3, 0, 0 ], [ 0, 2, 0 ]);
   *
   * @param {Vector3|Array} position - position vector or array
   * @param {Color|Array} color - color object or array
   * @param {Float} radius - radius value
   * @param {Vector3|Array} majorAxis - major axis vector or array
   * @param {Vector3|Array} minorAxis - minor axis vector or array
   * @param {String} [name] - text
   * @return {Shape} this object
   */
  addTorus (position: Vector3|[number, number, number], color: Color|[number, number, number], radius: number, majorAxis: Vector3|[number, number, number], minorAxis: Vector3|[number, number, number], name: string) {
    TorusPrimitive.objectToShape(
      this, { position, color, radius, majorAxis, minorAxis, name }
    )
    return this
  }

  /**
   * Add a cylinder
   * @example
   * shape.addCylinder([ 0, 2, 7 ], [ 0, 0, 9 ], [ 1, 1, 0 ], 0.5);
   *
   * @param {Vector3|Array} position1 - from position vector or array
   * @param {Vector3|Array} position2 - to position vector or array
   * @param {Color|Array} color - color object or array
   * @param {Float} radius - radius value
   * @param {String} [name] - text
   * @return {Shape} this object
   */
  addCylinder (position1: Vector3|[number, number, number], position2: Vector3|[number, number, number], color: Color|[number, number, number], radius: number, name: string) {
    CylinderPrimitive.objectToShape(
      this, { position1, position2, color, radius, name }
    )
    return this
  }

  /**
   * Add a cone
   * @example
   * shape.addCone([ 0, 2, 7 ], [ 0, 3, 3 ], [ 1, 1, 0 ], 1.5);
   *
   * @param {Vector3|Array} position1 - from position vector or array
   * @param {Vector3|Array} position2 - to position vector or array
   * @param {Color|Array} color - color object or array
   * @param {Float} radius - radius value
   * @param {String} [name] - text
   * @return {Shape} this object
   */
  addCone (position1: Vector3|[number, number, number], position2: Vector3|[number, number, number], color: Color|[number, number, number], radius: number, name: string) {
    ConePrimitive.objectToShape(
      this, { position1, position2, color, radius, name }
    )
    return this
  }

  /**
   * Add an arrow
   * @example
   * shape.addArrow([ 0, 2, 7 ], [ 0, 0, 9 ], [ 1, 1, 0 ], 0.5);
   *
   * @param {Vector3|Array} position1 - from position vector or array
   * @param {Vector3|Array} position2 - to position vector or array
   * @param {Color|Array} color - color object or array
   * @param {Float} radius - radius value
   * @param {String} [name] - text
   * @return {Shape} this object
   */
  addArrow (position1: Vector3|[number, number, number], position2: Vector3|[number, number, number], color: Color|[number, number, number], radius: number, name: string) {
    ArrowPrimitive.objectToShape(
      this, { position1, position2, color, radius, name }
    )
    return this
  }

  /**
   * Add a box
   * @example
   * shape.addBox([ 0, 3, 0 ], [ 1, 0, 1 ], 2, [ 0, 1, 1 ], [ 1, 0, 1 ]);
   *
   * @param {Vector3|Array} position - position vector or array
   * @param {Color|Array} color - color object or array
   * @param {Float} size - size value
   * @param {Vector3|Array} heightAxis - height axis vector or array
   * @param {Vector3|Array} depthAxis - depth axis vector or array
   * @param {String} [name] - text
   * @return {Shape} this object
   */
  addBox (position: Vector3|[number, number, number], color: Color|[number, number, number], size: number, heightAxis: Vector3|[number, number, number], depthAxis: Vector3|[number, number, number], name: string) {
    BoxPrimitive.objectToShape(
      this, { position, color, size, heightAxis, depthAxis, name }
    )
    return this
  }

  /**
   * Add an octahedron
   * @example
   * shape.addOctahedron([ 0, 3, 0 ], [ 1, 0, 1 ], 2, [ 0, 1, 1 ], [ 1, 0, 1 ]);
   *
   * @param {Vector3|Array} position - position vector or array
   * @param {Color|Array} color - color object or array
   * @param {Float} size - size value
   * @param {Vector3|Array} heightAxis - height axis vector or array
   * @param {Vector3|Array} depthAxis - depth axis vector or array
   * @param {String} [name] - text
   * @return {Shape} this object
   */
  addOctahedron (position: Vector3|[number, number, number], color: Color|[number, number, number], size: number, heightAxis: Vector3|[number, number, number], depthAxis: Vector3|[number, number, number], name: string) {
    OctahedronPrimitive.objectToShape(
      this, { position, color, size, heightAxis, depthAxis, name }
    )
    return this
  }

  /**
   * Add a tetrahedron
   * @example
   * shape.addTetrahedron([ 0, 3, 0 ], [ 1, 0, 1 ], 2, [ 0, 1, 1 ], [ 1, 0, 1 ]);
   *
   * @param {Vector3|Array} position - position vector or array
   * @param {Color|Array} color - color object or array
   * @param {Float} size - size value
   * @param {Vector3|Array} heightAxis - height axis vector or array
   * @param {Vector3|Array} depthAxis - depth axis vector or array
   * @param {String} [name] - text
   * @return {Shape} this object
   */
  addTetrahedron (position: Vector3|[number, number, number], color: Color|[number, number, number], size: number, heightAxis: Vector3|[number, number, number], depthAxis: Vector3|[number, number, number], name: string) {
    TetrahedronPrimitive.objectToShape(
      this, { position, color, size, heightAxis, depthAxis, name }
    )
    return this
  }

  /**
   * Add text
   * @example
   * shape.addText([ 10, -2, 4 ], [ 0.2, 0.5, 0.8 ], 0.5, "Hello");
   *
   * @param {Vector3|Array} position - position vector or array
   * @param {Color|Array} color - color object or array
   * @param {Float} size - size value
   * @param {String} text - text value
   * @return {Shape} this object
   */
  addText (position: Vector3|[number, number, number], color: Color|[number, number, number], size: number, text: string) {
    TextPrimitive.objectToShape(
      this, { position, color, size, text }
    )
    return this
  }

  /**
   * Add point
   * @example
   * shape.addPoint([ 10, -2, 4 ], [ 0.2, 0.5, 0.8 ]);
   *
   * @param {Vector3|Array} position - position vector or array
   * @param {Color|Array} color - color object or array
   * @param {String} [name] - text
   * @return {Shape} this object
   */
  addPoint (position: Vector3|[number, number, number], color: Color|[number, number, number], name: string) {
    PointPrimitive.objectToShape(
      this, { position, color, name }
    )
    return this
  }

  /**
   * Add a wideline
   * @example
   * shape.addWideline([ 0, 2, 7 ], [ 0, 0, 9 ], [ 1, 1, 0 ]);
   *
   * @param {Vector3|Array} position1 - from position vector or array
   * @param {Vector3|Array} position2 - to position vector or array
   * @param {Color|Array} color - color object or array
   * @param {String} [name] - text
   * @return {Shape} this object
   */
  addWideline (position1: Vector3|[number, number, number], position2: Vector3|[number, number, number], color: Color|[number, number, number], linewidth: number, name: string) {
    this.parameters.linewidth = linewidth
    WidelinePrimitive.objectToShape(
      this, { position1, position2, color, name }
    )
    return this
  }

  /**
   * Deprecated, use `.addText`
   */
  addLabel (position: Vector3|[number, number, number], color: Color|[number, number, number], size: number, text: string) {
    console.warn('Shape.addLabel is deprecated, use .addText instead')
    return this.addText(position, color, size, text)
  }

  getBufferList () {
    const buffers: Buffer[] = []

    Primitives.forEach(P => {
      if (this._primitiveData[ P.getShapeKey('color') ].length) {
        buffers.push(P.bufferFromShape(this, this.parameters))
      }
    })

    return this.bufferList.concat(buffers)
  }

  dispose () {
    this.bufferList.forEach(function (buffer) {
      buffer.dispose()
    })
    this.bufferList.length = 0

    Primitives.forEach(P => {
      Object.keys(P.fields).forEach(name => {
        this._primitiveData[ P.getShapeKey(name) ].length = 0
      })
      this._primitiveData[ P.getShapeKey('name') ].length = 0
    })
  }

  get center () {
    if (!this._center) {
      this._center = this.boundingBox.getCenter(new Vector3())
    }
    return this._center
  }

  get type () { return 'Shape' }
}

export default Shape
