/**
 * @file Volume
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3, Box3, Matrix3, Matrix4 } from 'three'

import { WorkerRegistry, ColormakerRegistry } from '../globals'
import { defaults } from '../utils'
import WorkerPool from '../worker/worker-pool'
import { VolumePicker } from '../utils/picker'
import {
  uniformArray, serialArray,
  arrayMin, arrayMax, arraySum, arrayMean, arrayRms
} from '../math/array-utils'
import MarchingCubes from './marching-cubes'
import { laplacianSmooth, computeVertexNormals } from './surface-utils'
import {
  applyMatrix4toVector3array, applyMatrix3toVector3array
} from '../math/vector-utils'
import { m3new, m3makeNormal } from '../math/matrix-utils'
import Surface from './surface'
import { NumberArray } from '../types';
import { ColormakerParameters } from '../color/colormaker';

export interface VolumeSurface {
  new (data: NumberArray, nx: number, ny: number, nz: number, atomindex: NumberArray): void
  getSurface: (isolevel: number, smooth: boolean|number, box: number[][]|undefined, matrix: Float32Array, contour: boolean, wrap?: boolean) => {
    position: Float32Array
    normal: undefined|Float32Array
    index: Uint32Array|Uint16Array
    atomindex: Int32Array|undefined
    contour: boolean
  }
}
export function VolumeSurface (this: VolumeSurface,data: NumberArray, nx: number, ny: number, nz: number, atomindex: NumberArray) {
  var mc = new (MarchingCubes as any)(data, nx, ny, nz, atomindex) as MarchingCubes

  function getSurface (isolevel: number, smooth: boolean|number, box: number[][]|undefined, matrix: Float32Array, contour: boolean, wrap: boolean = false) {
    const sd = mc.triangulate(isolevel, smooth as boolean, box, contour, wrap)
    if (smooth && !contour) {
      laplacianSmooth(sd.position, sd.index as any, smooth as number, true)
      sd.normal = computeVertexNormals(sd.position, sd.index as any)
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
Object.assign(VolumeSurface, {__deps: [
  laplacianSmooth, computeVertexNormals, MarchingCubes,
  applyMatrix4toVector3array, applyMatrix3toVector3array,
  m3new, m3makeNormal
]})

WorkerRegistry.add('surf', function func (e: any, callback: (data: any, transferList: any) => void) {
  const a = e.data.args
  const p = e.data.params
  if (a) {
    /* global self */
    (self as any).volsurf = new (VolumeSurface as any)(a[0], a[1], a[2], a[3], a[4]) as VolumeSurface
  }
  if (p) {
    const sd = ((self as any).volsurf as VolumeSurface).getSurface(
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

export type VolumeSize = 'value'|'abs-value'|'value-min'|'deviation'
/**
 * Volume
 */
class Volume {
  name: string
  path: string

  matrix: Matrix4
  normalMatrix: Matrix3
  inverseMatrix: Matrix4
  center: Vector3
  boundingBox: Box3

  nx: number
  ny: number
  nz: number
  data: Float32Array

  worker: Worker
  workerPool: WorkerPool
  _position: Float32Array
  _min: number|undefined
  _max: number|undefined
  _mean: number|undefined
  _rms: number|undefined
  _sum: number|undefined
  __box: Box3|undefined

  atomindex: Int32Array|undefined
  volsurf: VolumeSurface|undefined
  header: any
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
  constructor (name: string, path: string, data?: Float32Array, nx?: number, ny?: number, nz?: number, atomindex?: Int32Array) {
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
  setData (data?: Float32Array, nx?: number, ny?: number, nz?: number, atomindex?: Int32Array) {
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
  setStats (min: number|undefined, max: number|undefined, mean: number|undefined, rms: number|undefined) {
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
  setMatrix (matrix: Matrix4) {
    this.matrix.copy(matrix)

    const bb = this.boundingBox
    const v = this.center // temporary re-purposing

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
  setAtomindex (atomindex?: Int32Array) {
    this.atomindex = atomindex
  }

  getBox (center: Vector3, size: number, target: Box3) {
    if (!target) target = new Box3()

    target.set(center, center)
    target.expandByScalar(size)
    target.applyMatrix4(this.inverseMatrix)

    target.min.round()
    target.max.round()

    return target
  }

  _getBox (center: Vector3|undefined, size: number) {
    if (!center || !size) return

    if (!this.__box) this.__box = new Box3()
    const box = this.getBox(center, size, this.__box)
    return [ box.min.toArray(), box.max.toArray() ]
  }

  _makeSurface (sd: any, isolevel: number, smooth: number) {
    const name = this.name + '@' + isolevel.toPrecision(2)
    const surface = new Surface(name, '', sd)
    surface.info.isolevel = isolevel
    surface.info.smooth = smooth
    surface.info.volume = this

    return surface
  }

  getSurface (isolevel: number, smooth: number, center: Vector3, size: number, contour: boolean, wrap: boolean = false) {
    isolevel = isNaN(isolevel) ? this.getValueForSigma(2) : isolevel
    smooth = defaults(smooth, 0)

    //

    if (this.volsurf === undefined) {
      this.volsurf = new (VolumeSurface as any)(
        this.data, this.nx, this.ny, this.nz, this.atomindex
      ) as VolumeSurface
    }

    const box = this._getBox(center, size)
    const sd = this.volsurf.getSurface(
      isolevel, smooth, box!, this.matrix.elements as unknown as Float32Array, contour, wrap
    )

    return this._makeSurface(sd, isolevel, smooth)
  }

  getSurfaceWorker (isolevel: number, smooth: number, center: Vector3, size: number, contour: boolean, wrap: boolean, callback: (s: Surface) => void) {
    isolevel = isNaN(isolevel) ? this.getValueForSigma(2) : isolevel
    smooth = smooth || 0

    //

    if (window.hasOwnProperty('Worker')) {
      if (this.workerPool === undefined) {
        this.workerPool = new WorkerPool('surf', 2)
      }

      const msg = {}
      const worker = this.workerPool.getNextWorker()

      if (worker!.postCount === 0) {
        Object.assign(msg, {
          args: [
            this.data, this.nx, this.ny, this.nz, this.atomindex
          ]
        })
      }

      Object.assign(msg, {
        params: {
          isolevel: isolevel,
          smooth: smooth,
          box: this._getBox(center, size),
          matrix: this.matrix.elements,
          contour: contour,
          wrap: wrap
        }
      })

      worker!.post(msg, undefined,
        (e: any) => {
          const sd = e.data.sd
          const p = e.data.p
          callback(this._makeSurface(sd, p.isolevel, p.smooth))
        },
        (e : string) => {
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

  getValueForSigma (sigma: number) {
    return this.mean + defaults(sigma, 2) * this.rms
  }

  getSigmaForValue (value: number) {
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

      applyMatrix4toVector3array(this.matrix.elements as unknown as Float32Array, position)
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

  getDataColor (params: ColormakerParameters & {scheme: string}) {
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

  getDataSize (size: VolumeSize|number, scale: number) {
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
