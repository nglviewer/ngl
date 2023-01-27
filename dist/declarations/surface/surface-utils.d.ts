/**
 * @file Surface Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { NumberArray } from '../types';
declare function laplacianSmooth(verts: Float32Array, faces: Float32Array, numiter: number, inflate: boolean): void;
declare function computeVertexNormals(position: Float32Array, index?: NumberArray, normal?: Float32Array): Float32Array;
declare function getRadiusDict(radiusList: number[]): {
    [k: number]: boolean;
};
declare function getSurfaceGrid(min: Float32Array, max: Float32Array, maxRadius: number, scaleFactor: number, extraMargin: number): {
    dim: Float32Array;
    tran: Float32Array;
    matrix: Float32Array;
    scaleFactor: number;
};
export { laplacianSmooth, computeVertexNormals, getRadiusDict, getSurfaceGrid };
