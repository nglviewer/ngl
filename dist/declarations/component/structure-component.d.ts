/**
 * @file Sturucture Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Signal } from 'signals';
import { RingBuffer, SimpleDict } from '../utils';
import Component, { ComponentSignals } from './component';
import RepresentationCollection from './representation-collection';
import TrajectoryElement from './trajectory-element';
import RepresentationElement from './representation-element';
import Selection from '../selection/selection';
import Structure from '../structure/structure';
import StructureView from '../structure/structure-view';
import Stage from '../stage/stage';
import { StructureRepresentationParameters } from '../representation/structure-representation';
import AtomProxy from '../proxy/atom-proxy';
import { Vector3, Box3 } from 'three';
import { AngleRepresentationParameters } from '../representation/angle-representation';
import { AxesRepresentationParameters } from '../representation/axes-representation';
import { BallAndStickRepresentationParameters } from '../representation/ballandstick-representation';
import { CartoonRepresentationParameters } from '../representation/cartoon-representation';
import { ContactRepresentationParameters } from '../representation/contact-representation';
import { DihedralRepresentationParameters } from '../representation/dihedral-representation';
import { DihedralHistogramRepresentationParameters } from '../representation/dihedral-histogram-representation';
import { DistanceRepresentationParameters } from '../representation/distance-representation';
import { HyperballRepresentationParameters } from '../representation/hyperball-representation';
import { LabelRepresentationParameters } from '../representation/label-representation';
import { LineRepresentationParameters } from '../representation/line-representation';
import { PointRepresentationParameters } from '../representation/point-representation';
import { SurfaceRepresentationParameters } from '../representation/surface-representation';
import { RibbonRepresentationParameters } from '../representation/ribbon-representation';
import { RocketRepresentationParameters } from '../representation/rocket-representation';
import { TraceRepresentationParameters } from '../representation/trace-representation';
import { UnitcellRepresentationParameters } from '../representation/unitcell-representation';
import { SliceRepresentationParameters } from '../representation/slice-representation';
import { MolecularSurfaceRepresentationParameters } from '../representation/molecularsurface-representation';
import { DotRepresentationParameters } from '../representation/dot-representation';
export declare type StructureRepresentationType = keyof StructureRepresentationParametersMap;
interface StructureRepresentationParametersMap {
    'angle': AngleRepresentationParameters;
    'axes': AxesRepresentationParameters;
    'backbone': BallAndStickRepresentationParameters;
    'ball+stick': BallAndStickRepresentationParameters;
    'base': BallAndStickRepresentationParameters;
    'cartoon': CartoonRepresentationParameters;
    'contact': ContactRepresentationParameters;
    'dihedral': DihedralRepresentationParameters;
    'dihedral-histogram': DihedralHistogramRepresentationParameters;
    'distance': DistanceRepresentationParameters;
    'dot': DotRepresentationParameters;
    'helixorient': StructureRepresentationParameters;
    'hyperball': HyperballRepresentationParameters;
    'label': LabelRepresentationParameters;
    'licorice': BallAndStickRepresentationParameters;
    'line': LineRepresentationParameters;
    'molecularsurface': MolecularSurfaceRepresentationParameters;
    'point': PointRepresentationParameters;
    'ribbon': RibbonRepresentationParameters;
    'rocket': RocketRepresentationParameters;
    'rope': CartoonRepresentationParameters;
    'slice': SliceRepresentationParameters;
    'spacefill': BallAndStickRepresentationParameters;
    'surface': SurfaceRepresentationParameters;
    'trace': TraceRepresentationParameters;
    'tube': CartoonRepresentationParameters;
    'unitcell': UnitcellRepresentationParameters;
    'validation': StructureRepresentationParameters;
}
export declare const StructureComponentDefaultParameters: {
    sele: string;
    defaultAssembly: string;
} & {
    name: string;
    status: string;
    visible: boolean;
};
export declare type StructureComponentParameters = typeof StructureComponentDefaultParameters;
export interface StructureComponentSignals extends ComponentSignals {
    trajectoryAdded: Signal;
    trajectoryRemoved: Signal;
    defaultAssemblyChanged: Signal;
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
declare class StructureComponent extends Component {
    readonly structure: Structure;
    readonly signals: StructureComponentSignals;
    readonly parameters: StructureComponentParameters;
    get defaultParameters(): {
        sele: string;
        defaultAssembly: string;
    } & {
        name: string;
        status: string;
        visible: boolean;
    };
    selection: Selection;
    structureView: StructureView;
    readonly trajList: TrajectoryElement[];
    pickBuffer: RingBuffer<number>;
    pickDict: SimpleDict<number[], number[]>;
    lastPick?: number;
    spacefillRepresentation: RepresentationElement;
    distanceRepresentation: RepresentationElement;
    angleRepresentation: RepresentationElement;
    dihedralRepresentation: RepresentationElement;
    measureRepresentations: RepresentationCollection;
    constructor(stage: Stage, structure: Structure, params?: Partial<StructureComponentParameters>);
    /**
     * Component type
     * @type {String}
     */
    get type(): string;
    /**
     * Initialize selection
     * @private
     * @param {String} sele - selection string
     * @return {undefined}
     */
    initSelection(sele: string): void;
    /**
     * Set selection of {@link StructureComponent#structureView}
     * @param {String} string - selection string
     * @return {StructureComponent} this object
     */
    setSelection(string: string): this;
    /**
     * Set the default assembly
     * @param {String} value - assembly name
     * @return {undefined}
     */
    setDefaultAssembly(value: string): this;
    /**
     * Rebuild all representations
     * @return {undefined}
     */
    rebuildRepresentations(): void;
    /**
     * Rebuild all trajectories
     * @return {undefined}
     */
    rebuildTrajectories(): void;
    updateRepresentations(what: any): void;
    /**
     * Overrides {@link Component.updateRepresentationMatrices}
     * to also update matrix for measureRepresentations
     */
    updateRepresentationMatrices(): void;
    addRepresentation<K extends keyof StructureRepresentationParametersMap>(type: K, params?: Partial<StructureRepresentationParametersMap[K]> | {
        defaultAssembly: string;
    }, hidden?: boolean): RepresentationElement;
    /**
     * Add a new trajectory component to the structure
     */
    addTrajectory(trajPath?: string, params?: {
        [k: string]: any;
    }): TrajectoryElement;
    removeTrajectory(traj: TrajectoryElement): void;
    dispose(): void;
    /**
     * Automatically center and zoom the component
     * @param  {String|Integer} [sele] - selection string or duration if integer
     * @param  {Integer} [duration] - duration of the animation, defaults to 0
     * @return {undefined}
     */
    autoView(sele?: string | number, duration?: number): void;
    getBoxUntransformed(sele: string): Box3;
    getCenterUntransformed(sele: string): Vector3;
    superpose(component: StructureComponent, align: boolean, sele1: string, sele2: string): this;
    getMaxRepresentationRadius(atomIndex: number): number;
    measurePick(atom: AtomProxy): void;
    measureClear(): void;
    measureBuild(): void;
    measureUpdate(): void;
    measureData(): {
        distance: number[][];
        angle: number[][];
        dihedral: number[][];
    };
    /**
     * Remove all measurements, optionally limit to distance, angle or dihedral
     */
    removeAllMeasurements(type?: MeasurementFlags): void;
    /**
     * Remove a measurement given as a pair, triple, quad of atom indices
     */
    removeMeasurement(atomList: number[]): void;
    /**
     * Add a measurement given as a pair, triple, quad of atom indices
     */
    addMeasurement(atomList: number[]): void;
}
export declare const enum MeasurementFlags {
    Distance = 1,
    Angle = 2,
    Dihedral = 4
}
export default StructureComponent;
