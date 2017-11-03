/**
 * @file Halogen Bonds
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 */

import { defaults } from '../../utils'
import Structure from '../../structure/structure'
import { degToRad } from '../../math/math-utils'
import {
  Features, FeatureType,
  addAtom, addFeature, createFeatureState,
} from './features'
import { Contacts, ContactType, ContactDefaultParams, invalidAtomContact } from './contact'
import { calcMinAngle } from '../geometry'

const halBondElements = [17, 35, 53, 85]

/**
 * Halogen bond donors (X-C, with X one of Cl, Br, I or At) not F!
 */
export function addHalogenDonors (structure: Structure, features: Features) {
  structure.eachAtom(a => {
    if (halBondElements.includes(a.number) && a.bondToElementCount('C') === 1) {
      const state = createFeatureState(FeatureType.HalogenDonor)
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
  maxHalogenBondDistance?: number,
  maxHalogenBondAngle?: number
}

/**
 * All pairs of halogen donor and acceptor atoms
 */
export function addHalogenBonds (structure: Structure, contacts: Contacts, params: HalogenBondsParams = {}) {
  const maxHalogenBondDistance = defaults(params.maxHalogenBondDistance, ContactDefaultParams.maxHalogenBondDistance)
  const maxHalogenBondAngle = degToRad(defaults(params.maxHalogenBondAngle, ContactDefaultParams.maxHalogenBondAngle))

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
      if (!isHalogenBond(types[ i ], types[ j ])) return

      const [ halogen, oxygen ] = types[ i ] === FeatureType.HalogenDonor ? [ ap1, ap2 ] : [ ap2, ap1 ]
      const angle = calcMinAngle(halogen, oxygen)
      // Angle must be defined
      if (angle === undefined) return
      if (Math.PI - angle > maxHalogenBondAngle) return

      featureSet.setBits(i, j)
      contactStore.addContact(i, j, ContactType.HalogenBond)

    })
  }
}
