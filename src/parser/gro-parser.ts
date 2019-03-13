/**
 * @file Gro Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log, ParserRegistry } from '../globals'
import StructureParser from './structure-parser'
import {
  calculateBonds, calculateChainnames, calculateSecondaryStructure
} from '../structure/structure-utils'

class GroParser extends StructureParser {
  get type () { return 'gro' }

  _parse () {
    // http://manual.gromacs.org/current/online/gro.html

    if (Debug) Log.time('GroParser._parse ' + this.name)

    var s = this.structure
    var sb = this.structureBuilder

    var firstModelOnly = this.firstModelOnly
    var asTrajectory = this.asTrajectory
    var cAlphaOnly = this.cAlphaOnly

    var frames = s.frames
    var boxes = s.boxes
    var currentFrame: Float32Array, currentCoord: number

    var firstLines = this.streamer.peekLines(3)

    s.title = firstLines[ 0 ].trim()

    // determine number of decimal places
    var ndec = firstLines[ 2 ].length - firstLines[ 2 ].lastIndexOf('.') - 1
    var lpos = 5 + ndec
    var xpos = 20
    var ypos = 20 + lpos
    var zpos = 20 + 2 * lpos

    //

    var atomname, resname, resno, serial

    var atomCount = parseInt(firstLines[ 1 ])
    var modelLineCount = atomCount + 3

    var atomMap = s.atomMap
    var atomStore = s.atomStore
    atomStore.resize(atomCount)

    var idx = 0
    var modelIdx = 0
    var lineNo = 0

    function _parseChunkOfLines (_i: number, _n: number, lines: string[]) {
      for (var i = _i; i < _n; ++i) {
        ++lineNo
        var l = lineNo - 1

        var line = lines[ i ]

        if (!line) continue

        if (l % modelLineCount === 0) {
          // Log.log( "title", line )

          if (asTrajectory) {
            currentFrame = new Float32Array(atomCount * 3)
            frames.push(currentFrame)
            currentCoord = 0
          }
        } else if (l % modelLineCount === 1) {

          // Log.log( "atomCount", line )

        } else if (l % modelLineCount === modelLineCount - 1) {
          var str = line.trim().split(/\s+/)
          var box = new Float32Array(9)
          box[ 0 ] = parseFloat(str[ 0 ]) * 10
          box[ 4 ] = parseFloat(str[ 1 ]) * 10
          box[ 8 ] = parseFloat(str[ 2 ]) * 10
          boxes.push(box)

          if (firstModelOnly) {
            return true
          }

          modelIdx += 1
        } else {
          atomname = line.substr(10, 5).trim()
          if (cAlphaOnly && atomname !== 'CA') continue

          var x = parseFloat(line.substr(xpos, lpos)) * 10
          var y = parseFloat(line.substr(ypos, lpos)) * 10
          var z = parseFloat(line.substr(zpos, lpos)) * 10

          if (asTrajectory) {
            var j = currentCoord * 3

            currentFrame[ j + 0 ] = x
            currentFrame[ j + 1 ] = y
            currentFrame[ j + 2 ] = z

            currentCoord += 1

            if (l > modelLineCount) continue
          }

          resname = line.substr(5, 5).trim()
          resno = parseInt(line.substr(0, 5))
          serial = parseInt(line.substr(15, 5))

          atomStore.growIfFull()
          atomStore.atomTypeId[ idx ] = atomMap.add(atomname)

          atomStore.x[ idx ] = x
          atomStore.y[ idx ] = y
          atomStore.z[ idx ] = z
          atomStore.serial[ idx ] = serial

          sb.addAtom(modelIdx, '', '', resname, resno, 0, 'l')

          idx += 1
        }
      }
    }

    this.streamer.eachChunkOfLines(function (lines/*, chunkNo, chunkCount */) {
      _parseChunkOfLines(0, lines.length, lines)
    })

    sb.finalize()
    s.finalizeAtoms()
    calculateChainnames(s)
    calculateBonds(s)
    s.finalizeBonds()

    calculateSecondaryStructure(s)

    if (Debug) Log.timeEnd('GroParser._parse ' + this.name)
  }
}

ParserRegistry.add('gro', GroParser)

export default GroParser
