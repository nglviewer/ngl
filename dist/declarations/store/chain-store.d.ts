/**
 * @file Chain Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Store, { StoreField } from './store';
/**
 * Chain store
 */
export default class ChainStore extends Store {
    entityIndex: Uint16Array;
    modelIndex: Uint16Array;
    residueOffset: Uint32Array;
    residueCount: Uint32Array;
    chainname: Uint8Array;
    chainid: Uint8Array;
    get _defaultFields(): StoreField[];
    setChainname(i: number, str: string): void;
    getChainname(i: number): string;
    setChainid(i: number, str: string): void;
    getChainid(i: number): string;
}
