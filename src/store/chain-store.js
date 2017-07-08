/**
 * @file Chain Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Store from './store.js'

/**
 * Chain store
 */
class ChainStore extends Store {
  get _defaultFields () {
    return [
      [ 'entityIndex', 1, 'uint16' ],
      [ 'modelIndex', 1, 'uint16' ],
      [ 'residueOffset', 1, 'uint32' ],
      [ 'residueCount', 1, 'uint32' ],

      [ 'chainname', 4, 'uint8' ],
      [ 'chainid', 4, 'uint8' ]
    ]
  }

  setChainname (i, str) {
    const j = 4 * i
    this.chainname[ j ] = str.charCodeAt(0)
    this.chainname[ j + 1 ] = str.charCodeAt(1)
    this.chainname[ j + 2 ] = str.charCodeAt(2)
    this.chainname[ j + 3 ] = str.charCodeAt(3)
  }

  getChainname (i) {
    let chainname = ''
    for (let k = 0; k < 4; ++k) {
      const code = this.chainname[ 4 * i + k ]
      if (code) {
        chainname += String.fromCharCode(code)
      } else {
        break
      }
    }
    return chainname
  }

  setChainid (i, str) {
    const j = 4 * i
    this.chainid[ j ] = str.charCodeAt(0)
    this.chainid[ j + 1 ] = str.charCodeAt(1)
    this.chainid[ j + 2 ] = str.charCodeAt(2)
    this.chainid[ j + 3 ] = str.charCodeAt(3)
  }

  getChainid (i) {
    let chainid = ''
    for (let k = 0; k < 4; ++k) {
      const code = this.chainid[ 4 * i + k ]
      if (code) {
        chainid += String.fromCharCode(code)
      } else {
        break
      }
    }
    return chainid
  }
}

export default ChainStore
