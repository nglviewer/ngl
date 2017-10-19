/**
 * @file Hydrogen Bonds
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import { Vector3 } from 'three'

import { defaults } from '../../utils'
import { radToDeg, degToRad } from '../../math/math-utils'
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
    if (an === 7 || an === 8 || an === 9) {  // N, O, F
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
        (resname === 'CYS' && atomname === 'SG')
      ) {
        addAtom(state, a)
        addFeature(features, state)
        return
      }
    }
  })
}

/**
 * Weak hydrogen donor
 */
export function addWeakHydrogenDonors (structure: Structure, features: Features) {
  structure.eachAtom(a => {
    const state = createFeatureState(FeatureType.HydrogenAcceptor) // Acceptor?
    let flag = false
    if (a.number === 6) {
      // Depends on choice of definition but would usually say
      // aromatic C adjacent to N for a weak donor
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

/**
 * Potential hydrogen acceptor
 */
export function addHydrogenAcceptors (structure: Structure, features: Features) {
  const { charge, implicitH } = valenceModel(structure.data)

  structure.eachAtom(a => {
    const state = createFeatureState(FeatureType.HydrogenAcceptor)

    const an = a.number
    const resname = a.resname
    const atomname = a.atomname
    if (an === 9) {  // F
      // organic fluorine
      a.hasBondToElement('C')
    }else if (an === 8) {  // O
      if (
        (resname === 'ASN' && atomname === 'OD1') ||
        (resname === 'ASP' && ['OD1', 'OD2'].includes(atomname)) ||
        (resname === 'GLN' && atomname === 'OE1') ||
        (resname === 'GLU' && ['OE1', 'OE2'].includes(atomname)) ||
        (resname === 'SER' && atomname === 'OG') ||
        (resname === 'THR' && atomname === 'OG1') ||
        (resname === 'TYR' && atomname === 'OH')
      ) {
        addAtom(state, a)
        addFeature(features, state)
        return
      }
      if (
        (['C', 'DC'].includes(resname) && ['O2'].includes(atomname)) ||
        (['T', 'DT'].includes(resname) && ['O2', 'O4'].includes(atomname)) ||
        (['U', 'DU'].includes(resname) && ['O2', 'O4'].includes(atomname)) ||
        (['G', 'DG'].includes(resname) && ['O6'].includes(atomname))
      ) {
        addAtom(state, a)
        addFeature(features, state)
        return
      }
      // TODO https://github.com/openbabel/openbabel/blob/master/src/atom.cpp#L1792
      if (!a.aromatic) {
        addAtom(state, a)
        addFeature(features, state)
        return
      }
    }else if (an === 7) {  // N
      if (
        (resname === 'HIS' && ['ND1', 'NE2'].includes(atomname))
      ) {
        addAtom(state, a)
        addFeature(features, state)
        return
      }
      if (
        (['C', 'DC'].includes(resname) && ['N3'].includes(atomname)) ||
        (['A', 'DA'].includes(resname) && ['N1'].includes(atomname))
      ) {
        addAtom(state, a)
        addFeature(features, state)
        return
      }
      if (charge[ a.index ] < 1){
        // pyridine is an acceptor (2 bonds), amide N is not (3 bonds)
        if (a.bondCount + implicitH[ a.index ] < 3){
          addAtom(state, a)
          addFeature(features, state)
          return
        }
      }
      /*const valence = explicitValence(a)
      const hybridization = idealValence[ a.index ]
      // N+ ions and sp2 hybrid N with 3 valences should not be hdrogen bond acceptors
      if (!(valence === 4 && hybridization === 3) && !(valence === 3 && hybridization === 2)) {
        addAtom(state, a)
        addFeature(features, state)
        return
      }*/
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

// const HydrogenCovalentBondLength: { [k: string]: number } = {
//   C: 1.09,
//   N: 0.99,
//   O: 0.96
// }
// const DefaultHydrogenCovalentBondLength = 1.0

const TrigonalAngleFactor = Math.tan(degToRad(60.0))
const TetrahedralAngleFactor = Math.tan(degToRad(180.0 - 109.471))

export interface HydrogenBondParams {
  maxHydrogenBondDistance?: number
  maxHydrogenBondAngle?: number
  backboneHydrogenBond?: boolean
  waterHydrogenBond?: boolean
}

/**
 * All pairs of hydrogen donor and acceptor atoms
 */
export function addHydrogenBonds (structure: Structure, contacts: Contacts, params: HydrogenBondParams = {}) {
  const maxHydrogenBondDistance = defaults(params.maxHydrogenBondDistance, ContactDefaultParams.maxHydrogenBondDistance)
  const maxHydrogenBondAngle = defaults(params.maxHydrogenBondAngle, ContactDefaultParams.maxHydrogenBondAngle)
  const backboneHydrogenBond = defaults(params.backboneHydrogenBond, ContactDefaultParams.backboneHydrogenBond)
  const waterHydrogenBond = defaults(params.waterHydrogenBond, ContactDefaultParams.waterHydrogenBond)

  const { features, spatialHash, contactStore, featureSet } = contacts
  const { types, centers, atomSets } = features
  const { x, y, z } = centers
  const n = types.length

  const { idealGeometry } = valenceModel(structure.data)

  const ap1 = structure.getAtomProxy()
  const ap2 = structure.getAtomProxy()
  const ap3 = structure.getAtomProxy()
  const ap4 = structure.getAtomProxy()

  const d1 = new Vector3()
  const d2 = new Vector3()
  const cr1 = new Vector3()
  const cr2 = new Vector3()

  const v1 = new Vector3()
  const v2 = new Vector3()
  const v3 = new Vector3()
  const v4 = new Vector3()
  const vp = [ v1, v2, v3, v4 ]

  const h1 = new Vector3()
  const h2 = new Vector3()
  const h3 = new Vector3()
  const hp = [ h1, h2, h3 ]

  for (let i = 0; i < n; ++i) {
    spatialHash.eachWithin(x[i], y[i], z[i], maxHydrogenBondDistance, (j, dSq) => {
      if (j <= i) return

      const ti = types[ i ]
      const tj = types[ j ]

      if (!isHydrogenBond(ti, tj)) return

      // TODO handle edge case
      const [ l, k ] = types[ i ] === FeatureType.HydrogenDonor ? [ i, j ] : [ j, i ]

      ap1.index = atomSets[ l ][ 0 ]
      ap2.index = atomSets[ k ][ 0 ]

      if (invalidAtomContact(ap1, ap2)) return

      if (!backboneHydrogenBond && isBackboneHydrogenBond(ap1, ap2)) return
      if (!waterHydrogenBond && isWaterHydrogenBond(ap1, ap2)) return

      let vn = 0
      let hn = 0

      ap1.eachBondedAtom(ba => {
        vp[ vn ].set(ba.x, ba.y, ba.z)
        ++vn
        if (ba.element === 'H') {
          hp[ hn ].set(ba.x, ba.y, ba.z)
          ++hn
        }
      })

      // tetrahedral geometry but constraint to ring plane
      const isTyr = ap1.resname === 'TYR' && ap1.atomname === 'OH'

      if (idealGeometry[ ap1.index ] === AtomGeometry.Trigonal || isTyr) {

        if (ap1.bondCount === 1) {
          // two implicit hydrogens to add
          let flag = false
          ap1.eachBondedAtom(ba => {
            if (!flag && ba.element !== 'H') {
              ap3.index = ba.index
              flag = true
            }
          })
          if (flag) {
            flag = false
            ap3.eachBondedAtom(ba => {
            if (!flag && ba.element !== 'H') {
                ap4.index = ba.index
                flag = true
              }
            })
            if (flag) {
              d1.subVectors(ap1 as any, ap3 as any)
              d2.subVectors(ap3 as any, ap4 as any)
              cr1.crossVectors(d1, d2)
              cr2.crossVectors(d1, cr1).normalize()

              d2.subVectors(d1, cr2.multiplyScalar(isTyr ? TetrahedralAngleFactor : TrigonalAngleFactor))
              d2.normalize()
              hp[hn].addVectors(ap1 as any, d2)
              ++hn

              d2.subVectors(ap1 as any, hp[hn-1])
              d1.add(d2).normalize()
              hp[hn].addVectors(ap1 as any, d1)
              ++hn
            }
          }
        } else if (ap1.bondCount === 2) {
          // one implicit hydrogen to add
          //    \
          //     X--H
          //    /
          d1.subVectors(ap1 as any, vp[0])
          d2.subVectors(ap1 as any, vp[1])
          d1.add(d2).normalize()
          hp[ hn ].addVectors(ap1 as any, d1)
          ++hn
        } else if (ap1.bondCount === 3) {
          // no implicit hydrogens to add
        }

      } else if (
        idealGeometry[ ap1.index ] === AtomGeometry.Tetrahedral
      ) {

        if (ap1.bondCount === 1) {
          // one implicit hydrogen to add
          //    \
          //   --X--H
          //    /
          d1.subVectors(ap1 as any, vp[0])
          d2.subVectors(ap2 as any, ap1 as any)
          cr1.crossVectors(d1, d2)
          cr2.crossVectors(d1, cr1).normalize()

          d2.subVectors(d1, cr2.multiplyScalar(TetrahedralAngleFactor))
          d2.normalize()
          hp[hn].addVectors(ap1 as any, d2)
          ++hn
        }

      } else {
        console.log('TODO checking angle', ap1.qualifiedName(), ap2.qualifiedName())
      }

      for (let j = 0; j < hn; ++j) {
        d1.subVectors(hp[j], ap2 as any)
        d2.subVectors(ap1 as any, hp[j])
        const angle = radToDeg(d1.angleTo(d2))
        if (angle <= maxHydrogenBondAngle) {
          featureSet.setBits(l, k)
          contactStore.addContact(l, k, ContactType.HydrogenBond)
          break
        }
      }

      // TODO
      // D-A-AA: sp2 acceptors 135 (90-180) and sp3 acceptors 109.5 (60-180)
    })
  }
}
