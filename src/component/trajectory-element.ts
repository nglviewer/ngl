/**
 * @file Trajectory Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Signal } from 'signals'

import Element, { ElementSignals, ElementDefaultParameters } from './element'
import Stage from '../stage/stage'
import Trajectory, { TrajectoryParameters } from '../trajectory/trajectory'
import TrajectoryPlayer, {
  TrajectoryPlayerDirection, TrajectoryPlayerMode, TrajectoryPlayerInterpolateType
} from '../trajectory/trajectory-player'

/**
 * Trajectory component parameter object.
 * @typedef {Object} TrajectoryComponentParameters - component parameters
 *
 * @property {String} name - component name
 * @property {Integer} initialFrame - initial frame the trajectory is set to
 * @property {Integer} defaultStep - default step size to be used by trajectory players
 * @property {Integer} defaultTimeout - default timeout to be used by trajectory players
 * @property {String} defaultInterpolateType - one of "" (empty string), "linear" or "spline"
 * @property {Integer} defaultInterpolateStep - window size used for interpolation
 * @property {String} defaultMode - either "loop" or "once"
 * @property {String} defaultDirection - either "forward" or "backward"
 */

export const TrajectoryElementDefaultParameters = Object.assign({
  defaultStep: 1,
  defaultTimeout: 50,
  defaultInterpolateType: '' as TrajectoryPlayerInterpolateType,
  defaultInterpolateStep: 5,
  defaultMode: 'loop' as TrajectoryPlayerMode,
  defaultDirection: 'forward' as TrajectoryPlayerDirection,
  initialFrame: 0
}, ElementDefaultParameters)
export type TrajectoryElementParameters = typeof TrajectoryElementDefaultParameters

export interface TrajectoryElementSignals extends ElementSignals {
  frameChanged: Signal  // on frame change
  playerChanged: Signal  // on player change
  countChanged: Signal  // when frame count is available
  parametersChanged: Signal  // on parameters change
}

/**
 * Component wrapping a {@link Trajectory} object
 */
class TrajectoryElement extends Element {
  signals: TrajectoryElementSignals
  parameters: TrajectoryElementParameters
  get defaultParameters () { return TrajectoryElementDefaultParameters }

  /**
   * @param {Stage} stage - stage object the component belongs to
   * @param {Trajectory} trajectory - the trajectory object
   * @param {TrajectoryComponentParameters} params - component parameters
   * @param {StructureComponent} parent - the parent structure
   */
  constructor (stage: Stage, readonly trajectory: Trajectory, params: Partial<TrajectoryElementParameters> = {}) {
    super(stage, Object.assign({ name: trajectory.name }, params))

    this.signals = Object.assign(this.signals, {
      frameChanged: new Signal(),
      playerChanged: new Signal(),
      countChanged: new Signal(),
      parametersChanged: new Signal()
    })

    // signals

    trajectory.signals.frameChanged.add((i: number) => {
      this.signals.frameChanged.dispatch(i)
    })

    trajectory.signals.playerChanged.add((player: TrajectoryPlayer) => {
      this.signals.playerChanged.dispatch(player)
    })

    trajectory.signals.countChanged.add((n: number) => {
      this.signals.countChanged.dispatch(n)
    })

    //

    if (params.initialFrame !== undefined) {
      this.setFrame(params.initialFrame)
    }
  }

  /**
   * Component type
   * @type {String}
   */
  get type () { return 'trajectory' }

  /**
   * Set the frame of the trajectory
   * @param {Integer} i - frame number
   * @return {undefined}
   */
  setFrame (i: number) {
    this.trajectory.setFrame(i)
  }

  /**
   * Set trajectory parameters
   * @param {TrajectoryParameters} params - trajectory parameters
   * @return {undefined}
   */
  setParameters (params: Partial<TrajectoryParameters> = {}) {
    this.trajectory.setParameters(params)
    this.signals.parametersChanged.dispatch(params)
  }

  dispose () {
    this.trajectory.dispose()
    super.dispose()
  }
}

export default TrajectoryElement
