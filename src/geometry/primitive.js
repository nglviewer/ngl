/**
 * @file Primitive
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3, Color } from '../../lib/three.es6.js'

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

export {
  BoxPrimitive,
  CylinderPrimitive,
  SpherePrimitive
}
