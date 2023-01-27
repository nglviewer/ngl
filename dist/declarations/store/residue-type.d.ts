/**
 * @file Residue Type
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Fred Ludlow
 * @private
 */
import { ResidueBonds } from '../structure/structure-utils';
import Structure from '../structure/structure';
import ResidueProxy from '../proxy/residue-proxy';
import AtomProxy from '../proxy/atom-proxy';
export interface BondGraph {
    [k: number]: number[];
}
export interface RingData {
    atomRings: number[][];
    rings: number[][];
}
/**
 * Residue type
 */
export default class ResidueType {
    readonly structure: Structure;
    resname: string;
    atomTypeIdList: number[];
    hetero: number;
    chemCompType: string;
    bonds?: ResidueBonds;
    rings?: RingData;
    bondGraph?: BondGraph;
    aromaticAtoms?: Uint8Array;
    aromaticRings?: number[][];
    atomCount: number;
    moleculeType: number;
    backboneType: number;
    backboneEndType: number;
    backboneStartType: number;
    backboneIndexList: number[];
    traceAtomIndex: number;
    direction1AtomIndex: number;
    direction2AtomIndex: number;
    backboneStartAtomIndex: number;
    backboneEndAtomIndex: number;
    rungEndAtomIndex: number;
    bondReferenceAtomIndices: number[];
    /**
     * @param {Structure} structure - the structure object
     * @param {String} resname - name of the residue
     * @param {Array} atomTypeIdList - list of IDs of {@link AtomType}s corresponding
     *                                 to the atoms of the residue
     * @param {Boolean} hetero - hetero flag
     * @param {String} chemCompType - chemical component type
     * @param {Object} [bonds] - TODO
     */
    constructor(structure: Structure, resname: string, atomTypeIdList: number[], hetero: boolean, chemCompType: string, bonds?: ResidueBonds);
    getBackboneIndexList(): number[];
    getMoleculeType(): 1 | 2 | 3 | 0 | 4 | 6 | 5;
    getBackboneType(position: number): 1 | 2 | 3 | 0 | 4 | 6 | 5;
    isProtein(): boolean;
    isCg(): boolean;
    isNucleic(): boolean;
    isRna(): boolean;
    isDna(): boolean;
    isHetero(): boolean;
    isIon(): boolean;
    isWater(): boolean;
    isSaccharide(): boolean;
    isStandardAminoacid(): boolean;
    isStandardBase(): boolean;
    hasBackboneAtoms(position: number, type: number): boolean;
    hasProteinBackbone(position: number): boolean;
    hasRnaBackbone(position: number): boolean;
    hasDnaBackbone(position: number): boolean;
    hasCgProteinBackbone(position: number): boolean;
    hasCgRnaBackbone(position: number): boolean;
    hasCgDnaBackbone(position: number): boolean;
    hasBackbone(position: number): boolean;
    getAtomIndexByName(atomname: string | string[]): number | undefined;
    hasAtomWithName(...atomnames: (string | string[])[]): boolean;
    getBonds(r?: ResidueProxy): ResidueBonds;
    getRings(): RingData | undefined;
    getBondGraph(): BondGraph | undefined;
    getAromatic(a?: AtomProxy): Uint8Array | undefined;
    getAromaticRings(r?: ResidueProxy): number[][] | undefined;
    /**
     * @return {Object} bondGraph - represents the bonding in this
     *   residue: { ai1: [ ai2, ai3, ...], ...}
     */
    calculateBondGraph(): void;
    /**
     * Find all rings up to 2 * RingFinderMaxDepth
     */
    calculateRings(): void;
    isAromatic(atom: AtomProxy): boolean;
    calculateAromatic(r: ResidueProxy): void;
    /**
     * For bonds with order > 1, pick a reference atom
     * @return {undefined}
     */
    assignBondReferenceAtomIndices(): void;
    getBondIndex(atomIndex1: number, atomIndex2: number): number | undefined;
    getBondReferenceAtomIndex(atomIndex1: number, atomIndex2: number): number | undefined;
}
