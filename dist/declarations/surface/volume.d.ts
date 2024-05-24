/**
 * @file Volume
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3, Box3, Matrix3, Matrix4 } from 'three';
import WorkerPool from '../worker/worker-pool';
import { VolumePicker } from '../utils/picker';
import Surface from './surface';
import { NumberArray } from '../types';
import { ColormakerParameters } from '../color/colormaker';
export interface VolumeSurface {
    new (data: NumberArray, nx: number, ny: number, nz: number, atomindex: NumberArray): void;
    getSurface: (isolevel: number, smooth: boolean | number, box: number[][] | undefined, matrix: Float32Array, contour: boolean, wrap?: boolean) => {
        position: Float32Array;
        normal: undefined | Float32Array;
        index: Uint32Array | Uint16Array;
        atomindex: Int32Array | undefined;
        contour: boolean;
    };
}
export declare function VolumeSurface(this: VolumeSurface, data: NumberArray, nx: number, ny: number, nz: number, atomindex: NumberArray): void;
export declare type VolumeSize = 'value' | 'abs-value' | 'value-min' | 'deviation';
/**
 * Volume
 */
declare class Volume {
    name: string;
    path: string;
    matrix: Matrix4;
    normalMatrix: Matrix3;
    inverseMatrix: Matrix4;
    center: Vector3;
    boundingBox: Box3;
    nx: number;
    ny: number;
    nz: number;
    data: Float32Array;
    worker: Worker;
    workerPool: WorkerPool;
    _position: Float32Array | undefined;
    _min: number | undefined;
    _max: number | undefined;
    _mean: number | undefined;
    _rms: number | undefined;
    _sum: number | undefined;
    __box: Box3 | undefined;
    atomindex: Int32Array | undefined;
    volsurf: VolumeSurface | undefined;
    header: any;
    /**
     * Make Volume instance
     * @param {String} name - volume name
     * @param {String} path - source path
     * @param {Float32array} data - volume 3d grid
     * @param {Integer} nx - x dimension of the 3d volume
     * @param {Integer} ny - y dimension of the 3d volume
     * @param {Integer} nz - z dimension of the 3d volume
     * @param {Int32Array} atomindex - atom indices corresponding to the cells in the 3d grid
     */
    constructor(name: string, path: string, data?: Float32Array, nx?: number, ny?: number, nz?: number, atomindex?: Int32Array);
    get type(): string;
    /**
     * set volume data
     * @param {Float32array} data - volume 3d grid
     * @param {Integer} nx - x dimension of the 3d volume
     * @param {Integer} ny - y dimension of the 3d volume
     * @param {Integer} nz - z dimension of the 3d volume
     * @param {Int32Array} atomindex - atom indices corresponding to the cells in the 3d grid
     * @return {undefined}
     */
    setData(data?: Float32Array, nx?: number, ny?: number, nz?: number, atomindex?: Int32Array): void;
    /**
     * Set statistics, which can be different from the data in this volume,
     * if this volume is a slice of a bigger volume
     * @param {Number|undefined} min - minimum value of the whole data set
     * @param {Number|undefined} max - maximum value of the whole data set
     * @param {Number|undefined} mean - average value of the whole data set
     * @param {Number|undefined} rms - sigma value of the whole data set
     */
    setStats(min: number | undefined, max: number | undefined, mean: number | undefined, rms: number | undefined): void;
    /**
     * set transformation matrix
     * @param {Matrix4} matrix - 4x4 transformation matrix
     * @return {undefined}
     */
    setMatrix(matrix: Matrix4): void;
    /**
     * set atom indices
     * @param {Int32Array} atomindex - atom indices corresponding to the cells in the 3d grid
     * @return {undefined}
       */
    setAtomindex(atomindex?: Int32Array): void;
    getBox(center: Vector3, size: number, target: Box3): Box3;
    _getBox(center: Vector3 | undefined, size: number): import("three").Vector3Tuple[] | undefined;
    _makeSurface(sd: any, isolevel: number, smooth: number): Surface;
    getSurface(isolevel: number, smooth: number, center: Vector3, size: number, contour: boolean, wrap?: boolean): Surface;
    getSurfaceWorker(isolevel: number, smooth: number, center: Vector3, size: number, contour: boolean, wrap: boolean, callback: (s: Surface) => void): void;
    getValueForSigma(sigma: number): number;
    getSigmaForValue(value: number): number;
    get position(): Float32Array;
    getDataAtomindex(): Int32Array | undefined;
    getDataPosition(): Float32Array;
    getDataColor(params: ColormakerParameters & {
        scheme: string;
    }): Float32Array;
    getDataPicking(): VolumePicker;
    getDataSize(size: VolumeSize | number, scale: number): Float32Array;
    get min(): number;
    get max(): number;
    get sum(): number;
    get mean(): number;
    get rms(): number;
    clone(): Volume;
    dispose(): void;
}
export default Volume;
