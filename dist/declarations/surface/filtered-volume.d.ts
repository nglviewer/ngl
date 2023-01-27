/**
 * @file Filtered Volume
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Volume from './volume';
import { Box3, Matrix4, Matrix3, Vector3 } from 'three';
declare class FilteredVolume {
    volume: Volume;
    data: Float32Array;
    position: Float32Array;
    atomindex: Int32Array;
    _filterHash: string;
    _dataBuffer: ArrayBuffer;
    _positionBuffer: ArrayBuffer;
    _atomindexBuffer: ArrayBuffer;
    getValueForSigma: typeof Volume.prototype.getValueForSigma;
    getSigmaForValue: typeof Volume.prototype.getSigmaForValue;
    getDataAtomindex: typeof Volume.prototype.getDataAtomindex;
    getDataPosition: typeof Volume.prototype.getDataPosition;
    getDataColor: typeof Volume.prototype.getDataColor;
    getDataPicking: typeof Volume.prototype.getDataPicking;
    getDataSize: typeof Volume.prototype.getDataSize;
    constructor(volume: Volume, minValue?: number, maxValue?: number, outside?: boolean);
    get header(): any;
    get matrix(): Matrix4;
    get normalMatrix(): Matrix3;
    get inverseMatrix(): Matrix4;
    get center(): Vector3;
    get boundingBox(): Box3;
    get min(): number;
    get max(): number;
    get mean(): number;
    get rms(): number;
    _getFilterHash(minValue: number, maxValue: number, outside: boolean): string;
    setFilter(minValue: number | undefined, maxValue: number | undefined, outside: boolean | undefined): void;
}
export default FilteredVolume;
