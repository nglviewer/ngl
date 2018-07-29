/**
 * @file Dx Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Matrix4 } from 'three'

import { Debug, Log, ParserRegistry } from '../globals'
import { degToRad } from '../math/math-utils'
import VolumeParser from './volume-parser'

const reWhitespace = /\s+/

interface DxHeader {
  nx: number,
  ny: number,
  nz: number,
  xmin: number,
  ymin: number,
  zmin: number,
  hx: number,
  hy: number,
  hz: number
}

class DxParser extends VolumeParser {
  get type () { return 'dx' }

  _parse () {
    // http://apbs-pdb2pqr.readthedocs.io/en/latest/formats/opendx.html

    if (Debug) Log.time('DxParser._parse ' + this.name)

    const v = this.volume
    const headerLines = this.streamer.peekLines(30)
    const headerInfo = this.parseHeaderLines(headerLines)
    const header = this.volume.header
    const dataLineStart = headerInfo.dataLineStart

    const size = header.nx * header.ny * header.nz
    const data = new Float32Array(size)
    let count = 0
    let lineNo = 0

    function _parseChunkOfLines (_i: number, _n: number, lines: string []) {
      for (let i = _i; i < _n; ++i) {
        if (count < size && lineNo > dataLineStart) {
          const line = lines[ i ].trim()

          if (line !== '') {
            const ls = line.split(reWhitespace)

            for (let j = 0, lj = ls.length; j < lj; ++j) {
              data[ count ] = parseFloat(ls[ j ])
              ++count
            }
          }
        }

        ++lineNo
      }
    }

    this.streamer.eachChunkOfLines(function (lines/*, chunkNo, chunkCount */) {
      _parseChunkOfLines(0, lines.length, lines)
    })

    v.setData(data, header.nz, header.ny, header.nx)

    if (Debug) Log.timeEnd('DxParser._parse ' + this.name)
  }

  parseHeaderLines (headerLines: string []) {
    const header: Partial<DxHeader> = {}
    const n = headerLines.length

    let dataLineStart = 0
    let headerByteCount = 0
    let deltaLineCount = 0

    for (let i = 0; i < n; ++i) {
      let ls
      const line = headerLines[ i ]

      if (line.startsWith('object 1')) {
        ls = line.split(reWhitespace)

        header.nx = parseInt(ls[ 5 ])
        header.ny = parseInt(ls[ 6 ])
        header.nz = parseInt(ls[ 7 ])
      } else if (line.startsWith('origin')) {
        ls = line.split(reWhitespace)

        header.xmin = parseFloat(ls[ 1 ])
        header.ymin = parseFloat(ls[ 2 ])
        header.zmin = parseFloat(ls[ 3 ])
      } else if (line.startsWith('delta')) {
        ls = line.split(reWhitespace)

        if (deltaLineCount === 0) {
          header.hx = parseFloat(ls[ 1 ]) * this.voxelSize
        } else if (deltaLineCount === 1) {
          header.hy = parseFloat(ls[ 2 ]) * this.voxelSize
        } else if (deltaLineCount === 2) {
          header.hz = parseFloat(ls[ 3 ]) * this.voxelSize
        }

        deltaLineCount += 1
      } else if (line.startsWith('object 3')) {
        dataLineStart = i
        headerByteCount += line.length + 1
        break
      }

      headerByteCount += line.length + 1
    }

    this.volume.header = header

    return {
      dataLineStart: dataLineStart,
      headerByteCount: headerByteCount
    }
  }

  getMatrix () {
    const h = this.volume.header
    const matrix = new Matrix4()

    matrix.multiply(
      new Matrix4().makeRotationY(degToRad(90))
    )

    matrix.multiply(
      new Matrix4().makeTranslation(
        -h.zmin, h.ymin, h.xmin
      )
    )

    matrix.multiply(
      new Matrix4().makeScale(
        -h.hz, h.hy, h.hx
      )
    )

    return matrix
  }
}

ParserRegistry.add('dx', DxParser)

export default DxParser
