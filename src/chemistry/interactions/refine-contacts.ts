/**
 * @file Refine Contacts
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Structure from '../../structure/structure'
import { FrozenContacts, ContactType } from './contact'

/**
 * No extra hydrophobic contacts for rings interacting via stacking, needs
 * global handling of contacts. For atoms interacting with several atoms in
 * the same residue, only the one with the closest distance is kept.
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
