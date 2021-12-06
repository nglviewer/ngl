/**
 * @file Remote Trajectory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Log, TrajectoryDatasource } from '../globals'
import Structure from '../structure/structure'
import Trajectory, { TrajectoryParameters } from './trajectory'

/**
 * Remote trajectory class. Gets data from an MDsrv instance.
 */
class RemoteTrajectory extends Trajectory {
  atomIndices: number[][]

  constructor (trajPath: string, structure: Structure, params: TrajectoryParameters) {
    super(trajPath, structure, params)
    this._init(structure)
  }

  get type () { return 'remote' }

  _makeAtomIndices () {
    const atomIndices = []

    if (this.structure.type === 'StructureView') {
      const indices = this.structure.getAtomIndices()!  // TODO
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

  _loadFrame (i: number, callback?: Function) {
    // TODO implement max frameCache size, re-use arrays

    const request = new XMLHttpRequest()

    const url = TrajectoryDatasource.getFrameUrl(this.trajPath, i)
    const params = TrajectoryDatasource.getFrameParams(this.trajPath, this.atomIndices)

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
    const request = new XMLHttpRequest()

    const url = TrajectoryDatasource.getCountUrl(this.trajPath)

    request.open('GET', url, true)
    request.addEventListener('load', () => {
      this._setFrameCount(parseInt(request.response))
    }, false)
    request.send()
  }
}

export default RemoteTrajectory
