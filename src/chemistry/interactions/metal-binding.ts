/**
 * @file Metal Binding
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import { defaults } from '../../utils'
import Structure from '../../structure/structure'
import { valenceModel } from '../../structure/data'
import { hasAromaticNeighbour } from '../functional-groups'
import {
  Features, FeatureType,
  addAtom, addFeature, createFeatureState,
} from './features'
import { Contacts, ContactType, ContactDefaultParams, invalidAtomContact } from './contact'

/**
 * Potential metal binding
 */
export function addMetalBinding (structure: Structure, features: Features) {
  const { implicitCharge } = valenceModel(structure.data)

  structure.eachAtom(a => {
    const state = createFeatureState(FeatureType.MetalBinding)

    const resname = a.resname
    const element = a.element
    const atomname = a.atomname
    if (a.isProtein()){
      // main chain oxygen atom or oxygen, nitrogen and sulfur from specific amino acids
      if (element === 'O') {
        if(['ASP', 'GLU', 'SER', 'THR', 'TYR'].includes(resname) && a.isSidechain()) {
          addAtom(state, a)
          addFeature(features, state)
          return
        } else if (a.isBackbone()) {
          addAtom(state, a)
          addFeature(features, state)
          return
        }
      } else if (element === 'S' && resname === 'CYS') {
        addAtom(state, a)
        addFeature(features, state)
        return
      } else if (element === 'N') {
        if(resname === 'HIS' && a.isSidechain()) {
          addAtom(state, a)
          addFeature(features, state)
          return
        }
      }
    } else if (a.isNucleic()){
      // http://pubs.acs.org/doi/pdf/10.1021/acs.accounts.6b00253
      // http://onlinelibrary.wiley.com/doi/10.1002/anie.200900399/full
      if (
        (['C', 'DC'].includes(resname) && ['O2', 'N3', 'N4', 'C5'].includes(atomname)) ||
        (['T', 'DT'].includes(resname) && ['O2', 'N3', 'O4'].includes(atomname)) ||
        (['U', 'DU'].includes(resname) && ['O2', 'N3', 'O4', 'C5'].includes(atomname)) ||
        (['G', 'DG'].includes(resname) && ['N3', 'N7', 'O6'].includes(atomname)) ||
        (['A', 'DA'].includes(resname) && ['N1', 'N7', 'N3'].includes(atomname))
      ) {
        addAtom(state, a)
        addFeature(features, state)
        return
      }
      // TODO non-standard bases
    } else if (!a.isPolymer()) {
      // water oxygen, as well as oxygen from carboxylate, phophoryl, phenolate, alcohol;
      // nitrogen from imidazole; sulfur from thiolate
      if (element === 'O') {
        // Oxygen in alcohol (R-[O]-H)
        if (a.bondCount === 2 && implicitCharge[ a.index] || a.hasBondToElement('H')) {
          addAtom(state, a)
          addFeature(features, state)
          return
        }
        // Phenolate oxygen
        if (hasAromaticNeighbour(a) && !a.aromatic) {
          addAtom(state, a)
          addFeature(features, state)
          return
        }
        // Carboxylic acid oxygen
        if (a.bondToElementCount('C') === 1) {
          let flag = false
          a.eachBondedAtom(ba => {
            if (ba.element === 'C' && ba.bondToElementCount('O') === 2 && ba.bondToElementCount('C') === 1) {
              flag = true
            }
          })
          if (flag) {
            addAtom(state, a)
            addFeature(features, state)
            return
          }
        }
        // Phosphoryl oxygen
        if (a.bondToElementCount('P') === 1) {
          let flag = false
          a.eachBondedAtom(ba => {
            if (ba.element === 'P' && ba.bondToElementCount('O') >= 3) {
              flag = true
            }
          })
          if (flag) {
            addAtom(state, a)
            addFeature(features, state)
            return
          }
        }
      } else if (element === 'N') {
        // Imidazole/pyrrole or similar
        if (a.bondToElementCount('C') === 2) {
          addAtom(state, a)
          addFeature(features, state)
          return
        }
      } else if (element === 'S') {
        // Thiolate
        if (hasAromaticNeighbour(a) && !a.aromatic) {
          addAtom(state, a)
          addFeature(features, state)
          return
        }
        // Sulfur in Iron sulfur cluster
        const ironCount = a.bondToElementCount('FE')
        if (ironCount > 0 && ironCount === a.bondCount) {
          addAtom(state, a)
          addFeature(features, state)
          return
        }
      }
    }
  })
}

export function addMetals (structure: Structure, features: Features) {
  structure.eachAtom(a => {
    if (a.isMetal()) {
      const state = createFeatureState(FeatureType.Metal)
      addAtom(state, a)
      addFeature(features, state)
    }
  })
}

function isMetalComplex (ti: FeatureType, tj: FeatureType) {
  return (
    (ti === FeatureType.Metal && tj === FeatureType.MetalBinding) ||
    (ti === FeatureType.MetalBinding && tj === FeatureType.Metal)
  )
}

export interface MetalComplexationParams {
  maxMetalDistance?: number
}

/**
 * Metal complexes of metals and appropriate groups in protein and ligand, including water
 */
export function addMetalComplexation (structure: Structure, contacts: Contacts, params: MetalComplexationParams = {}) {
  const maxMetalDistance = defaults(params.maxMetalDistance, ContactDefaultParams.maxMetalDistance)

  const { features, spatialHash, contactStore, featureSet } = contacts
  const { types, centers, atomSets } = features
  const { x, y, z } = centers
  const n = types.length

  const ap1 = structure.getAtomProxy()
  const ap2 = structure.getAtomProxy()

  for (let i = 0; i < n; ++i) {
    spatialHash.eachWithin(x[i], y[i], z[i], maxMetalDistance, (j, dSq) => {
      if (j <= i) return

      ap1.index = atomSets[ i ][ 0 ]
      ap2.index = atomSets[ j ][ 0 ]

      if (invalidAtomContact(ap1, ap2)) return

      if (isMetalComplex(types[ i ], types[ j ])) {
        featureSet.setBits(i, j)
        contactStore.addContact(i, j, ContactType.MetalComplex)
      }
    })
  }
}
