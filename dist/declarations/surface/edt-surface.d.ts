/**
 * @file EDT Surface
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { TypedArray } from '../types';
interface EDTSurface {
    getVolume: (type: string, probeRadius: number, scaleFactor: number, cutoff: number, setAtomID: boolean) => {
        data: TypedArray;
        nx: number;
        ny: number;
        nz: number;
        atomindex: TypedArray;
    };
    getSurface: (type: string, probeRadius: number, scaleFactor: number, cutoff: number, setAtomID: boolean, smooth: number, contour: boolean) => any;
}
declare function EDTSurface(this: EDTSurface, coordList: Float32Array, radiusList: Float32Array, indexList: Uint16Array | Uint32Array): void;
export default EDTSurface;
