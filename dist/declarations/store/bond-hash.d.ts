/**
 * @file Bond Hash
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import BondStore from './bond-store';
declare class BondHash {
    countArray: Uint8Array;
    offsetArray: Int32Array;
    indexArray: Int32Array;
    constructor(bondStore: BondStore, atomCount: number);
}
export default BondHash;
