/**
 * @file Charged
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 */

import { Vector3 } from 'three'

import { defaults } from '../../utils'
import { radToDeg } from '../../math/math-utils'
import Structure from '../../structure/structure'
import { AA3 } from '../../structure/structure-constants'
import { valenceModel } from '../../structure/data'
import {
  isGuanidine, isSulfonicAcid, isPhosphate, isSulfate, isCarboxylate
} from '../functional-groups'
import {
  Features, FeatureType, FeatureGroup,
  addAtom, addFeature, createFeatureState,
} from './features'
import { Contacts, ContactType, ContactDefaultParams, invalidAtomContact } from './contact'

const PositvelyCharged = [ 'ARG', 'HIS', 'LYS' ]
const NegativelyCharged = [ 'GLU', 'ASP' ]

export function addPositiveCharges (structure: Structure, features: Features) {
  const { charge } = valenceModel(structure.data)

  structure.eachResidue(r => {
    if (PositvelyCharged.includes(r.resname)) {
      const state = createFeatureState(FeatureType.PositiveCharge)
      r.eachAtom(a => {
        if (a.element === 'N' && a.isSidechain()) {
          addAtom(state, a)
        }
      })
      addFeature(features, state)
    } else if(!AA3.includes(r.resname) && !r.isNucleic()) {
      r.eachAtom(a => {
        const state = createFeatureState(FeatureType.PositiveCharge)
        if (charge[ a.index   ] > 0) {
          state.group = FeatureGroup.Unknown
          addAtom(state, a)
        } else if (isGuanidine(a)) {
          // Guanidines don't get assigned positive charge by valence
          // model, for now fix here:
          state.group = FeatureGroup.Guanidine
          addAtom(state, a)
        }
        addFeature(features, state)
      })
    }
  })
}

export function addNegativeCharges (structure: Structure, features: Features) {
  const { charge } = valenceModel(structure.data)

  structure.eachResidue(r => {
    if (NegativelyCharged.includes(r.resname)) {
      const state = createFeatureState(FeatureType.NegativeCharge)
      r.eachAtom(a => {
        if (a.element === 'O' && a.isSidechain()) {
          addAtom(state, a)
        }
      })
      addFeature(features, state)
    } else if(!AA3.includes(r.resname) && !r.isNucleic()) {
      r.eachAtom(a => {
        const state = createFeatureState(FeatureType.NegativeCharge)
        if (isSulfonicAcid(a)) {
          state.group = FeatureGroup.SulfonicAcid
          addAtom(state, a)
        } else if (isPhosphate(a)) {
          state.group = FeatureGroup.Phosphate
          addAtom(state, a)
        } else if (isSulfate(a)) {
          state.group = FeatureGroup.Sulfate
          addAtom(state, a)
        } else if (isCarboxylate(a)) {
          state.group = FeatureGroup.Carboxylate
          addAtom(state, a)
        } else if (charge[a.index] < 0) {
          // TODO: This ends up adding both O- and
          // the C/S/P at the centre of one of the above types
          // as negative charge centres. Need to delocalize negative
          // charges better
          addAtom(state, a)
        }
        addFeature(features, state)
      })
    }
  })
}

export function addAromaticRings (structure: Structure, features: Features) {
  const a = structure.getAtomProxy()
  structure.eachResidue(r => {
    const rings = r.getAromaticRings()
    if (rings) {
      const offset = r.atomOffset
      rings.forEach(ring => {
        const state = createFeatureState(FeatureType.AromaticRing)
        ring.forEach(i => {
          a.index = i + offset
          addAtom(state, a)
        })
        addFeature(features, state)
      })
    }
  })
}

function isSaltBridge (ti: FeatureType, tj: FeatureType) {
  return (
    (ti === FeatureType.NegativeCharge && tj === FeatureType.PositiveCharge) ||
    (ti === FeatureType.PositiveCharge && tj === FeatureType.NegativeCharge)
  )
}

function isPiStacking (ti: FeatureType, tj: FeatureType) {
  return ti === FeatureType.AromaticRing && tj === FeatureType.AromaticRing
}

function isCationPi (ti: FeatureType, tj: FeatureType) {
  return (
    (ti === FeatureType.AromaticRing && tj === FeatureType.PositiveCharge) ||
    (ti === FeatureType.PositiveCharge && tj === FeatureType.AromaticRing)
  )
}

export interface ChargedContactsParams {
  maxSaltbridgeDist?: number
  maxPiStackingDist?: number
  maxPiStackingOffset?: number
  maxPiStackingAngle?: number
  maxCationPiDist?: number
  maxCationPiOffset?: number
}

export function addChargedContacts (structure: Structure, contacts: Contacts, params: ChargedContactsParams = {}) {
  const maxSaltbridgeDist = defaults(params.maxSaltbridgeDist, ContactDefaultParams.maxSaltbridgeDist)
  const maxPiStackingDist = defaults(params.maxPiStackingDist, ContactDefaultParams.maxPiStackingDist)
  const maxPiStackingOffset = defaults(params.maxPiStackingOffset, ContactDefaultParams.maxPiStackingOffset)
  const maxPiStackingAngle = defaults(params.maxPiStackingAngle, ContactDefaultParams.maxPiStackingAngle)
  const maxCationPiDist = defaults(params.maxCationPiDist, ContactDefaultParams.maxCationPiDist)
  const maxCationPiOffset = defaults(params.maxCationPiOffset, ContactDefaultParams.maxCationPiOffset)

  const maxDistance = Math.max(maxSaltbridgeDist, maxPiStackingDist, maxCationPiDist)
  const maxSaltbridgeDistSq = maxSaltbridgeDist * maxSaltbridgeDist
  const maxPiStackingDistSq = maxPiStackingDist * maxPiStackingDist
  const maxCationPiDistSq = maxCationPiDist * maxCationPiDist

  const { features, spatialHash, contactStore, featureSet } = contacts
  const { types, centers, atomSets } = features
  const { x, y, z } = centers
  const n = types.length

  const ax = structure.atomStore.x
  const ay = structure.atomStore.y
  const az = structure.atomStore.z

  const ap1 = structure.getAtomProxy()
  const ap2 = structure.getAtomProxy()

  const v1 = new Vector3()
  const v2 = new Vector3()
  const v3 = new Vector3()
  const d1 = new Vector3()
  const d2 = new Vector3()
  const n1 = new Vector3()
  const n2 = new Vector3()

  const getNormal = function (atoms: number[], normal: Vector3) {
    v1.set(ax[ atoms[ 0 ] ], ay[ atoms[ 0 ] ], az[ atoms[ 0 ] ])
    v2.set(ax[ atoms[ 1 ] ], ay[ atoms[ 1 ] ], az[ atoms[ 1 ] ])
    v3.set(ax[ atoms[ 2 ] ], ay[ atoms[ 2 ] ], az[ atoms[ 2 ] ])
    d1.subVectors(v1, v2)
    d2.subVectors(v1, v3)
    normal.crossVectors(d1, d2)
  }

  const getOffset = function (i: number, j: number, normal: Vector3) {
    v1.set(x[ i ], y[ i ], z[ i ])
    v2.set(x[ j ], y[ j ], z[ j ])
    return v1.sub(v2).projectOnPlane(normal).add(v2).distanceTo(v2)
  }

  const add = function (i: number, j: number, ct: ContactType) {
    featureSet.setBits(i, j)
    contactStore.addContact(i, j, ct)
  }

  for (let i = 0; i < n; ++i) {
    spatialHash.eachWithin(x[i], y[i], z[i], maxDistance, (j, dSq) => {
      if (j <= i) return

      ap1.index = atomSets[ i ][ 0 ]
      ap2.index = atomSets[ j ][ 0 ]

      if (invalidAtomContact(ap1, ap2)) return

      const ti = types[ i ]
      const tj = types[ j ]

      if (isSaltBridge(ti, tj)) {
        if (dSq <= maxSaltbridgeDistSq) {
          add(i, j, ContactType.SaltBridge)
        }
      } else if (isPiStacking(ti, tj)) {
        if (dSq <= maxPiStackingDistSq) {
          getNormal(atomSets[ i ], n1)
          getNormal(atomSets[ j ], n2)

          const angle = radToDeg(n1.angleTo(n2))
          const offset = Math.min(getOffset(i, j, n2), getOffset(j, i, n1))
          if (offset <= maxPiStackingOffset) {
            if (angle <= maxPiStackingAngle) {
              add(i, j, ContactType.PiStacking)  // parallel
            } else if (angle <= maxPiStackingAngle + 90 && angle >= 90 - maxPiStackingAngle) {
              add(i, j, ContactType.PiStacking)  // t-shaped
            }
          }
        }
      } else if (isCationPi(ti, tj)) {
        if (dSq <= maxCationPiDistSq) {
          const [ l, k ] = ti === FeatureType.AromaticRing ? [ i, j ] : [ j, i ]

          getNormal(atomSets[ l ], n1)
          const offset = getOffset(k, l, n1)
          if (offset <= maxCationPiOffset) {
            add(l, k, ContactType.CationPi)
          }
        }
      }
    })
  }
}
