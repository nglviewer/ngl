/**
 * @file Filtered Volume
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { defaults } from '../utils'
import Volume from './volume'
import { Box3, Matrix4, Matrix3, Vector3 } from 'three';

class FilteredVolume {
  volume: Volume
  data: Float32Array
  position: Float32Array
  atomindex: Int32Array
  _filterHash: string
  _dataBuffer: ArrayBuffer
  _positionBuffer: ArrayBuffer
  _atomindexBuffer: ArrayBuffer
  getValueForSigma: typeof Volume.prototype.getValueForSigma
  getSigmaForValue: typeof Volume.prototype.getSigmaForValue
  getDataAtomindex: typeof Volume.prototype.getDataAtomindex
  getDataPosition: typeof Volume.prototype.getDataPosition
  getDataColor: typeof Volume.prototype.getDataColor
  getDataPicking: typeof Volume.prototype.getDataPicking
  getDataSize: typeof Volume.prototype.getDataSize


  constructor (volume: Volume, minValue?: number, maxValue?: number, outside?: boolean) {
    this.volume = volume
    this.setFilter(minValue, maxValue, outside)
  }

  get header () { return this.volume.header }
  get matrix (): Matrix4 { return this.volume.matrix }
  get normalMatrix (): Matrix3 { return this.volume.normalMatrix }
  get inverseMatrix (): Matrix4 { return this.volume.inverseMatrix }
  get center (): Vector3 { return this.volume.center }
  get boundingBox (): Box3 { return this.volume.boundingBox }
  get min () { return this.volume.min }
  get max () { return this.volume.max }
  get mean () { return this.volume.mean }
  get rms () { return this.volume.rms }

  _getFilterHash (minValue: number, maxValue: number, outside: boolean) {
    return JSON.stringify([ minValue, maxValue, outside ])
  }

  setFilter (minValue: number|undefined, maxValue: number|undefined, outside: boolean|undefined) {
    if (isNaN(<number>minValue) && this.header) {
      minValue = this.header.DMEAN + 2.0 * this.header.ARMS
    }

    minValue = (minValue !== undefined && !isNaN(minValue)) ? minValue : -Infinity
    maxValue = defaults(maxValue, Infinity) as number
    outside = defaults(outside, false) as boolean

    const data = this.volume.data
    const position = this.volume.position
    const atomindex = this.volume.atomindex

    const filterHash = this._getFilterHash(minValue, maxValue, outside)

    if (filterHash === this._filterHash) {
      // already filtered
      return
    } else if (minValue === -Infinity && maxValue === Infinity) {
      this.data = data
      this.position = position
      this.atomindex = atomindex!
    } else {
      const n = data.length

      if (!this._dataBuffer) {
        // ArrayBuffer for re-use as Float32Array backend

        this._dataBuffer = new ArrayBuffer(n * 4)
        this._positionBuffer = new ArrayBuffer(n * 3 * 4)
        if (atomindex) this._atomindexBuffer = new ArrayBuffer(n * 4)
      }

      const filteredData = new Float32Array(this._dataBuffer)
      const filteredPosition = new Float32Array(this._positionBuffer)
      let filteredAtomindex
      if (atomindex) filteredAtomindex = new Uint32Array(this._atomindexBuffer)

      let j = 0

      for (let i = 0; i < n; ++i) {
        const i3 = i * 3
        const v = data[ i ]

        if ((!outside && v >= minValue && v <= maxValue) ||
            (outside && (v < minValue || v > maxValue))
        ) {
          const j3 = j * 3

          filteredData[ j ] = v

          filteredPosition[ j3 + 0 ] = position[ i3 + 0 ]
          filteredPosition[ j3 + 1 ] = position[ i3 + 1 ]
          filteredPosition[ j3 + 2 ] = position[ i3 + 2 ]

          if (atomindex && filteredAtomindex) filteredAtomindex[ j ] = atomindex[ i ]

          j += 1
        }
      }

      // set views

      this.data = new Float32Array(this._dataBuffer, 0, j)
      this.position = new Float32Array(this._positionBuffer, 0, j * 3)
      if (atomindex) this.atomindex = new Int32Array(this._atomindexBuffer, 0, j)
    }

    this._filterHash = filterHash
  }
}

FilteredVolume.prototype.getValueForSigma = Volume.prototype.getValueForSigma
FilteredVolume.prototype.getSigmaForValue = Volume.prototype.getSigmaForValue

FilteredVolume.prototype.getDataAtomindex = Volume.prototype.getDataAtomindex
FilteredVolume.prototype.getDataPosition = Volume.prototype.getDataPosition
FilteredVolume.prototype.getDataColor = Volume.prototype.getDataColor
FilteredVolume.prototype.getDataPicking = Volume.prototype.getDataPicking
FilteredVolume.prototype.getDataSize = Volume.prototype.getDataSize

export default FilteredVolume
