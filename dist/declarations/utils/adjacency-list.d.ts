/**
 * @file Adjacency List
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
export interface Edges {
    nodeArray1: ArrayLike<number>;
    nodeArray2: ArrayLike<number>;
    edgeCount: number;
    nodeCount: number;
}
export interface AdjacencyList {
    countArray: Uint8Array;
    offsetArray: Int32Array;
    indexArray: Int32Array;
}
export declare function createAdjacencyList(edges: Edges): AdjacencyList;
