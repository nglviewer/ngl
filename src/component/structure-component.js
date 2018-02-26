/**
 * @file Sturucture Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Signal from '../../lib/signals.es6.js'

import { ComponentRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import Component from './component.js'
import TrajectoryComponent from './trajectory-component.js'
import { makeTrajectory } from '../trajectory/trajectory-utils.js'
import Selection from '../selection/selection.js'
import StructureView from '../structure/structure-view.js'
import { superpose } from '../align/align-utils.js'

/**
 * Extends {@link ComponentSignals}
 *
 * @example
 * component.signals.representationAdded.add( function( representationComponent ){ ... } );
 *
 * @typedef {Object} StructureComponentSignals
 * @property {Signal<RepresentationComponent>} trajectoryAdded - when a trajectory is added
 * @property {Signal<RepresentationComponent>} trajectoryRemoved - when a trajectory is removed
 * @property {Signal<String>} defaultAssemblyChanged - on default assembly change
 */

/**
 * Component wrapping a {@link Structure} object
 *
 * @example
 * // get a structure component by loading a structure file into the stage
 * stage.loadFile( "rcsb://4opj" ).then( function( structureComponent ){
 *     structureComponent.addRepresentation( "cartoon" );
 *     structureComponent.autoView();
 * } );
 */
class StructureComponent extends Component {
  /**
   * Create structure component
   * @param {Stage} stage - stage object the component belongs to
   * @param {Structure} structure - structure object to wrap
   * @param {ComponentParameters} params - component parameters
   */
  constructor (stage, structure, params) {
    var p = params || {}
    p.name = defaults(p.name, structure.name)

    super(stage, p)

    /**
     * Events emitted by the component
     * @type {StructureComponentSignals}
     */
    this.signals = Object.assign(this.signals, {
      trajectoryAdded: new Signal(),
      trajectoryRemoved: new Signal(),
      defaultAssemblyChanged: new Signal()
    })

    /**
     * The wrapped structure
     * @type {Structure}
     */
    this.structure = structure

    this.trajList = []
    this.initSelection(p.sele)
    this.setDefaultAssembly(p.assembly || '')
  }

  /**
   * Component type
   * @type {String}
   */
  get type () { return 'structure' }

  /**
   * Initialize selection
   * @private
   * @param {String} sele - selection string
   * @return {undefined}
   */
  initSelection (sele) {
    /**
     * Selection for {@link StructureComponent#structureView}
     * @private
     * @type {Selection}
     */
    this.selection = new Selection(sele)

    /**
     * View on {@link StructureComponent#structure}.
     * Change its selection via {@link StructureComponent#setSelection}.
     * @type {StructureView}
     */
    this.structureView = new StructureView(
      this.structure, this.selection
    )

    this.selection.signals.stringChanged.add(() => {
      this.structureView.setSelection(this.selection)

      this.rebuildRepresentations()
      this.rebuildTrajectories()
    })
  }

  /**
   * Set selection of {@link StructureComponent#structureView}
   * @param {String} string - selection string
   * @return {StructureComponent} this object
   */
  setSelection (string) {
    this.selection.setString(string)

    return this
  }

  /**
   * Set the default assembly
   * @param {String} value - assembly name
   * @return {undefined}
   */
  setDefaultAssembly (value) {
    this.defaultAssembly = value
    this.reprList.forEach(repr => {
      repr.setParameters({ defaultAssembly: this.defaultAssembly })
    })
    this.signals.defaultAssemblyChanged.dispatch(value)
  }

  /**
   * Rebuild all representations
   * @return {undefined}
   */
  rebuildRepresentations () {
    this.reprList.forEach(repr => {
      repr.build()
    })
  }

  /**
   * Rebuild all trajectories
   * @return {undefined}
   */
  rebuildTrajectories () {
    this.trajList.slice().forEach(trajComp => {
      trajComp.trajectory.setStructure(this.structureView)
    })
  }

  /**
   * Add a new structure representation to the component
   * @param {String} type - the name of the representation, one of:
   *                        axes, backbone, ball+stick, base, cartoon, contact,
   *                        distance, helixorient, hyperball, label, licorice, line
   *                        surface, ribbon, rocket, rope, spacefill, trace, tube,
   *                        unitcell.
   * @param {StructureRepresentationParameters} params - representation parameters
   * @return {RepresentationComponent} the created representation wrapped into
   *                                   a representation component object
   */
  addRepresentation (type, params) {
    var p = params || {}
    p.defaultAssembly = this.defaultAssembly

    return super.addRepresentation(type, this.structureView, p)
  }

  /**
   * Add a new trajectory component to the structure
   * @param {String|Frames} trajPath - path or frames object
   * @param {TrajectoryComponentParameters|TrajectoryParameters} params - parameters
   * @return {TrajectoryComponent} the created trajectory component object
   */
  addTrajectory (trajPath, params) {
    var traj = makeTrajectory(trajPath, this.structureView, params)

    traj.signals.frameChanged.add(() => {
      this.updateRepresentations({ 'position': true })
    })

    var trajComp = new TrajectoryComponent(this.stage, traj, params, this)
    this.trajList.push(trajComp)
    this.signals.trajectoryAdded.dispatch(trajComp)

    return trajComp
  }

  removeTrajectory (traj) {
    var idx = this.trajList.indexOf(traj)
    if (idx !== -1) {
      this.trajList.splice(idx, 1)
    }

    traj.dispose()

    this.signals.trajectoryRemoved.dispatch(traj)
  }

  dispose () {
    // copy via .slice because side effects may change trajList
    this.trajList.slice().forEach(traj => {
      traj.dispose()
    })

    this.trajList.length = 0
    this.structure.dispose()

    super.dispose()
  }

  /**
   * Automatically center and zoom the component
   * @param  {String|Integer} [sele] - selection string or duration if integer
   * @param  {Integer} [duration] - duration of the animation, defaults to 0
   * @return {undefined}
   */
  autoView (sele, duration) {
    if (Number.isInteger(sele)) {
      duration = sele
      sele = undefined
    }

    this.stage.animationControls.zoomMove(
      this.getCenter(sele),
      this.getZoom(sele),
      defaults(duration, 0)
    )
  }

  getBoxUntransformed (sele) {
    var bb

    if (sele) {
      bb = this.structureView.getBoundingBox(new Selection(sele))
    } else {
      bb = this.structureView.boundingBox
    }

    return bb
  }

  getCenterUntransformed (sele) {
    if (sele && typeof sele === 'string') {
      return this.structure.atomCenter(new Selection(sele))
    } else {
      return this.structure.center
    }
  }

  superpose (component, align, sele1, sele2) {
    superpose(
      this.structureView, component.structureView, align, sele1, sele2
    )

    this.updateRepresentations({ 'position': true })

    return this
  }

  setVisibility (value) {
    super.setVisibility(value)

    this.trajList.forEach(traj => {
      // FIXME ???
      traj.setVisibility(value)
    })

    return this
  }
}

ComponentRegistry.add('structure', StructureComponent)
ComponentRegistry.add('structureview', StructureComponent)

export default StructureComponent
