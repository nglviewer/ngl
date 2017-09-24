/**
 * @file Viewer Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3, Matrix4, Quaternion } from '../../lib/three.es6.js'
import Signal from '../../lib/signals.es6.js'

import {
  ensureVector2, ensureVector3, ensureMatrix4, ensureQuaternion
} from '../utils.js'

/**
 * Orientation matrix, a 4x4 transformation matrix with rotation part
 * used for scene rotation, scale part for scene camera distance and
 * position part for scene translation
 * @typedef {Matrix4} OrientationMatrix - orientation matrix
 */

const tmpQ = new Quaternion()
const tmpP = new Vector3()
const tmpS = new Vector3()

const tmpCanvasVector = new Vector3()
const tmpScaleVector = new Vector3()
const tmpRotateMatrix = new Matrix4()
const tmpRotateVector = new Vector3()
const tmpAlignMatrix = new Matrix4()

/**
 * Viewer controls
 */
class ViewerControls {
  /**
   * @param  {Stage} stage - the stage object
   */
  constructor (stage) {
    this.stage = stage
    this.viewer = stage.viewer

    /**
     * @type {{changed: Signal}}
     */
    this.signals = {
      changed: new Signal()
    }
  }

  /**
   * scene center position
   * @type {Vector3}
   */
  get position () {
    return this.viewer.translationGroup.position
  }

  /**
   * scene rotation
   * @type {Quaternion}
   */
  get rotation () {
    return this.viewer.rotationGroup.quaternion
  }

  /**
   * Trigger render and emit changed event
   * @emits {ViewerControls.signals.changed}
   * @return {undefined}
   */
  changed () {
    this.viewer.requestRender()
    this.signals.changed.dispatch()
  }

  getPositionOnCanvas (position, optionalTarget) {
    const canvasPosition = ensureVector2(optionalTarget)
    const viewer = this.viewer

    tmpCanvasVector.copy(position)
      .add(viewer.translationGroup.position)
      .applyMatrix4(viewer.rotationGroup.matrix)
      .project(viewer.camera)

    return canvasPosition.set(
      (tmpCanvasVector.x + 1) * viewer.width / 2,
      (tmpCanvasVector.y + 1) * viewer.height / 2
    )
  }

  /**
   * get scene orientation
   * @param {Matrix4} optionalTarget - pre-allocated target matrix
   * @return {OrientationMatrix} scene orientation
   */
  getOrientation (optionalTarget) {
    const m = ensureMatrix4(optionalTarget)

    m.copy(this.viewer.rotationGroup.matrix)
    const z = -this.viewer.camera.position.z
    m.scale(tmpScaleVector.set(z, z, z))
    m.setPosition(this.viewer.translationGroup.position)

    return m
  }

  /**
   * set scene orientation
   * @param {OrientationMatrix|Array} orientation - scene orientation
   * @return {undefined}
   */
  orient (orientation) {
    ensureMatrix4(orientation).decompose(tmpP, tmpQ, tmpS)

    const v = this.viewer
    v.rotationGroup.setRotationFromQuaternion(tmpQ)
    v.translationGroup.position.copy(tmpP)
    v.camera.position.z = -tmpS.z
    v.updateZoom()
    this.changed()
  }

  /**
   * translate scene
   * @param  {Vector3|Array} vector - translation vector
   * @return {undefined}
   */
  translate (vector) {
    this.viewer.translationGroup.position
      .add(ensureVector3(vector))
    this.changed()
  }

  /**
   * center scene
   * @param  {Vector3|Array} position - center position
   * @return {undefined}
   */
  center (position) {
    this.viewer.translationGroup.position
      .copy(ensureVector3(position)).negate()
    this.changed()
  }

  /**
   * zoom scene
   * @param  {Number} delta - zoom change
   * @return {undefined}
   */
  zoom (delta) {
    this.distance(this.viewer.camera.position.z * (1 - delta))
  }

  /**
   * camera distance
   * @param  {Number} z - distance
   * @return {undefined}
   */
  distance (z) {
    this.viewer.camera.position.z = z
    this.viewer.updateZoom()
    this.changed()
  }

  /**
   * spin scene on axis
   * @param  {Vector3|Array} axis - rotation axis
   * @param  {Number} angle - amount to spin
   * @return {undefined}
   */
  spin (axis, angle) {
    tmpRotateMatrix.getInverse(this.viewer.rotationGroup.matrix)
    tmpRotateVector
      .copy(ensureVector3(axis)).applyMatrix4(tmpRotateMatrix)

    this.viewer.rotationGroup.rotateOnAxis(tmpRotateVector, angle)
    this.changed()
  }

  /**
   * rotate scene
   * @param  {Quaternion|Array} quaternion - rotation quaternion
   * @return {undefined}
   */
  rotate (quaternion) {
    this.viewer.rotationGroup
      .setRotationFromQuaternion(ensureQuaternion(quaternion))
    this.changed()
  }

  /**
   * align scene to basis matrix
   * @param  {Matrix4|Array} basis - basis matrix
   * @return {undefined}
   */
  align (basis) {
    tmpAlignMatrix.getInverse(ensureMatrix4(basis))

    this.viewer.rotationGroup.setRotationFromMatrix(tmpAlignMatrix)
    this.changed()
  }

  /**
   * apply rotation matrix to scene
   * @param  {Matrix4|Array} matrix - rotation matrix
   * @return {undefined}
   */
  applyMatrix (matrix) {
    this.viewer.rotationGroup.applyMatrix(ensureMatrix4(matrix))
    this.changed()
  }
}

export default ViewerControls
