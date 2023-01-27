/**
 * @file Array Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3 } from 'three';
import { NumberArray } from '../types';
export declare function circularMean(array: NumberArray, max: number, stride?: number, offset?: number, indices?: NumberArray): number;
export declare function calculateCenterArray<T extends NumberArray = Float32Array>(array1: NumberArray, array2: NumberArray, center?: T, offset?: number): T;
export declare function calculateDirectionArray(array1: NumberArray, array2: NumberArray): Float32Array;
export declare function uniformArray<T extends NumberArray = Float32Array>(n: number, a: number, optionalTarget?: T): T;
export declare function uniformArray3(n: number, a: number, b: number, c: number, optionalTarget?: NumberArray): NumberArray;
export declare function centerArray3(array: NumberArray, center?: Vector3): Vector3;
export declare function serialArray(n: number): Float32Array;
export declare function serialBlockArray(n: number, b: number, offset?: number, optionalTarget?: NumberArray): NumberArray;
export declare function randomColorArray(n: number): Float32Array;
export declare function replicateArrayEntries(array: NumberArray, m: number): Float32Array;
export declare function replicateArray3Entries(array: NumberArray, m: number): Float32Array;
export declare function calculateMeanArray(array1: NumberArray, array2: NumberArray): Float32Array;
export declare function calculateMinArray(array1: NumberArray, array2: NumberArray): Float32Array;
export declare function copyArray<T extends any[] | NumberArray>(src: T, dst: T, srcOffset: number, dstOffset: number, length: number): void;
export declare function copyWithin(array: NumberArray | any[], srcOffset: number, dstOffset: number, length: number): void;
/**
 * quicksortIP
 * @function
 * @author Roman Bolzern <roman.bolzern@fhnw.ch>, 2013
 * @author I4DS http://www.fhnw.ch/i4ds, 2013
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 * @description
 * In-place quicksort for typed arrays (e.g. for Float32Array)
 * provides fast sorting
 * useful e.g. for a custom shader and/or BufferGeometry
 * Complexity: http://bigocheatsheet.com/ see Quicksort
 *
 * @example
 * points: [x, y, z, x, y, z, x, y, z, ...]
 * eleSize: 3 //because of (x, y, z)
 * orderElement: 0 //order according to x
 *
 * @param {TypedArray} arr - array to be sorted
 * @param {Integer} eleSize - element size
 * @param {Integer} orderElement - index of element used for sorting, < eleSize
 * @param {Integer} [begin] - start index for range to be sorted
 * @param {Integer} [end] - end index for range to be sorted
 * @return {TypedArray} the input array
 */
export declare function quicksortIP(arr: NumberArray, eleSize: number, orderElement: number, begin?: number, end?: number): NumberArray;
export declare function quicksortCmp<T>(arr: NumberArray | T[], cmp?: (a: number | T, b: number | T) => number, begin?: number, end?: number): NumberArray | T[];
export declare function quickselectCmp<T>(arr: NumberArray | T[], n: number, cmp?: (a: number | T, b: number | T) => number, left?: number, right?: number): number | T;
export declare function arrayMax(array: NumberArray): number;
export declare function arrayMin(array: NumberArray): number;
export declare function arraySum(array: NumberArray, stride?: number, offset?: number): number;
export declare function arrayMean(array: NumberArray, stride?: number, offset?: number): number;
export declare function arrayRms(array: NumberArray): number;
export declare function arraySorted(array: NumberArray): boolean;
export declare function arraySortedCmp<T>(array: NumberArray | T[], cmp: (a: number | T, b: number | T) => number): boolean;
