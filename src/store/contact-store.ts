/**
 * @file Contact Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Store, { StoreField } from './store'

/**
 * Bond store
 */
export default class ContactStore extends Store {
  index1: Uint32Array
  index2: Uint32Array
  type: Uint8Array

  get _defaultFields () {
    return [
      [ 'index1', 1, 'int32' ],
      [ 'index2', 1, 'int32' ],
      [ 'type', 1, 'int8' ]
    ] as StoreField[]
  }

  addContact (index1: number, index2: number, type?: number) {
    this.growIfFull()

    const i = this.count

    if (index1 < index2) {
      this.index1[ i ] = index1
      this.index2[ i ] = index2
    } else {
      this.index2[ i ] = index1
      this.index1[ i ] = index2
    }
    if (type) this.type[ i ] = type

    this.count += 1
  }
}