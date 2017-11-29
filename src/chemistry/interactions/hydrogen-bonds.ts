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
import { Angles, AtomGeometry, calcAngles, calcPlaneAngle } from '../geometry'
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
    if (isHistidineNitrogen(a)) {
      // include both nitrogen atoms in histidine due to
      // their often ambiguous protonation assignment
      addAtom(state, a)
      addFeature(features, state)
    } else if (totalH[ a.index ] > 0 && (an === 7 || an === 8 || an === 16)) {  // N, O, S
      addAtom(state, a)
      addFeature(features, state)
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
      (
        a.bondToElementCount('N') > 0 ||
        a.bondToElementCount('O') > 0 ||
        inAromaticRingWithElectronNegativeElement(a)
      )
    ) {
      const state = createFeatureState(FeatureType.WeakHydrogenDonor)
      addAtom(state, a)
      addFeature(features, state)
    }
  })
}

function inAromaticRingWithElectronNegativeElement (a: AtomProxy) {
  if (!a.isAromatic()) return false

  const ringData = a.residueType.getRings()
  if (!ringData) return false

  let hasElement = false
  const rings = ringData.rings
  rings.forEach(ring => {
    if (hasElement) return  // already found one
    if (ring.some(idx => (a.index - a.residueAtomOffset) === idx)) {  // in ring
      hasElement = ring.some(idx => {
        const atomTypeId = a.residueType.atomTypeIdList[ idx ]
        const number = a.atomMap.get(atomTypeId).number
        return number === 7 || number === 8  // N, O
      })
    }
  })

  return hasElement
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
      // Basically assume all oxygen atoms are acceptors!
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
      if (a.resname === 'CYS' || a.resname === 'MET' || a.formalCharge === -1) {
        addAtom(state, a)
        addFeature(features, state)
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
  return ap.resname === 'HIS' && ap.number == 7 && ap.isRing()
}

function isBackboneHydrogenBond (ap1: AtomProxy, ap2: AtomProxy) {
  return ap1.isBackbone() && ap2.isBackbone()
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

function getHydrogenBondType (ap1: AtomProxy, ap2: AtomProxy) {
  if (isWaterHydrogenBond(ap1, ap2)) {
    return ContactType.WaterHydrogenBond
  } else if (isBackboneHydrogenBond(ap1, ap2)) {
    return ContactType.BackboneHydrogenBond
  } else {
    return ContactType.HydrogenBond
  }
}

export interface HydrogenBondParams {
  maxHbondDist?: number
  maxHbondSulfurDist?: number
  maxHbondAccAngle?: number
  maxHbondDonAngle?: number
  maxHbondAccDihedral?: number
  maxHbondDonDihedral?: number
  backboneHbond?: boolean
  waterHbond?: boolean
  masterModelIndex?: number
}

/**
 * All pairs of hydrogen donor and acceptor atoms
 */
export function addHydrogenBonds (structure: Structure, contacts: Contacts, params: HydrogenBondParams = {}) {
  const maxHbondDist = defaults(params.maxHbondDist, ContactDefaultParams.maxHbondDist)
  const maxHbondSulfurDist = defaults(params.maxHbondSulfurDist, ContactDefaultParams.maxHbondSulfurDist)
  const maxHbondAccAngle = degToRad(defaults(params.maxHbondAccAngle, ContactDefaultParams.maxHbondAccAngle))
  const maxHbondDonAngle = degToRad(defaults(params.maxHbondDonAngle, ContactDefaultParams.maxHbondDonAngle))
  const maxHbondAccDihedral = degToRad(defaults(params.maxHbondAccDihedral, ContactDefaultParams.maxHbondAccDihedral))
  const maxHbondDonDihedral = degToRad(defaults(params.maxHbondDonDihedral, ContactDefaultParams.maxHbondDonDihedral))
  const masterIdx = defaults(params.masterModelIndex, ContactDefaultParams.masterModelIndex)

  const maxDist = Math.max(maxHbondDist, maxHbondSulfurDist)
  const maxHbondDistSq = maxHbondDist * maxHbondDist

  const { features, spatialHash, contactStore, featureSet } = contacts
  const { types, centers, atomSets } = features
  const { x, y, z } = centers
  const n = types.length

  const { idealGeometry } = valenceModel(structure.data)

  const donor = structure.getAtomProxy()
  const acceptor = structure.getAtomProxy()

  for (let i = 0; i < n; ++i) {
    spatialHash.eachWithin(x[i], y[i], z[i], maxDist, (j, dSq) => {
      if (j <= i) return

      const ti = types[ i ]
      const tj = types[ j ]

      const isWeak = isWeakHydrogenBond(ti, tj)
      if (!isWeak && !isHydrogenBond(ti, tj)) return

      const [ l, k ] = types[ j ] === FeatureType.HydrogenAcceptor ? [ i, j ] : [ j, i ]

      donor.index = atomSets[ l ][ 0 ]
      acceptor.index = atomSets[ k ][ 0 ]

      if (invalidAtomContact(donor, acceptor, masterIdx)) return
      if (donor.number !== 16 && acceptor.number !== 16 && dSq > maxHbondDistSq) return

      const donorAngles = calcAngles(donor, acceptor)
      let reject = false
      const idealDonorAngle = Angles.get(idealGeometry[donor.index]) || degToRad(120)
      donorAngles.forEach(donorAngle => {
        if (Math.abs(idealDonorAngle - donorAngle) > maxHbondDonAngle) reject = true
      })
      if (reject) return

      if (idealGeometry[donor.index] === AtomGeometry.Trigonal){
        const outOfPlane = calcPlaneAngle(donor, acceptor)
        if (outOfPlane !== undefined && outOfPlane > maxHbondDonDihedral) return
      }

      const acceptorAngles = calcAngles(acceptor, donor)
      const idealAcceptorAngle = Angles.get(idealGeometry[acceptor.index]) || degToRad(120)
      acceptorAngles.forEach(acceptorAngle => {
        if (Math.abs(idealAcceptorAngle - acceptorAngle) > maxHbondAccAngle) reject = true
      })
      if (reject) return

      if (idealGeometry[acceptor.index] === AtomGeometry.Trigonal){
        const outOfPlane = calcPlaneAngle(acceptor, donor)
        if (outOfPlane !== undefined && outOfPlane > maxHbondAccDihedral) return
      }

      featureSet.setBits(l, k)
      const bondType = isWeak ? ContactType.WeakHydrogenBond : getHydrogenBondType(donor, acceptor)
      contactStore.addContact(l, k, bondType)
    })
  }
}
