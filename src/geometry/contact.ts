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

  within (maxDistance: number, minDistance = -Infinity) {
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

        if (ap1.residueIndex !== ap2.residueIndex && d.distance > minDistance) {
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

    return { atomSet, bondSet, bondStore }
  }
}

export function getContacts(sview1: Structure, sview2: Structure, maxDistance: number, minDistance = -Infinity) {
  Log.time('contact')

  const spatialHash = sview1.spatialHash!  // TODO
  const atomSet2 = sview2.getAtomSet()

  const ap2 = sview1.getAtomProxy()
  const atomSet = sview1.getAtomSet(false)
  const bondStore = new BondStore()

  sview1.eachAtom(function (ap1) {
    let found = false

    spatialHash.eachWithin(ap1.x, ap1.y, ap1.z, maxDistance, atomIndex => {
      if (atomSet2.isSet(atomIndex)) {
        ap2.index = atomIndex
        if (ap1.residueIndex !== ap2.residueIndex && ap1.distanceTo(ap2) > minDistance) {
          found = true
          atomSet.set(ap2.index)
          bondStore.addBond(ap1, ap2, 1)
        }
      }
    })

    if (found) {
      atomSet.set(ap1.index)
    }
  })

  const bondSet = new BitArray(bondStore.count, true)

  Log.timeEnd('contact')

  return { atomSet, bondSet, bondStore }
}

export default Contact
