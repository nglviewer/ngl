/**
 * @file Dsn6 Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Matrix4 } from 'three'

import { Debug, Log, ParserRegistry } from '../globals'
import { ensureBuffer } from '../utils'
import { degToRad } from '../math/math-utils'
import VolumeParser from './volume-parser'

interface Dsn6Header {
  xStart: number,
  yStart: number,
  zStart: number,
  xExtent: number,
  yExtent: number,
  zExtent: number,
  xRate: number,
  yRate: number,
  zRate: number,
  xlen: number,
  ylen: number,
  zlen: number,
  alpha: number,
  beta: number,
  gamma: number,
  sigma: number
}

class Dsn6Parser extends VolumeParser {
  get type () { return 'dsn6' }
  get isBinary () { return true }

  _parse () {
    // DSN6 http://www.uoxray.uoregon.edu/tnt/manual/node104.html
    // BRIX http://svn.cgl.ucsf.edu/svn/chimera/trunk/libs/VolumeData/dsn6/brix-1.html

    if (Debug) Log.time('Dsn6Parser._parse ' + this.name)

    const v = this.volume
    const header: Partial<Dsn6Header> = {}
    let divisor, summand

    const bin = ensureBuffer(this.streamer.data)
    const intView = new Int16Array(bin)
    const byteView = new Uint8Array(bin)
    const brixStr = String.fromCharCode.apply(null, byteView.subarray(0, 512))

    if (brixStr.startsWith(':-)')) {
      header.xStart = parseInt(brixStr.substr(10, 5)) // NXSTART
      header.yStart = parseInt(brixStr.substr(15, 5))
      header.zStart = parseInt(brixStr.substr(20, 5))

      header.xExtent = parseInt(brixStr.substr(32, 5)) // NX
      header.yExtent = parseInt(brixStr.substr(38, 5))
      header.zExtent = parseInt(brixStr.substr(42, 5))

      header.xRate = parseInt(brixStr.substr(52, 5)) // MX
      header.yRate = parseInt(brixStr.substr(58, 5))
      header.zRate = parseInt(brixStr.substr(62, 5))

      header.xlen = parseFloat(brixStr.substr(73, 10)) * this.voxelSize
      header.ylen = parseFloat(brixStr.substr(83, 10)) * this.voxelSize
      header.zlen = parseFloat(brixStr.substr(93, 10)) * this.voxelSize

      header.alpha = parseFloat(brixStr.substr(103, 10))
      header.beta = parseFloat(brixStr.substr(113, 10))
      header.gamma = parseFloat(brixStr.substr(123, 10))

      divisor = parseFloat(brixStr.substr(138, 12)) / 100
      summand = parseInt(brixStr.substr(155, 8))

      header.sigma = parseFloat(brixStr.substr(170, 12)) * 100
    } else {
      // swap byte order when big endian
      if (intView[ 18 ] !== 100) {
        for (let i = 0, n = intView.length; i < n; ++i) {
          const val = intView[ i ]
          intView[ i ] = ((val & 0xff) << 8) | ((val >> 8) & 0xff)
        }
      }

      header.xStart = intView[ 0 ] // NXSTART
      header.yStart = intView[ 1 ]
      header.zStart = intView[ 2 ]

      header.xExtent = intView[ 3 ] // NX
      header.yExtent = intView[ 4 ]
      header.zExtent = intView[ 5 ]

      header.xRate = intView[ 6 ] // MX
      header.yRate = intView[ 7 ]
      header.zRate = intView[ 8 ]

      const factor = 1 / intView[ 17 ]
      const scalingFactor = factor * this.voxelSize

      header.xlen = intView[ 9 ] * scalingFactor
      header.ylen = intView[ 10 ] * scalingFactor
      header.zlen = intView[ 11 ] * scalingFactor

      header.alpha = intView[ 12 ] * factor
      header.beta = intView[ 13 ] * factor
      header.gamma = intView[ 14 ] * factor

      divisor = intView[ 15 ] / 100
      summand = intView[ 16 ]
      header.gamma = intView[ 14 ] * factor
    }

    v.header = header

    if (Debug) Log.log(header, divisor, summand)

    const data = new Float32Array(
      header.xExtent * header.yExtent * header.zExtent
    )

    let offset = 512
    const xBlocks = Math.ceil(header.xExtent / 8)
    const yBlocks = Math.ceil(header.yExtent / 8)
    const zBlocks = Math.ceil(header.zExtent / 8)

    // loop over blocks
    for (var zz = 0; zz < zBlocks; ++zz) {
      for (var yy = 0; yy < yBlocks; ++yy) {
        for (var xx = 0; xx < xBlocks; ++xx) {
          // loop inside block
          for (var k = 0; k < 8; ++k) {
            var z = 8 * zz + k
            for (var j = 0; j < 8; ++j) {
              var y = 8 * yy + j
              for (var i = 0; i < 8; ++i) {
                var x = 8 * xx + i

                // check if remaining slice-part contains data
                if (x < header.xExtent && y < header.yExtent && z < header.zExtent) {
                  var idx = ((((x * header.yExtent) + y) * header.zExtent) + z)
                  data[ idx ] = (byteView[ offset ] - summand) / divisor
                  ++offset
                } else {
                  offset += 8 - i
                  break
                }
              }
            }
          }
        }
      }
    }

    v.setData(data, header.zExtent, header.yExtent, header.xExtent)
    if (header.sigma) {
      v.setStats(undefined, undefined, undefined, header.sigma)
    }

    if (Debug) Log.timeEnd('Dsn6Parser._parse ' + this.name)
  }

  getMatrix () {
    const h: Dsn6Header = this.volume.header

    const basisX = [
      h.xlen as number,
      0,
      0
    ]

    const basisY = [
      h.ylen * Math.cos(Math.PI / 180.0 * h.gamma),
      h.ylen * Math.sin(Math.PI / 180.0 * h.gamma),
      0
    ]

    const basisZ = [
      h.zlen * Math.cos(Math.PI / 180.0 * h.beta),
      h.zlen * (
        Math.cos(Math.PI / 180.0 * h.alpha) -
        Math.cos(Math.PI / 180.0 * h.gamma) *
        Math.cos(Math.PI / 180.0 * h.beta)
      ) / Math.sin(Math.PI / 180.0 * h.gamma),
      0
    ]
    basisZ[ 2 ] = Math.sqrt(
      h.zlen * h.zlen * Math.sin(Math.PI / 180.0 * h.beta) *
      Math.sin(Math.PI / 180.0 * h.beta) - basisZ[ 1 ] * basisZ[ 1 ]
    )

    const basis = [ [], basisX, basisY, basisZ ]
    const nxyz = [ 0, h.xRate, h.yRate, h.zRate ]
    const mapcrs = [ 0, 1, 2, 3 ]

    const matrix = new Matrix4()

    matrix.set(
      basis[ mapcrs[1] ][0] / nxyz[ mapcrs[1] ],
      basis[ mapcrs[2] ][0] / nxyz[ mapcrs[2] ],
      basis[ mapcrs[3] ][0] / nxyz[ mapcrs[3] ],
      0,
      basis[ mapcrs[1] ][1] / nxyz[ mapcrs[1] ],
      basis[ mapcrs[2] ][1] / nxyz[ mapcrs[2] ],
      basis[ mapcrs[3] ][1] / nxyz[ mapcrs[3] ],
      0,
      basis[ mapcrs[1] ][2] / nxyz[ mapcrs[1] ],
      basis[ mapcrs[2] ][2] / nxyz[ mapcrs[2] ],
      basis[ mapcrs[3] ][2] / nxyz[ mapcrs[3] ],
      0,
      0, 0, 0, 1
    )

    matrix.multiply(
      new Matrix4().makeRotationY(degToRad(90))
    )

    matrix.multiply(new Matrix4().makeTranslation(
      -h.zStart, h.yStart, h.xStart
    ))

    matrix.multiply(new Matrix4().makeScale(
      -1, 1, 1
    ))

    return matrix
  }
}

ParserRegistry.add('dsn6', Dsn6Parser)
ParserRegistry.add('brix', Dsn6Parser)

export default Dsn6Parser
