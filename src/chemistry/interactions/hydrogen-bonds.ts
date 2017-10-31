/**
 * @file Hydrogen Bonds
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import { Vector3 } from 'three'

import { defaults } from '../../utils'
import { degToRad } from '../../math/math-utils'
import Structure from '../../structure/structure'
import AtomProxy from '../../proxy/atom-proxy'
import { valenceModel } from '../../structure/data'
import { AtomGeometry } from '../valence-model'
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
    const resname = a.resname
    const atomname = a.atomname
    if (an === 7 || an === 8 || an === 9) {  // N, O, F, S
      if (
        (resname === 'ARG' && ['NE', 'NH1', 'NH2'].includes(atomname)) ||
        (resname === 'ASN' && atomname === 'ND2') ||
        (resname === 'GLN' && atomname === 'NE2') ||
        (resname === 'HIS' && ['ND1', 'NE2'].includes(atomname)) ||
        (resname === 'LYS' && atomname === 'NZ') ||
        (resname === 'SER' && atomname === 'OG') ||
        (resname === 'THR' && atomname === 'OG1') ||
        (resname === 'TRP' && atomname === 'NE1') ||
        (resname === 'TYR' && atomname === 'OH')
      ) {
        addAtom(state, a)
        addFeature(features, state)
        return
      }
      if (
        (['C', 'DC'].includes(resname) && ['N4'].includes(atomname)) ||
        (['T', 'DT'].includes(resname) && ['N3'].includes(atomname)) ||
        (['U', 'DU'].includes(resname) && ['N3'].includes(atomname)) ||
        (['G', 'DG'].includes(resname) && ['N1', 'N2'].includes(atomname)) ||
        (['A', 'DA'].includes(resname) && ['N6'].includes(atomname))
      ) {
        addAtom(state, a)
        addFeature(features, state)
        return
      }
      if (atomname === 'N' && a.isProtein()) {
        addAtom(state, a)
        addFeature(features, state)
        return
      }
      if (totalH[ a.index ] > 0) {
        addAtom(state, a)
        addFeature(features, state)
        return
      }
    } else if (an === 16) {  // S
      if (
        (resname === 'CYS' && atomname === 'SG') ||
        (totalH[ a.index] > 0) // Ligand SH
      ) {
        addAtom(state, a)
        addFeature(features, state)
        return
      }
    }
  })
}

/**
 * Weak hydrogen donor.
 */
export function addWeakHydrogenDonors (structure: Structure, features: Features) {
  // TODO: Previous version assigned HydrogenAcceptors to any C bound only
  // to C and H? Check if this was intended?
  const { totalH, idealGeometry } = valenceModel(structure.data)

  structure.eachAtom(a => {
    if (
      a.number === 6 &&
      totalH[ a.index ] > 0 &&
      idealGeometry[ a.index] === AtomGeometry.Trigonal &&
      a.bondToElementCount('N') > 0
      // Better check would be "is there a nitrogen in an aromatic ring?"
      // e.g. CH para to N in pyridine
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
    const resname = a.resname
    const atomname = a.atomname
    if (an === 8) {  // O
      // Basically assume all O are acceptors!
      // TODO https://github.com/openbabel/openbabel/blob/master/src/atom.cpp#L1792
      // if (!a.aromatic) {
        addAtom(state, a)
        addFeature(features, state)
        return
      // }
    }else if (an === 7) {  // N
      if (
        (resname === 'HIS' && ['ND1', 'NE2'].includes(atomname))
      ) {
        addAtom(state, a)
        addFeature(features, state)
        return
      }
      else if (
        (['C', 'DC'].includes(resname) && ['N3'].includes(atomname)) ||
        (['A', 'DA'].includes(resname) && ['N1'].includes(atomname))
      ) {
        addAtom(state, a)
        addFeature(features, state)
        return
      }
      else if (charge[ a.index ] < 1){
        // Neutral nitrogen might be an acceptor
        // It must have at least one lone pair not conjugated
        const totalBonds = a.bondCount + implicitH[ a.index ]
        if (
          (idealGeometry[ a.index ] === AtomGeometry.Tetrahedral
          && totalBonds < 4) ||
          (idealGeometry[ a.index ] === AtomGeometry.Trigonal
          && totalBonds < 3) ||
          (idealGeometry[ a.index ] === AtomGeometry.Linear
          && totalBonds < 2)
        ) {
          addAtom(state, a)
          addFeature(features, state)
          return
        }
      }
    }else if (an === 16) {
      if (
        (resname === 'CYS' && atomname === 'SG') ||
        (resname === 'MET' && atomname === 'SD')
      ) {
        addAtom(state, a)
        addFeature(features, state)
        return
      }
      if (a.formalCharge === -1) {  // S
        // Allow sulfur hdrogen bond
        addAtom(state, a)
        addFeature(features, state)
        return
      }
    }
  })
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

// const HydrogenCovalentBondLength: { [k: string]: number } = {
//   C: 1.09,
//   N: 0.99,
//   O: 0.96
// }
// const DefaultHydrogenCovalentBondLength = 1.0

/* const TrigonalAngleFactor = Math.tan(degToRad(60.0))
const TetrahedralAngleFactor = Math.tan(degToRad(180.0 - 109.471))
*/

const Angles = new Map<AtomGeometry, number>([
  [ AtomGeometry.Linear, degToRad(180) ],
  [ AtomGeometry.Trigonal, degToRad(120) ],
  [ AtomGeometry.Tetrahedral, degToRad(109.4721) ],
  [ AtomGeometry.Octahedral, degToRad(90) ]
])

/**
 * Calculate the minimum angle x-1-2 where x is a heavy atom bonded to ap1.
 * @param  {AtomProxy} ap1 First atom (angle centre)
 * @param  {AtomProxy} ap2 Second atom
 * @return {Number}        Angle in radians
 */
export function calcMinAngle (ap1: AtomProxy, ap2: AtomProxy): number {
  let angle = degToRad(120) // Reasonable default if we can't find any neighbours
  const d1 = new Vector3()
  const d2 = new Vector3()
  d1.subVectors(ap2 as any, ap1 as any)
  ap1.eachBondedAtom( x => {
    if (x.element !== 'H') {
      d2.subVectors(x as any, ap1 as any)
      angle = Math.min(angle, d1.angleTo(d2))
    }
   })
  return angle
}

/**
 * Find two neighbours of ap1 to define a plane (if possible) and
 * measure angle out of plane to ap2
 * @param  {AtomProxy} ap1 First atom (angle centre)
 * @param  {AtomProxy} ap2 Second atom (out-of-plane)
 * @return {number}        Angle from plane to second atom
 */
export function calcPlaneAngle (ap1: AtomProxy, ap2: AtomProxy): number {
  const x1 = ap1.clone()

  const v12 = new Vector3()
  v12.subVectors(ap2 as any, ap1 as any)

  const neighbours = [new Vector3(), new Vector3()]
  let ni = 0
  ap1.eachBondedAtom( x => {
    if (ni > 1) { return }
    if (x.element !== 'H') {
      x1.index = x.index
      neighbours[ni++].subVectors(x as any, ap1 as any)
    }
  })
  if (ni === 1) {
    x1.eachBondedAtom( x => {
      if (ni > 1) { return }
      if (x.element !== 'H' && x.index !== ap1.index){
        neighbours[ni++].subVectors(x as any, ap1 as any)
      }
    })
  }
  if (ni !== 2) {
    return 0.0
  }

  const cp = neighbours[0].cross(neighbours[1])
  return Math.abs((Math.PI / 2) - cp.angleTo(v12))
}

export interface HydrogenBondParams {
  maxHydrogenBondDistance?: number
  maxHydrogenBondAngle?: number
  backboneHydrogenBond?: boolean
  waterHydrogenBond?: boolean
  weakHydrogenBond?: boolean
}

/**
 * All pairs of hydrogen donor and acceptor atoms
 */
export function addHydrogenBonds (structure: Structure, contacts: Contacts, params: HydrogenBondParams = {}) {
  const maxHydrogenBondDistance = defaults(params.maxHydrogenBondDistance, ContactDefaultParams.maxHydrogenBondDistance)
  const maxHydrogenBondAngle = degToRad(defaults(params.maxHydrogenBondAngle, ContactDefaultParams.maxHydrogenBondAngle))
  const backboneHydrogenBond = defaults(params.backboneHydrogenBond, ContactDefaultParams.backboneHydrogenBond)
  const waterHydrogenBond = defaults(params.waterHydrogenBond, ContactDefaultParams.waterHydrogenBond)
  const weakHydrogenBond = defaults(params.weakHydrogenBond, ContactDefaultParams.weakHydrogenBond)

  const { features, spatialHash, contactStore, featureSet } = contacts
  const { types, centers, atomSets } = features
  const { x, y, z } = centers
  const n = types.length

  const { idealGeometry } = valenceModel(structure.data)

  const donor = structure.getAtomProxy()
  const acceptor = structure.getAtomProxy()

  for (let i = 0; i < n; ++i) {
    spatialHash.eachWithin(x[i], y[i], z[i], maxHydrogenBondDistance, (j, dSq) => {
      if (j <= i) return

      const ti = types[ i ]
      const tj = types[ j ]

      const isWeak = isWeakHydrogenBond(ti, tj)
      if (!isHydrogenBond(ti, tj) && !isWeak) return

      // TODO handle edge case
      const [ l, k ] = types[ j ] === FeatureType.HydrogenAcceptor ? [ i, j ] : [ j, i ]

      donor.index = atomSets[ l ][ 0 ]
      acceptor.index = atomSets[ k ][ 0 ]

      if (invalidAtomContact(donor, acceptor)) return

      if (!backboneHydrogenBond && isBackboneHydrogenBond(donor, acceptor)) return
      if (!waterHydrogenBond && isWaterHydrogenBond(donor, acceptor)) return
      if (!weakHydrogenBond && isWeak) return

      const donorAngle = calcMinAngle(donor, acceptor)
      const idealDonorAngle = Angles.get(idealGeometry[donor.index]) || degToRad(120)

      if (Math.abs(idealDonorAngle - donorAngle) > maxHydrogenBondAngle) {
        return
      }

      if (idealGeometry[donor.index] === AtomGeometry.Trigonal){
        const outOfPlane = calcPlaneAngle(donor, acceptor)
        if (outOfPlane > maxHydrogenBondAngle){
          return
        }
      }

      const acceptorAngle = calcMinAngle(acceptor, donor)
      const idealAcceptorAngle = Angles.get(idealGeometry[acceptor.index]) || degToRad(120)
      if (Math.abs(idealAcceptorAngle - acceptorAngle) > maxHydrogenBondAngle) {
        // Acceptor
        return
      }

      if (idealGeometry[acceptor.index] === AtomGeometry.Trigonal){
        const outOfPlane = calcPlaneAngle(acceptor, donor)
        if (outOfPlane > maxHydrogenBondAngle){
          return
        }
      }

      featureSet.setBits(l, k)
      const bondType = isWeak ? ContactType.WeakHydrogenBond : ContactType.HydrogenBond
      contactStore.addContact(l, k, bondType)

    })
  }
}
