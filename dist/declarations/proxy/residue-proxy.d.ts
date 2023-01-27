/**
 * @file Residue Proxy
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { NumberArray } from '../types';
import Structure from '../structure/structure';
import Selection from '../selection/selection';
import ChainStore from '../store/chain-store';
import ResidueStore from '../store/residue-store';
import AtomStore from '../store/atom-store';
import AtomMap from '../store/atom-map';
import ResidueMap from '../store/residue-map';
import AtomProxy from '../proxy/atom-proxy';
import ResidueType, { RingData } from '../store/residue-type';
import { ResidueBonds } from '../structure/structure-utils';
import AtomType from '../store/atom-type';
import ChainProxy from './chain-proxy';
import Entity from '../structure/entity';
/**
 * Residue proxy
 */
declare class ResidueProxy {
    readonly structure: Structure;
    index: number;
    chainStore: ChainStore;
    residueStore: ResidueStore;
    atomStore: AtomStore;
    residueMap: ResidueMap;
    atomMap: AtomMap;
    /**
     * @param {Structure} structure - the structure
     * @param {Integer} index - the index
     */
    constructor(structure: Structure, index?: number);
    /**
     * Entity
     * @type {Entity}
     */
    get entity(): Entity;
    get entityIndex(): number;
    /**
     * Chain
     * @type {ChainProxy}
     */
    get chain(): ChainProxy;
    get chainIndex(): number;
    set chainIndex(value: number);
    get atomOffset(): number;
    set atomOffset(value: number);
    /**
     * Atom count
     * @type {Integer}
     */
    get atomCount(): number;
    set atomCount(value: number);
    get atomEnd(): number;
    get modelIndex(): number;
    /**
     * Chain name
     * @type {String}
     */
    get chainname(): string;
    /**
     * Chain id
     * @type {String}
     */
    get chainid(): string;
    /**
     * Residue number/label
     * @type {Integer}
     */
    get resno(): number;
    set resno(value: number);
    /**
     * Secondary structure code
     * @type {String}
     */
    get sstruc(): string;
    set sstruc(value: string);
    /**
     * Insertion code
     * @type {String}
     */
    get inscode(): string;
    set inscode(value: string);
    get residueType(): ResidueType;
    /**
     * Residue name
     * @type {String}
     */
    get resname(): string;
    /**
     * Hetero flag
     * @type {Boolean}
     */
    get hetero(): number;
    get moleculeType(): number;
    get backboneType(): number;
    get backboneStartType(): number;
    get backboneEndType(): number;
    get traceAtomIndex(): number;
    get direction1AtomIndex(): number;
    get direction2AtomIndex(): number;
    get backboneStartAtomIndex(): number;
    get backboneEndAtomIndex(): number;
    get rungEndAtomIndex(): number;
    get x(): number;
    get y(): number;
    get z(): number;
    /**
     * Atom iterator
     * @param  {function(atom: AtomProxy)} callback - the callback
     * @param  {Selection} [selection] - the selection
     * @return {undefined}
     */
    eachAtom(callback: (ap: AtomProxy) => void, selection?: Selection): void;
    /**
     * Write residue center position to array
     * @param  {Array|TypedArray} [array] - target array
     * @param  {Integer} [offset] - the offset
     * @return {Array|TypedArray} target array
     */
    positionToArray(array?: NumberArray, offset?: number): NumberArray;
    /**
     * If residue is from a protein
     * @return {Boolean} flag
     */
    isProtein(): boolean;
    /**
     * If residue is nucleic
     * @return {Boolean} flag
     */
    isNucleic(): boolean;
    /**
     * If residue is rna
     * @return {Boolean} flag
     */
    isRna(): boolean;
    /**
     * If residue is dna
     * @return {Boolean} flag
     */
    isDna(): boolean;
    /**
     * If residue is coarse-grain
     * @return {Boolean} flag
     */
    isCg(): boolean;
    /**
     * If residue is from a polymer
     * @return {Boolean} flag
     */
    isPolymer(): boolean;
    /**
     * If residue is hetero
     * @return {Boolean} flag
     */
    isHetero(): boolean;
    /**
     * If residue is a water molecule
     * @return {Boolean} flag
     */
    isWater(): boolean;
    /**
     * If residue is an ion
     * @return {Boolean} flag
     */
    isIon(): boolean;
    /**
     * If residue is a saccharide
     * @return {Boolean} flag
     */
    isSaccharide(): boolean;
    isStandardAminoacid(): boolean;
    isStandardBase(): boolean;
    /**
     * If residue is part of a helix
     * @return {Boolean} flag
     */
    isHelix(): boolean;
    /**
     * If residue is part of a sheet
     * @return {Boolean} flag
     */
    isSheet(): boolean;
    /**
     * If residue is part of a turn
     * @return {Boolean} flag
     */
    isTurn(): boolean;
    getAtomType(index: number): AtomType;
    getResname1(): string;
    getBackboneType(position: number): number;
    getAtomIndexByName(atomname: string): number | undefined;
    hasAtomWithName(atomname: string): boolean;
    getAtomnameList(): any[];
    /**
     * If residue is connected to another
     * @param  {ResidueProxy} rNext - the other residue
     * @return {Boolean} - flag
     */
    connectedTo(rNext: ResidueProxy): boolean;
    getNextConnectedResidue(): ResidueProxy | undefined;
    getPreviousConnectedResidue(residueProxy?: ResidueProxy): any;
    getBonds(): ResidueBonds;
    getRings(): RingData | undefined;
    getAromaticRings(): number[][] | undefined;
    qualifiedName(noResname?: boolean): string;
    /**
     * Clone object
     * @return {ResidueProxy} cloned residue
     */
    clone(): ResidueProxy;
    toObject(): {
        index: number;
        chainIndex: number;
        atomOffset: number;
        atomCount: number;
        resno: number;
        resname: string;
        sstruc: string;
    };
}
export default ResidueProxy;
