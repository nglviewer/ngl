/**
 * @file Polymer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Structure from '../structure/structure';
import Selection from '../selection/selection';
import ChainStore from '../store/chain-store';
import ResidueStore from '../store/residue-store';
import AtomStore from '../store/atom-store';
import ResidueProxy from '../proxy/residue-proxy';
import AtomProxy from '../proxy/atom-proxy';
/**
 * Polymer
 */
declare class Polymer {
    readonly structure: Structure;
    readonly residueIndexStart: number;
    readonly residueIndexEnd: number;
    chainStore: ChainStore;
    residueStore: ResidueStore;
    atomStore: AtomStore;
    residueCount: number;
    isPrevConnected: boolean;
    isNextConnected: boolean;
    isNextNextConnected: boolean;
    isCyclic: boolean;
    private __residueProxy;
    /**
     * @param {Structure} structure - the structure
     * @param {Integer} residueIndexStart - the index of the first residue
     * @param {Integer} residueIndexEnd - the index of the last residue
     */
    constructor(structure: Structure, residueIndexStart: number, residueIndexEnd: number);
    get chainIndex(): number;
    get modelIndex(): number;
    /**
     * @type {String}
     */
    get chainname(): string;
    /**
     * If first residue is from aprotein
     * @return {Boolean} flag
     */
    isProtein(): boolean;
    /**
     * If atom is part of a coarse-grain group
     * @return {Boolean} flag
     */
    isCg(): boolean;
    /**
     * If atom is part of a nucleic molecule
     * @return {Boolean} flag
     */
    isNucleic(): boolean;
    getMoleculeType(): number;
    getBackboneType(position: number): number;
    getAtomIndexByType(index: number, type: string): number | undefined;
    /**
     * Atom iterator
     * @param  {function(atom: AtomProxy)} callback - the callback
     * @param  {Selection} [selection] - the selection
     * @return {undefined}
     */
    eachAtom(callback: (ap: AtomProxy) => void, selection?: Selection): void;
    eachAtomN(n: number, callback: (...apArray: AtomProxy[]) => void, type: string): void;
    /**
     * Residue iterator
     * @param  {function(residue: ResidueProxy)} callback - the callback
     * @return {undefined}
     */
    eachResidue(callback: (rp: ResidueProxy) => void): void;
    qualifiedName(): string;
}
export default Polymer;
