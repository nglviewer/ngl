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
    let lineNo = 0  // for V2000: current line number in currently parsed Mol file
    let modelIdx = 0
    let modelAtomIdxStart = 0

    const sdfData: {[k: string]: string[]}[] = []
    let currentItem: string|boolean = false
    let currentData: {[k: string]: string[]} = {}
    let mItem: RegExpMatchArray | null
    s.extraData.sdf = sdfData

    let atomCount, bondCount, atomStart: number, atomEnd: number, bondStart: number, bondEnd: number, x: number, y: number, z: number, atomname: string, element: string, atomindex: number, order: number
    let isV3000 = false, isAtomBlock = false, isBondBlock = false
    let tokens: string[] = [], acc: string[] = []
    const atomindexToStoreindex = new Map<number, number>()

    function _parseChunkOfLines (_i: number, _n: number, lines: string[]) {
      for (let i = _i; i < _n; ++i) {
        const line = lines[ i ]

        if (isV3000 && line) {
          tokens = line.substring(7).split(' ')

          // Entity properties may extend over multiple lines (hanging line finishes with '-')
          // Tokens are accumulated to be processed at the same time for a given entity
          if (acc.length) {
            tokens = [...acc, ...tokens]
            acc = []
          }
          if (tokens[tokens.length - 1] === '-') {
            tokens.pop();
            acc = tokens;
            continue;
          }
        }

        if (line.substr(0, 4) === '$$$$') {
          lineNo = -1
          ++modelIdx
          modelAtomIdxStart = atomStore.count
          sdfData.push(currentData)
          currentData = {}
          currentItem = false
          isV3000 = false
        } else if (lineNo === 3) {
          isV3000 = line.indexOf(' V3000') > -1

          if (isV3000) {
            atomindexToStoreindex.clear()
          } else {

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
          }
        } else if (isV3000 && tokens[0] === 'COUNTS') {
          atomCount = parseInt(tokens[1]);

          if (asTrajectory) {
            currentCoord = 0
            currentFrame = new Float32Array(atomCount * 3)
            frames.push(currentFrame)

            if (modelIdx > 0) doFrames = true
          }
        } else if (isV3000 && tokens.length == 2) {
          if (tokens[1] === 'ATOM') {
            if (tokens[0] === 'BEGIN') isAtomBlock = true
            else if (tokens[0] === 'END') isAtomBlock = false
          } else if (tokens[1] === 'BOND') {
            if (tokens[0] === 'BEGIN') isBondBlock = true
            else if (tokens[0] === 'END') isBondBlock = false
          }
        } else if (
          isAtomBlock 
          || (!isV3000 && lineNo >= atomStart && lineNo < atomEnd)
        ) {
          if (firstModelOnly && modelIdx > 0) continue

          let charge = 0
          if (isV3000) {
            x = parseFloat(tokens[2])
            y = parseFloat(tokens[3])
            z = parseFloat(tokens[4])

            element = tokens[1]
            atomindex = parseInt(tokens[0])
            atomindexToStoreindex.set(atomindex, idx)
            atomname = element + atomindex

            if (tokens.length > 6) {
              let chgTok = tokens.slice(6).find(t => t.indexOf('CHG=') === 0);
              if (chgTok) {
                charge = parseInt(chgTok.substring(4))
              }
            }
          } else {
            x = parseFloat(line.substr(0, 10))
            y = parseFloat(line.substr(10, 10))
            z = parseFloat(line.substr(20, 10))

            element = line.substr(31, 3).trim()
            atomname = element + (idx - modelAtomIdxStart + 1)
          }

          if (asTrajectory) {
            const j = currentCoord * 3

            currentFrame[ j + 0 ] = x
            currentFrame[ j + 1 ] = y
            currentFrame[ j + 2 ] = z

            currentCoord += 1

            if (doFrames) continue
          }

          atomStore.growIfFull()
          atomStore.atomTypeId[ idx ] = atomMap.add(atomname, element)

          atomStore.x[ idx ] = x
          atomStore.y[ idx ] = y
          atomStore.z[ idx ] = z
          atomStore.serial[ idx ] = isV3000 ? atomindex : idx
          atomStore.formalCharge![ idx ] = charge

          sb.addAtom(modelIdx, '', '', 'HET', 1, true)

          idx += 1
        } else if (
          isBondBlock 
          || (!isV3000 && lineNo >= bondStart && lineNo < bondEnd)
        ) {
          if (firstModelOnly && modelIdx > 0) continue
          if (asTrajectory && modelIdx > 0) continue

          if (isV3000) {
            ap1.index = atomindexToStoreindex.get(parseInt(tokens[2]))!
            ap2.index = atomindexToStoreindex.get(parseInt(tokens[3]))!
            order = parseInt(tokens[1])
          } else {
            ap1.index = parseInt(line.substr(0, 3)) - 1 + modelAtomIdxStart
            ap2.index = parseInt(line.substr(3, 3)) - 1 + modelAtomIdxStart
            order = parseInt(line.substr(6, 3))
          }

          s.bondStore.addBond(ap1, ap2, order)
        } else if (line.substr(0, 6) === 'M  CHG') {
          const chargeCount = parseInt(line.substr(6, 3))
          for (let ci = 0, coffset = 10; ci < chargeCount; ++ci, coffset += 8) {
            const aToken = parseInt(line.substr(coffset, 3))
            const atomIdx = aToken - 1 + modelAtomIdxStart
            const cToken = parseInt(line.substr(coffset + 4, 3))
            atomStore.formalCharge![ atomIdx ] = cToken
          }
        // eslint-disable-next-line no-cond-assign
        } else if (line.charAt(0) === '>' && (mItem = line.match(reItem))) {
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
