/**
 * @file Worker Registry
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { makeWorkerBlob } from './worker-utils.js'

class WorkerRegistry {
  constructor () {
    this.activeWorkerCount = 0

    this._funcDict = {}
    this._depsDict = {}
    this._blobDict = {}
  }

  add (name, func, deps) {
    this._funcDict[ name ] = func
    this._depsDict[ name ] = deps
  }

  get (name) {
    if (!this._blobDict[ name ]) {
      this._blobDict[ name ] = makeWorkerBlob(
                this._funcDict[ name ], this._depsDict[ name ]
            )
    }
    return this._blobDict[ name ]
  }
}

export default WorkerRegistry
