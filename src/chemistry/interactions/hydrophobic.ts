/**
 * @file Hydrophobic
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import { defaults } from '../../utils'
import Structure from '../../structure/structure'
import { Elements } from '../../structure/structure-constants'
import {
  Features, FeatureType,
  addAtom, addFeature, createFeatureState,
} from './features'
import { Contacts, ContactType, ContactDefaultParams, invalidAtomContact } from './contact'

/**
 * Hydrophobic carbon (only bonded to carbon or hydrogen); fluorine
 */
export function addHydrophobic (structure: Structure, features: Features) {
  structure.eachAtom(a => {
    const state = createFeatureState(FeatureType.Hydrophobic)
    let flag = false
    if (a.number === Elements.C) {
      flag = true
      a.eachBondedAtom(ap => {
        const an = ap.number
        if (an !== Elements.C && an !== Elements.H) flag = false
      })
    } else if (a.number === Elements.F) {
      flag = true
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
  maxHydrophobicDist?: number
  masterModelIndex?: number
}

/**
 * All hydrophobic contacts
 */
export function addHydrophobicContacts (structure: Structure, contacts: Contacts, params: HydrophobicContactsParams = {}) {
  const maxHydrophobicDist = defaults(params.maxHydrophobicDist, ContactDefaultParams.maxHydrophobicDist)
  const masterIdx = defaults(params.masterModelIndex, ContactDefaultParams.masterModelIndex)

  const { features, spatialHash, contactStore, featureSet } = contacts
  const { types, centers, atomSets } = features
  const { x, y, z } = centers
  const n = types.length

  const ap1 = structure.getAtomProxy()
  const ap2 = structure.getAtomProxy()

  for (let i = 0; i < n; ++i) {
    spatialHash.eachWithin(x[i], y[i], z[i], maxHydrophobicDist, (j, dSq) => {
      if (j <= i) return

      ap1.index = atomSets[ i ][ 0 ]
      ap2.index = atomSets[ j ][ 0 ]

      if (invalidAtomContact(ap1, ap2, masterIdx)) return
      if (ap1.number === Elements.F && ap2.number === Elements.F) return
      if (ap1.connectedTo(ap2)) return

      if (isHydrophobicContact(types[ i ], types[ j ])) {
        featureSet.setBits(i, j)
        contactStore.addContact(i, j, ContactType.Hydrophobic)
      }
    })
  }
}
