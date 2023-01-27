/**
 * @file Model Proxy
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Structure from '../structure/structure';
import Selection from '../selection/selection';
import ModelStore from '../store/model-store';
import ChainStore from '../store/chain-store';
import ResidueStore from '../store/residue-store';
import ChainProxy from '../proxy/chain-proxy';
import Polymer from '../proxy/polymer';
import ResidueProxy from '../proxy/residue-proxy';
import AtomProxy from '../proxy/atom-proxy';
/**
 * Model proxy
 */
declare class ModelProxy {
    readonly structure: Structure;
    index: number;
    modelStore: ModelStore;
    chainStore: ChainStore;
    residueStore: ResidueStore;
    /**
     * @param {Structure} structure - the structure
     * @param {Integer} index - the index
     */
    constructor(structure: Structure, index?: number);
    get chainOffset(): number;
    set chainOffset(value: number);
    get chainCount(): number;
    set chainCount(value: number);
    get residueOffset(): number;
    get atomOffset(): number;
    get chainEnd(): number;
    get residueEnd(): number;
    get atomEnd(): number;
    /**
     * Residue count
     * @type {Integer}
     */
    get residueCount(): number;
    /**
     * Atom count
     * @type {Integer}
     */
    get atomCount(): number;
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
     * Polymer iterator
     * @param  {function(polymer: Polymer)} callback - the callback
     * @param  {Selection} [selection] - the selection
     * @return {undefined}
     */
    eachPolymer(callback: (p: Polymer) => void, selection?: Selection): void;
    /**
     * Chain iterator
     * @param  {function(chain: ChainProxy)} callback - the callback
     * @param  {Selection} [selection] - the selection
     * @return {undefined}
     */
    eachChain(callback: (cp: ChainProxy) => void, selection?: Selection): void;
    qualifiedName(): string;
    /**
     * Clone object
     * @return {ModelProxy} cloned model
     */
    clone(): ModelProxy;
    toObject(): {
        index: number;
        chainOffset: number;
        chainCount: number;
    };
}
export default ModelProxy;
