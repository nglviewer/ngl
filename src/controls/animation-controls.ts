/**
 * @file Animation Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3, Quaternion, Matrix4 } from 'three'

import { ensureMatrix4 } from '../utils'
import Animation, {
    SpinAnimation, RockAnimation, MoveAnimation, ZoomAnimation,
    RotateAnimation, ValueAnimation, TimeoutAnimation, AnimationList
} from '../animation/animation'
import Stage from '../stage/stage'
import Component from '../component/component'
import Viewer from '../viewer/viewer'
import Stats from '../viewer/stats'
import ViewerControls from './viewer-controls'

/**
 * Animation controls
 */
class AnimationControls {
  viewer: Viewer
  controls: ViewerControls

  animationList: Animation[] = []
  finishedList: Animation[] = []

  /**
   * Create animation controls
   * @param  {Stage} stage - the stage object
   */
  constructor (readonly stage: Stage) {
    this.viewer = stage.viewer
    this.controls = stage.viewerControls
  }

  /**
   * True when all animations are paused
   * @type {Boolean}
   */
  get paused () {
    return this.animationList.every((animation: Animation) => animation.paused)
  }

  /**
   * Add an animation
   */
  add (animation: Animation) {
    if (animation.duration === 0) {
      animation.tick(this.viewer.stats)
    } else {
      this.animationList.push(animation)
    }

    return animation
  }

  /**
   * Remove an animation
   */
  remove (animation: Animation) {
    const list = this.animationList
    const index = list.indexOf(animation)

    if (index > -1) {
      list.splice(index, 1)
    }
  }

  /**
   * Run all animations
   */
  run (stats: Stats) {
    const finishedList = this.finishedList
    const animationList = this.animationList

    const n = animationList.length
    for (let i = 0; i < n; ++i) {
      const animation = animationList[ i ]
      // tick returns true when finished
      if (animation.tick(stats)) {
        finishedList.push(animation)
      }
    }

    const m = finishedList.length
    if (m) {
      for (let j = 0; j < m; ++j) {
        this.remove(finishedList[ j ])
      }
      finishedList.length = 0
    }
  }

  /**
   * Add a spin animation
   * @param  {Vector3} axis - axis to spin around
   * @param  {Number} angle - amount to spin per frame, radians
   * @param  {Number} duration - animation time in milliseconds
   * @return {SpinAnimation} the animation
   */
  spin (axis: Vector3|number[], angle?: number, duration?: number) {
    return this.add(
      new SpinAnimation(duration, this.controls, axis, angle)
    )
  }

  /**
   * Add a rock animation
   * @param  {Vector3} axis - axis to rock around
   * @param  {Number} angle - amount to spin per frame, radians
   * @param  {Number} end - maximum extend of motion, radians
   * @param  {Number} duration - animation time in milliseconds
   * @return {SpinAnimation} the animation
   */
  rock (axis: Vector3|number[], angle?: number, end?: number, duration?: number) {
    return this.add(
      new RockAnimation(duration, this.controls, axis, angle, end)
    )
  }

  /**
   * Add a rotate animation
   * @param  {Quaternion} rotateTo - target rotation
   * @param  {Number} duration - animation time in milliseconds
   * @return {RotateAnimation} the animation
   */
  rotate (rotateTo: Quaternion|number[], duration?: number) {
    const rotateFrom = this.viewer.rotationGroup.quaternion.clone()

    return this.add(
      new RotateAnimation(duration, this.controls, rotateFrom, rotateTo)
    )
  }

  /**
   * Add a move animation
   * @param  {Vector3} moveTo - target position
   * @param  {Number} duration - animation time in milliseconds
   * @return {MoveAnimation} the animation
   */
  move (moveTo: Vector3|number[], duration?: number) {
    const moveFrom = this.controls.position.clone().negate()

    return this.add(
      new MoveAnimation(duration, this.controls, moveFrom, moveTo)
    )
  }

  /**
   * Add a zoom animation
   * @param  {Number} zoomTo - target distance
   * @param  {Number} duration - animation time in milliseconds
   * @return {ZoomAnimation} the animation
   */
  zoom (zoomTo: number, duration?: number) {
    const zoomFrom = this.viewer.camera.position.z

    return this.add(
      new ZoomAnimation(duration, this.controls, zoomFrom, zoomTo)
    )
  }

  /**
   * Add a zoom and a move animation
   * @param  {Vector3} moveTo - target position
   * @param  {Number} zoomTo - target distance
   * @param  {Number} duration - animation time in milliseconds
   * @return {Array} the animations
   */
  zoomMove (moveTo: Vector3, zoomTo: number, duration?: number) {
    return new AnimationList([
      this.move(moveTo, duration),
      this.zoom(zoomTo, duration)
    ])
  }

  /**
   * Add an orient animation
   * @param  {OrientationMatrix|Array} orientTo - target orientation
   * @param  {Number} duration - animation time in milliseconds
   * @return {Array} the animations
   */
  orient (orientTo: Matrix4|number[], duration?: number) {
    const p = new Vector3()
    const q = new Quaternion()
    const s = new Vector3()

    ensureMatrix4(orientTo).decompose(p, q, s)

    return new AnimationList([
      this.move(p.negate(), duration),
      this.rotate(q, duration),
      this.zoom(-s.x, duration)
    ])
  }

  /**
   * Add a value animation
   * @param  {Number} valueFrom - start value
   * @param  {Number} valueTo - target value
   * @param  {Function} callback - called on every tick
   * @param  {Number} duration - animation time in milliseconds
   * @return {ValueAnimation} the animation
   */
  value (valueFrom: number, valueTo: number, callback: Function, duration?: number) {
    return this.add(
      new ValueAnimation(duration, this.controls, valueFrom, valueTo, callback)
    )
  }

  /**
   * Add a timeout animation
   * @param  {Function} callback - called after duration
   * @param  {Number} duration - timeout in milliseconds
   * @return {TimeoutAnimation} the animation
   */
  timeout (callback: Function, duration?: number) {
    return this.add(
      new TimeoutAnimation(duration, this.controls, callback)
    )
  }

  /**
   * Add a component spin animation
   * @param  {Component} component - object to move
   * @param  {Vector3} axis - axis to spin around
   * @param  {Number} angle - amount to spin per frame, radians
   * @param  {Number} duration - animation time in milliseconds
   * @return {SpinAnimation} the animation
   */
  spinComponent (component: Component, axis?: Vector3|number[], angle?: number, duration?: number) {
    return this.add(
      // TODO
      new SpinAnimation(duration, component.controls as any, axis, angle)
    )
  }

  /**
   * Add a component rock animation
   * @param  {Component} component - object to move
   * @param  {Vector3} axis - axis to rock around
   * @param  {Number} angle - amount to spin per frame, radians
   * @param  {Number} end - maximum extend of motion, radians
   * @param  {Number} duration - animation time in milliseconds
   * @return {SpinAnimation} the animation
   */
  rockComponent (component: Component, axis: Vector3|number[], angle?: number, end?: number, duration?: number) {
    return this.add(
       // TODO
      new RockAnimation(duration, component.controls as any, axis, angle, end)
    )
  }

  /**
   * Add a component move animation
   * @param  {Component} component - object to move
   * @param  {Vector3} moveTo - target position
   * @param  {Number} duration - animation time in milliseconds
   * @return {MoveAnimation} the animation
   */
  moveComponent (component: Component, moveTo: Vector3|number[], duration?: number) {
    const moveFrom = component.controls.position.clone().negate()

    return this.add(
      // TODO
      new MoveAnimation(duration, component.controls as any, moveFrom, moveTo)
    )
  }

  /**
   * Pause all animations
   * @return {undefined}
   */
  pause () {
    this.animationList.forEach(animation => animation.pause())
  }

  /**
   * Resume all animations
   * @return {undefined}
   */
  resume () {
    this.animationList.forEach(animation => animation.resume())
  }

  /**
   * Toggle all animations
   * @return {undefined}
   */
  toggle () {
    if (this.paused) {
      this.resume()
    } else {
      this.pause()
    }
  }

  /**
   * Clear all animations
   * @return {undefined}
   */
  clear () {
    this.animationList.length = 0
  }

  dispose () {
    this.clear()
  }
}

export default AnimationControls
