/**
 * @file Component Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3, Matrix4, Quaternion } from 'three'
import * as signalsWrapper from 'signals'

import { ensureVector3 } from '../utils'
import Component from '../component/component'
import Stage from '../stage/stage'
import Viewer from '../viewer/viewer'

const tmpRotateMatrix = new Matrix4()
const tmpRotateVector = new Vector3()
const tmpRotateQuaternion = new Quaternion()

/**
 * Component controls
 */
class ComponentControls {
  signals = {
    changed: new signalsWrapper.Signal()
  }

  stage: Stage
  viewer: Viewer

  /**
   * @param  {Component} component - the component object
   */
  constructor (readonly component: Component) {
    this.stage = component.stage
    this.viewer = component.stage.viewer
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
  spin (axis: Vector3, angle: number) {
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
