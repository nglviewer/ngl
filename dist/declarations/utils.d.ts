/**
 * @file Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector2, Vector3, Matrix4, Quaternion } from 'three';
export declare function getQuery(id: string): string | undefined;
export declare function boolean(value: any): boolean;
export declare function defaults(value: any, defaultValue: any): any;
export declare function createParams<T>(params: {
    [k in keyof T]?: any;
}, defaultParams: T): T;
export declare function updateParams<T>(params: T, newParams: {
    [k in keyof T]?: any;
}): T;
export declare function pick(object: {
    [index: string]: any;
}): any;
export declare function flatten(array: any[], ret: any[]): any[];
export declare function getProtocol(): string;
export declare function getBrowser(): false | "Opera" | "Chrome" | "Firefox" | "Mobile Safari" | "Internet Explorer" | "Safari";
export declare function getAbsolutePath(relativePath: string): string;
export declare function deepCopy(src: any): any;
export declare function deepEqual(a: any, b: any): boolean;
export declare function download(data: Blob | string, downloadName?: string): void;
export declare function submit(url: string, data: FormData, callback: Function, onerror: Function): void;
export declare function open(callback: Function, extensionList?: string[]): void;
export declare function throttle(func: Function, wait: number, options: {
    leading?: boolean;
    trailing?: boolean;
}): (this: any) => any;
export declare function lexicographicCompare<T>(elm1: T, elm2: T): 1 | 0 | -1;
/**
 * Does a binary search to get the index of an element in the input array
 * @function
 * @example
 * var array = [ 1, 2, 3, 4, 5, 6 ];
 * var element = 4;
 * binarySearchIndexOf( array, element );  // returns 3
 *
 * @param {Array} array - sorted array
 * @param {Anything} element - element to search for in the array
 * @param {Function} [compareFunction] - compare function
 * @return {Number} the index of the element or -1 if not in the array
 */
export declare function binarySearchIndexOf<T>(array: T[], element: T, compareFunction?: typeof lexicographicCompare): number;
export declare function binarySearchForLeftRange(array: number[], leftRange: number): number;
export declare function binarySearchForRightRange(array: number[], rightRange: number): number;
export declare function rangeInSortedArray(array: number[], min: number, max: number): number;
export declare function dataURItoImage(dataURI: string): HTMLImageElement;
export declare function uniqueArray(array: any[]): any[];
export declare function uint8ToString(u8a: Uint8Array): any;
export declare function uint8ToLines(u8a: Uint8Array, chunkSize?: number, newline?: string): string[];
export declare type TypedArrayString = 'int8' | 'int16' | 'int32' | 'uint8' | 'uint16' | 'uint32' | 'float32';
export declare function getTypedArray(arrayType: TypedArrayString, arraySize: number): Uint8Array | Int8Array | Int16Array | Int32Array | Uint16Array | Uint32Array | Float32Array;
export declare function getUintArray(sizeOrArray: any, maxUint: number): Uint16Array | Uint32Array;
export declare function ensureArray(value: any): any[];
export declare function ensureBuffer(a: any): any;
export declare function ensureVector2(v?: number[] | Vector2): any;
export declare function ensureVector3(v?: number[] | Vector3): any;
export declare function ensureMatrix4(m?: number[] | Matrix4): any;
export declare function ensureQuaternion(q?: number[] | Quaternion): any;
export declare function ensureFloat32Array(a?: number[] | Float32Array): any;
export interface RingBuffer<T> {
    has: (value: T) => boolean;
    get: (value: number) => T;
    push: (value: T) => void;
    count: number;
    data: T[];
    clear: () => void;
}
export declare function createRingBuffer<T>(length: number): RingBuffer<T>;
export interface SimpleDict<K, V> {
    has: (k: K) => boolean;
    add: (k: K, v: V) => void;
    del: (k: K) => void;
    values: V[];
}
export declare function createSimpleDict<K, V>(): SimpleDict<K, V>;
export interface SimpleSet<T> {
    has: (value: T) => boolean;
    add: (value: T) => void;
    del: (value: T) => void;
    list: T[];
}
export declare function createSimpleSet<T>(): SimpleSet<T>;
