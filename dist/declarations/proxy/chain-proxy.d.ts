/**
 * @file Chain Proxy
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Structure from '../structure/structure';
import Selection from '../selection/selection';
import ChainStore from '../store/chain-store';
import ResidueStore from '../store/residue-store';
import Polymer from '../proxy/polymer';
import ResidueProxy from '../proxy/residue-proxy';
import AtomProxy from '../proxy/atom-proxy';
import ModelProxy from './model-proxy';
import Entity from '../structure/entity';
/**
 * Chain proxy
 */
declare class ChainProxy {
    readonly structure: Structure;
    index: number;
    chainStore: ChainStore;
    residueStore: ResidueStore;
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
    /**
     * Model
     * @type {ModelProxy}
     */
    get model(): ModelProxy;
    get entityIndex(): number;
    set entityIndex(value: number);
    get modelIndex(): number;
    set modelIndex(value: number);
    get residueOffset(): number;
    set residueOffset(value: number);
    /**
     * Residue count
     * @type {Integer}
     */
    get residueCount(): number;
    set residueCount(value: number);
    get residueEnd(): number;
    get atomOffset(): number;
    get atomEnd(): number;
    /**
     * Atom count
     * @type {Integer}
     */
    get atomCount(): number;
    /**
     * Chain name
     * @type {String}
     */
    get chainname(): string;
    set chainname(value: string);
    /**
     * Chain id
     * @type {String}
     */
    get chainid(): string;
    set chainid(value: string);
    /**
     * Atom iterator
     * @param  {function(atom: AtomProxy)} callback - the callback
     * @param  {Selection} [selection] - the selection
     * @return {undefined}
     */
    eachAtom(callback: (ap: AtomProxy) => void, selection?: Selection): void;
    /**
     * Residue iterator
     * @param  {function(residue: ResidueProxy)} callback - the callback
     * @param  {Selection} [selection] - the selection
     * @return {undefined}
     */
    eachResidue(callback: (rp: ResidueProxy) => void, selection?: Selection): void;
    /**
     * Multi-residue iterator
     * @param {Integer} n - window size
     * @param  {function(residueList: ResidueProxy[])} callback - the callback
     * @return {undefined}
     */
    eachResidueN(n: number, callback: (...rpArray: ResidueProxy[]) => void): void;
    /**
     * Polymer iterator
     * @param  {function(polymer: Polymer)} callback - the callback
     * @param  {Selection} [selection] - the selection
     * @return {undefined}
     */
    eachPolymer(callback: (p: Polymer) => void, selection?: Selection): void;
    qualifiedName(): string;
    /**
     * Clone object
     * @return {ChainProxy} cloned chain
     */
    clone(): ChainProxy;
    toObject(): {
        index: number;
        residueOffset: number;
        residueCount: number;
        chainname: string;
    };
}
export default ChainProxy;
