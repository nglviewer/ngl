/**
 * @file Refine Contacts
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Structure from '../../structure/structure'
import { FrozenContacts, ContactType } from './contact'
import { FeatureType } from './features'

/**
 * For atoms interacting with several atoms in the same residue
 * only the one with the closest distance is kept.
 */
export function refineHydrophobicContacts (structure: Structure, contacts: FrozenContacts) {
  const { contactSet, contactStore, features } = contacts
  const { type, index1, index2 } = contactStore
  const { atomSets } = features

  const ap1 = structure.getAtomProxy()
  const ap2 = structure.getAtomProxy()

  const residueContactDict: { [k: string]: number[] } = {}

  /* keep only closest contact between residues */
  const handleResidueContact = function (dist: number, i: number, key: string) {
    const [ minDist, minIndex ] = residueContactDict[ key ] || [ Infinity, -1 ]
    if (dist < minDist) {
      if (minIndex !== -1) contactSet.clear(minIndex)
      residueContactDict[ key ] = [ dist, i ]
    } else {
      contactSet.clear(i)
    }
  }

  contactSet.forEach(i => {
    if (type[ i ] !== ContactType.Hydrophobic) return

    ap1.index = atomSets[ index1[ i ] ][ 0 ]
    ap2.index = atomSets[ index2[ i ] ][ 0 ]

    const dist = ap1.distanceTo(ap2)
    handleResidueContact(dist, i, `${ap1.index}|${ap2.residueIndex}`)
    handleResidueContact(dist, i, `${ap2.index}|${ap1.residueIndex}`)
  })
}

function isHydrogenBondType (type: number) {
  return (
    type === ContactType.HydrogenBond ||
    type === ContactType.WaterHydrogenBond ||
    type === ContactType.BackboneHydrogenBond
  )
}

/**
 * Remove weak hydrogen bonds when the acceptor is involved in
 * a normal/strong hydrogen bond
 */
export function refineWeakHydrogenBonds (structure: Structure, contacts: FrozenContacts) {
  const { contactSet, contactStore, features, adjacencyList } = contacts
  const { type, index1, index2 } = contactStore
  const { types } = features

  contactSet.forEach(i => {
    if (type[ i ] !== ContactType.WeakHydrogenBond) return

    let accFeat: number
    if (types[ index1[ i ] ] === FeatureType.WeakHydrogenDonor) {
      accFeat = index2[ i ]
    } else {
      accFeat = index1[ i ]
    }

    const n = adjacencyList.countArray[ accFeat ]
    const offset = adjacencyList.offsetArray[ accFeat ]
    for (let j = 0; j < n; ++j) {
      const ci = adjacencyList.indexArray[ offset + j ]
      if (isHydrogenBondType(type[ ci ])) {
        contactSet.clear(i)
        return
      }
    }
  })
}

/**
 * Remove hydrogen bonds between groups that also form
 * a salt bridge between each other
 */
export function refineSaltBridges (structure: Structure, contacts: FrozenContacts) {
  const { contactSet, contactStore, features } = contacts
  const { type, index1, index2 } = contactStore
  const { atomSets } = features

  const saltBridgeDict: { [atomIndex: number]: number[] } = {}

  const add = function(idx: number, i: number) {
    if (!saltBridgeDict[ idx ]) saltBridgeDict[ idx ] = []
    saltBridgeDict[ idx ].push(i)
  }

  contactSet.forEach(i => {
    if (type[ i ] !== ContactType.SaltBridge) return
    atomSets[ index1[ i ] ].forEach(idx => add(idx, i))
    atomSets[ index2[ i ] ].forEach(idx => add(idx, i))
  })

  contactSet.forEach(i => {
    if (!isHydrogenBondType(type[ i ])) return

    const sbl1 = saltBridgeDict[ atomSets[ index1[ i ] ][ 0 ] ]
    const sbl2 = saltBridgeDict[ atomSets[ index2[ i ] ][ 0 ] ]
    if (!sbl1 || !sbl2) return

    const n = sbl1.length
    for (let j = 0; j < n; ++j) {
      if (sbl2.includes(sbl1[j])) {
        contactSet.clear(i)
        return
      }
    }
  })
}

/**
 * Remove hydrophobic and cation-pi interactions between groups that also form
 * a pi-stacking interaction between each other
 */
export function refinePiStacking (structure: Structure, contacts: FrozenContacts) {
  const { contactSet, contactStore, features } = contacts
  const { type, index1, index2 } = contactStore
  const { atomSets } = features

  const piStackingDict: { [atomIndex: number]: number[] } = {}

  const add = function(idx: number, i: number) {
    if (!piStackingDict[ idx ]) piStackingDict[ idx ] = []
    piStackingDict[ idx ].push(i)
  }

  contactSet.forEach(i => {
    if (type[ i ] !== ContactType.PiStacking) return
    atomSets[ index1[ i ] ].forEach(idx => add(idx, i))
    atomSets[ index2[ i ] ].forEach(idx => add(idx, i))
  })

  contactSet.forEach(i => {
    if (
      type[ i ] !== ContactType.Hydrophobic &&
      type[ i ] !== ContactType.CationPi
    ) return

    const pil1 = piStackingDict[ atomSets[ index1[ i ] ][ 0 ] ]
    const pil2 = piStackingDict[ atomSets[ index2[ i ] ][ 0 ] ]
    if (!pil1 || !pil2) return

    const n = pil1.length
    for (let j = 0; j < n; ++j) {
      if (pil2.includes(pil1[j])) {
        contactSet.clear(i)
        return
      }
    }
  })
}

// TODO: refactor refineSaltBridges and refinePiStacking to be DRY
