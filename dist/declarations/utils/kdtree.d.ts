/**
 * @file Kdtree
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { NumberArray } from '../types';
/**
 * Kdtree
 * @class
 * @author Alexander Rose <alexander.rose@weirdbyte.de>, 2016
 * @author Roman Bolzern <roman.bolzern@fhnw.ch>, 2013
 * @author I4DS http://www.fhnw.ch/i4ds, 2013
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 * @description
 * k-d Tree for typed arrays of 3d points (e.g. for Float32Array), in-place
 * provides fast nearest neighbour search
 *
 * Based on https://github.com/ubilabs/kd-tree-javascript by Ubilabs
 *
 * Further information (including mathematical properties)
 * http://en.wikipedia.org/wiki/Binary_tree
 * http://en.wikipedia.org/wiki/K-d_tree
 *
 * @example
 * points: [x, y, z, x, y, z, x, y, z, ...]
 * metric: function(a, b){
 *    return Math.pow(a[0]-b[0], 2) + Math.pow(a[1]-b[1], 2) + Math.pow(a[2]-b[2], 2);
 * }
 *
 * @param {Float32Array} points - points
 * @param {Function} metric - metric
 */
declare class Kdtree {
    readonly points: NumberArray;
    readonly metric: (a: NumberArray, b: NumberArray) => number;
    indices: Uint32Array;
    nodes: Int32Array;
    rootIndex: number;
    maxDepth: number;
    currentNode: number;
    constructor(points: NumberArray, metric: (a: NumberArray, b: NumberArray) => number);
    buildTree(depth: number, parent: number, arrBegin: number, arrEnd: number): number;
    getNodeDepth(nodeIndex: number): number;
    /**
     * find nearest points
     * @param {Array} point - array of size 3
     * @param {Integer} maxNodes - max amount of nodes to return
     * @param {Float} maxDistance - maximum distance of point to result nodes
     * @return {Array} array of point, distance pairs
     */
    nearest(point: NumberArray, maxNodes: number, maxDistance: number): [number, number][];
    verify(nodeIndex?: number, depth?: number): number;
}
export default Kdtree;
