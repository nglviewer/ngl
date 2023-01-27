/**
 * @file Contact Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Store, { StoreField } from './store';
/**
 * Bond store
 */
export default class ContactStore extends Store {
    index1: Uint32Array;
    index2: Uint32Array;
    type: Uint8Array;
    get _defaultFields(): StoreField[];
    addContact(index1: number, index2: number, type?: number): void;
}
