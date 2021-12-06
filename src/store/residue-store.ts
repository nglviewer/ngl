/**
 * @file Residue Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Store, { StoreField } from './store'

/**
 * Residue store
 */
export default class ResidueStore extends Store {
  chainIndex: Uint32Array
  atomOffset: Uint32Array
  atomCount: Uint32Array
  residueTypeId: Uint16Array

  resno: Uint32Array
  sstruc: Uint8Array
  inscode: Uint8Array

  get _defaultFields () {
    return [
      [ 'chainIndex', 1, 'uint32' ],
      [ 'atomOffset', 1, 'uint32' ],
      [ 'atomCount', 1, 'uint32' ],
      [ 'residueTypeId', 1, 'uint16' ],

      [ 'resno', 1, 'int32' ],
      [ 'sstruc', 1, 'uint8' ],
      [ 'inscode', 1, 'uint8' ]
    ] as StoreField[]
  }

  setSstruc (i: number, str: string) {
    this.sstruc[ i ] = str.charCodeAt(0)
  }

  getSstruc (i: number) {
    const code = this.sstruc[ i ]
    return code ? String.fromCharCode(code) : ''
  }

  setInscode (i: number, str: string) {
    this.inscode[ i ] = str.charCodeAt(0)
  }

  getInscode (i: number) {
    const code = this.inscode[ i ]
    return code ? String.fromCharCode(code) : ''
  }
}