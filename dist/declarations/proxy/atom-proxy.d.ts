/**
 * @file Atom Proxy
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3 } from 'three';
import { NumberArray } from '../types';
import { Elements } from '../structure/structure-constants';
import Structure from '../structure/structure';
import ChainStore from '../store/chain-store';
import ResidueStore from '../store/residue-store';
import AtomStore from '../store/atom-store';
import AtomMap from '../store/atom-map';
import ResidueMap from '../store/residue-map';
import BondProxy from '../proxy/bond-proxy';
import AtomType from '../store/atom-type';
import ResidueType from '../store/residue-type';
import ResidueProxy from './residue-proxy';
import Entity from '../structure/entity';
import BondHash from '../store/bond-hash';
/**
 * Atom proxy
 */
declare class AtomProxy {
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
     * @type {BondHash}
     */
    get bondHash(): BondHash | undefined;
    /**
     * Molecular enity
     * @type {Entity}
     */
    get entity(): Entity;
    get entityIndex(): number;
    get modelIndex(): number;
    get chainIndex(): number;
    /**
     * @type {ResidueProxy}
     */
    get residue(): ResidueProxy;
    get residueIndex(): number;
    set residueIndex(value: number);
    /**
     * Secondary structure code
     * @type {String}
     */
    get sstruc(): string;
    /**
     * Insertion code
     * @type {String}
     */
    get inscode(): string;
    /**
     * Residue number/label
     * @type {Integer}
     */
    get resno(): number;
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
     * @type {ResidueType}
     */
    get residueType(): ResidueType;
    /**
     * @type {AtomType}
     */
    get atomType(): AtomType;
    get residueAtomOffset(): number;
    /**
     * Residue name
     */
    get resname(): string;
    /**
     * Hetero flag
     */
    get hetero(): number;
    /**
     * Atom name
     */
    get atomname(): string;
    /**
     * Atomic number
     */
    get number(): number;
    /**
     * Element
     */
    get element(): string;
    /**
     * Van-der-Waals radius
     */
    get vdw(): number;
    /**
     * Covalent radius
     */
    get covalent(): number;
    /**
     * X coordinate
     */
    get x(): number;
    set x(value: number);
    /**
     * Y coordinate
     */
    get y(): number;
    set y(value: number);
    /**
     * Z coordinate
     */
    get z(): number;
    set z(value: number);
    /**
     * Serial number
     */
    get serial(): number;
    set serial(value: number);
    /**
     * B-factor value
     */
    get bfactor(): number;
    set bfactor(value: number);
    /**
     * Occupancy value
     */
    get occupancy(): number;
    set occupancy(value: number);
    /**
     * Alternate location identifier
     */
    get altloc(): string;
    set altloc(value: string);
    /**
     * Partial charge
     */
    get partialCharge(): number | null;
    set partialCharge(value: number | null);
    /**
     * Explicit radius
     */
    get radius(): any;
    set radius(value: any);
    /**
     * Formal charge
     */
    get formalCharge(): number | null;
    set formalCharge(value: number | null);
    /**
     * Aromaticity flag
     */
    get aromatic(): number;
    set aromatic(value: number);
    get bondCount(): number;
    /**
     * Iterate over each bond
     * @param  {function(bond: BondProxy)} callback - iterator callback function
     * @param  {BondProxy} [bp] - optional target bond proxy for use in the callback
     * @return {undefined}
     */
    eachBond(callback: (bp: BondProxy) => void, bp?: BondProxy): void;
    /**
     * Iterate over each bonded atom
     * @param  {function(atom: AtomProxy)} callback - iterator callback function
     * @param  {AtomProxy} [ap] - optional target atom proxy for use in the callback
     * @return {undefined}
     */
    eachBondedAtom(callback: (ap: AtomProxy) => void, _ap?: AtomProxy): void;
    /**
     * Check if this atom is bonded to the given atom,
     * assumes both atoms are from the same structure
     * @param  {AtomProxy} ap - the given atom
     * @return {Boolean} whether a bond exists or not
     */
    hasBondTo(ap: AtomProxy): boolean;
    bondToElementCount(element: Elements): number;
    hasBondToElement(element: Elements): boolean;
    /**
     * If atom is part of a backbone
     * @return {Boolean} flag
     */
    isBackbone(): boolean;
    /**
     * If atom is part of a polymer
     * @return {Boolean} flag
     */
    isPolymer(): boolean;
    /**
     * If atom is part of a sidechin
     * @return {Boolean} flag
     */
    isSidechain(): boolean;
    /**
     * If atom is part of a coarse-grain group
     * @return {Boolean} flag
     */
    isCg(): boolean;
    isTrace(): boolean;
    /**
     * If atom is part of a hetero group
     * @return {Boolean} flag
     */
    isHetero(): boolean;
    /**
     * If atom is part of a protein molecule
     * @return {Boolean} flag
     */
    isProtein(): boolean;
    /**
     * If atom is part of a nucleic molecule
     * @return {Boolean} flag
     */
    isNucleic(): boolean;
    /**
     * If atom is part of a rna
     * @return {Boolean} flag
     */
    isRna(): boolean;
    /**
     * If atom is part of a dna
     * @return {Boolean} flag
     */
    isDna(): boolean;
    /**
     * If atom is part of a water molecule
     * @return {Boolean} flag
     */
    isWater(): boolean;
    /**
     * If atom is part of an ion
     * @return {Boolean} flag
     */
    isIon(): boolean;
    /**
     * If atom is part of a saccharide
     * @return {Boolean} flag
     */
    isSaccharide(): boolean;
    /**
     * If atom is part of a helix
     * @return {Boolean} flag
     */
    isHelix(): boolean;
    /**
     * If atom is part of a sheet
     * @return {Boolean} flag
     */
    isSheet(): boolean;
    /**
     * If atom is part of a turn
     * @return {Boolean} flag
     */
    isTurn(): boolean;
    isBonded(): boolean;
    /**
     * If atom is part of a ring
     * @return {Boolean} flag
     */
    isRing(): boolean;
    isAromatic(): boolean;
    isPolarHydrogen(): boolean;
    isMetal(): boolean;
    isNonmetal(): boolean;
    isMetalloid(): boolean;
    isHalogen(): boolean;
    isDiatomicNonmetal(): boolean;
    isPolyatomicNonmetal(): boolean;
    isAlkaliMetal(): boolean;
    isAlkalineEarthMetal(): boolean;
    isNobleGas(): boolean;
    isTransitionMetal(): boolean;
    isPostTransitionMetal(): boolean;
    isLanthanide(): boolean;
    isActinide(): boolean;
    getDefaultValence(): number;
    getValenceList(): number[];
    getOuterShellElectronCount(): number;
    /**
     * Distance to another atom
     * @param  {AtomProxy} atom - the other atom
     * @return {Number} the distance
     */
    distanceTo(atom: AtomProxy): number;
    /**
     * If connected to another atom
     * @param  {AtomProxy} atom - the other atom
     * @return {Boolean} flag
     */
    connectedTo(atom: AtomProxy): boolean;
    /**
     * Set atom position from array
     * @param  {Array|TypedArray} array - input array
     * @param  {Integer} [offset] - the offset
     * @return {AtomProxy} this object
     */
    positionFromArray(array: NumberArray, offset?: number): this;
    /**
     * Write atom position to array
     * @param  {Array|TypedArray} [array] - target array
     * @param  {Integer} [offset] - the offset
     * @return {Array|TypedArray} target array
     */
    positionToArray(array?: NumberArray, offset?: number): NumberArray;
    /**
     * Write atom position to vector
     * @param  {Vector3} [v] - target vector
     * @return {Vector3} target vector
     */
    positionToVector3(v?: Vector3): Vector3;
    /**
     * Set atom position from vector
     * @param  {Vector3} v - input vector
     * @return {AtomProxy} this object
     */
    positionFromVector3(v: Vector3): this;
    /**
     * Add vector to atom position
     * @param  {Vector3} v - input vector
     * @return {AtomProxy} this object
     */
    positionAdd(v: Vector3 | AtomProxy): this;
    /**
     * Subtract vector from atom position
     * @param  {Vector3} v - input vector
     * @return {AtomProxy} this object
     */
    positionSub(v: Vector3 | AtomProxy): this;
    /**
     * Get intra group/residue bonds
     * @param  {Boolean} firstOnly - immediately return the first connected atomIndex
     * @return {Integer[]|Integer|undefined} connected atomIndices
     */
    getResidueBonds(firstOnly?: boolean): number | number[] | undefined;
    qualifiedName(noResname?: boolean): string;
    /**
     * Clone object
     * @return {AtomProxy} cloned atom
     */
    clone(): AtomProxy;
    toObject(): {
        index: number;
        residueIndex: number;
        resname: string;
        x: number;
        y: number;
        z: number;
        element: string;
        chainname: string;
        resno: number;
        serial: number;
        vdw: number;
        covalent: number;
        hetero: number;
        bfactor: number;
        altloc: string;
        atomname: string;
        modelIndex: number;
    };
}
export default AtomProxy;
