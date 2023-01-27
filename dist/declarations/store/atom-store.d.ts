/**
 * @file Atom Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Store, { StoreField } from './store';
/**
 * Atom store
 */
export default class AtomStore extends Store {
    residueIndex: Uint32Array;
    atomTypeId: Uint16Array;
    x: Float32Array;
    y: Float32Array;
    z: Float32Array;
    serial: Int32Array;
    bfactor: Float32Array;
    altloc: Uint8Array;
    occupancy: Float32Array;
    partialCharge?: Float32Array;
    formalCharge?: Uint8Array;
    get _defaultFields(): StoreField[];
    setAltloc(i: number, str: string): void;
    getAltloc(i: number): string;
}
