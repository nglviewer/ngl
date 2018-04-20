/**
 * @file Bond Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Store, { StoreField } from './store'
import AtomProxy from '../proxy/atom-proxy'

/**
 * Bond store
 */
export default class BondStore extends Store {
  atomIndex1: Uint32Array
  atomIndex2: Uint32Array
  bondOrder: Uint8Array

  get _defaultFields () {
    return [
      [ 'atomIndex1', 1, 'int32' ],
      [ 'atomIndex2', 1, 'int32' ],
      [ 'bondOrder', 1, 'int8' ]
    ] as StoreField[]
  }

  addBond (atom1: AtomProxy, atom2: AtomProxy, bondOrder?: number) {
    this.growIfFull()

    const i = this.count
    const ai1 = atom1.index
    const ai2 = atom2.index

    if (ai1 < ai2) {
      this.atomIndex1[ i ] = ai1
      this.atomIndex2[ i ] = ai2
    } else {
      this.atomIndex2[ i ] = ai1
      this.atomIndex1[ i ] = ai2
    }
    if (bondOrder) this.bondOrder[ i ] = bondOrder

    this.count += 1
  }

  addBondIfConnected (atom1: AtomProxy, atom2: AtomProxy, bondOrder?: number) {
    if (atom1.connectedTo(atom2)) {
      this.addBond(atom1, atom2, bondOrder)
      return true
    }

    return false
  }
}