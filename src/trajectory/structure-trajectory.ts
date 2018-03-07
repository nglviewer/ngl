/**
 * @file Structure Trajectory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Structure from '../structure/structure'
import Trajectory, { TrajectoryParameters } from './trajectory'

/**
 * Structure trajectory class. Gets data from a structure object.
 */
class StructureTrajectory extends Trajectory {
  atomIndices?: ArrayLike<number>

  constructor (trajPath: string, structure: Structure, params: TrajectoryParameters) {
    super('', structure, params)
    this._init(structure)
  }

  get type () { return 'structure' }

  _makeAtomIndices () {
    if (this.structure.atomSet && this.structure.atomSet.getSize() < this.structure.atomStore.count) {
      this.atomIndices = this.structure.getAtomIndices()
    } else {
      this.atomIndices = undefined
    }
  }

  _loadFrame (i: number, callback?: Function) {
    let coords
    const structure = this.structure
    const frame = structure.frames[ i ]

    if (this.atomIndices) {
      const indices = this.atomIndices
      const m = indices.length

      coords = new Float32Array(m * 3)

      for (let j = 0; j < m; ++j) {
        const j3 = j * 3
        const idx3 = indices[ j ] * 3

        coords[ j3 + 0 ] = frame[ idx3 + 0 ]
        coords[ j3 + 1 ] = frame[ idx3 + 1 ]
        coords[ j3 + 2 ] = frame[ idx3 + 2 ]
      }
    } else {
      coords = new Float32Array(frame)
    }

    const box = structure.boxes[ i ]
    const frameCount = structure.frames.length

    this._process(i, box, coords, frameCount)

    if (typeof callback === 'function') {
      callback()
    }
  }

  _loadFrameCount () {
    this._setFrameCount(this.structure.frames.length)
  }
}

export default StructureTrajectory
