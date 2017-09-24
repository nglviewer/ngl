/**
 * @file Primitive
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3, Color } from '../../lib/three.es6.js'

import { BufferRegistry, PickerRegistry } from '../globals.js'

function addElement (elm, array) {
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

/**
 * Base class for geometry primitives
 * @interface
 */
class Primitive {
  static get Picker () { return PickerRegistry.get(this.type) }
  static get Buffer () { return BufferRegistry.get(this.type) }

  static getShapeKey (name) {
    return this.type + name[0].toUpperCase() + name.substr(1)
  }

  static valueToShape (shape, name, value) {
    const data = shape[this.getShapeKey(name)]
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

  static objectToShape (shape, data) {
    Object.keys(this.fields).forEach(name => {
      this.valueToShape(shape, name, data[name])
    })
    this.valueToShape(shape, 'name', data.name)
    this.expandBoundingBox(shape.boundingBox, data)
  }

  static valueFromShape (shape, pid, name) {
    const data = shape[this.getShapeKey(name)]
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

  static objectFromShape (shape, pid) {
    const o = {
      shape,
      name: this.valueFromShape(shape, pid, 'name')
    }

    Object.keys(this.fields).forEach(name => {
      o[name] = this.valueFromShape(shape, pid, name)
    })

    return o
  }

  static arrayFromShape (shape, name) {
    const data = shape[this.getShapeKey(name)]
    const type = this.fields[name]

    switch (type) {
      case 's':
        return data
      default:
        return new Float32Array(data)
    }
  }

  static dataFromShape (shape) {
    const data = {}

    if (this.Picker) {
      data.picking = new this.Picker(shape)
    }

    Object.keys(this.fields).forEach(name => {
      data[name] = this.arrayFromShape(shape, name)
    })

    return data
  }

  static bufferFromShape (shape, params) {
    return new this.Buffer(this.dataFromShape(shape), params)
  }
}

/**
 * Sphere geometry primitive
 */
class SpherePrimitive extends Primitive {
  static get type () { return 'sphere' }

  static get fields () {
    return {
      position: 'v3',
      color: 'c',
      radius: 'f'
    }
  }

  static positionFromShape (shape, pid) {
    return this.valueFromShape(shape, pid, 'position')
  }

  static expandBoundingBox (box, data) {
    box.expandByPoint(tmpVec.fromArray(data.position))
  }
}

/**
 * Box geometry primitive
 */
class BoxPrimitive extends SpherePrimitive {
  static get type () { return 'box' }

  static get fields () {
    return {
      position: 'v3',
      color: 'c',
      size: 'f',
      heightAxis: 'v3',
      depthAxis: 'v3'
    }
  }
}

/**
 * Octahedron geometry primitive
 */
class OctahedronPrimitive extends BoxPrimitive {
  static get type () { return 'octahedron' }
}

/**
 * Tetrahedron geometry primitive
 */
class TetrahedronPrimitive extends BoxPrimitive {
  static get type () { return 'tetrahedron' }
}

/**
 * Cylinder geometry primitive
 */
class CylinderPrimitive extends Primitive {
  static get type () { return 'cylinder' }

  static get fields () {
    return {
      position1: 'v3',
      position2: 'v3',
      color: 'c',
      radius: 'f'
    }
  }

  static positionFromShape (shape, pid) {
    const p1 = this.valueFromShape(shape, pid, 'position1')
    const p2 = this.valueFromShape(shape, pid, 'position2')
    return p1.add(p2).multiplyScalar(0.5)
  }

  static expandBoundingBox (box, data) {
    box.expandByPoint(tmpVec.fromArray(data.position1))
    box.expandByPoint(tmpVec.fromArray(data.position2))
  }
}

/**
 * Arrow geometry primitive
 */
class ArrowPrimitive extends CylinderPrimitive {
  static get type () { return 'arrow' }
}

/**
 * Cone geometry primitive
 */
class ConePrimitive extends CylinderPrimitive {
  static get type () { return 'cone' }
}

/**
 * Ellipsoid geometry primitive
 */
class EllipsoidPrimitive extends SpherePrimitive {
  static get type () { return 'ellipsoid' }

  static get fields () {
    return {
      position: 'v3',
      color: 'c',
      radius: 'f',
      majorAxis: 'v3',
      minorAxis: 'v3'
    }
  }
}

/**
 * Torus geometry primitive
 */
class TorusPrimitive extends EllipsoidPrimitive {
  static get type () { return 'torus' }
}

/**
 * Text geometry primitive
 */
class TextPrimitive extends SpherePrimitive {
  static get type () { return 'text' }

  static get fields () {
    return {
      position: 'v3',
      color: 'c',
      size: 'f',
      text: 's'
    }
  }
}

export {
  ArrowPrimitive,
  BoxPrimitive,
  ConePrimitive,
  CylinderPrimitive,
  EllipsoidPrimitive,
  OctahedronPrimitive,
  SpherePrimitive,
  TetrahedronPrimitive,
  TextPrimitive,
  TorusPrimitive
}
