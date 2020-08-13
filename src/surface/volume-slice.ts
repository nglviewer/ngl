/**
 * @file Volume Slice
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3 } from 'three'

import { ColormakerRegistry } from '../globals'
import { defaults } from '../utils'
import { SlicePicker } from '../utils/picker'
import { Volume } from '../ngl';
import { SliceRepresentationParameters } from '../representation/slice-representation';

class VolumeSlice {
  dimension: 'x'|'y'|'z'
  positionType: 'percent'|'coordinate'
  position: number
  thresholdType: 'sigma'|'value'
  thresholdMin: number
  thresholdMax: number
  normalize: boolean
  volume: Volume

  constructor (volume: Volume, params: Partial<SliceRepresentationParameters>) {
    const p = params || {}

    this.dimension = defaults(p.dimension, 'x')
    this.positionType = defaults(p.positionType, 'percent')
    this.position = defaults(p.position, 30)
    this.thresholdType = defaults(p.thresholdType, 'sigma')
    this.thresholdMin = defaults(p.thresholdMin, -Infinity)
    this.thresholdMax = defaults(p.thresholdMax, Infinity)
    this.normalize = defaults(p.normalize, false)

    this.volume = volume
  }

  getPositionFromCoordinate (coord: number) {
    const dim = this.dimension
    const v = this.volume
    const m = v.matrix

    const mp = new Vector3().setFromMatrixPosition(m)[ dim ]
    const ms = new Vector3().setFromMatrixScale(m)[ dim ]

    let vn
    if (dim === 'x') {
      vn = v.nx
    } else if (dim === 'y') {
      vn = v.ny
    } else {
      vn = v.nz
    }

    return Math.round((((coord - mp) / (vn / 100)) + 1) / ms)
  }

  getData (params: any) {
    params = params || {}

    const v = this.volume
    const d = v.data
    const m = v.matrix

    let p: number
    if (this.positionType === 'coordinate') {
      p = this.getPositionFromCoordinate(this.position)
    } else {
      p = this.position
    }

    function pos (dimLen: number) {
      return Math.round((dimLen / 100) * (p - 1))
    }

    function index (x: number, y: number, z: number, i: number) {
      return (z * v.ny * v.nx + y * v.nx + x) * 3 + i
    }

    const position = new Float32Array(4 * 3)
    const vec = new Vector3()

    let width, height
    let x
    let y
    let z
    let x0 = 0
    let y0 = 0
    let z0 = 0
    let nx = v.nx
    let ny = v.ny
    let nz = v.nz

    function setVec (x: number, y: number, z: number, offset: number) {
      vec.set(x, y, z).applyMatrix4(m).toArray(position as any, offset)
    }

    if (this.dimension === 'x') {
      x = pos(v.nx)
      y = v.ny - 1
      z = v.nz - 1

      width = v.nz
      height = v.ny

      x0 = x
      nx = x0 + 1

      setVec(x, 0, 0, 0)
      setVec(x, y, 0, 3)
      setVec(x, 0, z, 6)
      setVec(x, y, z, 9)
    } else if (this.dimension === 'y') {
      x = v.nx - 1
      y = pos(v.ny)
      z = v.nz - 1

      width = v.nz
      height = v.nx

      y0 = y
      ny = y0 + 1

      setVec(0, y, 0, 0)
      setVec(x, y, 0, 3)
      setVec(0, y, z, 6)
      setVec(x, y, z, 9)
    } else if (this.dimension === 'z') {
      x = v.nx - 1
      y = v.ny - 1
      z = pos(v.nz)

      width = v.nx
      height = v.ny

      z0 = z
      nz = z0 + 1

      setVec(0, 0, z, 0)
      setVec(0, y, z, 3)
      setVec(x, 0, z, 6)
      setVec(x, y, z, 9)
    }

    let i = 0
    let j = 0
    const imageData = new Uint8Array(<number>width * <number>height * 4)
    const pickingArray = new Float32Array(<number>width * <number>height)

    let tMin, tMax
    if (this.thresholdType === 'sigma') {
      tMin = v.getValueForSigma(this.thresholdMin)
      tMax = v.getValueForSigma(this.thresholdMax)
    } else {
      tMin = this.thresholdMin
      tMax = this.thresholdMax
    }

    const cp = Object.assign({}, params.colorParams, { volume: v })
    if (this.normalize) {
      cp.domain = [ 0, 1 ]
    }
    const colormaker = ColormakerRegistry.getScheme(cp)
    const tmp = new Float32Array(3)
    const scale = colormaker.getScale()

    let min = 0, max, diff = 0
    if (this.normalize) {
      min = +Infinity
      max = -Infinity
      for (let iy = y0; iy < ny; ++iy) {
        for (let ix = x0; ix < nx; ++ix) {
          for (let iz = z0; iz < nz; ++iz) {
            const idx = index(ix, iy, iz, 0) / 3
            const val = d[ idx ]
            if (val < min) min = val
            if (val > max) max = val
          }
        }
      }
      diff = max - min
    }

    for (let iy = y0; iy < ny; ++iy) {
      for (let ix = x0; ix < nx; ++ix) {
        for (let iz = z0; iz < nz; ++iz) {
          const idx = index(ix, iy, iz, 0) / 3
          let val = d[ idx ]
          if (this.normalize) {
            val = (val - min) / diff
          }

          colormaker.colorToArray(scale(val), tmp)
          imageData[ i ] = Math.round(tmp[ 0 ] * 255)
          imageData[ i + 1 ] = Math.round(tmp[ 1 ] * 255)
          imageData[ i + 2 ] = Math.round(tmp[ 2 ] * 255)
          imageData[ i + 3 ] = (val > tMin && val < tMax) ? 255 : 0

          pickingArray[ j ] = idx

          ++j
          i += 4
        }
      }
    }

    const picking = new SlicePicker(pickingArray, v)

    return { position, imageData, width, height, picking }
  }
}

export default VolumeSlice
