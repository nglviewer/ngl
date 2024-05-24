/**
 * @file Structure
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3, Box3 } from 'three';
import { Signal } from 'signals';
import { CifBlock } from 'molstar/lib/mol-io/reader/cif';
import BitArray from '../utils/bitarray';
import PrincipalAxes from '../math/principal-axes';
import SpatialHash from '../geometry/spatial-hash';
import StructureView from './structure-view';
import { AtomDataParams, AtomData, BondDataParams, BondData } from './structure-data';
import { Data } from './data';
import Entity from './entity';
import Unitcell from '../symmetry/unitcell';
import Validation from './validation';
import Selection from '../selection/selection';
import Assembly from '../symmetry/assembly';
import Volume from '../surface/volume';
import Polymer from '../proxy/polymer';
import BondHash from '../store/bond-hash';
import BondStore from '../store/bond-store';
import AtomStore from '../store/atom-store';
import ResidueStore from '../store/residue-store';
import ChainStore from '../store/chain-store';
import ModelStore from '../store/model-store';
import AtomMap from '../store/atom-map';
import ResidueMap from '../store/residue-map';
import BondProxy from '../proxy/bond-proxy';
import AtomProxy from '../proxy/atom-proxy';
import ResidueProxy from '../proxy/residue-proxy';
import ChainProxy from '../proxy/chain-proxy';
import ModelProxy from '../proxy/model-proxy';
import ChemCompMap from '../store/chemcomp-map';
interface Structure {
    signals: StructureSignals;
    name: string;
    path: string;
    title: string;
    id: string;
    data: Data;
    atomCount: number;
    bondCount: number;
    header: StructureHeader;
    extraData: StructureExtraData;
    atomSetCache: {
        [k: string]: BitArray;
    };
    atomSetDict: {
        [k: string]: BitArray;
    };
    biomolDict: {
        [k: string]: Assembly;
    };
    entityList: Entity[];
    unitcell?: Unitcell;
    frames: Float32Array[];
    boxes: Float32Array[];
    validation?: Validation;
    bondStore: BondStore;
    backboneBondStore: BondStore;
    rungBondStore: BondStore;
    atomStore: AtomStore;
    residueStore: ResidueStore;
    chainStore: ChainStore;
    modelStore: ModelStore;
    atomMap: AtomMap;
    residueMap: ResidueMap;
    chemCompMap?: ChemCompMap;
    bondHash?: BondHash;
    spatialHash?: SpatialHash;
    atomSet?: BitArray;
    bondSet?: BitArray;
    center: Vector3;
    boundingBox: Box3;
    trajectory?: {
        name: string;
        frame: number;
    };
    getView(selection: Selection): StructureView;
    _hasCoords?: boolean;
    _bp: BondProxy;
    _ap: AtomProxy;
    _rp: ResidueProxy;
    _cp: ChainProxy;
}
export declare type StructureHeader = {
    releaseDate?: string;
    depositionDate?: string;
    resolution?: number;
    rFree?: number;
    rWork?: number;
    experimentalMethods?: string[];
};
export declare type StructureExtraData = {
    cif?: CifBlock;
    sdf?: object[];
};
export declare type StructureSignals = {
    refreshed: Signal;
};
/**
 * Structure
 */
declare class Structure implements Structure {
    signals: StructureSignals;
    /**
     * @param {String} name - structure name
     * @param {String} path - source path
     */
    constructor(name?: string, path?: string);
    init(name: string, path: string): void;
    get type(): string;
    finalizeAtoms(): void;
    finalizeBonds(): void;
    getBondProxy(index?: number): BondProxy;
    getAtomProxy(index?: number): AtomProxy;
    getResidueProxy(index?: number): ResidueProxy;
    getChainProxy(index?: number): ChainProxy;
    getModelProxy(index?: number): ModelProxy;
    getBondSet(): BitArray;
    getBackboneBondSet(): BitArray;
    getRungBondSet(): BitArray;
    /**
     * Get a set of atoms
     * @param  {Boolean|Selection|BitArray} selection - object defining how to
     *                                      initialize the atom set.
     *                                      Boolean: init with value;
     *                                      Selection: init with selection;
     *                                      BitArray: return bit array
     * @return {BitArray} set of atoms
     */
    getAtomSet(selection?: boolean | Selection | BitArray): BitArray;
    /**
     * Get set of atoms around a set of atoms from a selection
     * @param  {Selection} selection - the selection object
     * @param  {Number} radius - radius to select within
     * @return {BitArray} set of atoms
     */
    getAtomSetWithinSelection(selection: boolean | Selection | BitArray, radius: number): BitArray;
    /**
     * Get set of atoms around a point
     * @param  {Vector3|AtomProxy} point - the point
     * @param  {Number} radius - radius to select within
     * @return {BitArray} set of atoms
     */
    getAtomSetWithinPoint(point: Vector3 | AtomProxy, radius: number): BitArray;
    /**
     * Get set of atoms within a volume
     * @param  {Volume} volume - the volume
     * @param  {Number} radius - radius to select within
     * @param  {[type]} minValue - minimum value to be considered as within the volume
     * @param  {[type]} maxValue - maximum value to be considered as within the volume
     * @param  {[type]} outside - use only values falling outside of the min/max values
     * @return {BitArray} set of atoms
     */
    getAtomSetWithinVolume(volume: Volume, radius: number, minValue: number, maxValue: number, outside: boolean): BitArray;
    /**
     * Get set of all atoms within the groups of a selection
     * @param  {Selection} selection - the selection object
     * @return {BitArray} set of atoms
     */
    getAtomSetWithinGroup(selection: boolean | Selection | BitArray): BitArray;
    getSelection(): undefined | Selection;
    getStructure(): Structure | StructureView;
    /**
     * Entity iterator
     * @param  {function(entity: Entity)} callback - the callback
     * @param  {EntityType} type - entity type
     * @return {undefined}
     */
    eachEntity(callback: (entity: Entity) => void, type: number): void;
    /**
     * Bond iterator
     * @param  {function(bond: BondProxy)} callback - the callback
     * @param  {Selection} [selection] - the selection
     * @return {undefined}
     */
    eachBond(callback: (entity: BondProxy) => void, selection?: Selection): void;
    /**
     * Atom iterator
     * @param  {function(atom: AtomProxy)} callback - the callback
     * @param  {Selection} [selection] - the selection
     * @return {undefined}
     */
    eachAtom(callback: (entity: AtomProxy) => void, selection?: Selection): void;
    /**
     * Residue iterator
     * @param  {function(residue: ResidueProxy)} callback - the callback
     * @param  {Selection} [selection] - the selection
     * @return {undefined}
     */
    eachResidue(callback: (entity: ResidueProxy) => void, selection?: Selection): void;
    /**
     * Multi-residue iterator
     * @param {Integer} n - window size
     * @param  {function(residueList: ResidueProxy[])} callback - the callback
     * @return {undefined}
     */
    eachResidueN(n: number, callback: (...entityArray: ResidueProxy[]) => void): void;
    /**
     * Polymer iterator
     * @param  {function(polymer: Polymer)} callback - the callback
     * @param  {Selection} [selection] - the selection
     * @return {undefined}
     */
    eachPolymer(callback: (entity: Polymer) => void, selection?: Selection): void;
    /**
     * Chain iterator
     * @param  {function(chain: ChainProxy)} callback - the callback
     * @param  {Selection} [selection] - the selection
     * @return {undefined}
     */
    eachChain(callback: (entity: ChainProxy) => void, selection?: Selection): void;
    /**
     * Model iterator
     * @param  {function(model: ModelProxy)} callback - the callback
     * @param  {Selection} [selection] - the selection
     * @return {undefined}
     */
    eachModel(callback: (entity: ModelProxy) => void, selection?: Selection): void;
    getAtomData(params: AtomDataParams): AtomData;
    getBondData(params: BondDataParams): BondData;
    getBackboneAtomData(params: AtomDataParams): AtomData;
    getBackboneBondData(params: BondDataParams): BondData;
    getRungAtomData(params: AtomDataParams): AtomData;
    getRungBondData(params: BondDataParams): BondData;
    /**
     * Gets the bounding box of the (selected) structure atoms
     * @param  {Selection} [selection] - the selection
     * @param  {Box3} [box] - optional target
     * @return {Vector3} the box
     */
    getBoundingBox(selection?: Selection, box?: Box3): Box3;
    /**
     * Gets the principal axes of the (selected) structure atoms
     * @param  {Selection} [selection] - the selection
     * @return {PrincipalAxes} the principal axes
     */
    getPrincipalAxes(selection?: Selection): PrincipalAxes;
    /**
     * Gets the center of the (selected) structure atoms
     * @param  {Selection} [selection] - the selection
     * @return {Vector3} the center
     */
    atomCenter(selection?: Selection): Vector3;
    hasCoords(): boolean;
    getSequence(selection?: Selection): string[];
    getAtomIndices(selection?: Selection): Uint32Array | undefined;
    /**
     * Get number of unique chainnames
     * @param  {Selection} selection - limit count to selection
     * @return {Integer} count
     */
    getChainnameCount(selection?: Selection): number;
    /**
     * Update atomic positions
     * @param position - Array to copy positions from
     * @param refresh - Whether or not to issue a full refresh (automatically
     *                  triggers re-calculation of bounding boxes, spatial hash,
     *                  representations etc etc). This provides compatibility with
     *                  the old behaviour
     */
    updatePosition(position: Float32Array | number[], refresh?: boolean): void;
    refreshPosition(): void;
    /**
     * Calls dispose() method of property objects.
     * Unsets properties to help garbage collection.
     * @return {undefined}
     */
    dispose(): void;
}
export default Structure;
