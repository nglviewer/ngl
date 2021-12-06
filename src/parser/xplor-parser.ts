/**
 * @file Xplor Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Matrix4 } from 'three'

import { Debug, Log, ParserRegistry } from '../globals'
import VolumeParser from './volume-parser'

const reWhitespace = /\s+/

function parseNumberLine (line: string) {
  return line.trim().split(reWhitespace).map(parseFloat)
}

interface XplorHeader {
  NA: number,
  AMIN: number,
  AMAX: number,
  NB: number,
  BMIN: number,
  BMAX: number,
  NC: number,
  CMIN: number,
  CMAX: number,
  a: number,
  b: number,
  c: number,
  alpha: number,
  beta: number,
  gamma: number,
  RAVE: number,
  RSIGMA: number
}

class XplorParser extends VolumeParser {
  get type () { return 'xplor' }

  _parse () {
    // http://hincklab.uthscsa.edu/html/soft_packs/msi_docs/insight980/xplor/formats.html
    // http://www.mrc-lmb.cam.ac.uk/public/xtal/doc/cns/cns_1.3/tutorial/formats/maps/text.html

    if (Debug) Log.time('XplorParser._parse ' + this.name)

    const v = this.volume
    const headerLines = this.streamer.peekLines(8)
    const header: Partial<XplorHeader> = {}

    let infoStart
    if (headerLines[ 2 ].startsWith('REMARKS')) {
      infoStart = parseInt(headerLines[ 1 ].substring(0, 8)) + 2
    } else {
      infoStart = 5
    }
    const dataStart = infoStart + 3

    const gridInfo = parseNumberLine(headerLines[ infoStart ])
    header.NA = gridInfo[ 0 ]
    header.AMIN = gridInfo[ 1 ]
    header.AMAX = gridInfo[ 2 ]
    header.NB = gridInfo[ 3 ]
    header.BMIN = gridInfo[ 4 ]
    header.BMAX = gridInfo[ 5 ]
    header.NC = gridInfo[ 6 ]
    header.CMIN = gridInfo[ 7 ]
    header.CMAX = gridInfo[ 8 ]

    const cellInfo = parseNumberLine(headerLines[ infoStart + 1 ])
    header.a = cellInfo[ 0 ] * this.voxelSize
    header.b = cellInfo[ 1 ] * this.voxelSize
    header.c = cellInfo[ 2 ] * this.voxelSize
    header.alpha = cellInfo[ 3 ]
    header.beta = cellInfo[ 4 ]
    header.gamma = cellInfo[ 5 ]

    const na = header.AMAX - header.AMIN + 1
    const nb = header.BMAX - header.BMIN + 1
    const nc = header.CMAX - header.CMIN + 1
    const n = na * nb * nc

    const data = new Float32Array(n)
    const lineSection = Math.ceil(1 + (na * nb) / 6)
    let count = 0
    let lineNo = 0

    function _parseChunkOfLines (_i: number, _n: number, lines: string[]) {
      for (let i = _i; i < _n; ++i) {
        const line = lines[ i ]

        if (lineNo >= dataStart && (lineNo - dataStart) % lineSection !== 0 && count < n) {
          for (let j = 0, lj = 6; j < lj; ++j) {
            const value = parseFloat(line.substr(12 * j, 12))
            if (isNaN(value)) { break } // Last line of map section
            data[count++] = value
          }
        } else if (count === n) {
          const lt = line.trim()
          if (lt && lt !== '-9999') {
            const ls = parseNumberLine(line)
            header.RAVE = ls[0]
            header.RSIGMA = ls[1]
          }
        }

        ++lineNo
      }
    }

    this.streamer.eachChunkOfLines(function (lines/*, chunkNo, chunkCount */) {
      _parseChunkOfLines(0, lines.length, lines)
    })

    v.header = header
    v.setData(data, na, nb, nc)
    if (header.RAVE !== 0 && header.RSIGMA !== 1) {
      v.setStats(undefined, undefined, header.RAVE, header.RSIGMA)
    }

    if (Debug) Log.timeEnd('XplorParser._parse ' + this.name)
  }

  getMatrix () {
    const h = this.volume.header

    const basisX = [
      h.a,
      0,
      0
    ]

    const basisY = [
      h.b * Math.cos(Math.PI / 180.0 * h.gamma),
      h.b * Math.sin(Math.PI / 180.0 * h.gamma),
      0
    ]

    const basisZ = [
      h.c * Math.cos(Math.PI / 180.0 * h.beta),
      h.c * (
        Math.cos(Math.PI / 180.0 * h.alpha) -
        Math.cos(Math.PI / 180.0 * h.gamma) *
        Math.cos(Math.PI / 180.0 * h.beta)
      ) / Math.sin(Math.PI / 180.0 * h.gamma),
      0
    ]
    basisZ[ 2 ] = Math.sqrt(
      h.c * h.c * Math.sin(Math.PI / 180.0 * h.beta) *
      Math.sin(Math.PI / 180.0 * h.beta) - basisZ[ 1 ] * basisZ[ 1 ]
    )

    const basis = [ [], basisX, basisY, basisZ ]
    const nxyz = [ 0, h.NA, h.NB, h.NC ]
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

    matrix.multiply(new Matrix4().makeTranslation(
      h.AMIN, h.BMIN, h.CMIN
    ))

    return matrix
  }
}

ParserRegistry.add('xplor', XplorParser)
ParserRegistry.add('cns', XplorParser)

export default XplorParser
