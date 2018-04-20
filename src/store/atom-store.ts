/**
 * @file Atom Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Store, { StoreField } from './store'

/**
 * Atom store
 */
export default class AtomStore extends Store {
  residueIndex: Uint32Array
  atomTypeId: Uint16Array

  x: Float32Array
  y: Float32Array
  z: Float32Array
  serial: Int32Array
  bfactor: Float32Array
  altloc: Uint8Array
  occupancy: Float32Array

  partialCharge?: Float32Array
  formalCharge?: Uint8Array

  get _defaultFields () {
    return [
      [ 'residueIndex', 1, 'uint32' ],
      [ 'atomTypeId', 1, 'uint16' ],

      [ 'x', 1, 'float32' ],
      [ 'y', 1, 'float32' ],
      [ 'z', 1, 'float32' ],
      [ 'serial', 1, 'int32' ],
      [ 'bfactor', 1, 'float32' ],
      [ 'altloc', 1, 'uint8' ],
      [ 'occupancy', 1, 'float32' ]
    ] as StoreField[]
  }

  setAltloc (i: number, str: string) {
    this.altloc[ i ] = str.charCodeAt(0)
  }

  getAltloc (i: number) {
    const code = this.altloc[ i ]
    return code ? String.fromCharCode(code) : ''
  }
}