/**
 * @file Trajectory Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Signal from '../../lib/signals.es6.js'

import { defaults } from '../utils.js'
import Component from './component.js'

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

/**
 * Extends {@link ComponentSignals}
 *
 * @example
 * component.signals.representationAdded.add( function( representationComponent ){ ... } );
 *
 * @typedef {Object} TrajectoryComponentSignals
 * @property {Signal<RepresentationComponent>} frameChanged - on frame change
 * @property {Signal<RepresentationComponent>} playerChanged - on player change
 * @property {Signal<Integer>} countChanged - when frame count is available
 * @property {Signal<TrajectoryComponentParameters>} parametersChanged - on parameters change
 */

/**
 * Component wrapping a {@link Trajectory} object
 */
class TrajectoryComponent extends Component {
  /**
   * @param {Stage} stage - stage object the component belongs to
   * @param {Trajectory} trajectory - the trajectory object
   * @param {TrajectoryComponentParameters} params - component parameters
   * @param {StructureComponent} parent - the parent structure
   */
  constructor (stage, trajectory, params, parent) {
    const p = params || {}
    p.name = defaults(p.name, trajectory.name)

    super(stage, p)

    /**
     * Events emitted by the component
     * @type {TrajectoryComponentSignals}
     */
    this.signals = Object.assign(this.signals, {
      frameChanged: new Signal(),
      playerChanged: new Signal(),
      countChanged: new Signal(),
      parametersChanged: new Signal()
    })

    this.trajectory = trajectory
    this.parent = parent
    this.status = 'loaded'

    this.defaultStep = defaults(p.defaultStep, undefined)
    this.defaultTimeout = defaults(p.defaultTimeout, 50)
    this.defaultInterpolateType = defaults(p.defaultInterpolateType, '')
    this.defaultInterpolateStep = defaults(p.defaultInterpolateStep, 5)
    this.defaultMode = defaults(p.defaultMode, 'loop')
    this.defaultDirection = defaults(p.defaultDirection, 'forward')

    // signals

    trajectory.signals.frameChanged.add(i => {
      this.signals.frameChanged.dispatch(i)
    })

    trajectory.signals.playerChanged.add(player => {
      this.signals.playerChanged.dispatch(player)
    })

    trajectory.signals.countChanged.add(n => {
      this.signals.countChanged.dispatch(n)
    })

        //

    if (p.initialFrame !== undefined) {
      this.setFrame(p.initialFrame)
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
  addRepresentation (type, params) {
    return super.addRepresentation(type, this.trajectory, params)
  }

  /**
   * Set the frame of the trajectory
   * @param {Integer} i - frame number
   * @return {undefined}
   */
  setFrame (i) {
    this.trajectory.setFrame(i)
  }

  /**
   * Set trajectory parameters
   * @param {TrajectoryParameters} params - trajectory parameters
   * @return {undefined}
   */
  setParameters (params) {
    this.trajectory.setParameters(params)
    this.signals.parametersChanged.dispatch(params)
  }

  dispose () {
    this.trajectory.dispose()
    super.dispose()
  }

  getCenter () {}
}

export default TrajectoryComponent
