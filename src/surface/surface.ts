/**
 * @file Surface
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3, Box3, Geometry, BufferGeometry, Group, Color } from 'three'

import { Debug, Log, ColormakerRegistry } from '../globals'
import { getUintArray } from '../utils'
import { AtomPicker, SurfacePicker } from '../utils/picker'
import { uniformArray, uniformArray3, serialArray } from '../math/array-utils'
import Selection from '../selection/selection'
import { ColormakerParameters } from '../color/colormaker';
import { Structure, Volume } from '../ngl';

export interface SurfaceData {
  position: Float32Array
  index: Uint32Array|Uint16Array|undefined
  normal: Float32Array
  color: Float32Array
  atomindex: Int32Array
  contour: boolean
}
/**
 * Surface
 */
class Surface {
  name: string
  path: string
  position: Float32Array
  index: Uint32Array|Uint16Array|undefined
  normal: Float32Array|undefined
  color: Float32Array|undefined
  atomindex: Int32Array|undefined
  contour: boolean
  center: Vector3
  boundingBox: Box3
  size: number
  info: {
    type?: string
    probeRadius?: number
    scaleFactor?: number
    smooth?: number
    cutoff?: number
    isolevel?: number
    volume?: Volume
  }

  /**
   * @param {String} name - surface name
   * @param {String} path - source path
   * @param {Object} data - surface data
   * @param {Float32Array} data.position - surface positions
   * @param {Int32Array} data.index - surface indices
   * @param {Float32Array} data.normal - surface normals
   * @param {Float32Array} data.color - surface colors
   * @param {Int32Array} data.atomindex - atom indices
   * @param {boolean} data.contour - contour mode flag
   */
  constructor (name: string, path: string, data?: SurfaceData) {
    this.name = name || ''
    this.path = path || ''
    this.info = {}

    this.center = new Vector3()
    this.boundingBox = new Box3()

    if (data instanceof Geometry ||
      data instanceof BufferGeometry ||
      data instanceof Group
    ) {
      // to be removed
      this.fromGeometry(data)
    } else if (data) {
      this.set(
        data.position,
        data.index,
        data.normal,
        data.color,
        data.atomindex,
        data.contour
      )

      this.boundingBox.setFromArray(data.position)
      this.boundingBox.getCenter(this.center)
    }
  }

  get type () { return 'Surface' }

  /**
   * set surface data
   * @param {Float32Array} position - surface positions
   * @param {Int32Array} index - surface indices
   * @param {Float32Array} normal - surface normals
   * @param {Float32Array} color - surface colors
   * @param {Int32Array} atomindex - atom indices
   * @param {boolean} contour - contour mode flag
   * @return {undefined}
   */
  set (position: Float32Array,
      index: Uint32Array|Uint16Array|undefined,
      normal: Float32Array|undefined,
      color: Float32Array|undefined,
      atomindex: Int32Array|undefined,
      contour: boolean = false) {
    /**
     * @type {Float32Array}
     */
    this.position = position
    /**
     * @type {Uint32Array|Uint16Array|undefined}
     */
    this.index = index
    /**
     * @type {Float32Array|undefined}
     */
    this.normal = normal
    /**
     * @type {Float32Array|undefined}
     */
    this.color = color
    /**
     * @type {Int32Array|undefined}
     */
    this.atomindex = atomindex

    this.size = position.length / 3
    this.contour = contour
  }

  fromGeometry (geometry: Geometry|BufferGeometry|Group) {
    if (Debug) Log.time('GeometrySurface.fromGeometry')

    let geo

    if (geometry instanceof Geometry) {
      geometry.computeVertexNormals(true)
      geo = new BufferGeometry().fromGeometry(geometry)
    } else if (geometry instanceof BufferGeometry) {
      geo = geometry
    } else {
      geo = (geometry as any)[ 0 ]
    }

    if (!geo.boundingBox) geo.computeBoundingBox()

    this.boundingBox.copy(geo.boundingBox)
    this.boundingBox.getCenter(this.center)

    let position, color, index, normal

    if (geo instanceof BufferGeometry) {
      const attr = geo.attributes
      const an = (attr as any).normal ? (attr as any).normal.array : false

      // assume there are no normals if the first is zero
      if (!an || (an[ 0 ] === 0 && an[ 1 ] === 0 && an[ 2 ] === 0)) {
        geo.computeVertexNormals()
      }

      position = (<any>attr).position.array
      index = (<any>attr).index ? (<any>attr).index.array : null
      normal = (<any>attr).normal.array
    }

    this.set(position, index, normal, color, undefined)

    if (Debug) Log.timeEnd('GeometrySurface.setGeometry')
  }

  getPosition () {
    return this.position
  }

  getColor (params: ColormakerParameters&{ scheme: string}) {
    const p = params || {}
    p.surface = this

    const n = this.size
    const array = new Float32Array(n * 3)
    const colormaker = ColormakerRegistry.getScheme(p)

    if (colormaker.volumeColor || p.scheme === 'random') {
      for (let i = 0; i < n; ++i) {
        colormaker.volumeColorToArray(i, array, i * 3)
      }
    } else if (colormaker.positionColor) {
      const v = new Vector3()
      const pos = this.position

      for (let i = 0; i < n; ++i) {
        var i3 = i * 3
        v.set(pos[ i3 ], pos[ i3 + 1 ], pos[ i3 + 2 ])
        colormaker.positionColorToArray(v, array, i3)
      }
    } else if (colormaker.atomColor && this.atomindex) {
      const atomProxy = p.structure!.getAtomProxy()
      const atomindex = this.atomindex

      for (let i = 0; i < n; ++i) {
        atomProxy.index = atomindex[ i ]
        colormaker.atomColorToArray(atomProxy, array, i * 3)
      }
    } else {
      const tc = new Color(p.value)
      uniformArray3(n, tc.r, tc.g, tc.b, array)
    }

    return array
  }

  getPicking (structure?: Structure) {
    if (this.atomindex && structure) {
      return new AtomPicker(this.atomindex as any, structure)
    } else {
      return new SurfacePicker(serialArray(this.size), this)
    }
  }

  getNormal () {
    return this.normal
  }

  getSize (size: number, scale: number) {
    return uniformArray(this.size, size * scale)
  }

  getIndex () {
    return this.index
  }

  getFilteredIndex (sele: string, structure: Structure) {
    if (sele && this.atomindex) {
      const selection = new Selection(sele)
      const atomSet = structure.getAtomSet(selection)
      const filteredIndex = []

      const atomindex = this.atomindex
      const index = this.index
      const n = index!.length
      const elementSize = this.contour ? 2 : 3

      let j = 0

      for (let i = 0; i < n; i += elementSize) {
        let include = true

        for (let a = 0; a < elementSize; a++) {
          const idx = index![ i + a ]
          const ai = atomindex[ idx ]
          if (!atomSet.get(ai)) {
            include = false
            break
          }
        }

        if (!include) { continue }

        for (let a = 0; a < elementSize; a++, j++) {
          filteredIndex[ j ] = index![ i + a ]
        }
      }

      return getUintArray(filteredIndex, this.position.length / 3)
    } else {
      return this.index
    }
  }

  getAtomindex () {
    return this.atomindex
  }

  dispose () {

    //

  }
}

export default Surface
