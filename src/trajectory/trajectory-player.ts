/**
 * @file Trajectory Player
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Signal } from 'signals'

import { defaults, createParams, updateParams } from '../utils'
import Trajectory from './trajectory'

export type TrajectoryPlayerInterpolateType = ''|'linear'|'spline'
export type TrajectoryPlayerMode = 'loop'|'once'
export type TrajectoryPlayerDirection = 'forward'|'backward'|'bounce'

export const TrajectoryPlayerDefaultParameters = {
  step: 1,  // how many frames to advance when playing
  timeout: 50,  // how many milliseconds to wait between playing frames
  start: 0,  // first frame to play
  end: 0,  // last frame to play
  interpolateType: '' as TrajectoryPlayerInterpolateType,
  interpolateStep: 5,  // window size used for interpolation
  mode: 'loop' as TrajectoryPlayerMode,
  direction: 'forward' as TrajectoryPlayerDirection
}
export type TrajectoryPlayerParameters = typeof TrajectoryPlayerDefaultParameters

export interface TrajectoryPlayerSignals {
  startedRunning: Signal
  haltedRunning: Signal
}

/**
 * Trajectory player for animating coordinate frames
 * @example
 * var player = new TrajectoryPlayer(trajectory, {step: 1, timeout: 50});
 * player.play();
 */
class TrajectoryPlayer {
  signals: TrajectoryPlayerSignals = {
    startedRunning: new Signal(),
    haltedRunning: new Signal()
  }

  parameters: TrajectoryPlayerParameters
  traj: Trajectory

  private _run = false
  private _previousTime = 0
  private _currentTime = 0
  private _currentStep = 1
  private _currentFrame: number|[number, number, number, number]
  private _direction: TrajectoryPlayerDirection

  /**
   * make trajectory player
   * @param {Trajectory} traj - the trajectory
   * @param {TrajectoryPlayerParameters} [params] - parameter object
   */
  constructor (traj: Trajectory, params: Partial<TrajectoryPlayerParameters> = {}) {
    traj.signals.playerChanged.add((player: TrajectoryPlayer) => {
      if (player !== this) {
        this.pause()
      }
    }, this)

    const n = defaults(traj.frameCount, 1)

    this.traj = traj
    this.parameters = createParams(params, TrajectoryPlayerDefaultParameters)
    this.parameters.end = Math.min(defaults(params.end, n - 1), n - 1)
    this.parameters.step = defaults(params.step, Math.ceil((n + 1) / 100))

    this._currentFrame = this.parameters.start
    this._direction = this.parameters.direction === 'bounce' ? 'forward' : this.parameters.direction

    traj.signals.countChanged.add((n: number) => {
      this.parameters.end = Math.min(defaults(this.parameters.end, n - 1), n - 1)
    }, this)

    this._animate = this._animate.bind(this)
  }

  get isRunning () { return this._run }

  /**
   * set player parameters
   * @param {TrajectoryPlayerParameters} [params] - parameter object
   */
  setParameters (params: Partial<TrajectoryPlayerParameters> = {}) {
    updateParams(this.parameters, params)

    if (params.direction !== undefined && this.parameters.direction !== 'bounce') {
      this._direction = this.parameters.direction
    }
  }

  _animate () {
    if (!this._run) return

    this._currentTime = window.performance.now()
    const dt = this._currentTime - this._previousTime
    const step = this.parameters.interpolateType ? this.parameters.interpolateStep : 1
    const timeout = this.parameters.timeout / step
    const traj = this.traj

    if (traj && traj.frameCount && !traj.inProgress && dt >= timeout) {
      if (this.parameters.interpolateType) {
        if (this._currentStep > this.parameters.interpolateStep) {
          this._currentStep = 1
        }
        if (this._currentStep === 1) {
          this._currentFrame = this._nextInterpolated()
        }
        if (traj.hasFrame(this._currentFrame)) {
          this._currentStep += 1
          const t = this._currentStep / (this.parameters.interpolateStep + 1)
          const [i, ip, ipp, ippp] = this._currentFrame as [number, number, number, number]
          traj.setFrameInterpolated(
            i, ip, ipp, ippp, t, this.parameters.interpolateType
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
    const p = this.parameters
    let i

    if (this._direction === 'forward') {
      i = this.traj.currentFrame + p.step
    } else {
      i = this.traj.currentFrame - p.step
    }

    if (i > p.end || i < p.start) {
      if (p.direction === 'bounce') {
        if (this._direction === 'forward') {
          this._direction = 'backward'
        } else {
          this._direction = 'forward'
        }
      }

      if (p.mode === 'once') {
        this.pause()

        if (p.direction === 'forward') {
          i = p.end
        } else if (p.direction === 'backward') {
          i = p.start
        } else {
          if (this._direction === 'forward') {
            i = p.start
          } else {
            i = p.end
          }
        }
      } else {
        if (this._direction === 'forward') {
          i = p.start
          if (p.interpolateType) {
            i = Math.min(p.end, i + p.step)
          }
        } else {
          i = p.end
          if (p.interpolateType) {
            i = Math.max(p.start, i - p.step)
          }
        }
      }
    }

    return i
  }

  _nextInterpolated () {
    const p = this.parameters
    const i = this._next()
    let ip, ipp, ippp

    if (this._direction === 'forward') {
      ip = Math.max(p.start, i - p.step)
      ipp = Math.max(p.start, i - 2 * p.step)
      ippp = Math.max(p.start, i - 3 * p.step)
    } else {
      ip = Math.min(p.end, i + p.step)
      ipp = Math.min(p.end, i + 2 * p.step)
      ippp = Math.min(p.end, i + 3 * p.step)
    }

    return [i, ip, ipp, ippp] as [number, number, number, number]
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

      const p = this.parameters
      const frame = this.traj.currentFrame

      // snap to the grid implied by this.step division and multiplication
      // thus minimizing cache misses
      let i = Math.ceil(frame / p.step) * p.step
      // wrap when restarting from the limit (i.e. end or start)
      if (p.direction === 'forward' && frame >= p.end) {
        i = p.start
      } else if (p.direction === 'backward' && frame <= p.start) {
        i = p.end
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
    this.traj.setFrame(this.parameters.start)
  }
}

export default TrajectoryPlayer
