/**
 * @file Structure View
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Structure from './structure';
import Selection from '../selection/selection';
import BitArray from '../utils/bitarray';
import BondProxy from '../proxy/bond-proxy';
import AtomProxy from '../proxy/atom-proxy';
import ResidueProxy from '../proxy/residue-proxy';
import ChainProxy from '../proxy/chain-proxy';
import ModelProxy from '../proxy/model-proxy';
import SpatialHash from '../geometry/spatial-hash';
import BondHash from '../store/bond-hash';
import ResidueMap from '../store/residue-map';
import AtomMap from '../store/atom-map';
import ModelStore from '../store/model-store';
import ChainStore from '../store/chain-store';
import ResidueStore from '../store/residue-store';
import AtomStore from '../store/atom-store';
import BondStore from '../store/bond-store';
import Validation from './validation';
import Unitcell from '../symmetry/unitcell';
import Entity from './entity';
import Assembly from '../symmetry/assembly';
import { Data } from './data';
/**
 * View on the structure, restricted to the selection
 */
declare class StructureView extends Structure {
    structure: Structure;
    selection: Selection;
    /**
     * @param {Structure} structure - the structure
     * @param {Selection} selection - the selection
     */
    constructor(structure: Structure, selection: Selection);
    init(): void;
    get type(): string;
    get name(): string;
    get path(): string;
    get title(): string;
    get id(): string;
    get data(): Data;
    get atomSetDict(): {
        [k: string]: BitArray;
    };
    get biomolDict(): {
        [k: string]: Assembly;
    };
    get entityList(): Entity[];
    get unitcell(): Unitcell | undefined;
    get frames(): Float32Array[];
    get boxes(): Float32Array[];
    get validation(): Validation | undefined;
    get bondStore(): BondStore;
    get backboneBondStore(): BondStore;
    get rungBondStore(): BondStore;
    get atomStore(): AtomStore;
    get residueStore(): ResidueStore;
    get chainStore(): ChainStore;
    get modelStore(): ModelStore;
    get atomMap(): AtomMap;
    get residueMap(): ResidueMap;
    get bondHash(): BondHash | undefined;
    get spatialHash(): SpatialHash | undefined;
    get _hasCoords(): boolean | undefined;
    set _hasCoords(value: boolean | undefined);
    /**
     * Updates atomSet, bondSet, atomSetCache, atomCount, bondCount, boundingBox, center.
     * @emits {Structure.signals.refreshed} when refreshed
     * @return {undefined}
     */
    refresh(): void;
    setSelection(selection: Selection): void;
    getSelection(selection?: Selection): Selection;
    getStructure(): Structure | StructureView;
    eachBond(callback: (entity: BondProxy) => any, selection?: Selection): void;
    eachAtom(callback: (entity: AtomProxy) => any, selection?: Selection): void;
    eachResidue(callback: (entity: ResidueProxy) => any, selection?: Selection): void;
    /**
     * Not implemented
     * @alias StructureView#eachResidueN
     * @return {undefined}
     */
    eachResidueN(n: number, callback: (entity: ResidueProxy) => any): void;
    eachChain(callback: (entity: ChainProxy) => any, selection?: Selection): void;
    eachModel(callback: (entity: ModelProxy) => any, selection?: Selection): void;
    getAtomSet(selection?: boolean | Selection | BitArray, ignoreView?: boolean): BitArray;
    getAtomIndices(selection?: Selection): Uint32Array | undefined;
    refreshPosition(): void;
    dispose(): void;
}
export default StructureView;
