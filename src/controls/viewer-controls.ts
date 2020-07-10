/**
 * @file Viewer Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector2, Vector3, Matrix4, Quaternion, OrthographicCamera } from 'three'
import * as signalsWrapper from 'signals'

import {
  ensureVector2, ensureVector3, ensureMatrix4, ensureQuaternion
} from '../utils'
import { degToRad } from '../math/math-utils'
import Stage from '../stage/stage'
import Viewer from '../viewer/viewer'

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
  signals = {
    changed: new signalsWrapper.Signal()
  }

  viewer: Viewer

  /**
   * @param  {Stage} stage - the stage object
   */
  constructor (readonly stage: Stage) {
    this.viewer = stage.viewer
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

  getPositionOnCanvas (position: Vector3, optionalTarget?: Vector2) {
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

  getCanvasScaleFactor (z = 0) {
    const camera = this.viewer.camera
    if (camera instanceof OrthographicCamera) {
      return 1 / camera.zoom
    } else {
      z = Math.abs(z)
      z += this.getCameraDistance()
      const fov = degToRad(camera.fov)
      const unitHeight = 2.0 * z * Math.tan(fov / 2)
      return unitHeight / this.viewer.height
    }
  }

  /**
   * get scene orientation
   * @param {Matrix4} optionalTarget - pre-allocated target matrix
   * @return {OrientationMatrix} scene orientation
   */
  getOrientation (optionalTarget?: Matrix4) {
    const m = ensureMatrix4(optionalTarget)

    m.copy(this.viewer.rotationGroup.matrix)
    const z = this.getCameraDistance()
    m.scale(tmpScaleVector.set(z, z, z))
    m.setPosition(this.viewer.translationGroup.position)

    return m
  }

  /**
   * set scene orientation
   * @param {OrientationMatrix|Array} orientation - scene orientation
   * @return {undefined}
   */
  orient (orientation?: Matrix4) {
    ensureMatrix4(orientation).decompose(tmpP, tmpQ, tmpS)

    const v = this.viewer
    v.rotationGroup.setRotationFromQuaternion(tmpQ)
    v.translationGroup.position.copy(tmpP)
    v.cameraDistance = tmpS.z
    v.updateZoom()
    this.changed()
  }

  /**
   * translate scene
   * @param  {Vector3|Array} vector - translation vector
   * @return {undefined}
   */
  translate (vector: Vector3|number[]) {
    this.viewer.translationGroup.position
      .add(ensureVector3(vector))
    this.changed()
  }

  /**
   * center scene
   * @param  {Vector3|Array} position - center position
   * @return {undefined}
   */
  center (position: Vector3|number[]) {
    this.viewer.translationGroup.position
      .copy(ensureVector3(position)).negate()
    this.changed()
  }

  /**
   * "zoom" scene by moving camera closer to origin
   * @param  {Number} delta - zoom change
   * @return {undefined}
   */
  zoom (delta: number) {
    this.distance(this.getCameraDistance() * (1 - delta))
  }

  /**
   * get camera distance
   */
  getCameraDistance(): number {
    return this.viewer.cameraDistance
  }

  /**
   * camera distance
   * @param  {Number} z - distance
   * @return {undefined}
   */
  distance (distance: number) {
    // Math.abs because distance used to be "z", normally negative.
    // Math.max to prevent us from getting _too_ close.
    this.viewer.cameraDistance = Math.max(Math.abs(distance), 0.2)
    this.viewer.updateZoom()
    this.changed()
  }

  /**
   * spin scene on axis
   * @param  {Vector3|Array} axis - rotation axis
   * @param  {Number} angle - amount to spin
   * @return {undefined}
   */
  spin (axis: Vector3|number[], angle: number) {
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
  rotate (quaternion: Quaternion|number[]) {
    this.viewer.rotationGroup
      .setRotationFromQuaternion(ensureQuaternion(quaternion))
    this.changed()
  }

  /**
   * align scene to basis matrix
   * @param  {Matrix4|Array} basis - basis matrix
   * @return {undefined}
   */
  align (basis: Matrix4|number[]) {
    tmpAlignMatrix.getInverse(ensureMatrix4(basis))

    this.viewer.rotationGroup.setRotationFromMatrix(tmpAlignMatrix)
    this.changed()
  }

  /**
   * apply rotation matrix to scene
   * @param  {Matrix4|Array} matrix - rotation matrix
   * @return {undefined}
   */
  applyMatrix (matrix: Matrix4|number[]) {
    this.viewer.rotationGroup.applyMatrix4(ensureMatrix4(matrix))
    this.changed()
  }
}

export default ViewerControls
