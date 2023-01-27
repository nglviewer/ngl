/**
 * @file Matrix Utils
 * @private
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * svd methods from Eugene Zatepyakin / http://inspirit.github.io/jsfeat/
 */
import { NumberArray } from '../types';
export declare class Matrix {
    readonly cols: number;
    readonly rows: number;
    size: number;
    data: Float32Array;
    constructor(cols: number, rows: number);
    copyTo(matrix: Matrix): void;
}
export declare function transpose(At: Matrix, A: Matrix): void;
export declare function multiply(C: Matrix, A: Matrix, B: Matrix): void;
export declare function multiplyABt(C: Matrix, A: Matrix, B: Matrix): void;
export declare function multiplyAtB(C: Matrix, A: Matrix, B: Matrix): void;
export declare function invert3x3(from: Matrix, to: Matrix): void;
export declare function mat3x3determinant(M: Matrix): number;
export declare function multiply3x3(C: Matrix, A: Matrix, B: Matrix): void;
export declare function meanRows(A: Matrix): any[];
export declare function meanCols(A: Matrix): any[];
export declare function subRows(A: Matrix, row: number[]): void;
export declare function subCols(A: Matrix, col: number[]): void;
export declare function addRows(A: Matrix, row: number[]): void;
export declare function addCols(A: Matrix, col: number[]): void;
export declare function swap(A: NumberArray, i0: number, i1: number, t: number): void;
export declare function hypot(a: number, b: number): number;
export declare function JacobiSVDImpl(At: NumberArray, astep: number, _W: NumberArray, Vt: NumberArray, vstep: number, m: number, n: number, n1: number): void;
export declare function svd(A: Matrix, W: Matrix, U: Matrix, V: Matrix): void;
export declare function m4new(): Float32Array;
export declare function m4set(out: Float32Array, n11: number, n12: number, n13: number, n14: number, n21: number, n22: number, n23: number, n24: number, n31: number, n32: number, n33: number, n34: number, n41: number, n42: number, n43: number, n44: number): void;
export declare function m4identity(out: Float32Array): void;
export declare function m4multiply(out: Float32Array, a: Float32Array, b: Float32Array): void;
export declare function m4makeScale(out: Float32Array, x: number, y: number, z: number): void;
export declare function m4makeTranslation(out: Float32Array, x: number, y: number, z: number): void;
export declare function m4makeRotationY(out: Float32Array, theta: number): void;
export declare function m3new(): Float32Array;
export declare function m3makeNormal(out: Float32Array, m4: Float32Array): void;
