/**
 * @file Cube Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Matrix4, Vector3 } from 'three'

import { Debug, Log, ParserRegistry } from '../globals'
import VolumeParser from './volume-parser'

// @author Johanna Tiemann <johanna.tiemann@googlemail.com>
// @author Alexander Rose <alexander.rose@weirdbyte.de>

const reWhitespace = /\s+/
const reScientificNotation = /-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?/g
const bohrToAngstromFactor = 0.529177210859
interface Header {
  atomCount: number,
  originX: number,
  originY: number,
  originZ: number,
  NVX: number,
  NVY: number,
  NVZ: number,
  basisX: Vector3,
  basisY: Vector3,
  basisZ: Vector3
}

class CubeParser extends VolumeParser {
  get type () { return 'cube' }

  _parse () {
    // http://paulbourke.net/dataformats/cube/

    if (Debug) Log.time('CubeParser._parse ' + this.name)

    const v = this.volume
    const headerLines = this.streamer.peekLines(6)
    const header: Partial<Header> = {}

    const scaleFactor = bohrToAngstromFactor * this.voxelSize

    function h (k: number, l: number) {
      var field = headerLines[ k ].trim().split(reWhitespace)[ l ]
      return parseFloat(field)
    }

    header.atomCount = Math.abs(h(2, 0)) // Number of atoms
    header.originX = h(2, 1) * bohrToAngstromFactor // Position of origin of volumetric data
    header.originY = h(2, 2) * bohrToAngstromFactor
    header.originZ = h(2, 3) * bohrToAngstromFactor
    header.NVX = h(3, 0) // Number of voxels
    header.NVY = h(4, 0)
    header.NVZ = h(5, 0)

    header.basisX = new Vector3(h(3, 1), h(3, 2), h(3, 3))
      .multiplyScalar(scaleFactor)
    header.basisY = new Vector3(h(4, 1), h(4, 2), h(4, 3))
      .multiplyScalar(scaleFactor)
    header.basisZ = new Vector3(h(5, 1), h(5, 2), h(5, 3))
      .multiplyScalar(scaleFactor)

    const data = new Float32Array(header.NVX * header.NVY * header.NVZ)
    let count = 0
    let lineNo = 0
    const oribitalFlag = h(2, 0) > 0 ? 0 : 1

    function _parseChunkOfLines (_i: number, _n: number, lines: string[]) {
      for (let i = _i; i < _n; ++i) {
        const line = lines[ i ].trim()

        if (line !== '' && lineNo >= header.atomCount! + 6 + oribitalFlag) {
          const m = line.match(reScientificNotation) as RegExpMatchArray
          for (let j = 0, lj = m.length; j < lj; ++j) {
            data[ count ] = parseFloat(m[ j ])
            ++count
          }
        }

        ++lineNo
      }
    }

    this.streamer.eachChunkOfLines(function (lines/*, chunkNo, chunkCount */) {
      _parseChunkOfLines(0, lines.length, lines)
    })

    v.header = header
    v.setData(data, header.NVZ, header.NVY, header.NVX)

    if (Debug) Log.timeEnd('CubeParser._parse ' + this.name)
  }

  getMatrix () {
    const h = this.volume.header
    const matrix = new Matrix4()

    matrix.multiply(
      new Matrix4().makeTranslation(
        h.originX, h.originY, h.originZ
      )
    )

    matrix.multiply(
      new Matrix4().makeBasis(
        h.basisZ, h.basisY, h.basisX
      )
    )

    return matrix
  }
}

ParserRegistry.add('cub', CubeParser)
ParserRegistry.add('cube', CubeParser)

export default CubeParser
