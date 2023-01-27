/**
 * @file Kdtree
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3 } from 'three';
import _Kdtree from '../utils/kdtree';
import Structure from '../structure/structure';
import ResidueProxy from '../proxy/residue-proxy';
declare class Kdtree {
    points: Float32Array;
    atomIndices: Uint32Array;
    kdtree: _Kdtree;
    constructor(structure: Structure | ResidueProxy, useSquaredDist?: boolean);
    nearest(point: number[] | Vector3, maxNodes: number, maxDistance: number): {
        index: number;
        distance: number;
    }[];
}
export default Kdtree;
