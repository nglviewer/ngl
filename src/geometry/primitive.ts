/**
 * @file Primitive
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3, Color, Box3 } from 'three'

import { BufferRegistry, PickerRegistry } from '../globals'
import Shape from './shape'
import { getFixedLengthDashData } from './dash'

function addElement (elm: any, array: any[]) {
  if (elm.toArray !== undefined) {
    elm = elm.toArray()
  } else if (elm.x !== undefined) {
    elm = [ elm.x, elm.y, elm.z ]
  } else if (elm.r !== undefined) {
    elm = [ elm.r, elm.g, elm.b ]
  }
  array.push.apply(array, elm)
}

const tmpVec = new Vector3()

export type PrimitiveFields = { [k: string]: string }

/**
 * Base class for geometry primitives
 * @interface
 */
export abstract class Primitive {
  static type = ''
  static fields: PrimitiveFields = {}

  static get Picker () { return PickerRegistry.get(this.type) }
  static get Buffer () { return BufferRegistry.get(this.type) }

  static getShapeKey (name: string) {
    return this.type + name[0].toUpperCase() + name.substr(1)
  }

  static expandBoundingBox (box: Box3, data: any) {}

  static valueToShape (shape: Shape, name: string, value: any) {
    const data = shape._primitiveData[this.getShapeKey(name)]
    const type = this.fields[name]

    switch (type) {
      case 'v3':
      case 'c':
        addElement(value, data)
        break
      default:
        data.push(value)
    }
  }

  static objectToShape (shape: Shape, data: any) {
    Object.keys(this.fields).forEach(name => {
      this.valueToShape(shape, name, data[name])
    })
    this.valueToShape(shape, 'name', data.name)
    this.expandBoundingBox(shape.boundingBox, data)
  }

  static valueFromShape (shape: Shape, pid: number, name: string) {
    const data = shape._primitiveData[this.getShapeKey(name)]
    const type = this.fields[name]

    switch (type) {
      case 'v3':
        return new Vector3().fromArray(data, 3 * pid)
      case 'c':
        return new Color().fromArray(data, 3 * pid)
      default:
        return data[pid]
    }
  }

  static objectFromShape (shape: Shape, pid: number) {
    let name = this.valueFromShape(shape, pid, 'name')
    if (name === undefined) {
      name = `${this.type}: ${pid} (${shape.name})`
    }
    const o: any = { shape, name }

    Object.keys(this.fields).forEach(name => {
      o[name] = this.valueFromShape(shape, pid, name)
    })

    return o
  }

  static arrayFromShape (shape: Shape, name: string) {
    const data = shape._primitiveData[this.getShapeKey(name)]
    const type = this.fields[name]

    switch (type) {
      case 's':
        return data
      default:
        return new Float32Array(data)
    }
  }

  static dataFromShape (shape: Shape) {
    const data: any = {}

    if (this.Picker) {
      data.picking = new this.Picker(shape)
    }

    Object.keys(this.fields).forEach(name => {
      data[name] = this.arrayFromShape(shape, name)
    })

    return data
  }

  static bufferFromShape (shape: Shape, params: any) {
    return new this.Buffer(this.dataFromShape(shape), params)
  }
}

/**
 * Sphere geometry primitive
 */
export class SpherePrimitive extends Primitive {
  static type = 'sphere'

  static fields = {
    position: 'v3',
    color: 'c',
    radius: 'f'
  }

  static positionFromShape (shape: Shape, pid: number) {
    return this.valueFromShape(shape, pid, 'position')
  }

  static expandBoundingBox (box: Box3, data: any) {
    box.expandByPoint(tmpVec.fromArray(data.position))
  }
}

/**
 * Box geometry primitive
 */
export class BoxPrimitive extends Primitive {
  static type = 'box'

  static fields = {
    position: 'v3',
    color: 'c',
    size: 'f',
    heightAxis: 'v3',
    depthAxis: 'v3'
  }

  static positionFromShape (shape: Shape, pid: number) {
    return this.valueFromShape(shape, pid, 'position')
  }

  static expandBoundingBox (box: Box3, data: any) {
    box.expandByPoint(tmpVec.fromArray(data.position))
  }
}

/**
 * Octahedron geometry primitive
 */
export class OctahedronPrimitive extends BoxPrimitive {
  static type = 'octahedron'
}

/**
 * Tetrahedron geometry primitive
 */
export class TetrahedronPrimitive extends BoxPrimitive {
  static type = 'tetrahedron'
}

/**
 * Cylinder geometry primitive
 */
export class CylinderPrimitive extends Primitive {
  static type = 'cylinder'

  static fields = {
    position1: 'v3',
    position2: 'v3',
    color: 'c',
    radius: 'f'
  }

  static positionFromShape (shape: Shape, pid: number) {
    const p1 = this.valueFromShape(shape, pid, 'position1')
    const p2 = this.valueFromShape(shape, pid, 'position2')
    return p1.add(p2).multiplyScalar(0.5)
  }

  static expandBoundingBox (box: Box3, data: any) {
    box.expandByPoint(tmpVec.fromArray(data.position1))
    box.expandByPoint(tmpVec.fromArray(data.position2))
  }

  static bufferFromShape (shape: Shape, params: any = {}) {
    let data = this.dataFromShape(shape)
    if (this.type === 'cylinder' && params.dashedCylinder) {
      data = getFixedLengthDashData(data)
    }
    return new this.Buffer(data, params)
  }
}

/**
 * Arrow geometry primitive
 */
export class ArrowPrimitive extends CylinderPrimitive {
  static type = 'arrow'
}

/**
 * Cone geometry primitive
 */
export class ConePrimitive extends CylinderPrimitive {
  static type = 'cone'
}

/**
 * Ellipsoid geometry primitive
 */
export class EllipsoidPrimitive extends SpherePrimitive {
  static type = 'ellipsoid'

  static fields = {
    position: 'v3',
    color: 'c',
    radius: 'f',
    majorAxis: 'v3',
    minorAxis: 'v3'
  }
}

/**
 * Torus geometry primitive
 */
export class TorusPrimitive extends EllipsoidPrimitive {
  static type = 'torus'
}

/**
 * Text geometry primitive
 */
export class TextPrimitive extends Primitive {
  static type = 'text'

  static fields = {
    position: 'v3',
    color: 'c',
    size: 'f',
    text: 's'
  }

  static positionFromShape (shape: Shape, pid: number) {
    return this.valueFromShape(shape, pid, 'position')
  }

  static expandBoundingBox (box: Box3, data: any) {
    box.expandByPoint(tmpVec.fromArray(data.position))
  }
}

/**
 * Point primitive
 */
export class PointPrimitive extends Primitive {
  static type = 'point'

  static fields = {
    position: 'v3',
    color: 'c',
  }

  static positionFromShape (shape: Shape, pid: number) {
    return this.valueFromShape(shape, pid, 'position')
  }

  static expandBoundingBox (box: Box3, data: any) {
    box.expandByPoint(tmpVec.fromArray(data.position))
  }
}

/**
 * Wideline geometry primitive
 */
export class WidelinePrimitive extends Primitive {
  static type = 'wideline'

  static fields = {
    position1: 'v3',
    position2: 'v3',
    color: 'c'
  }

  static positionFromShape (shape: Shape, pid: number) {
    const p1 = this.valueFromShape(shape, pid, 'position1')
    const p2 = this.valueFromShape(shape, pid, 'position2')
    return p1.add(p2).multiplyScalar(0.5)
  }

  static expandBoundingBox (box: Box3, data: any) {
    box.expandByPoint(tmpVec.fromArray(data.position1))
    box.expandByPoint(tmpVec.fromArray(data.position2))
  }
}
