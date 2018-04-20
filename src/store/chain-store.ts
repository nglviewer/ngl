/**
 * @file Chain Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Store, { StoreField } from './store'

/**
 * Chain store
 */
export default class ChainStore extends Store {
  entityIndex: Uint16Array
  modelIndex: Uint16Array
  residueOffset: Uint32Array
  residueCount: Uint32Array

  chainname: Uint8Array
  chainid: Uint8Array

  get _defaultFields () {
    return [
      [ 'entityIndex', 1, 'uint16' ],
      [ 'modelIndex', 1, 'uint16' ],
      [ 'residueOffset', 1, 'uint32' ],
      [ 'residueCount', 1, 'uint32' ],

      [ 'chainname', 4, 'uint8' ],
      [ 'chainid', 4, 'uint8' ]
    ] as StoreField[]
  }

  setChainname (i: number, str: string) {
    const j = 4 * i
    this.chainname[ j ] = str.charCodeAt(0)
    this.chainname[ j + 1 ] = str.charCodeAt(1)
    this.chainname[ j + 2 ] = str.charCodeAt(2)
    this.chainname[ j + 3 ] = str.charCodeAt(3)
  }

  getChainname (i: number) {
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

  setChainid (i: number, str: string) {
    const j = 4 * i
    this.chainid[ j ] = str.charCodeAt(0)
    this.chainid[ j + 1 ] = str.charCodeAt(1)
    this.chainid[ j + 2 ] = str.charCodeAt(2)
    this.chainid[ j + 3 ] = str.charCodeAt(3)
  }

  getChainid (i: number) {
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
