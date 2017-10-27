/**
 * @file Sturucture Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Signal } from 'signals'

import { ComponentRegistry } from '../globals'
import { defaults, createRingBuffer, RingBuffer, createSimpleDict, SimpleDict } from '../utils'
import Component, { ComponentSignals, ComponentDefaultParameters } from './component'
import TrajectoryElement from './trajectory-element'
import RepresentationElement from './representation-element'
import { makeTrajectory } from '../trajectory/trajectory-utils'
import { TrajectoryParameters } from '../trajectory/trajectory'
import Selection from '../selection/selection'
import Structure from '../structure/structure'
import StructureView from '../structure/structure-view'
import { superpose } from '../align/align-utils'
import Stage from '../stage/stage'

type StructureRepresentationType = (
  'angle'|'axes'|'backbone'|'ball+stick'|'base'|'cartoon'|'contact'|'dihedral'|
  'distance'|'helixorient'|'hyperball'|'label'|'licorice'|'line'|'surface'|
  'ribbon'|'rocket'|'rope'|'spacefill'|'trace'|'tube'|'unitcell'
)

export const StructureComponentDefaultParameters = Object.assign({
  sele: '',
  defaultAssembly: ''
}, ComponentDefaultParameters)
export type StructureComponentParameters = typeof StructureComponentDefaultParameters

interface StructureComponentSignals extends ComponentSignals {
  trajectoryAdded: Signal  // when a trajectory is added
  trajectoryRemoved: Signal  // when a trajectory is removed
  defaultAssemblyChanged: Signal  // on default assembly change
}

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
  readonly signals: StructureComponentSignals
  readonly parameters: StructureComponentParameters
  get defaultParameters () { return StructureComponentDefaultParameters }

  selection: Selection
  structureView: StructureView
  readonly trajList: TrajectoryElement[] = []

  pickBuffer: RingBuffer<number>
  pickDict: SimpleDict<number[], number[]>
  lastPick?: number

  spacefillRepresentation: RepresentationElement
  distanceRepresentation: RepresentationElement
  angleRepresentation: RepresentationElement
  dihedralRepresentation: RepresentationElement

  constructor (stage: Stage, readonly structure: Structure, params: Partial<StructureComponentParameters> = {}) {
    super(stage, structure, Object.assign({ name: structure.name }, params))

    this.signals = Object.assign(this.signals, {
      trajectoryAdded: new Signal(),
      trajectoryRemoved: new Signal(),
      defaultAssemblyChanged: new Signal()
    })

    this.initSelection(this.parameters.sele)
    this.setDefaultAssembly(this.parameters.defaultAssembly)

    //

    this.pickBuffer = createRingBuffer(4)
    this.pickDict = createSimpleDict()

    this.spacefillRepresentation = this.addRepresentation('spacefill', {
      sele: 'none',
      opacity: 0.6,
      color: 'green',
      disablePicking: true,
      scale: 0.3
    }, true)

    const measurementParams = {
      color: 'green',
      labelColor: 'grey',
      labelAttachment: 'bottom-center',
      labelSize: 0.7,
      labelZOffset: 0.5,
      labelYOffset: 0.1,
      labelBorder: true,
      labelBorderColor: 'lightgrey',
      labelBorderWidth: 0.25,
      lineOpacity: 0.8,
      linewidth: 5.0,
      opacity: 0.6
    }
    this.distanceRepresentation = this.addRepresentation(
      'distance', Object.assign({ labelUnit: 'angstrom' }, measurementParams), true
    )
    this.angleRepresentation = this.addRepresentation(
      'angle', Object.assign({ arcVisible: false }, measurementParams), true
    )
    this.dihedralRepresentation = this.addRepresentation(
      'dihedral', Object.assign({ planeVisible: false }, measurementParams), true
    )
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
  initSelection (sele: string) {
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
  setSelection (string: string) {
    this.parameters.sele = string
    this.selection.setString(string)

    return this
  }

  /**
   * Set the default assembly
   * @param {String} value - assembly name
   * @return {undefined}
   */
  setDefaultAssembly (value:string) {
    this.parameters.defaultAssembly = value
    this.reprList.forEach(repr => {
      repr.setParameters({ defaultAssembly: this.parameters.defaultAssembly })
    })
    this.signals.defaultAssemblyChanged.dispatch(value)
  }

  /**
   * Rebuild all representations
   * @return {undefined}
   */
  rebuildRepresentations () {
    this.reprList.forEach((repr: any) => {  // TODO
      repr.build()
    })

    this.spacefillRepresentation.build(undefined)
    this.distanceRepresentation.build(undefined)
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

  addRepresentation (type: StructureRepresentationType, params: { [k: string]: any } = {}, hidden = false) {
    params.defaultAssembly = this.parameters.defaultAssembly

    return this._addRepresentation(type, this.structureView, params)
  }

  /**
   * Add a new trajectory component to the structure
   */
  addTrajectory (trajPath = '', params: { [k: string]: any } = {}) {
    var traj = makeTrajectory(trajPath, this.structureView, params as TrajectoryParameters)

    traj.signals.frameChanged.add(() => {
      this.updateRepresentations({ 'position': true })
    })

    var trajComp = new TrajectoryElement(this.stage, traj, params)
    this.trajList.push(trajComp)
    this.signals.trajectoryAdded.dispatch(trajComp)

    return trajComp
  }

  removeTrajectory (traj: TrajectoryElement) {
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

    this.spacefillRepresentation.dispose()
    this.distanceRepresentation.dispose()

    super.dispose()
  }

  /**
   * Automatically center and zoom the component
   * @param  {String|Integer} [sele] - selection string or duration if integer
   * @param  {Integer} [duration] - duration of the animation, defaults to 0
   * @return {undefined}
   */
  autoView (duration?: number): any
  autoView (sele?: string|number, duration?: number) {
    if (typeof sele === 'number') {
      duration = sele
      sele = ''
    }

    this.stage.animationControls.zoomMove(
      this.getCenter(sele),
      this.getZoom(sele),
      defaults(duration, 0)
    )
  }

  getBoxUntransformed (sele: string) {
    let bb

    if (sele) {
      bb = this.structureView.getBoundingBox(new Selection(sele))
    } else {
      bb = this.structureView.boundingBox
    }

    return bb
  }

  getCenterUntransformed (sele: string) {
    if (sele && typeof sele === 'string') {
      return this.structure.atomCenter(new Selection(sele))
    } else {
      return this.structure.center
    }
  }

  superpose (component: StructureComponent, align: boolean, sele1: string, sele2: string) {
    superpose(
      this.structureView, component.structureView, align, sele1, sele2
    )

    this.updateRepresentations({ 'position': true })

    return this
  }
}

ComponentRegistry.add('structure', StructureComponent)
ComponentRegistry.add('structureview', StructureComponent)

export default StructureComponent
