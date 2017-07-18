/**
 * @file Remote Trajectory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Log, DatasourceRegistry } from '../globals.js'
import Trajectory from './trajectory.js'

/**
 * Remote trajectory class. Gets data from an MDsrv instance.
 */
class RemoteTrajectory extends Trajectory {
  constructor (trajPath, structure, params) {
    super(trajPath, structure, params)
    this._init(structure)
  }

  get type () { return 'remote' }

  _makeAtomIndices () {
    const atomIndices = []

    if (this.structure.type === 'StructureView') {
      const indices = this.structure.getAtomIndices()
      const n = indices.length

      let p = indices[ 0 ]
      let q = indices[ 0 ]

      for (let i = 1; i < n; ++i) {
        const r = indices[ i ]

        if (q + 1 < r) {
          atomIndices.push([ p, q + 1 ])
          p = r
        }

        q = r
      }

      atomIndices.push([ p, q + 1 ])
    } else {
      atomIndices.push([ 0, this.atomCount ])
    }

    this.atomIndices = atomIndices
  }

  _loadFrame (i, callback) {
    // TODO implement max frameCache size, re-use arrays

    const request = new window.XMLHttpRequest()

    const ds = DatasourceRegistry.trajectory
    const url = ds.getFrameUrl(this.trajPath, i)
    const params = ds.getFrameParams(this.trajPath, this.atomIndices)

    request.open('POST', url, true)
    request.responseType = 'arraybuffer'
    request.setRequestHeader(
      'Content-type', 'application/x-www-form-urlencoded'
    )

    request.addEventListener('load', () => {
      const arrayBuffer = request.response
      if (!arrayBuffer) {
        Log.error(`empty arrayBuffer for '${url}'`)
        return
      }

      const frameCount = new Int32Array(arrayBuffer, 0, 1)[ 0 ]
      // const time = new Float32Array( arrayBuffer, 1 * 4, 1 )[ 0 ];
      const box = new Float32Array(arrayBuffer, 2 * 4, 9)
      const coords = new Float32Array(arrayBuffer, 11 * 4)

      this._process(i, box, coords, frameCount)
      if (typeof callback === 'function') {
        callback()
      }
    }, false)

    request.send(params)
  }

  _loadFrameCount () {
    const request = new window.XMLHttpRequest()

    const ds = DatasourceRegistry.trajectory
    const url = ds.getCountUrl(this.trajPath)

    request.open('GET', url, true)
    request.addEventListener('load', () => {
      this._setFrameCount(parseInt(request.response))
    }, false)
    request.send(null)
  }

  getPath (index, callback) {
    if (this.pathCache[ index ]) {
      callback(this.pathCache[ index ])
      return
    }

    Log.time('loadPath')

    const request = new window.XMLHttpRequest()

    const ds = DatasourceRegistry.trajectory
    const url = ds.getPathUrl(this.trajPath, index)
    const params = ''

    request.open('POST', url, true)
    request.responseType = 'arraybuffer'
    request.setRequestHeader(
      'Content-type', 'application/x-www-form-urlencoded'
    )

    request.addEventListener('load', () => {
      Log.timeEnd('loadPath')

      const arrayBuffer = request.response
      if (!arrayBuffer) {
        Log.error("empty arrayBuffer for '" + url + "'")
        return
      }

      const path = new Float32Array(arrayBuffer)
      // Log.log( path )
      this.pathCache[ index ] = path
      callback(path)
    }, false)

    request.send(params)
  }
}

export default RemoteTrajectory
