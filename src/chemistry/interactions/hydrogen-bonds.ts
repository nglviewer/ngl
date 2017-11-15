/**
 * @file Hydrogen Bonds
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 */
import { defaults } from '../../utils'
import { degToRad } from '../../math/math-utils'
import Structure from '../../structure/structure'
import AtomProxy from '../../proxy/atom-proxy'
import { valenceModel } from '../../structure/data'
import { Angles, AtomGeometry, calcMinAngle, calcPlaneAngle } from '../geometry'
import {
  Features, FeatureType,
  addAtom, addFeature, createFeatureState,
} from './features'
import { Contacts, ContactType, ContactDefaultParams, invalidAtomContact } from './contact'


// Geometric characteristics of hydrogen bonds involving sulfur atoms in proteins
// https://doi.org/10.1002/prot.22327

// Satisfying Hydrogen Bonding Potential in Proteins (HBPLUS)
// https://doi.org/10.1006/jmbi.1994.1334
// http://www.csb.yale.edu/userguides/datamanip/hbplus/hbplus_descrip.html

/**
 * Potential hydrogen donor
 */
export function addHydrogenDonors (structure: Structure, features: Features) {
  const { totalH } = valenceModel(structure.data)

  structure.eachAtom(a => {
    const state = createFeatureState(FeatureType.HydrogenDonor)

    const an = a.number
    if (an === 7 || an === 8 || an === 9) {  // N, O, F
      if (isHistidineNitrogen(a)) {
        // include both nitrogen atoms in histidine due to
        // their often ambiguous protonation assignment
        addAtom(state, a)
        addFeature(features, state)
      } else if (totalH[ a.index ] > 0) {
        addAtom(state, a)
        addFeature(features, state)
      }
    } else if (an === 16) {  // S
      if (totalH[ a.index ] > 0) {
        addAtom(state, a)
        addFeature(features, state)
      }
    }
  })
}

/**
 * Weak hydrogen donor.
 */
export function addWeakHydrogenDonors (structure: Structure, features: Features) {
  const { totalH } = valenceModel(structure.data)

  structure.eachAtom(a => {
    if (
      a.number === 6 &&  // C
      totalH[ a.index ] > 0 &&
      a.bondToElementCount('N') > 0  // TODO && a.isAromatic()
    ) {
      const state = createFeatureState(FeatureType.WeakHydrogenDonor)
      addAtom(state, a)
      addFeature(features, state)
    }
  })
}

/**
 * Potential hydrogen acceptor
 */
export function addHydrogenAcceptors (structure: Structure, features: Features) {
  const { charge, implicitH, idealGeometry } = valenceModel(structure.data)

  structure.eachAtom(a => {
    const state = createFeatureState(FeatureType.HydrogenAcceptor)

    const an = a.number
    if (an === 8) {  // O
      // Basically assume all O are acceptors!
      addAtom(state, a)
      addFeature(features, state)
    }else if (an === 7) {  // N
      if (isHistidineNitrogen(a)) {
        // include both nitrogen atoms in histidine due to
        // their often ambiguous protonation assignment
        addAtom(state, a)
        addFeature(features, state)
      } else if (charge[ a.index ] < 1){
        // Neutral nitrogen might be an acceptor
        // It must have at least one lone pair not conjugated
        const totalBonds = a.bondCount + implicitH[ a.index ]
        const ig = idealGeometry[ a.index ]
        if (
          (ig === AtomGeometry.Tetrahedral && totalBonds < 4) ||
          (ig === AtomGeometry.Trigonal && totalBonds < 3) ||
          (ig === AtomGeometry.Linear && totalBonds < 2)
        ) {
          addAtom(state, a)
          addFeature(features, state)
        }
      }
    }else if (an === 16) {  // S
      if (
        (a.resname === 'CYS' && a.atomname === 'SG') ||
        (a.resname === 'MET' && a.atomname === 'SD')
      ) {
        addAtom(state, a)
        addFeature(features, state)
        return
      }
      if (a.formalCharge === -1) {
        // Allow sulfur hdrogen bond
        addAtom(state, a)
        addFeature(features, state)
        return
      }
    }
  })
}

/**
 * Atom that is only bound to carbon or hydrogen
 */
// function isHydrocarbon (atom: AtomProxy) {
//   let flag = true
//   atom.eachBondedAtom(ap => {
//     const e = ap.element
//     if (e !== 'C' && e !== 'H') flag = false
//   })
//   return flag
// }

function isHistidineNitrogen (ap: AtomProxy) {
  return ap.resname === 'HIS' && ['ND1', 'NE2'].includes(ap.atomname)
}

function isBackboneHydrogenBond (ap1: AtomProxy, ap2: AtomProxy) {
  return (
    (ap1.atomname === 'O' && ap2.atomname === 'N') ||
    (ap1.atomname === 'N' && ap2.atomname === 'O')
  )
}

function isWaterHydrogenBond (ap1: AtomProxy, ap2: AtomProxy) {
  return ap1.isWater() && ap2.isWater()
}

function isHydrogenBond (ti: FeatureType, tj: FeatureType) {
  return (
    (ti === FeatureType.HydrogenAcceptor && tj === FeatureType.HydrogenDonor) ||
    (ti === FeatureType.HydrogenDonor && tj === FeatureType.HydrogenAcceptor)
  )
}

function isWeakHydrogenBond (ti: FeatureType, tj: FeatureType){
  return (
    (ti === FeatureType.WeakHydrogenDonor && tj === FeatureType.HydrogenAcceptor) ||
    (ti === FeatureType.HydrogenAcceptor && tj === FeatureType.WeakHydrogenDonor)
  )
}

export interface HydrogenBondParams {
  maxHbondDist?: number
  maxHbondAccAngle?: number
  maxHbondDonAngle?: number
  maxHbondAccDihedral?: number
  maxHbondDonDihedral?: number
  backboneHbond?: boolean
  waterHbond?: boolean
}

/**
 * All pairs of hydrogen donor and acceptor atoms
 */
export function addHydrogenBonds (structure: Structure, contacts: Contacts, params: HydrogenBondParams = {}) {
  const maxHbondDist = defaults(params.maxHbondDist, ContactDefaultParams.maxHbondDist)
  const maxHbondAccAngle = degToRad(defaults(params.maxHbondAccAngle, ContactDefaultParams.maxHbondAccAngle))
  const maxHbondDonAngle = degToRad(defaults(params.maxHbondDonAngle, ContactDefaultParams.maxHbondDonAngle))
  const maxHbondAccDihedral = degToRad(defaults(params.maxHbondAccDihedral, ContactDefaultParams.maxHbondAccDihedral))
  const maxHbondDonDihedral = degToRad(defaults(params.maxHbondDonDihedral, ContactDefaultParams.maxHbondDonDihedral))
  const backboneHbond = defaults(params.backboneHbond, ContactDefaultParams.backboneHbond)
  const waterHbond = defaults(params.waterHbond, ContactDefaultParams.waterHbond)

  const { features, spatialHash, contactStore, featureSet } = contacts
  const { types, centers, atomSets } = features
  const { x, y, z } = centers
  const n = types.length

  const { idealGeometry } = valenceModel(structure.data)

  const donor = structure.getAtomProxy()
  const acceptor = structure.getAtomProxy()

  for (let i = 0; i < n; ++i) {
    spatialHash.eachWithin(x[i], y[i], z[i], maxHbondDist, (j, dSq) => {
      if (j <= i) return

      const ti = types[ i ]
      const tj = types[ j ]

      const isWeak = isWeakHydrogenBond(ti, tj)
      if (!isHydrogenBond(ti, tj) && !isWeakHydrogenBond(ti, tj)) return

      const [ l, k ] = types[ j ] === FeatureType.HydrogenAcceptor ? [ i, j ] : [ j, i ]

      donor.index = atomSets[ l ][ 0 ]
      acceptor.index = atomSets[ k ][ 0 ]

      if (invalidAtomContact(donor, acceptor)) return

      if (!backboneHbond && isBackboneHydrogenBond(donor, acceptor)) return
      if (!waterHbond && isWaterHydrogenBond(donor, acceptor)) return

      const donorAngle = calcMinAngle(donor, acceptor)
      if (donorAngle !== undefined) {
        const idealDonorAngle = Angles.get(idealGeometry[donor.index]) || degToRad(120)
        if (Math.abs(idealDonorAngle - donorAngle) > maxHbondDonAngle) return
      }

      if (idealGeometry[donor.index] === AtomGeometry.Trigonal){
        const outOfPlane = calcPlaneAngle(donor, acceptor)
        if (outOfPlane !== undefined && outOfPlane > maxHbondDonDihedral) return
      }

      const acceptorAngle = calcMinAngle(acceptor, donor)
      if (acceptorAngle !== undefined) {
        const idealAcceptorAngle = Angles.get(idealGeometry[acceptor.index]) || degToRad(120)
        if (Math.abs(idealAcceptorAngle - acceptorAngle) > maxHbondAccAngle) return
      }

      if (idealGeometry[acceptor.index] === AtomGeometry.Trigonal){
        const outOfPlane = calcPlaneAngle(acceptor, donor)
        if (outOfPlane !== undefined && outOfPlane > maxHbondAccDihedral) return
      }

      featureSet.setBits(l, k)
      const bondType = isWeak ? ContactType.WeakHydrogenBond : ContactType.HydrogenBond
      contactStore.addContact(l, k, bondType)
    })
  }
}
