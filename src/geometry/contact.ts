/**
 * @file Contact
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Log } from '../globals'
import BitArray from '../utils/bitarray'
import Kdtree from './kdtree'
import BondStore from '../store/bond-store'
import Structure from '../structure/structure'

class Contact {
  // kdtree1: Kdtree
  kdtree2: Kdtree

  constructor (readonly sview1: Structure, readonly sview2: Structure) {
    // this.kdtree1 = new Kdtree(sview1)
    this.kdtree2 = new Kdtree(sview2)
  }

  within (maxDistance: number, minDistance?: number) {
    Log.time('Contact within')

    // const kdtree1 = this.kdtree1
    const kdtree2 = this.kdtree2

    const ap2 = this.sview1.getAtomProxy()
    const atomSet = this.sview1.getAtomSet(false)
    const bondStore = new BondStore()

    this.sview1.eachAtom(function (ap1) {
      let found = false
      const contacts = kdtree2.nearest(ap1 as any, Infinity, maxDistance)

      for (let j = 0, m = contacts.length; j < m; ++j) {
        const d = contacts[ j ]
        ap2.index = d.index

        if (ap1.residueIndex !== ap2.residueIndex &&
            (!minDistance || d.distance > minDistance)
        ) {
          found = true
          atomSet.set(ap2.index)
          bondStore.addBond(ap1, ap2, 1)
        }
      }

      if (found) {
        atomSet.set(ap1.index)
      }
    })

    const bondSet = new BitArray(bondStore.count, true)

    Log.timeEnd('Contact within')

    return {
      atomSet: atomSet,
      bondSet: bondSet,
      bondStore: bondStore
    }
  }
}

export default Contact
