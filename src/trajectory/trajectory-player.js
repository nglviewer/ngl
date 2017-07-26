/**
 * @file Trajectory Player
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Signal from '../../lib/signals.es6.js'

import { defaults } from '../utils.js'

/**
 * Trajectory player parameter object.
 * @typedef {Object} TrajectoryPlayerParameters - parameters
 *
 * @property {Integer} step - how many frames to skip when playing
 * @property {Integer} timeout - how many milliseconds to wait between playing frames
 * @property {Integer} start - first frame to play
 * @property {Integer} end - last frame to play
 * @property {String} interpolateType - one of "" (empty string), "linear" or "spline"
 * @property {Integer} interpolateStep - window size used for interpolation
 * @property {String} mode - either "loop" or "once"
 * @property {String} direction - either "forward", "backward" or "bounce"
 */

/**
 * Trajectory player for animating coordinate frames
 * @example
 * var player = new TrajectoryPlayer(trajectory, {step: 1, timeout: 50});
 * player.play();
 */
class TrajectoryPlayer {
  /**
   * make trajectory player
   * @param {Trajectory} traj - the trajectory
   * @param {TrajectoryPlayerParameters} [params] - parameter object
   */
  constructor (traj, params) {
    this.signals = {
      startedRunning: new Signal(),
      haltedRunning: new Signal()
    }

    traj.signals.playerChanged.add(function (player) {
      if (player !== this) {
        this.pause()
      }
    }, this)

    const p = Object.assign({}, params)
    const n = defaults(traj.frameCount, 1)

    this.traj = traj
    this.start = defaults(p.start, 0)
    this.end = Math.min(defaults(p.end, n - 1), n - 1)

    this.step = defaults(p.step, Math.ceil((n + 1) / 100))
    this.timeout = defaults(p.timeout, 50)
    this.interpolateType = defaults(p.interpolateType, '')
    this.interpolateStep = defaults(p.interpolateStep, 5)
    this.mode = defaults(p.mode, 'loop')  // loop, once
    this.direction = defaults(p.direction, 'forward')  // forward, backward, bounce

    this._run = false
    this._previousTime = 0
    this._currentTime = 0
    this._currentStep = 1
    this._currentFrame = this.start
    this._direction = this.direction === 'bounce' ? 'forward' : this.direction

    traj.signals.countChanged.add(function (n) {
      this.end = Math.min(defaults(this.end, n - 1), n - 1)
    }, this)

    this._animate = this._animate.bind(this)
  }

  get isRunning () { return this._run }

  /**
   * set player parameters
   * @param {TrajectoryPlayerParameters} [params] - parameter object
   */
  setParameters (params) {
    const p = Object.assign({}, params)

    if (p.start !== undefined) this.start = p.start
    if (p.end !== undefined) this.end = p.end

    if (p.step !== undefined) this.step = p.step
    if (p.timeout !== undefined) this.timeout = p.timeout
    if (p.interpolateType !== undefined) this.interpolateType = p.interpolateType
    if (p.interpolateStep !== undefined) this.interpolateStep = p.interpolateStep
    if (p.mode !== undefined) this.mode = p.mode

    if (p.direction !== undefined) {
      this.direction = p.direction
      if (this.direction !== 'bounce') {
        this._direction = this.direction
      }
    }
  }

  _animate () {
    if (!this._run) return

    this._currentTime = window.performance.now()
    const dt = this._currentTime - this._previousTime
    const step = this.interpolateType ? this.interpolateStep : 1
    const timeout = this.timeout / step
    const traj = this.traj

    if (traj && traj.frameCount && !traj.inProgress && dt >= timeout) {
      if (this.interpolateType) {
        if (this._currentStep > this.interpolateStep) {
          this._currentStep = 1
        }
        if (this._currentStep === 1) {
          this._currentFrame = this._nextInterpolated()
        }
        if (traj.hasFrame(this._currentFrame)) {
          this._currentStep += 1
          const t = this._currentStep / (this.interpolateStep + 1)
          traj.setFrameInterpolated(
            ...this._currentFrame, t, this.interpolateType
          )
          this._previousTime = this._currentTime
        } else {
          traj.loadFrame(this._currentFrame)
        }
      } else {
        const i = this._next()
        if (traj.hasFrame(i)) {
          traj.setFrame(i)
          this._previousTime = this._currentTime
        } else {
          traj.loadFrame(i)
        }
      }
    }

    window.requestAnimationFrame(this._animate)
  }

  _next () {
    let i

    if (this._direction === 'forward') {
      i = this.traj.currentFrame + this.step
    } else {
      i = this.traj.currentFrame - this.step
    }

    if (i > this.end || i < this.start) {
      if (this.direction === 'bounce') {
        if (this._direction === 'forward') {
          this._direction = 'backward'
        } else {
          this._direction = 'forward'
        }
      }

      if (this.mode === 'once') {
        this.pause()

        if (this.direction === 'forward') {
          i = this.end
        } else if (this.direction === 'backward') {
          i = this.start
        } else {
          if (this._direction === 'forward') {
            i = this.start
          } else {
            i = this.end
          }
        }
      } else {
        if (this._direction === 'forward') {
          i = this.start
          if (this.interpolateType) {
            i = Math.min(this.end, i + this.step)
          }
        } else {
          i = this.end
          if (this.interpolateType) {
            i = Math.max(this.start, i - this.step)
          }
        }
      }
    }

    return i
  }

  _nextInterpolated () {
    const i = this._next()
    let ip, ipp, ippp

    if (this._direction === 'forward') {
      ip = Math.max(this.start, i - this.step)
      ipp = Math.max(this.start, i - 2 * this.step)
      ippp = Math.max(this.start, i - 3 * this.step)
    } else {
      ip = Math.min(this.end, i + this.step)
      ipp = Math.min(this.end, i + 2 * this.step)
      ippp = Math.min(this.end, i + 3 * this.step)
    }

    return [i, ip, ipp, ippp]
  }

  /**
   * toggle between playing and pausing the animation
   * @return {undefined}
   */
  toggle () {
    if (this._run) {
      this.pause()
    } else {
      this.play()
    }
  }

  /**
   * start the animation
   * @return {undefined}
   */
  play () {
    if (!this._run) {
      if (this.traj.player !== this) {
        this.traj.setPlayer(this)
      }
      this._currentStep = 1

      const frame = this.traj.currentFrame

      // snap to the grid implied by this.step division and multiplication
      // thus minimizing cache misses
      let i = Math.ceil(frame / this.step) * this.step
      // wrap when restarting from the limit (i.e. end or start)
      if (this.direction === 'forward' && frame >= this.end) {
        i = this.start
      } else if (this.direction === 'backward' && frame <= this.start) {
        i = this.end
      }

      this.traj.setFrame(i)

      this._run = true
      this._animate()
      this.signals.startedRunning.dispatch()
    }
  }

  /**
   * pause the animation
   * @return {undefined}
   */
  pause () {
    this._run = false
    this.signals.haltedRunning.dispatch()
  }

  /**
   * stop the animation (pause and go to start-frame)
   * @return {undefined}
   */
  stop () {
    this.pause()
    this.traj.setFrame(this.start)
  }
}

export default TrajectoryPlayer
