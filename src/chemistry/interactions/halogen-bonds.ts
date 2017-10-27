/**
 * @file Halogen Bonds
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import { defaults } from '../../utils'
import Structure from '../../structure/structure'
import {
  Features, FeatureType,
  addAtom, addFeature, createFeatureState,
} from './features'
import { Contacts, ContactType, ContactDefaultParams, invalidAtomContact } from './contact'

/**
 * Halogen bond donors (X-C, with X one of F, Cl, Br, I or At)
 */
export function addHalogenDonors (structure: Structure, features: Features) {
  structure.eachAtom(a => {
    if (a.isHalogen() && a.bondToElementCount('C') === 1) {
      const state = createFeatureState(FeatureType.HydrogenAcceptor)
      addAtom(state, a)
      addFeature(features, state)
    }
  })
}

const X = [ 7, 8, 16 ]  // N, O, S
const Y = [ 6, 7, 15, 16 ]  // C, N, P, S

/**
 * Halogen bond acceptors (Y-{O|N|S}, with Y=C,P,N,S)
 */
export function addHalogenAcceptors (structure: Structure, features: Features) {
  structure.eachAtom(a => {
    if (X.includes(a.number)) {
      let flag = false
      a.eachBondedAtom(ba => {
        if (Y.includes(ba.number)) {
          flag = true
        }
      })
      if (flag) {
        const state = createFeatureState(FeatureType.HalogenAcceptor)
        addAtom(state, a)
        addFeature(features, state)
      }
    }
  })
}

function isHalogenBond (ti: FeatureType, tj: FeatureType) {
  return (
    (ti === FeatureType.HalogenAcceptor && tj === FeatureType.HalogenDonor) ||
    (ti === FeatureType.HalogenDonor && tj === FeatureType.HalogenAcceptor)
  )
}

export interface HalogenBondsParams {
  maxHalogenBondDistance?: number
}

/**
 * All pairs of halogen donor and acceptor atoms
 */
export function addHalogenBonds (structure: Structure, contacts: Contacts, params: HalogenBondsParams = {}) {
  const maxHalogenBondDistance = defaults(params.maxHalogenBondDistance, ContactDefaultParams.maxHalogenBondDistance)

  const { features, spatialHash, contactStore, featureSet } = contacts
  const { types, centers, atomSets } = features
  const { x, y, z } = centers
  const n = types.length

  const ap1 = structure.getAtomProxy()
  const ap2 = structure.getAtomProxy()

  for (let i = 0; i < n; ++i) {
    spatialHash.eachWithin(x[i], y[i], z[i], maxHalogenBondDistance, (j, dSq) => {
      if (j <= i) return

      ap1.index = atomSets[ i ][ 0 ]
      ap2.index = atomSets[ j ][ 0 ]

      if (invalidAtomContact(ap1, ap2)) return

      if (isHalogenBond(types[ i ], types[ j ])) {
        featureSet.setBits(i, j)
        contactStore.addContact(i, j, ContactType.HalogenBond)
      }
    })
  }
}
