/**
 * @file Trajectory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Signal from '../../lib/signals.es6.js'

import { Log } from '../globals.js'
import { defaults } from '../utils.js'
import { circularMean } from '../math/array-utils.js'
import { lerp, spline } from '../math/math-utils.js'
import Selection from '../selection.js'
import Superposition from '../align/superposition.js'
import TrajectoryPlayer from './trajectory-player.js'

function centerPbc (coords, mean, box) {
  if (box[ 0 ] === 0 || box[ 8 ] === 0 || box[ 4 ] === 0) {
    return
  }

  const n = coords.length

  const bx = box[ 0 ]
  const by = box[ 1 ]
  const bz = box[ 2 ]
  const mx = mean[ 0 ]
  const my = mean[ 1 ]
  const mz = mean[ 2 ]

  const fx = -mx + bx + bx / 2
  const fy = -my + by + by / 2
  const fz = -mz + bz + bz / 2

  for (let i = 0; i < n; i += 3) {
    coords[ i + 0 ] = (coords[ i + 0 ] + fx) % bx
    coords[ i + 1 ] = (coords[ i + 1 ] + fy) % by
    coords[ i + 2 ] = (coords[ i + 2 ] + fz) % bz
  }
}

function removePbc (x, box) {
  if (box[ 0 ] === 0 || box[ 8 ] === 0 || box[ 4 ] === 0) {
    return
  }

  // ported from GROMACS src/gmxlib/rmpbc.c:rm_gropbc()
  // in-place

  let i, j, d, dist
  const n = x.length

  for (i = 3; i < n; i += 3) {
    for (j = 0; j < 3; ++j) {
      dist = x[ i + j ] - x[ i - 3 + j ]

      if (Math.abs(dist) > 0.9 * box[ j * 3 + j ]) {
        if (dist > 0) {
          for (d = 0; d < 3; ++d) {
            x[ i + d ] -= box[ j * 3 + d ]
          }
        } else {
          for (d = 0; d < 3; ++d) {
            x[ i + d ] += box[ j * 3 + d ]
          }
        }
      }
    }
  }

  return x
}

/**
 * Trajectory parameter object.
 * @typedef {Object} TrajectoryParameters - parameters
 *
 * @property {Number} deltaTime - timestep between frames in picoseconds
 * @property {Number} timeOffset - starting time of frames in picoseconds
 * @property {String} sele - to restrict atoms used for superposition
 * @property {Boolean} centerPbc - center on initial frame
 * @property {Boolean} removePbc - try fixing periodic boundary discontinuities
 * @property {Boolean} superpose - superpose on initial frame
 */

/**
 * Trajectory object for tying frames and structure together
 * @class
 * @param {String|Frames} trajPath - trajectory source
 * @param {Structure} structure - the structure object
 * @param {TrajectoryParameters} params - trajectory parameters
 */
class Trajectory {
  constructor (trajPath, structure, params) {
    this.signals = {
      gotNumframes: new Signal(),
      frameChanged: new Signal(),
      selectionChanged: new Signal(),
      playerChanged: new Signal()
    }

    const p = params || {}
    p.deltaTime = defaults(p.deltaTime, 0)
    p.timeOffset = defaults(p.timeOffset, 0)
    p.centerPbc = defaults(p.centerPbc, false)
    p.removePbc = defaults(p.removePbc, false)
    p.superpose = defaults(p.superpose, false)
    this.setParameters(p)

    this.name = trajPath.replace(/^.*[\\/]/, '')

    // selection to restrict atoms used for superposition
    this.selection = new Selection(
      defaults(p.sele, 'backbone and not hydrogen')
    )

    this.selection.signals.stringChanged.add(function () {
      this.makeIndices()
      this.resetCache()
    }, this)

    // should come after this.selection is set
    this.setStructure(structure)
    this.setPlayer(new TrajectoryPlayer(this))

    this.trajPath = trajPath

    this.numframes = undefined
    this.getNumframes()
  }

  setStructure (structure) {
    this.structure = structure
    this.atomCount = structure.atomCount

    this.makeAtomIndices()

    this.saveInitialStructure()

    this.backboneIndices = this.getIndices(
      new Selection('backbone and not hydrogen')
    )
    this.makeIndices()

    this.frameCache = {}
    this.loadQueue = {}
    this.boxCache = {}
    this.pathCache = {}
    this.frameCacheSize = 0
    this.currentFrame = -1
  }

  saveInitialStructure () {
    const initialStructure = new Float32Array(3 * this.atomCount)
    let i = 0

    this.structure.eachAtom(function (a) {
      initialStructure[ i + 0 ] = a.x
      initialStructure[ i + 1 ] = a.y
      initialStructure[ i + 2 ] = a.z

      i += 3
    })

    this.initialStructure = initialStructure
  }

  setSelection (string) {
    this.selection.setString(string)

    return this
  }

  getIndices (selection) {
    let indices

    if (selection && selection.test) {
      let i = 0
      const test = selection.test
      indices = []

      this.structure.eachAtom(function (ap) {
        if (test(ap)) {
          indices.push(i)
        }
        i += 1
      })
    } else {
      indices = this.structure.getAtomIndices(this.selection)
    }

    return indices
  }

  makeIndices () {
    // indices to restrict atoms used for superposition
    this.indices = this.getIndices(this.selection)

    const n = this.indices.length * 3

    this.coords1 = new Float32Array(n)
    this.coords2 = new Float32Array(n)

    const y = this.initialStructure
    const coords2 = this.coords2

    for (let i = 0; i < n; i += 3) {
      const j = this.indices[ i / 3 ] * 3

      coords2[ i + 0 ] = y[ j + 0 ]
      coords2[ i + 1 ] = y[ j + 1 ]
      coords2[ i + 2 ] = y[ j + 2 ]
    }
  }

  makeAtomIndices () {
    Log.error('Trajectory.makeAtomIndices not implemented')
  }

  getNumframes () {
    Log.error('Trajectory.loadFrame not implemented')
  }

  resetCache () {
    this.frameCache = {}
    this.loadQueue = {}
    this.boxCache = {}
    this.pathCache = {}
    this.frameCacheSize = 0
    this.setFrame(this.currentFrame)

    return this
  }

  setParameters (params) {
    const p = params
    let resetCache = false

    if (p.centerPbc !== undefined && p.centerPbc !== this.centerPbc) {
      this.centerPbc = p.centerPbc
      resetCache = true
    }

    if (p.removePbc !== undefined && p.removePbc !== this.removePbc) {
      this.removePbc = p.removePbc
      resetCache = true
    }

    if (p.superpose !== undefined && p.superpose !== this.superpose) {
      this.superpose = p.superpose
      resetCache = true
    }

    this.deltaTime = defaults(p.deltaTime, this.deltaTime)
    this.timeOffset = defaults(p.timeOffset, this.timeOffset)

    if (resetCache) this.resetCache()
  }

  hasFrame (i) {
    if (Array.isArray(i)) {
      return i.every(j => !!this.frameCache[j])
    } else {
      return !!this.frameCache[i]
    }
  }

  setFrame (i, callback) {
    if (i === undefined) return this

    this.inProgress = true

    i = parseInt(i)

    if (i === -1 || this.frameCache[ i ]) {
      this.updateStructure(i)
      if (callback) callback()
    } else {
      this.loadFrame(i, () => {
        this.updateStructure(i)
        if (callback) callback()
      })
    }

    return this
  }

  interpolate (i, ip, ipp, ippp, t, type) {
    const fc = this.frameCache

    const c = fc[ i ]
    const cp = fc[ ip ]
    const cpp = fc[ ipp ]
    const cppp = fc[ ippp ]

    const m = c.length
    const coords = new Float32Array(m)

    if (type === 'spline') {
      for (let j = 0; j < m; j += 3) {
        coords[ j + 0 ] = spline(
          cppp[ j + 0 ], cpp[ j + 0 ], cp[ j + 0 ], c[ j + 0 ], t, 1
        )
        coords[ j + 1 ] = spline(
          cppp[ j + 1 ], cpp[ j + 1 ], cp[ j + 1 ], c[ j + 1 ], t, 1
        )
        coords[ j + 2 ] = spline(
          cppp[ j + 2 ], cpp[ j + 2 ], cp[ j + 2 ], c[ j + 2 ], t, 1
        )
      }
    } else {
      for (let j = 0; j < m; j += 3) {
        coords[ j + 0 ] = lerp(cp[ j + 0 ], c[ j + 0 ], t)
        coords[ j + 1 ] = lerp(cp[ j + 1 ], c[ j + 1 ], t)
        coords[ j + 2 ] = lerp(cp[ j + 2 ], c[ j + 2 ], t)
      }
    }

    this.structure.updatePosition(coords)
    this.currentFrame = i
    this.signals.frameChanged.dispatch(i)
  }

  setFrameInterpolated (i, ip, ipp, ippp, t, type, callback) {
    if (i === undefined) return this

    const fc = this.frameCache
    const iList = []

    if (!fc[ ippp ]) iList.push(ippp)
    if (!fc[ ipp ]) iList.push(ipp)
    if (!fc[ ip ]) iList.push(ip)
    if (!fc[ i ]) iList.push(i)

    if (iList.length) {
      this.loadFrame(iList, () => {
        this.interpolate(i, ip, ipp, ippp, t, type)
        if (callback) callback()
      })
    } else {
      this.interpolate(i, ip, ipp, ippp, t, type)
      if (callback) callback()
    }

    return this
  }

  loadFrame (i, callback) {
    if (Array.isArray(i)) {
      i.forEach(j => {
        if (!this.loadQueue[j] && !this.frameCache[j]) {
          this.loadQueue[j] = true
          this._loadFrame(j, () => {
            delete this.loadQueue[j]
          })
        }
      })
    } else {
      if (!this.loadQueue[i] && !this.frameCache[i]) {
        this.loadQueue[i] = true
        this._loadFrame(i, () => {
          delete this.loadQueue[i]
          if (callback) callback()
        })
      }
    }
  }

  _loadFrame (i, callback) {
    Log.error('Trajectory._loadFrame not implemented', i, callback)
  }

  updateStructure (i) {
    if (this._disposed) return

    if (i === -1) {
      this.structure.updatePosition(this.initialStructure)
    } else {
      this.structure.updatePosition(this.frameCache[ i ])
    }

    this.structure.trajectory = {
      name: this.trajPath,
      frame: i
    }

    this.currentFrame = i
    this.inProgress = false
    this.signals.frameChanged.dispatch(i)
  }

  getCircularMean (indices, coords, box) {
    return [
      circularMean(coords, box[ 0 ], 3, 0, indices),
      circularMean(coords, box[ 1 ], 3, 1, indices),
      circularMean(coords, box[ 2 ], 3, 2, indices)
    ]
  }

  doSuperpose (x) {
    const n = this.indices.length * 3

    const coords1 = this.coords1
    const coords2 = this.coords2

    for (let i = 0; i < n; i += 3) {
      const j = this.indices[ i / 3 ] * 3

      coords1[ i + 0 ] = x[ j + 0 ]
      coords1[ i + 1 ] = x[ j + 1 ]
      coords1[ i + 2 ] = x[ j + 2 ]
    }

    // TODO re-use superposition object
    const sp = new Superposition(coords1, coords2)
    sp.transform(x)
  }

  process (i, box, coords, numframes) {
    this.setNumframes(numframes)

    if (box) {
      if (this.backboneIndices.length > 0 && this.centerPbc) {
        const box2 = [ box[ 0 ], box[ 4 ], box[ 8 ] ]
        const mean = this.getCircularMean(
          this.backboneIndices, coords, box2
        )
        centerPbc(coords, mean, box2)
      }

      if (this.removePbc) {
        removePbc(coords, box)
      }
    }

    if (this.indices.length > 0 && this.superpose) {
      this.doSuperpose(coords)
    }

    this.frameCache[ i ] = coords
    this.boxCache[ i ] = box
    this.frameCacheSize += 1
  }

  setNumframes (n) {
    if (n !== this.numframes) {
      this.numframes = n
      this.signals.gotNumframes.dispatch(n)
    }
  }

  dispose () {
    this.resetCache()  // aid GC
    this._disposed = true
    if (this.player) this.player.stop()
  }

  setPlayer (player) {
    this.player = player
    this.signals.playerChanged.dispatch(player)
  }

  getPath (index, callback) {
    Log.error('Trajectory.getPath not implemented', index, callback)
  }

  /**
   * Get time for frame
   * @param  {Integer} i - frame index
   * @return {Number} time in picoseconds
   */
  getFrameTime (i) {
    return this.timeOffset + i * this.deltaTime
  }
}

export default Trajectory
