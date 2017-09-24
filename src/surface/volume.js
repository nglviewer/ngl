/**
 * @file Volume
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3, Box3, Matrix3, Matrix4 } from '../../lib/three.es6.js'

import { WorkerRegistry, ColormakerRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import WorkerPool from '../worker/worker-pool.js'
import { VolumePicker } from '../utils/picker.js'
import {
  uniformArray, serialArray,
  arrayMin, arrayMax, arraySum, arrayMean, arrayRms
} from '../math/array-utils'
import MarchingCubes from './marching-cubes.js'
import { laplacianSmooth, computeVertexNormals } from './surface-utils.js'
import {
  applyMatrix4toVector3array, applyMatrix3toVector3array
} from '../math/vector-utils.js'
import { m3new, m3makeNormal } from '../math/matrix-utils.js'
import Surface from './surface.js'

function VolumeSurface (data, nx, ny, nz, atomindex) {
  var mc = new MarchingCubes(data, nx, ny, nz, atomindex)

  function getSurface (isolevel, smooth, box, matrix, contour, wrap) {
    const sd = mc.triangulate(isolevel, smooth, box, contour, wrap)
    if (smooth && !contour) {
      laplacianSmooth(sd.position, sd.index, smooth, true)
      sd.normal = computeVertexNormals(sd.position, sd.index)
    }
    if (matrix) {
      applyMatrix4toVector3array(matrix, sd.position)
      if (sd.normal) {
        const normalMatrix = m3new()
        m3makeNormal(normalMatrix, matrix)
        applyMatrix3toVector3array(normalMatrix, sd.normal)
      }
    }
    return sd
  }

  this.getSurface = getSurface
}
VolumeSurface.__deps = [
  laplacianSmooth, computeVertexNormals, MarchingCubes,
  applyMatrix4toVector3array, applyMatrix3toVector3array,
  m3new, m3makeNormal
]

WorkerRegistry.add('surf', function func (e, callback) {
  const a = e.data.args
  const p = e.data.params
  if (a) {
    /* global self */
    self.volsurf = new VolumeSurface(a[0], a[1], a[2], a[3], a[4])
  }
  if (p) {
    const sd = self.volsurf.getSurface(
            p.isolevel, p.smooth, p.box, p.matrix, p.contour, p.wrap
        )
    const transferList = [ sd.position.buffer, sd.index.buffer ]
    if (sd.normal) transferList.push(sd.normal.buffer)
    if (sd.atomindex) transferList.push(sd.atomindex.buffer)
    const data = {
      sd: sd,
      p: p
    }
    callback(data, transferList)
  }
}, [ VolumeSurface ])

/**
 * Volume
 */
class Volume {
  /**
   * Make Volume instance
   * @param {String} name - volume name
   * @param {String} path - source path
   * @param {Float32array} data - volume 3d grid
   * @param {Integer} nx - x dimension of the 3d volume
   * @param {Integer} ny - y dimension of the 3d volume
   * @param {Integer} nz - z dimension of the 3d volume
   * @param {Int32Array} atomindex - atom indices corresponding to the cells in the 3d grid
   */
  constructor (name, path, data, nx, ny, nz, atomindex) {
    this.name = name
    this.path = path

    this.matrix = new Matrix4()
    this.normalMatrix = new Matrix3()
    this.inverseMatrix = new Matrix4()
    this.center = new Vector3()
    this.boundingBox = new Box3()

    this.setData(data, nx, ny, nz, atomindex)
  }

  get type () { return 'Volume' }

  /**
   * set volume data
   * @param {Float32array} data - volume 3d grid
   * @param {Integer} nx - x dimension of the 3d volume
   * @param {Integer} ny - y dimension of the 3d volume
   * @param {Integer} nz - z dimension of the 3d volume
   * @param {Int32Array} atomindex - atom indices corresponding to the cells in the 3d grid
   * @return {undefined}
   */
  setData (data, nx, ny, nz, atomindex) {
    this.nx = nx || 1
    this.ny = ny || 1
    this.nz = nz || 1

    this.data = data || new Float32Array(1)
    this.setAtomindex(atomindex)

    delete this._position

    delete this._min
    delete this._max
    delete this._mean
    delete this._rms

    if (this.worker) this.worker.terminate()
  }

  /**
   * Set statistics, which can be different from the data in this volume,
   * if this volume is a slice of a bigger volume
   * @param {Number|undefined} min - minimum value of the whole data set
   * @param {Number|undefined} max - maximum value of the whole data set
   * @param {Number|undefined} mean - average value of the whole data set
   * @param {Number|undefined} rms - sigma value of the whole data set
   */
  setStats (min, max, mean, rms) {
    this._min = min
    this._max = max
    this._mean = mean
    this._rms = rms
  }

  /**
   * set transformation matrix
   * @param {Matrix4} matrix - 4x4 transformation matrix
   * @return {undefined}
   */
  setMatrix (matrix) {
    this.matrix.copy(matrix)

    const bb = this.boundingBox
    const v = this.center  // temporary re-purposing

    const x = this.nx - 1
    const y = this.ny - 1
    const z = this.nz - 1

    bb.makeEmpty()

    bb.expandByPoint(v.set(x, y, z))
    bb.expandByPoint(v.set(x, y, 0))
    bb.expandByPoint(v.set(x, 0, z))
    bb.expandByPoint(v.set(x, 0, 0))
    bb.expandByPoint(v.set(0, y, z))
    bb.expandByPoint(v.set(0, 0, z))
    bb.expandByPoint(v.set(0, y, 0))
    bb.expandByPoint(v.set(0, 0, 0))

    bb.applyMatrix4(this.matrix)
    bb.getCenter(this.center)

    // make normal matrix

    const me = this.matrix.elements
    const r0 = new Vector3(me[0], me[1], me[2])
    const r1 = new Vector3(me[4], me[5], me[6])
    const r2 = new Vector3(me[8], me[9], me[10])
    const cp = new Vector3()
    //        [ r0 ]       [ r1 x r2 ]
    // M3x3 = [ r1 ]   N = [ r2 x r0 ]
    //        [ r2 ]       [ r0 x r1 ]
    const ne = this.normalMatrix.elements
    cp.crossVectors(r1, r2)
    ne[ 0 ] = cp.x
    ne[ 1 ] = cp.y
    ne[ 2 ] = cp.z
    cp.crossVectors(r2, r0)
    ne[ 3 ] = cp.x
    ne[ 4 ] = cp.y
    ne[ 5 ] = cp.z
    cp.crossVectors(r0, r1)
    ne[ 6 ] = cp.x
    ne[ 7 ] = cp.y
    ne[ 8 ] = cp.z

    this.inverseMatrix.getInverse(this.matrix)
  }

  /**
   * set atom indices
   * @param {Int32Array} atomindex - atom indices corresponding to the cells in the 3d grid
   * @return {undefined}
     */
  setAtomindex (atomindex) {
    this.atomindex = atomindex
  }

  getBox (center, size, target) {
    if (!target) target = new Box3()

    target.set(center, center)
    target.expandByScalar(size)
    target.applyMatrix4(this.inverseMatrix)

    target.min.round()
    target.max.round()

    return target
  }

  _getBox (center, size) {
    if (!center || !size) return

    if (!this.__box) this.__box = new Box3()
    const box = this.getBox(center, size, this.__box)
    return [ box.min.toArray(), box.max.toArray() ]
  }

  _makeSurface (sd, isolevel, smooth) {
    const name = this.name + '@' + isolevel.toPrecision(2)
    const surface = new Surface(name, '', sd)
    surface.info.isolevel = isolevel
    surface.info.smooth = smooth
    surface.info.volume = this

    return surface
  }

  getSurface (isolevel, smooth, center, size, contour, wrap) {
    isolevel = isNaN(isolevel) ? this.getValueForSigma(2) : isolevel
    smooth = defaults(smooth, 0)

    //

    if (this.volsurf === undefined) {
      this.volsurf = new VolumeSurface(
        this.data, this.nx, this.ny, this.nz, this.atomindex
      )
    }

    const box = this._getBox(center, size)
    const sd = this.volsurf.getSurface(
      isolevel, smooth, box, this.matrix.elements, contour, wrap
    )

    return this._makeSurface(sd, isolevel, smooth)
  }

  getSurfaceWorker (isolevel, smooth, center, size, contour, wrap, callback) {
    isolevel = isNaN(isolevel) ? this.getValueForSigma(2) : isolevel
    smooth = smooth || 0

    //

    if (window.Worker) {
      if (this.workerPool === undefined) {
        this.workerPool = new WorkerPool('surf', 2)
      }

      const msg = {}
      const worker = this.workerPool.getNextWorker()

      if (worker.postCount === 0) {
        msg.args = [
          this.data, this.nx, this.ny, this.nz, this.atomindex
        ]
      }

      msg.params = {
        isolevel: isolevel,
        smooth: smooth,
        box: this._getBox(center, size),
        matrix: this.matrix.elements,
        contour: contour,
        wrap: wrap
      }

      worker.post(msg, undefined,
        e => {
          const sd = e.data.sd
          const p = e.data.p
          callback(this._makeSurface(sd, p.isolevel, p.smooth))
        },
        e => {
          console.warn(
            'Volume.getSurfaceWorker error - trying without worker', e
          )
          const surface = this.getSurface(isolevel, smooth, center, size, contour, wrap)
          callback(surface)
        }
      )
    } else {
      const surface = this.getSurface(isolevel, smooth, center, size, contour, wrap)
      callback(surface)
    }
  }

  getValueForSigma (sigma) {
    return this.mean + defaults(sigma, 2) * this.rms
  }

  getSigmaForValue (value) {
    return (defaults(value, 0) - this.mean) / this.rms
  }

  get position () {
    if (!this._position) {
      const nz = this.nz
      const ny = this.ny
      const nx = this.nx
      const position = new Float32Array(nx * ny * nz * 3)

      let p = 0
      for (let z = 0; z < nz; ++z) {
        for (let y = 0; y < ny; ++y) {
          for (let x = 0; x < nx; ++x) {
            position[ p + 0 ] = x
            position[ p + 1 ] = y
            position[ p + 2 ] = z
            p += 3
          }
        }
      }

      applyMatrix4toVector3array(this.matrix.elements, position)
      this._position = position
    }

    return this._position
  }

  getDataAtomindex () {
    return this.atomindex
  }

  getDataPosition () {
    return this.position
  }

  getDataColor (params) {
    const p = params || {}
    p.volume = this
    p.scale = p.scale || 'Spectral'
    p.domain = p.domain || [ this.min, this.max ]

    const colormaker = ColormakerRegistry.getScheme(p)

    const n = this.position.length / 3
    const array = new Float32Array(n * 3)

    // var atoms = p.structure.atoms;
    // var atomindex = this.atomindex;

    for (let i = 0; i < n; ++i) {
      colormaker.volumeColorToArray(i, array, i * 3)
      // a = atoms[ atomindex[ i ] ];
      // if( a ) colormaker.atomColorToArray( a, array, i * 3 );
    }

    return array
  }

  getDataPicking () {
    const picking = serialArray(this.position.length / 3)
    return new VolumePicker(picking, this)
  }

  getDataSize (size, scale) {
    const data = this.data
    const n = this.position.length / 3
    let array

    switch (size) {
      case 'value':
        array = new Float32Array(data)
        break

      case 'abs-value':
        array = new Float32Array(data)
        for (let i = 0; i < n; ++i) {
          array[ i ] = Math.abs(array[ i ])
        }
        break

      case 'value-min': {
        array = new Float32Array(data)
        const min = this.min
        for (let i = 0; i < n; ++i) {
          array[ i ] -= min
        }
        break
      }

      case 'deviation':
        array = new Float32Array(data)
        break

      default:
        array = uniformArray(n, size)
        break
    }

    if (scale !== 1.0) {
      for (let i = 0; i < n; ++i) {
        array[ i ] *= scale
      }
    }

    return array
  }

  get min () {
    if (this._min === undefined) {
      this._min = arrayMin(this.data)
    }
    return this._min
  }

  get max () {
    if (this._max === undefined) {
      this._max = arrayMax(this.data)
    }
    return this._max
  }

  get sum () {
    if (this._sum === undefined) {
      this._sum = arraySum(this.data)
    }
    return this._sum
  }

  get mean () {
    if (this._mean === undefined) {
      this._mean = arrayMean(this.data)
    }
    return this._mean
  }

  get rms () {
    if (this._rms === undefined) {
      this._rms = arrayRms(this.data)
    }
    return this._rms
  }

  clone () {
    const vol = new Volume(
      this.name,
      this.path,

      this.data,

      this.nx,
      this.ny,
      this.nz,

      this.atomindex
    )

    vol.matrix.copy(this.matrix)
    vol.header = Object.assign({}, this.header)

    return vol
  }

  dispose () {
    if (this.workerPool) this.workerPool.terminate()
  }
}

export default Volume

export {
    VolumeSurface
}
