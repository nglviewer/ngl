/**
 * @file Kdtree
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { NumberArray } from '../types'
import BinaryHeap from './binary-heap'

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
class Kdtree {
  indices: Uint32Array
  nodes: Int32Array
  rootIndex: number

  maxDepth = 0
  currentNode = 0

  constructor(readonly points: NumberArray, readonly metric: (a: NumberArray, b: NumberArray) => number) {
    const n = points.length / 3

    const indices = new Uint32Array(n)
    for (let i = 0; i < n; ++i) {
      indices[ i ] = i
    }
    this.indices = indices
    this.nodes = new Int32Array(n * 4)
    this.rootIndex = this.buildTree(0, -1, 0, n)
  }

  buildTree (depth: number, parent: number, arrBegin: number, arrEnd: number) {
    if (depth > this.maxDepth) this.maxDepth = depth

    const plength = arrEnd - arrBegin
    if (plength === 0) {
      return -1
    }

    const nodeIndex = this.currentNode * 4
    const nodes = this.nodes

    this.currentNode += 1
    if (plength === 1) {
      nodes[ nodeIndex ] = arrBegin
      nodes[ nodeIndex + 1 ] = -1
      nodes[ nodeIndex + 2 ] = -1
      nodes[ nodeIndex + 3 ] = parent
      return nodeIndex
    }
    // if(plength <= 32){
    //   return nodeIndex;
    // }

    const indices = this.indices
    const points = this.points

    const arrMedian = arrBegin + Math.floor(plength / 2)
    const currentDim = depth % 3

    // inlined quickselect function
    let j, tmp, pivotIndex, pivotValue, storeIndex
    let left = arrBegin
    let right = arrEnd - 1
    while (right > left) {
      pivotIndex = (left + right) >> 1
      pivotValue = points[ indices[ pivotIndex ] * 3 + currentDim ]
      // swap( pivotIndex, right );
      tmp = indices[ pivotIndex ]
      indices[ pivotIndex ] = indices[ right ]
      indices[ right ] = tmp
      storeIndex = left
      for (j = left; j < right; ++j) {
        if (points[ indices[ j ] * 3 + currentDim ] < pivotValue) {
          // swap( storeIndex, j );
          tmp = indices[ storeIndex ]
          indices[ storeIndex ] = indices[ j ]
          indices[ j ] = tmp
          ++storeIndex
        }
      }
      // swap( right, storeIndex );
      tmp = indices[ right ]
      indices[ right ] = indices[ storeIndex ]
      indices[ storeIndex ] = tmp
      pivotIndex = storeIndex
      if (arrMedian === pivotIndex) {
        break
      } else if (arrMedian < pivotIndex) {
        right = pivotIndex - 1
      } else {
        left = pivotIndex + 1
      }
    }

    nodes[ nodeIndex ] = arrMedian
    nodes[ nodeIndex + 1 ] = this.buildTree(depth + 1, nodeIndex, arrBegin, arrMedian)
    nodes[ nodeIndex + 2 ] = this.buildTree(depth + 1, nodeIndex, arrMedian + 1, arrEnd)
    nodes[ nodeIndex + 3 ] = parent

    return nodeIndex
  }

  getNodeDepth (nodeIndex: number): number {
    const parentIndex = this.nodes[ nodeIndex + 3 ]
    return (parentIndex === -1) ? 0 : this.getNodeDepth(parentIndex) + 1
  }

  // TODO
  // function getNodePos (node) {}

  /**
   * find nearest points
   * @param {Array} point - array of size 3
   * @param {Integer} maxNodes - max amount of nodes to return
   * @param {Float} maxDistance - maximum distance of point to result nodes
   * @return {Array} array of point, distance pairs
   */
  nearest (point: NumberArray, maxNodes: number, maxDistance: number) {
    const bestNodes = new BinaryHeap<[number, number]>(e => -e[ 1 ])

    const nodes = this.nodes
    const points = this.points
    const indices = this.indices

    const nearestSearch = (nodeIndex: number) => {
      let bestChild, otherChild
      const dimension = this.getNodeDepth(nodeIndex) % 3
      const pointIndex = indices[ nodes[ nodeIndex ] ] * 3
      const ownPoint = [
        points[ pointIndex + 0 ],
        points[ pointIndex + 1 ],
        points[ pointIndex + 2 ]
      ]
      const ownDistance = this.metric(point, ownPoint)

      function saveNode (nodeIndex: number, distance: number) {
        bestNodes.push([ nodeIndex, distance ])
        if (bestNodes.size() > maxNodes) {
          bestNodes.pop()
        }
      }

      const leftIndex = nodes[ nodeIndex + 1 ]
      const rightIndex = nodes[ nodeIndex + 2 ]

      // if it's a leaf
      if (rightIndex === -1 && leftIndex === -1) {
        if ((bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[ 1 ]) &&
          ownDistance <= maxDistance
        ) {
          saveNode(nodeIndex, ownDistance)
        }
        return
      }

      if (rightIndex === -1) {
        bestChild = leftIndex
      } else if (leftIndex === -1) {
        bestChild = rightIndex
      } else {
        if (point[ dimension ] <= points[ pointIndex + dimension ]) {
          bestChild = leftIndex
        } else {
          bestChild = rightIndex
        }
      }

      // recursive search
      nearestSearch(bestChild)

      if ((bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[ 1 ]) &&
        ownDistance <= maxDistance
      ) {
        saveNode(nodeIndex, ownDistance)
      }

      // if there's still room or the current distance is nearer than the best distance
      const linearPoint = []
      for (let i = 0; i < 3; i += 1) {
        if (i === dimension) {
          linearPoint[ i ] = point[ i ]
        } else {
          linearPoint[ i ] = points[ pointIndex + i ]
        }
      }
      const linearDistance = this.metric(linearPoint, ownPoint)

      if ((bestNodes.size() < maxNodes || Math.abs(linearDistance) < bestNodes.peek()[ 1 ]) &&
        Math.abs(linearDistance) <= maxDistance
      ) {
        if (bestChild === leftIndex) {
          otherChild = rightIndex
        } else {
          otherChild = leftIndex
        }
        if (otherChild !== -1) {
          nearestSearch(otherChild)
        }
      }
    }

    nearestSearch(this.rootIndex)

    const result = []
    for (let i = 0, il = Math.min(bestNodes.size(), maxNodes); i < il; i += 1) {
      result.push(bestNodes.content[ i ])
    }

    return result
  }

  verify (nodeIndex?: number, depth = 0) {
    let count = 1

    if (nodeIndex === undefined) {
      nodeIndex = this.rootIndex
    }

    if (nodeIndex === -1) {
      throw new Error('node is null')
    }

    const dim = depth % 3
    const nodes = this.nodes
    const points = this.points
    const indices = this.indices

    const leftIndex = nodes[ nodeIndex + 1 ]
    const rightIndex = nodes[ nodeIndex + 2 ]

    if (leftIndex !== -1) {
      if (points[ indices[ nodes[ leftIndex ] ] * 3 + dim ] >
        points[ indices[ nodes[ nodeIndex ] ] * 3 + dim ]
      ) {
        throw new Error('left child is > parent!')
      }
      count += this.verify(leftIndex, depth + 1)
    }

    if (rightIndex !== -1) {
      if (points[ indices[ nodes[ rightIndex ] ] * 3 + dim ] <
        points[ indices[ nodes[ nodeIndex ] ] * 3 + dim ]
      ) {
        throw new Error('right child is < parent!')
      }
      count += this.verify(rightIndex, depth + 1)
    }

    return count
  }
}

export default Kdtree
