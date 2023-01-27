/**
 * @file Bond Proxy
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3 } from 'three';
import Structure from '../structure/structure';
import BondStore from '../store/bond-store';
import AtomProxy from '../proxy/atom-proxy';
/**
 * Bond proxy
 */
declare class BondProxy {
    readonly structure: Structure;
    index: number;
    bondStore: BondStore;
    private _v12;
    private _v13;
    private _ap1;
    private _ap2;
    private _ap3;
    /**
     * @param {Structure} structure - the structure
     * @param {Integer} index - the index
     */
    constructor(structure: Structure, index?: number);
    /**
     * @type {AtomProxy}
     */
    get atom1(): AtomProxy;
    /**
     * @type {AtomProxy}
     */
    get atom2(): AtomProxy;
    /**
     * @type {Integer}
     */
    get atomIndex1(): number;
    set atomIndex1(value: number);
    /**
     * @type {Integer}
     */
    get atomIndex2(): number;
    set atomIndex2(value: number);
    /**
     * @type {Integer}
     */
    get bondOrder(): number;
    set bondOrder(value: number);
    getOtherAtomIndex(atomIndex: number): number;
    getOtherAtom(atom: AtomProxy): AtomProxy;
    /**
     * Get reference atom index for the bond
     * @return {Integer|undefined} atom index, or `undefined` if unavailable
     */
    getReferenceAtomIndex(): number | undefined;
    /**
     * calculate shift direction for displaying double/triple bonds
     * @param  {Vector3} [v] pre-allocated output vector
     * @return {Vector3} the shift direction vector
     */
    calculateShiftDir(v?: Vector3): Vector3;
    qualifiedName(): string;
    /**
     * Clone object
     * @return {BondProxy} cloned bond
     */
    clone(): BondProxy;
    toObject(): {
        atomIndex1: number;
        atomIndex2: number;
        bondOrder: number;
    };
}
export default BondProxy;
