/**
 * @file Residue Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Store, { StoreField } from './store';
/**
 * Residue store
 */
export default class ResidueStore extends Store {
    chainIndex: Uint32Array;
    atomOffset: Uint32Array;
    atomCount: Uint32Array;
    residueTypeId: Uint16Array;
    resno: Uint32Array;
    sstruc: Uint8Array;
    inscode: Uint8Array;
    get _defaultFields(): StoreField[];
    setSstruc(i: number, str: string): void;
    getSstruc(i: number): string;
    setInscode(i: number, str: string): void;
    getInscode(i: number): string;
}
