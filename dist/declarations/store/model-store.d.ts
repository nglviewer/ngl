/**
 * @file Model Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Store, { StoreField } from './store';
/**
 * Model store
 */
export default class ModelStore extends Store {
    chainOffset: Uint32Array;
    chainCount: Uint32Array;
    get _defaultFields(): StoreField[];
}
