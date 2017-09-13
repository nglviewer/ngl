/**
 * @file Trajectory Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3 } from 'three'
import { Signal } from 'signals'

import { defaults } from '../utils'
import Component, { ComponentSignals, ComponentDefaultParameters } from './component'
import Stage from '../stage/stage'
import Trajectory, { TrajectoryParameters } from '../trajectory/trajectory'
import TrajectoryPlayer, {
  TrajectoryPlayerDirection, TrajectoryPlayerMode, TrajectoryPlayerInterpolateType
} from '../trajectory/trajectory-player'

type TrajectoryRepresentationType = (
  'trajectory'
)

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

export const TrajectoryComponentDefaultParameters = Object.assign({
  defaultStep: 1,
  defaultTimeout: 50,
  defaultInterpolateType: '' as TrajectoryPlayerInterpolateType,
  defaultInterpolateStep: 5,
  defaultMode: 'loop' as TrajectoryPlayerMode,
  defaultDirection: 'forward' as TrajectoryPlayerDirection,
  initialFrame: 0
}, ComponentDefaultParameters)
export type TrajectoryComponentParameters = typeof TrajectoryComponentDefaultParameters

interface TrajectoryComponentSignals extends ComponentSignals {
  frameChanged: Signal  // on frame change
  playerChanged: Signal  // on player change
  countChanged: Signal  // when frame count is available
  parametersChanged: Signal  // on parameters change
}

/**
 * Component wrapping a {@link Trajectory} object
 */
class TrajectoryComponent extends Component {
  signals: TrajectoryComponentSignals
  parameters: TrajectoryComponentParameters
  get defaultParameters () { return TrajectoryComponentDefaultParameters }

  trajectory: Trajectory

  /**
   * @param {Stage} stage - stage object the component belongs to
   * @param {Trajectory} trajectory - the trajectory object
   * @param {TrajectoryComponentParameters} params - component parameters
   * @param {StructureComponent} parent - the parent structure
   */
  constructor (stage: Stage, trajectory: Trajectory, params: Partial<TrajectoryComponentParameters> = {}) {
    super(stage, Object.assign({
      name: defaults(params.name, trajectory.name)
    }, params))

    this.signals = Object.assign(this.signals, {
      frameChanged: new Signal(),
      playerChanged: new Signal(),
      countChanged: new Signal(),
      parametersChanged: new Signal()
    })

    this.trajectory = trajectory
    this.status = 'loaded'

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
   * Add trajectory representation
   * @param {String} type - representation type, currently only: "trajectory"
   * @param {RepresentationParameters} params - parameters
   * @return {RepresentationComponent} the added representation component
   */
  addRepresentation (type: TrajectoryRepresentationType, params: { [k: string]: any } = {}) {
    return super.addRepresentation(type, this.trajectory, params)
  }

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

  getCenter () {
    return new Vector3()
  }
}

export default TrajectoryComponent
