/**
 * @file Spatial Hash
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Box3 } from 'three';
export declare type Positions = {
    x: ArrayLike<number>;
    y: ArrayLike<number>;
    z: ArrayLike<number>;
    count?: number;
};
export default class SpatialHash {
    exp: number;
    minX: number;
    minY: number;
    minZ: number;
    boundX: number;
    boundY: number;
    boundZ: number;
    grid: Uint32Array;
    bucketCount: Uint16Array;
    bucketOffset: Uint32Array;
    bucketArray: Int32Array;
    xArray: ArrayLike<number>;
    yArray: ArrayLike<number>;
    zArray: ArrayLike<number>;
    constructor(positions: Positions, boundingBox?: Box3);
    within(x: number, y: number, z: number, r: number): number[];
    eachWithin(x: number, y: number, z: number, r: number, callback: (atomIndex: number, dSq: number) => void): void;
}
