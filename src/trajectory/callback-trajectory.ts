/**
 * @file Callback Trajectory
 * @author Tarn W. Burton <twburton@gmail.com>
 * @private
 */

import Structure from '../structure/structure'
import Trajectory, { TrajectoryParameters } from './trajectory'

type RequestCallback = (responseCallback: Function, i?: number, atomIndices?: number[][]) => void

/**
 * Callback trajectory class. Gets data from an JavaScript function.
 */
class CallbackTrajectory extends Trajectory {
  atomIndices: number[][]
  requestCallback: RequestCallback

  constructor (requestCallback: RequestCallback, structure: Structure, params: TrajectoryParameters) {
    super('', structure, params)
    this.requestCallback = requestCallback;
    this._init(structure)
  }

  get type () { return 'callback' }

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
    this.requestCallback(
      (i: number, box: ArrayLike<number>, coords: Float32Array, frameCount: number) => {
        this._process(i, box, coords, frameCount)
        if (typeof callback === 'function') {
          callback()
        }
      }, i, this.atomIndices)
  }

  _loadFrameCount () {
    this.requestCallback((count: number) => this._setFrameCount(count))
  }
}

export default CallbackTrajectory

