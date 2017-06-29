/**
 * @file Contact
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Log } from '../globals.js'
import BitArray from '../utils/bitarray.js'
import Kdtree from './kdtree.js'
import BondStore from '../store/bond-store.js'

class Contact {
  constructor (sview1, sview2) {
    this.sview1 = sview1
    this.sview2 = sview2

        // this.kdtree1 = new Kdtree( sview1 );
    this.kdtree2 = new Kdtree(sview2)
  }

  within (maxDistance, minDistance) {
    Log.time('Contact within')

        // var kdtree1 = this.kdtree1;
    const kdtree2 = this.kdtree2

    const ap2 = this.sview1.getAtomProxy()
    const atomSet = this.sview1.getAtomSet(false)
    const bondStore = new BondStore()

    this.sview1.eachAtom(function (ap1) {
      let found = false
      const contacts = kdtree2.nearest(ap1, Infinity, maxDistance)

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
