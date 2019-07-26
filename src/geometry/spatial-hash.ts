/**
 * @file Spatial Hash
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Box3 } from 'three'

export type Positions = {
  x: ArrayLike<number>,
  y: ArrayLike<number>,
  z: ArrayLike<number>,
  count?:number
}

function createBoundingBox(positions: Positions) {
    const { x, y, z } = positions
    const boundingBox = new Box3()
    const count = x.length
    const { min, max } = boundingBox

    for (let i = 0; i < count; i++) {
        min.x = Math.min(x[i], min.x)
        min.y = Math.min(y[i], min.y)
        min.z = Math.min(z[i], min.z)
        max.x = Math.max(x[i], max.x)
        max.y = Math.max(y[i], max.y)
        max.z = Math.max(z[i], max.z)
    }

    return boundingBox
}

export default class SpatialHash {
  exp = 3

  minX: number
  minY: number
  minZ: number

  boundX: number
  boundY: number
  boundZ: number

  grid: Uint32Array
  bucketCount: Uint16Array
  bucketOffset: Uint32Array
  bucketArray: Int32Array

  xArray: ArrayLike<number>
  yArray: ArrayLike<number>
  zArray: ArrayLike<number>

  constructor(positions: Positions, boundingBox?: Box3) {
    const bb = boundingBox || createBoundingBox(positions)
    this.minX = bb.min.x
    this.minY = bb.min.y
    this.minZ = bb.min.z
    this.boundX = ((bb.max.x - this.minX) >> this.exp) + 1
    this.boundY = ((bb.max.y - this.minY) >> this.exp) + 1
    this.boundZ = ((bb.max.z - this.minZ) >> this.exp) + 1

    const n = this.boundX * this.boundY * this.boundZ
    const an = (positions.count !== undefined) ? positions.count : positions.x.length

    const xArray = positions.x
    const yArray = positions.y
    const zArray = positions.z

    let count = 0
    const grid = new Uint32Array(n)
    const bucketIndex = new Int32Array(an)
    for (let i = 0; i < an; ++i) {
      const x = (xArray[ i ] - this.minX) >> this.exp
      const y = (yArray[ i ] - this.minY) >> this.exp
      const z = (zArray[ i ] - this.minZ) >> this.exp
      const idx = (((x * this.boundY) + y) * this.boundZ) + z
      if ((grid[ idx ] += 1) === 1) {
        count += 1
      }
      bucketIndex[ i ] = idx
    }

    const bucketCount = new Uint16Array(count)
    for (let i = 0, j = 0; i < n; ++i) {
      const c = grid[ i ]
      if (c > 0) {
        grid[ i ] = j + 1
        bucketCount[ j ] = c
        j += 1
      }
    }

    const bucketOffset = new Uint32Array(count)
    for (let i = 1; i < count; ++i) {
      bucketOffset[ i ] += bucketOffset[ i - 1 ] + bucketCount[ i - 1 ]
    }

    const bucketFill = new Uint16Array(count)
    const bucketArray = new Int32Array(an)
    for (let i = 0; i < an; ++i) {
      const bucketIdx = grid[ bucketIndex[ i ] ]
      if (bucketIdx > 0) {
        const k = bucketIdx - 1
        bucketArray[ bucketOffset[ k ] + bucketFill[ k ] ] = i
        bucketFill[ k ] += 1
      }
    }

    this.grid = grid
    this.bucketCount = bucketCount
    this.bucketOffset = bucketOffset
    this.bucketArray = bucketArray

    this.xArray = xArray
    this.yArray = yArray
    this.zArray = zArray
  }

  within (x: number, y: number, z: number, r: number) {
    const result: number[] = []

    this.eachWithin(x, y, z, r, atomIndex => result.push(atomIndex))

    return result
  }

  eachWithin (x: number, y: number, z: number, r: number, callback: (atomIndex: number, dSq: number) => void) {
    const rSq = r * r

    const loX = Math.max(0, (x - r - this.minX) >> this.exp)
    const loY = Math.max(0, (y - r - this.minY) >> this.exp)
    const loZ = Math.max(0, (z - r - this.minZ) >> this.exp)

    const hiX = Math.min(this.boundX, ((x + r - this.minX) >> this.exp) + 1)
    const hiY = Math.min(this.boundY, ((y + r - this.minY) >> this.exp) + 1)
    const hiZ = Math.min(this.boundZ, ((z + r - this.minZ) >> this.exp) + 1)

    for (let ix = loX; ix < hiX; ++ix) {
      for (let iy = loY; iy < hiY; ++iy) {
        for (let iz = loZ; iz < hiZ; ++iz) {
          const idx = (((ix * this.boundY) + iy) * this.boundZ) + iz
          const bucketIdx = this.grid[ idx ]

          if (bucketIdx > 0) {
            const k = bucketIdx - 1
            const offset = this.bucketOffset[ k ]
            const count = this.bucketCount[ k ]
            const end = offset + count

            for (let i = offset; i < end; ++i) {
              const atomIndex = this.bucketArray[ i ]
              const dx = this.xArray[ atomIndex ] - x
              const dy = this.yArray[ atomIndex ] - y
              const dz = this.zArray[ atomIndex ] - z

              const dSq = dx * dx + dy * dy + dz * dz
              if (dSq <= rSq) callback(atomIndex, dSq)
            }
          }
        }
      }
    }
  }
}