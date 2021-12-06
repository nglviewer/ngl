/**
 * @file Adjacency List
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

export interface Edges {
  nodeArray1: ArrayLike<number>
  nodeArray2: ArrayLike<number>
  edgeCount: number
  nodeCount: number
}

export interface AdjacencyList {
  /* number of edges for each node */
  countArray: Uint8Array
  /* offset into indexArray for each node */
  offsetArray: Int32Array
  /* edge indices, grouped by nodes */
  indexArray: Int32Array
}

export function createAdjacencyList (edges: Edges): AdjacencyList {
  const { edgeCount, nodeCount, nodeArray1, nodeArray2 } = edges

  const countArray = new Uint8Array(nodeCount)
  const offsetArray = new Int32Array(nodeCount)

  // count edges per node
  for (let i = 0; i < edgeCount; ++i) {
    countArray[ nodeArray1[ i ] ] += 1
    countArray[ nodeArray2[ i ] ] += 1
  }

  // get offsets to node edges
  for (let i = 1; i < nodeCount; ++i) {
    offsetArray[ i ] += offsetArray[ i - 1 ] + countArray[ i - 1 ]
  }

  // prepare index array
  const bondCount2 = edgeCount * 2
  const indexArray = new Int32Array(bondCount2)
  for (let j = 0; j < bondCount2; ++j) {
    indexArray[ j ] = -1
  }

  // build index array
  for (let i = 0; i < edgeCount; ++i) {
    const idx1 = nodeArray1[ i ]
    const idx2 = nodeArray2[ i ]
    let j1 = offsetArray[ idx1 ]
    while (indexArray[ j1 ] !== -1 && j1 < bondCount2) {
      j1 += 1
    }
    indexArray[ j1 ] = i
    let j2 = offsetArray[ idx2 ]
    while (indexArray[ j2 ] !== -1 && j2 < bondCount2) {
      j2 += 1
    }
    indexArray[ j2 ] = i
  }

  return { countArray, offsetArray, indexArray }
}
