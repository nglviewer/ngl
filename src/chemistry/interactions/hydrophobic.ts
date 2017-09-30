/**
 * @file Hydrophobic
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
 * Weak hydrogen donor
 */
export function addHydrophobic (structure: Structure, features: Features) {
  structure.eachAtom(a => {
    const state = createFeatureState(FeatureType.Hydrophobic)
    let flag = false
    if (a.number === 6) {
      flag = true
      a.eachBondedAtom(ap => {
        const e = ap.element
        if (e !== 'C' && e !== 'H') flag = false
      })
    }
    if (flag) {
      addAtom(state, a)
      addFeature(features, state)
    }
  })
}

function isHydrophobicContact (ti: FeatureType, tj: FeatureType) {
  return ti === FeatureType.Hydrophobic && tj === FeatureType.Hydrophobic
}

export interface HydrophobicContactsParams {
  maxHydrophobicDistance?: number
}

/**
 * All contacts between carbon atoms that are only bonded to carbon or hydrogen
 */
export function addHydrophobicContacts (structure: Structure, contacts: Contacts, params: HydrophobicContactsParams = {}) {
  const maxHydrophobicDistance = defaults(params.maxHydrophobicDistance, ContactDefaultParams.maxHydrophobicDistance)

  const { features, spatialHash, contactStore, featureSet } = contacts
  const { types, centers, atomSets } = features
  const { x, y, z } = centers
  const n = types.length

  const ap1 = structure.getAtomProxy()
  const ap2 = structure.getAtomProxy()

  for (let i = 0; i < n; ++i) {
    spatialHash.eachWithin(x[i], y[i], z[i], maxHydrophobicDistance, (j, dSq) => {
      if (j <= i) return

      ap1.index = atomSets[ i ][ 0 ]
      ap2.index = atomSets[ j ][ 0 ]

      if (invalidAtomContact(ap1, ap2)) return

      if (isHydrophobicContact(types[ i ], types[ j ])) {
        featureSet.setBits(i, j)
        contactStore.addContact(i, j, ContactType.Hydrophobic)
      }
    })
  }
}
