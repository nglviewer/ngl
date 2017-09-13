/**
 * @file Animation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3, Quaternion } from 'three'

import { defaults, ensureVector3, ensureQuaternion } from '../utils'
import { lerp, smoothstep } from '../math/math-utils'
import ViewerControls from '../controls/viewer-controls'
import Stats from '../viewer/stats'

/**
 * Animation. Base animation class.
 * @interface
 */
abstract class Animation {
  duration: number
  controls: ViewerControls

  alpha: number
  startTime: number

  pausedTime = -1
  elapsedDuration = 0
  pausedDuration = 0
  ignoreGlobalToggle = false

  private _paused = false
  private _resolveList: Function[] = []
  private _hold: boolean

  constructor (duration: number|undefined, controls: ViewerControls, ...args: any[]) {
    this.duration = defaults(duration, 1000)
    this.controls = controls

    this.startTime = window.performance.now()

    this._init(...args)
  }

  /**
   * True when animation has finished
   */
  get done () {
    return this.alpha === 1
  }

  /**
   * True when animation is paused
   */
  get paused () {
    return this._paused
  }

  /**
   * init animation
   */
  abstract _init (...args: any[]): void

  /**
   * called on every tick
   */
  abstract _tick (stats?: Stats): void

  tick (stats: Stats) {
    if (this._paused) return

    this.elapsedDuration = stats.currentTime - this.startTime - this.pausedDuration

    if (this.duration === 0) {
      this.alpha = 1
    } else {
      this.alpha = smoothstep(0, 1, this.elapsedDuration / this.duration)
    }

    this._tick(stats)

    if (this.done) {
      this._resolveList.forEach(resolve => resolve())
    }

    return this.done
  }

  /**
   * Pause animation
   * @param {boolean} [hold] - put animation on a hold which
   *                           must be release before it can be resumed
   */
  pause (hold?: boolean) {
    if (hold) this._hold = true

    if (this.pausedTime === -1) {
      this.pausedTime = window.performance.now()
    }
    this._paused = true
  }

  /**
   * Resume animation
   * @param {Boolean} [releaseHold] - release a hold on the animation
   */
  resume (releaseHold?: boolean) {
    if (!releaseHold && this._hold) return

    this.pausedDuration += window.performance.now() - this.pausedTime
    this._paused = false
    this._hold = false
    this.pausedTime = -1
  }

  /**
   * Toggle animation
   */
  toggle () {
    if (this._paused) {
      this.resume()
    } else {
      this.pause()
    }
  }

  /**
   * Promise-like interface
   */
  then (callback: Function) {
    let p: Promise<any>

    if (this.done) {
      p = Promise.resolve()
    } else {
      p = new Promise(resolve => this._resolveList.push(resolve))
    }

    return p.then(callback as any)
  }
}

export default Animation

/**
 * Spin animation. Spin around an axis.
 */
export class SpinAnimation extends Animation {
  axis: Vector3
  angle: number

  constructor (duration: number|undefined, controls: ViewerControls, ...args: any[]) {
    super(defaults(duration, Infinity), controls, ...args)
  }

  _init (axis: number[]|Vector3, angle: number) {
    if (Array.isArray(axis)) {
      this.axis = new Vector3().fromArray(axis)
    } else {
      this.axis = defaults(axis, new Vector3(0, 1, 0))
    }
    this.angle = defaults(angle, 0.01)
  }

  _tick (stats: Stats) {
    if (!this.axis || !this.angle) return

    this.controls.spin(
      this.axis, this.angle * stats.lastDuration / 16
    )
  }
}

/**
 * Rock animation. Rock around an axis.
 */
export class RockAnimation extends Animation {
  axis: Vector3
  angleStep: number
  angleEnd: number
  angleSum = 0
  direction = 1

  constructor (duration: number|undefined, controls: ViewerControls, ...args: any[]) {
    super(defaults(duration, Infinity), controls, ...args)
  }

  _init (axis: number[]|Vector3, angleStep: number, angleEnd: number) {
    if (Array.isArray(axis)) {
      this.axis = new Vector3().fromArray(axis)
    } else {
      this.axis = defaults(axis, new Vector3(0, 1, 0))
    }
    this.angleStep = defaults(angleStep, 0.01)
    this.angleEnd = defaults(angleEnd, 0.2)
  }

  _tick (stats: Stats) {
    if (!this.axis || !this.angleStep || !this.angleEnd) return

    const alpha = smoothstep(
      0, 1, Math.abs(this.angleSum) / this.angleEnd
    )
    const angle = this.angleStep * this.direction * (1.1 - alpha)

    this.controls.spin(
      this.axis, angle * stats.lastDuration / 16
    )

    this.angleSum += this.angleStep

    if (this.angleSum >= this.angleEnd) {
      this.direction *= -1
      this.angleSum = -this.angleEnd
    }
  }
}

/**
 * Move animation. Move from one position to another.
 */
export class MoveAnimation extends Animation {
  moveFrom: Vector3
  moveTo: Vector3

  _init (moveFrom: number[]|Vector3, moveTo: number[]|Vector3) {
    this.moveFrom = ensureVector3(defaults(moveFrom, new Vector3()))
    this.moveTo = ensureVector3(defaults(moveTo, new Vector3()))
  }

  _tick (/* stats */) {
    this.controls.position.lerpVectors(
      this.moveFrom, this.moveTo, this.alpha
    ).negate()
    this.controls.changed()
  }
}

/**
 * Zoom animation. Gradually change the zoom level.
 */
export class ZoomAnimation extends Animation {
  zoomFrom: number
  zoomTo: number

  _init (zoomFrom: number, zoomTo: number) {
    this.zoomFrom = zoomFrom
    this.zoomTo = zoomTo
  }

  _tick () {
    this.controls.distance(lerp(this.zoomFrom, this.zoomTo, this.alpha))
  }
}

/**
 * Rotate animation. Rotate from one orientation to another.
 */
export class RotateAnimation extends Animation {
  rotateFrom: Quaternion
  rotateTo: Quaternion

  private _currentRotation = new Quaternion()

  _init (rotateFrom: number[]|Quaternion, rotateTo: number[]|Quaternion) {
    this.rotateFrom = ensureQuaternion(rotateFrom)
    this.rotateTo = ensureQuaternion(rotateTo)

    this._currentRotation = new Quaternion()
  }

  _tick () {
    this._currentRotation
      .copy(this.rotateFrom)
      .slerp(this.rotateTo, this.alpha)

    this.controls.rotate(this._currentRotation)
  }
}

/**
 * Value animation. Call callback with interpolated value.
 */
export class ValueAnimation extends Animation {
  valueFrom: number
  valueTo: number
  callback: Function

  _init (valueFrom: number, valueTo: number, callback: Function) {
    this.valueFrom = valueFrom
    this.valueTo = valueTo

    this.callback = callback
  }

  _tick (/* stats */) {
    this.callback(lerp(this.valueFrom, this.valueTo, this.alpha))
  }
}

/**
 * Timeout animation. Call callback after duration.
 */
export class TimeoutAnimation extends Animation {
  callback: Function

  _init (callback: Function) {
    this.callback = callback
  }

  _tick () {
    if (this.alpha === 1) this.callback()
  }
}

/**
 * Animation list.
 */
export class AnimationList {
  _list: Animation[]
  _resolveList: Function[] = []

  constructor (list: Animation[] = []) {
    this._list = list
  }

  /**
   * True when all animations have finished
   */
  get done () {
    return this._list.every(animation => {
      return animation.done
    })
  }

  /**
   * Promise-like interface
   */
  then (callback: Function) {
    let p: Promise<any>

    if (this.done) {
      p = Promise.resolve()
    } else {
      p = new Promise(resolve => {
        this._resolveList.push(resolve)
        this._list.forEach(animation => {
          animation.then(() => {
            this._resolveList.forEach(callback => {
              callback()
            })
            this._resolveList.length = 0
          })
        })
      })
    }

    return p.then(callback as any)
  }
}
