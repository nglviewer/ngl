/**
 * @file Worker Registry
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { makeWorkerBlob } from './worker-utils'

class WorkerRegistry {
  activeWorkerCount = 0

  private _funcDict: { [k: string]: Function } = {}
  private _depsDict: { [k: string]: Function[] } = {}
  private _blobDict: { [k: string]: Blob } = {}

  add (name: string, func: Function, deps: Function[]) {
    this._funcDict[ name ] = func
    this._depsDict[ name ] = deps
  }

  get (name: string) {
    if (!this._blobDict[ name ]) {
      this._blobDict[ name ] = makeWorkerBlob(
        this._funcDict[ name ], this._depsDict[ name ]
      )
    }
    return this._blobDict[ name ]
  }
}

export default WorkerRegistry
