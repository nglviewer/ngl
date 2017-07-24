/**
 * @file Component Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3, Matrix4, Quaternion } from '../../lib/three.es6.js'
import Signal from '../../lib/signals.es6.js'

import { ensureVector3 } from '../utils.js'

const tmpRotateMatrix = new Matrix4()
const tmpRotateVector = new Vector3()
const tmpRotateQuaternion = new Quaternion()

/**
 * Component controls
 */
class ComponentControls {
  /**
   * @param  {Component} component - the component object
   */
  constructor (component) {
    this.component = component
    this.stage = component.stage
    this.viewer = component.stage.viewer

    /**
     * @type {{changed: Signal}}
     */
    this.signals = {
      changed: new Signal()
    }
  }

  /**
   * component center position
   * @type {Vector3}
   */
  get position () {
    return this.component.position
  }

  /**
   * component rotation
   * @type {Quaternion}
   */
  get rotation () {
    return this.component.quaternion
  }

  /**
   * Trigger render and emit changed event
   * @emits {ComponentControls.signals.changed}
   * @return {undefined}
   */
  changed () {
    this.component.updateMatrix()
    this.viewer.requestRender()
    this.signals.changed.dispatch()
  }

  /**
   * spin component on axis
   * @param  {Vector3|Array} axis - rotation axis
   * @param  {Number} angle - amount to spin
   * @return {undefined}
   */
  spin (axis, angle) {
    tmpRotateMatrix.getInverse(this.viewer.rotationGroup.matrix)
    tmpRotateVector
      .copy(ensureVector3(axis)).applyMatrix4(tmpRotateMatrix)

    tmpRotateMatrix.extractRotation(this.component.transform)
    tmpRotateMatrix.premultiply(this.viewer.rotationGroup.matrix)
    tmpRotateMatrix.getInverse(tmpRotateMatrix)

    tmpRotateVector.copy(ensureVector3(axis))
    tmpRotateVector.applyMatrix4(tmpRotateMatrix)
    tmpRotateMatrix.makeRotationAxis(tmpRotateVector, angle)
    tmpRotateQuaternion.setFromRotationMatrix(tmpRotateMatrix)

    this.component.quaternion.premultiply(tmpRotateQuaternion)
    this.changed()
  }
}

export default ComponentControls
