/**
 * @file Vector Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3 } from 'three';
import { NumberArray } from '../types';
/**
 * Calculate the two intersection points
 * Converted to JavaScript from
 * {@link http://paulbourke.net/geometry/pointlineplane/lineline.c}
 */
export declare function lineLineIntersect(p1: Vector3, p2: Vector3, p3: Vector3, p4: Vector3): Vector3[] | null;
export declare function calculateMeanVector3(array: NumberArray): Vector3;
export declare function isPointOnSegment(p: Vector3, l1: Vector3, l2: Vector3): boolean;
export declare function projectPointOnVector(point: Vector3, vector: Vector3, origin?: Vector3): Vector3;
export declare function computeBoundingBox(array: NumberArray): Float32Array[];
export declare function applyMatrix4toVector3array(m: Float32Array, a: Float32Array): void;
export declare function applyMatrix3toVector3array(m: Float32Array, a: Float32Array): void;
export declare function normalizeVector3array(a: Float32Array): void;
export declare function v3new(array?: NumberArray): Float32Array;
export declare function v3cross(out: Float32Array, a: Float32Array, b: Float32Array): void;
export declare function v3dot(a: Float32Array, b: Float32Array): number;
export declare function v3sub(out: Float32Array, a: Float32Array, b: Float32Array): void;
export declare function v3add(out: Float32Array, a: Float32Array, b: Float32Array): void;
export declare function v3fromArray(out: Float32Array, array: Float32Array, offset?: number): void;
export declare function v3toArray(input: Float32Array, array: Float32Array, offset?: number): void;
export declare function v3forEach(array: Float32Array, fn: (i: Float32Array, j: Float32Array, k: Float32Array) => void, b: Float32Array): void;
export declare function v3length2(a: Float32Array): number;
export declare function v3length(a: Float32Array): number;
export declare function v3divide(out: Float32Array, a: Float32Array, b: Float32Array): void;
export declare function v3multiply(out: Float32Array, a: Float32Array, b: Float32Array): void;
export declare function v3divideScalar(out: Float32Array, a: Float32Array, s: number): void;
export declare function v3multiplyScalar(out: Float32Array, a: Float32Array, s: number): void;
export declare function v3normalize(out: Float32Array, a: Float32Array): void;
export declare function v3subScalar(out: Float32Array, a: Float32Array, s: number): void;
export declare function v3addScalar(out: Float32Array, a: Float32Array, s: number): void;
export declare function v3floor(out: Float32Array, a: Float32Array): void;
export declare function v3ceil(out: Float32Array, a: Float32Array): void;
export declare function v3round(out: Float32Array, a: Float32Array): void;
export declare function v3negate(out: Float32Array, a: Float32Array): void;
export declare function v3angle(a: Float32Array, b: Float32Array): number;
