/**
 * @file Residue Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Store from './store.js'

/**
 * Residue store
 */
class ResidueStore extends Store {
  get _defaultFields () {
    return [
      [ 'chainIndex', 1, 'uint32' ],
      [ 'atomOffset', 1, 'uint32' ],
      [ 'atomCount', 1, 'uint16' ],
      [ 'residueTypeId', 1, 'uint16' ],

      [ 'resno', 1, 'int32' ],
      [ 'sstruc', 1, 'uint8' ],
      [ 'inscode', 1, 'uint8' ]
    ]
  }

  setSstruc (i, str) {
    this.sstruc[ i ] = str.charCodeAt(0)
  }

  getSstruc (i) {
    const code = this.sstruc[ i ]
    return code ? String.fromCharCode(code) : ''
  }

  setInscode (i, str) {
    this.inscode[ i ] = str.charCodeAt(0)
  }

  getInscode (i) {
    const code = this.inscode[ i ]
    return code ? String.fromCharCode(code) : ''
  }
}

export default ResidueStore
