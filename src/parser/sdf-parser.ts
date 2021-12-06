/**
 * @file Sdf Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log, ParserRegistry } from '../globals'
import { assignResidueTypeBonds } from '../structure/structure-utils'
import StructureParser from './structure-parser'

const reItem = /> +<(.+)>/

class SdfParser extends StructureParser {
  get type () { return 'sdf' }

  _parse () {
    // https://en.wikipedia.org/wiki/Chemical_table_file#SDF
    // http://download.accelrys.com/freeware/ctfile-formats/ctfile-formats.zip

    if (Debug) Log.time('SdfParser._parse ' + this.name)

    const s = this.structure
    const sb = this.structureBuilder

    const firstModelOnly = this.firstModelOnly
    const asTrajectory = this.asTrajectory

    const headerLines = this.streamer.peekLines(2)

    s.id = headerLines[ 0 ].trim()
    s.title = headerLines[ 1 ].trim()

    const frames = s.frames
    let doFrames = false
    let currentFrame: Float32Array, currentCoord: number

    const atomMap = s.atomMap
    const atomStore = s.atomStore
    atomStore.resize(Math.round(this.streamer.data.length / 50))
    atomStore.addField('formalCharge', 1, 'int8')

    const ap1 = s.getAtomProxy()
    const ap2 = s.getAtomProxy()

    let idx = 0
    let lineNo = 0
    let modelIdx = 0
    let modelAtomIdxStart = 0

    const sdfData: {[k: string]: string[]}[] = []
    let currentItem: string|boolean = false
    let currentData: {[k: string]: string[]} = {}
    let mItem
    s.extraData.sdf = sdfData

    let atomCount, bondCount, atomStart: number, atomEnd: number, bondStart: number, bondEnd: number

    function _parseChunkOfLines (_i: number, _n: number, lines: string[]) {
      for (let i = _i; i < _n; ++i) {
        const line = lines[ i ]

        if (line.substr(0, 4) === '$$$$') {
          lineNo = -1
          ++modelIdx
          modelAtomIdxStart = atomStore.count
          sdfData.push(currentData)
          currentData = {}
          currentItem = false
        } else if (lineNo === 3) {
          atomCount = parseInt(line.substr(0, 3))
          bondCount = parseInt(line.substr(3, 3))

          atomStart = 4
          atomEnd = atomStart + atomCount
          bondStart = atomEnd
          bondEnd = bondStart + bondCount

          if (asTrajectory) {
            currentCoord = 0
            currentFrame = new Float32Array(atomCount * 3)
            frames.push(currentFrame)

            if (modelIdx > 0) doFrames = true
          }
        } else if (lineNo >= atomStart && lineNo < atomEnd) {
          if (firstModelOnly && modelIdx > 0) continue

          const x = parseFloat(line.substr(0, 10))
          const y = parseFloat(line.substr(10, 10))
          const z = parseFloat(line.substr(20, 10))

          if (asTrajectory) {
            const j = currentCoord * 3

            currentFrame[ j + 0 ] = x
            currentFrame[ j + 1 ] = y
            currentFrame[ j + 2 ] = z

            currentCoord += 1

            if (doFrames) continue
          }

          const element = line.substr(31, 3).trim()
          const atomname = element + (idx + 1)

          atomStore.growIfFull()
          atomStore.atomTypeId[ idx ] = atomMap.add(atomname, element)

          atomStore.x[ idx ] = x
          atomStore.y[ idx ] = y
          atomStore.z[ idx ] = z
          atomStore.serial[ idx ] = idx
          atomStore.formalCharge[ idx ] = 0

          sb.addAtom(modelIdx, '', '', 'HET', 1, 1)

          idx += 1
        } else if (lineNo >= bondStart && lineNo < bondEnd) {
          if (firstModelOnly && modelIdx > 0) continue
          if (asTrajectory && modelIdx > 0) continue

          ap1.index = parseInt(line.substr(0, 3)) - 1 + modelAtomIdxStart
          ap2.index = parseInt(line.substr(3, 3)) - 1 + modelAtomIdxStart
          const order = parseInt(line.substr(6, 3))

          s.bondStore.addBond(ap1, ap2, order)
        } else if (line.match(/M {2}CHG/)) {
          const chargeCount = parseInt(line.substr(6, 3))
          for (let ci = 0, coffset = 10; ci < chargeCount; ++ci, coffset += 8) {
            const aToken = parseInt(line.substr(coffset, 3))
            const atomIdx = aToken - 1 + modelAtomIdxStart
            const cToken = parseInt(line.substr(coffset + 4, 3))
            atomStore.formalCharge[ atomIdx ] = cToken
          }
        // eslint-disable-next-line no-cond-assign
        } else if (mItem = line.match(reItem)) {
          currentItem = mItem[ 1 ]
          currentData[ currentItem ] = []
        } else if (currentItem !== false && line) {
          currentData[ <string>currentItem ].push(line)
        }

        ++lineNo
      }
    }

    this.streamer.eachChunkOfLines(function (lines/*, chunkNo, chunkCount */) {
      _parseChunkOfLines(0, lines.length, lines)
    })

    sb.finalize()
    s.finalizeAtoms()
    s.finalizeBonds()
    assignResidueTypeBonds(s)

    if (Debug) Log.timeEnd('SdfParser._parse ' + this.name)
  }

  _postProcess () {
    assignResidueTypeBonds(this.structure)
  }
}

ParserRegistry.add('sdf', SdfParser)
ParserRegistry.add('sd', SdfParser)
ParserRegistry.add('mol', SdfParser)

export default SdfParser
