/**
 * @file Halogen Bonds
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 */

import { defaults } from '../../utils'
import Structure from '../../structure/structure'
import { Elements } from '../../structure/structure-constants'
import { degToRad } from '../../math/math-utils'
import {
  Features, FeatureType,
  addAtom, addFeature, createFeatureState,
} from './features'
import { Contacts, ContactType, ContactDefaultParams, invalidAtomContact } from './contact'
import { calcAngles } from '../geometry'

const halBondElements = [17, 35, 53, 85]

/**
 * Halogen bond donors (X-C, with X one of Cl, Br, I or At) not F!
 */
export function addHalogenDonors (structure: Structure, features: Features) {
  structure.eachAtom(a => {
    if (halBondElements.includes(a.number) && a.bondToElementCount(Elements.C) === 1) {
      const state = createFeatureState(FeatureType.HalogenDonor)
      addAtom(state, a)
      addFeature(features, state)
    }
  })
}

const X = [ Elements.N, Elements.O, Elements.S ]
const Y = [ Elements.C, Elements.N, Elements.P, Elements.S ]

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
  maxHalogenBondDist?: number
  maxHalogenBondAngle?: number
  masterModelIndex?: number
}

// http://www.pnas.org/content/101/48/16789.full
const OptimalHalogenAngle = degToRad(180)  // adjusted from 165 to account for spherical statistics
const OptimalAcceptorAngle = degToRad(120)

/**
 * All pairs of halogen donor and acceptor atoms
 */
export function addHalogenBonds (structure: Structure, contacts: Contacts, params: HalogenBondsParams = {}) {
  const maxHalogenBondDist = defaults(params.maxHalogenBondDist, ContactDefaultParams.maxHalogenBondDist)
  const maxHalogenBondAngle = degToRad(defaults(params.maxHalogenBondAngle, ContactDefaultParams.maxHalogenBondAngle))
  const masterIdx = defaults(params.masterModelIndex, ContactDefaultParams.masterModelIndex)

  const { features, spatialHash, contactStore, featureSet } = contacts
  const { types, centers, atomSets } = features
  const { x, y, z } = centers
  const n = types.length

  const ap1 = structure.getAtomProxy()
  const ap2 = structure.getAtomProxy()

  for (let i = 0; i < n; ++i) {
    spatialHash.eachWithin(x[i], y[i], z[i], maxHalogenBondDist, (j, dSq) => {
      if (j <= i) return

      ap1.index = atomSets[ i ][ 0 ]
      ap2.index = atomSets[ j ][ 0 ]

      if (invalidAtomContact(ap1, ap2, masterIdx)) return
      if (!isHalogenBond(types[ i ], types[ j ])) return

      const [ halogen, acceptor ] = types[ i ] === FeatureType.HalogenDonor ? [ ap1, ap2 ] : [ ap2, ap1 ]

      const halogenAngles = calcAngles(halogen, acceptor)
      // Singly bonded halogen only (not bromide ion for example)
      if (halogenAngles.length !== 1) return
      if (OptimalHalogenAngle - halogenAngles[0] > maxHalogenBondAngle) return

      const acceptorAngles = calcAngles(acceptor, halogen)
      // Angle must be defined. Excludes water as acceptor. Debatable
      if (acceptorAngles.length === 0) return
      if (acceptorAngles.some(acceptorAngle => {
        return (OptimalAcceptorAngle - acceptorAngle > maxHalogenBondAngle)
      })) return


      featureSet.setBits(i, j)
      contactStore.addContact(i, j, ContactType.HalogenBond)

    })
  }
}
