/**
 * @file Bond Hash
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import BondStore from './bond-store'
import { createAdjacencyList } from '../utils/adjacency-list'

class BondHash {
  countArray: Uint8Array
  offsetArray: Int32Array
  indexArray: Int32Array

  constructor (bondStore: BondStore, atomCount: number) {
    const al = createAdjacencyList({
      nodeArray1: bondStore.atomIndex1,
      nodeArray2: bondStore.atomIndex2,
      edgeCount: bondStore.count,
      nodeCount: atomCount
    })

    this.countArray = al.countArray
    this.offsetArray = al.offsetArray
    this.indexArray = al.indexArray
  }
}

export default BondHash
