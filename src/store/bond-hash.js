/**
 * @file Bond Hash
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log } from '../globals.js'

class BondHash {
  constructor (bondStore, atomCount) {
    if (Debug) Log.time('BondHash init')

    const bondCount = bondStore.count
    const atomIndex1Array = bondStore.atomIndex1
    const atomIndex2Array = bondStore.atomIndex2
    const countArray = new Uint8Array(atomCount)
    const offsetArray = new Int32Array(atomCount)

    // count bonds per atom
    for (let i = 0; i < bondCount; ++i) {
      countArray[ atomIndex1Array[ i ] ] += 1
      countArray[ atomIndex2Array[ i ] ] += 1
    }

    // get offsets to atom bonds
    for (let i = 1; i < atomCount; ++i) {
      offsetArray[ i ] += offsetArray[ i - 1 ] + countArray[ i - 1 ]
    }

    // prepare index array
    const bondCount2 = bondCount * 2
    const indexArray = new Int32Array(bondCount2)
    for (let j = 0; j < bondCount2; ++j) {
      indexArray[ j ] = -1
    }

    // build index array
    for (let i = 0; i < bondCount; ++i) {
      const idx1 = atomIndex1Array[ i ]
      const idx2 = atomIndex2Array[ i ]
      let j1 = offsetArray[ idx1 ]
      while (indexArray[ j1 ] !== -1) {
        j1 += 1
      }
      indexArray[ j1 ] = i
      let j2 = offsetArray[ idx2 ]
      while (indexArray[ j2 ] !== -1) {
        j2 += 1
      }
      indexArray[ j2 ] = i
    }

    if (Debug) Log.timeEnd('BondHash init')

    this.countArray = countArray
    this.offsetArray = offsetArray
    this.indexArray = indexArray
  }
}

export default BondHash
