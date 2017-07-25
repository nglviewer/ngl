/**
 * @file Shape
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Box3 } from '../../lib/three.es6.js'

import { defaults, ensureFloat32Array, getUintArray } from '../utils.js'
import {
  ArrowPrimitive, BoxPrimitive, ConePrimitive, CylinderPrimitive,
  EllipsoidPrimitive, OctahedronPrimitive, SpherePrimitive,
  TetrahedronPrimitive, TextPrimitive, TorusPrimitive
} from '../geometry/primitive.js'
import { MeshPicker } from '../utils/picker.js'
import MeshBuffer from '../buffer/mesh-buffer.js'

const tmpBox = new Box3()

const Primitives = [
  ArrowPrimitive, BoxPrimitive, ConePrimitive, CylinderPrimitive,
  EllipsoidPrimitive, OctahedronPrimitive, SpherePrimitive,
  TetrahedronPrimitive, TextPrimitive, TorusPrimitive
]

/**
 * Class for building custom shapes.
 *
 * @example
 * var shape = new NGL.Shape("shape", { disableImpostor: true });
 * shape.addSphere([ 0, 0, 9 ], [ 1, 0, 0 ], 1.5 );
 * shape.addEllipsoid([ 6, 0, 0 ], [ 1, 0, 0 ], 1.5, [ 3, 0, 0 ], [ 0, 2, 0 ]);
 * shape.addCylinder([ 0, 2, 7 ], [ 0, 0, 9 ], [ 1, 1, 0 ], 0.5);
 * shape.addCone([ 0, 2, 7 ], [ 0, 3, 3 ], [ 1, 1, 0 ], 1.5);
 * shape.addArrow([ 1, 2, 7 ], [ 30, 3, 3 ], [ 1, 0, 1 ], 1.0);
 * shape.addBox([ 0, 3, 0 ], [ 1, 0, 1 ], 2, [ 0, 1, 1 ], [ 1, 0, 1 ]);
 * var shapeComp = stage.addComponentFromObject(shape);
 * geoComp.addRepresentation("buffer");
 */
class Shape {
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
  constructor (name, params) {
    this.name = defaults(name, 'shape')

    const p = params || {}

    this.aspectRatio = defaults(p.aspectRatio, 1.5)
    this.sphereDetail = defaults(p.sphereDetail, 2)
    this.radialSegments = defaults(p.radialSegments, 50)
    this.disableImpostor = defaults(p.disableImpostor, false)
    this.openEnded = defaults(p.openEnded, false)
    this.labelParams = defaults(p.labelParams, {})

    this.boundingBox = new Box3()

    this.bufferList = []
    this.meshCount = 0

    Primitives.forEach(P => {
      Object.keys(P.fields).forEach(name => {
        this[ P.getShapeKey(name) ] = []
      })
      this[ P.getShapeKey('name') ] = []
    })
  }

  /**
   * Add a buffer
   * @param {Buffer} buffer - buffer object
   * @return {Shape} this object
   */
  addBuffer (buffer) {
    this.bufferList.push(buffer)

    const geometry = buffer.geometry
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
  addMesh (position, color, index, normal, name) {
    position = ensureFloat32Array(position)
    color = ensureFloat32Array(color)
    if (Array.isArray(index)) {
      index = getUintArray(index, position.length)
    }
    if (normal) {
      normal = ensureFloat32Array(normal)
    }

    const data = { position, color, index, normal }
    const picking = new MeshPicker(
      this, Object.assign({ serial: this.meshCount, name }, data)
    )
    const meshBuffer = new MeshBuffer(
      Object.assign({ picking }, data)
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
  addSphere (position, color, radius, name) {
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
  addEllipsoid (position, color, radius, majorAxis, minorAxis, name) {
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
  addTorus (position, color, radius, majorAxis, minorAxis, name) {
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
  addCylinder (position1, position2, color, radius, name) {
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
  addCone (position1, position2, color, radius, name) {
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
  addArrow (position1, position2, color, radius, name) {
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
  addBox (position, color, size, heightAxis, depthAxis, name) {
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
  addOctahedron (position, color, size, heightAxis, depthAxis, name) {
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
  addTetrahedron (position, color, size, heightAxis, depthAxis, name) {
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
   * @param {Vector3|Array} position - from position vector or array
   * @param {Color|Array} color - color object or array
   * @param {Float} size - size value
   * @param {String} text - text value
   * @return {Shape} this object
   */
  addText (position, color, size, text) {
    TextPrimitive.objectToShape(
      this, { position, color, size, text }
    )
    return this
  }

  /**
   * Deprecated, use `.addText`
   */
  addLabel (position, color, size, text) {
    console.warn('Shape.addLabel is deprecated, use .addText instead')
    return this.addText(position, color, size, text)
  }

  getBufferList () {
    const buffers = []

    const params = {
      aspectRatio: this.aspectRatio,
      sphereDetail: this.sphereDetail,
      radialSegments: this.radialSegments,
      disableImpostor: this.disableImpostor,
      openEnded: this.openEnded,
      labelParams: this.labelParams
    }

    Primitives.forEach(P => {
      if (this[ P.getShapeKey('color') ].length) {
        buffers.push(P.bufferFromShape(this, params))
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
        this[ P.getShapeKey(name) ].length = 0
      })
      this[ P.getShapeKey('name') ].length = 0
    })
  }

  get center () {
    if (!this._center) {
      this._center = this.boundingBox.getCenter()
    }
    return this._center
  }

  get type () { return 'Shape' }
}

export default Shape
