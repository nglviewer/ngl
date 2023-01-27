/**
 * @file Bond Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Store, { StoreField } from './store';
import AtomProxy from '../proxy/atom-proxy';
/**
 * Bond store
 */
export default class BondStore extends Store {
    atomIndex1: Uint32Array;
    atomIndex2: Uint32Array;
    bondOrder: Uint8Array;
    get _defaultFields(): StoreField[];
    addBond(atom1: AtomProxy, atom2: AtomProxy, bondOrder?: number): void;
    addBondIfConnected(atom1: AtomProxy, atom2: AtomProxy, bondOrder?: number): boolean;
}
