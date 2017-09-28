/**
 * @file Trackball Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3, Matrix4, Quaternion } from '../../lib/three.es6.js'

import { defaults } from '../utils.js'
import { degToRad } from '../math/math-utils.js'

const tmpRotateXMatrix = new Matrix4()
const tmpRotateYMatrix = new Matrix4()
const tmpRotateMatrix = new Matrix4()
const tmpRotateVector = new Vector3()
const tmpRotateQuaternion = new Quaternion()
const tmpPanMatrix = new Matrix4()
const tmpPanVector = new Vector3()
const tmpAtomVector = new Vector3()

/**
 * Trackball controls
 */
class TrackballControls {
  constructor (stage, params) {
    const p = params || {}

    this.rotateSpeed = defaults(p.rotateSpeed, 2.0)
    this.zoomSpeed = defaults(p.zoomSpeed, 1.2)
    this.panSpeed = defaults(p.panSpeed, 1.0)

    this.stage = stage
    this.viewer = stage.viewer
    this.mouse = stage.mouseObserver
    this.controls = stage.viewerControls
  }

  get component () {
    return this.stage.transformComponent
  }

  get atom () {
    return this.stage.transformAtom
  }

  _setPanVector (x, y, z) {
    let scaleFactor
    const camera = this.viewer.camera

    z = -z || 0
    z += camera.position.z

    if (camera.type === 'OrthographicCamera') {
      scaleFactor = 1 / camera.zoom
    } else {
      const fov = degToRad(camera.fov)
      const unitHeight = -2.0 * z * Math.tan(fov / 2)
      scaleFactor = unitHeight / this.viewer.height
    }

    tmpPanVector.set(x, y, 0)
    tmpPanVector.multiplyScalar(this.panSpeed * scaleFactor)
  }

  _getRotateXY (x, y) {
    return [
      this.rotateSpeed * -x * 0.01,
      this.rotateSpeed * y * 0.01
    ]
  }

  _transformPanVector () {
    tmpPanMatrix.extractRotation(this.component.transform)
    tmpPanMatrix.premultiply(this.viewer.rotationGroup.matrix)
    tmpPanMatrix.getInverse(tmpPanMatrix)
    tmpPanVector.applyMatrix4(tmpPanMatrix)
  }

  zoom (delta) {
    this.controls.zoom(this.zoomSpeed * delta * 0.02)
  }

  pan (x, y) {
    this._setPanVector(x, y)

    tmpPanMatrix.getInverse(this.viewer.rotationGroup.matrix)
    tmpPanVector.applyMatrix4(tmpPanMatrix)
    this.controls.translate(tmpPanVector)
  }

  panComponent (x, y) {
    if (!this.component) return

    this._setPanVector(x, y)
    this._transformPanVector()

    this.component.position.add(tmpPanVector)
    this.component.updateMatrix()
  }

  panAtom (x, y) {
    if (!this.atom || !this.component) return

    this.atom.positionToVector3(tmpAtomVector)
    tmpAtomVector.add(this.viewer.translationGroup.position)
    tmpAtomVector.applyMatrix4(this.viewer.rotationGroup.matrix)

    this._setPanVector(x, y, tmpAtomVector.z)
    this._transformPanVector()

    this.atom.positionAdd(tmpPanVector)
    this.component.updateRepresentations({ 'position': true })
  }

  rotate (x, y) {
    const [ dx, dy ] = this._getRotateXY(x, y)

    tmpRotateXMatrix.makeRotationX(dy)
    tmpRotateYMatrix.makeRotationY(dx)
    tmpRotateXMatrix.multiply(tmpRotateYMatrix)
    this.controls.applyMatrix(tmpRotateXMatrix)
  }

  rotateComponent (x, y) {
    if (!this.component) return

    const [ dx, dy ] = this._getRotateXY(x, y)

    tmpRotateMatrix.extractRotation(this.component.transform)
    tmpRotateMatrix.premultiply(this.viewer.rotationGroup.matrix)
    tmpRotateMatrix.getInverse(tmpRotateMatrix)
    tmpRotateVector.set(1, 0, 0)
    tmpRotateVector.applyMatrix4(tmpRotateMatrix)
    tmpRotateXMatrix.makeRotationAxis(tmpRotateVector, dy)
    tmpRotateVector.set(0, 1, 0)
    tmpRotateVector.applyMatrix4(tmpRotateMatrix)
    tmpRotateYMatrix.makeRotationAxis(tmpRotateVector, dx)
    tmpRotateXMatrix.multiply(tmpRotateYMatrix)
    tmpRotateQuaternion.setFromRotationMatrix(tmpRotateXMatrix)
    this.component.quaternion.premultiply(tmpRotateQuaternion)
    this.component.updateMatrix()
  }
}

export default TrackballControls
