/**
 * @file Spline
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3 } from 'three';
import { AtomPicker } from '../utils/picker';
import { RadiusParams } from '../utils/radius-factory';
import Polymer from '../proxy/polymer';
import AtomProxy from '../proxy/atom-proxy';
import { ColormakerParameters } from '../color/colormaker';
export declare class Interpolator {
    m: number;
    tension: number;
    dt: number;
    delta: number;
    vec1: Vector3;
    vec2: Vector3;
    vDir: Vector3;
    vTan: Vector3;
    vNorm: Vector3;
    vBin: Vector3;
    m2: number;
    constructor(m: number, tension: number);
    private interpolateToArr;
    private interpolateToVec;
    private interpolatePosition;
    private interpolateTangent;
    private vectorSubdivide;
    getPosition(iterator: AtomIterator, array: Float32Array, offset: number, isCyclic: boolean): void;
    getTangent(iterator: AtomIterator, array: Float32Array, offset: number, isCyclic: boolean): void;
    private interpolateNormalDir;
    private interpolateNormal;
    getNormal(size: number, tan: Float32Array, norm: Float32Array, bin: Float32Array, offset: number, isCyclic: boolean): void;
    getNormalDir(iterDir1: AtomIterator, iterDir2: AtomIterator, tan: Float32Array, norm: Float32Array, bin: Float32Array, offset: number, isCyclic: boolean, shift: boolean): void;
    private interpolateColor;
    getColor(iterator: AtomIterator, colFn: (...arg: any[]) => void, col: any, offset: number, isCyclic: boolean): void;
    private interpolatePicking;
    getPicking(iterator: AtomIterator, pickFn: (item: AtomProxy) => number, pick: Float32Array, offset: number, isCyclic: boolean): void;
    private interpolateSize;
    getSize(iterator: AtomIterator, sizeFn: (item: AtomProxy) => number, size: Float32Array, offset: number, isCyclic: boolean): void;
}
export interface SplineParameters {
    directional?: boolean;
    positionIterator?: boolean;
    subdiv?: number;
    smoothSheet?: boolean;
    tension?: number;
}
export interface AtomIterator {
    size: number;
    next: () => AtomProxy | Vector3;
    get: (idx: number) => AtomProxy | Vector3;
    reset: () => void;
}
declare class Spline {
    polymer: Polymer;
    size: number;
    directional: boolean;
    positionIterator: any;
    subdiv: number;
    smoothSheet: boolean;
    tension: number;
    interpolator: Interpolator;
    constructor(polymer: Polymer, params?: SplineParameters);
    getAtomIterator(type: string, smooth?: boolean): AtomIterator;
    getSubdividedColor(params: {
        scheme: string;
        [k: string]: any;
    } & ColormakerParameters): {
        color: Float32Array;
    };
    getSubdividedPicking(): {
        picking: AtomPicker;
    };
    getSubdividedPosition(): {
        position: Float32Array;
    };
    getSubdividedOrientation(): {
        tangent: Float32Array;
        normal: Float32Array;
        binormal: Float32Array;
    };
    getSubdividedSize(params: RadiusParams): {
        size: Float32Array;
    };
    getPosition(): Float32Array;
    getTangent(): Float32Array;
    getNormals(tan: Float32Array): {
        normal: Float32Array;
        binormal: Float32Array;
    };
}
export default Spline;
