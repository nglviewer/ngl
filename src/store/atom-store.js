/**
 * @file Atom Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Store from './store.js'

/**
 * Atom store
 */
class AtomStore extends Store {
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
    ]
  }

  setAltloc (i, str) {
    this.altloc[ i ] = str.charCodeAt(0)
  }

  getAltloc (i) {
    const code = this.altloc[ i ]
    return code ? String.fromCharCode(code) : ''
  }
}

export default AtomStore
