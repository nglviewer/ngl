/**
 * @file Prmtop Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log, ParserRegistry } from '../globals.js'
import StructureParser from './structure-parser.js'
import {
    assignResidueTypeBonds, calculateBondsBetween,
    calculateBondsWithin, calculateChainnames
} from '../structure/structure-utils.js'

const amberChargeUnitFactor = 18.2223

const TitleMode = 1
const PointersMode = 2
const AtomNameMode = 3
const ChargeMode = 4
const MassMode = 5
const ResidueLabelMode = 6
const ResiduePointerMode = 7
const BondsIncHydrogenMode = 8
const BondsWithoutHydrogenMode = 9
const RadiiMode = 10

function parseIntSubstr (line, start, length) {
  return parseInt(line.substr(start, length).trim())
}

class PrmtopParser extends StructureParser {
  get type () { return 'prmtop' }

  _parse () {
    // http://ambermd.org/prmtop.pdf
    // http://ambermd.org/formats.html#topology

    if (Debug) Log.time('PrmtopParser._parse ' + this.name)

    const s = this.structure
    const sb = this.structureBuilder

    //

    const atomMap = s.atomMap
    const atomStore = s.atomStore
    atomStore.addField('partialCharge', 1, 'float32')
    atomStore.addField('radius', 1, 'float32')

    const title = []
    const pointersDict = {}
    const pointers = [
      'NATOM', 'NTYPES', 'NBONH', 'MBONA', 'NTHETH', 'MTHETA',
      'NPHIH', 'MPHIA', 'NHPARM', 'NPARM', 'NNB', 'NRES',
      'NBONA', 'NTHETA', 'NPHIA', 'NUMBND', 'NUMANG', 'NPTRA',
      'NATYP', 'NPHB', 'IFPERT', 'NBPER', 'NGPER', 'NDPER',
      'MBPER', 'MGPER', 'MDPER', 'IFBOX', 'NMXRS', 'IFCAP',
      'NUMEXTRA', 'NCOPY'
    ]
    pointers.forEach(name => { pointersDict[ name ] = 0 })

    let atomNames
    let charges
    let radii
    let bAtomIndex1
    let bAtomIndex2
    let bBondOrder
    let residueLabels
    let residuePointers

    let mode
    // let currentFormat
    let curIdx
    let bondIdx

    function _parseChunkOfLines (_i, _n, lines) {
      for (let i = _i; i < _n; ++i) {
        const line = lines[ i ]
        const lt = line.trim()

        if (!lt) {
          continue
        } else if (line.startsWith('%FORMAT')) {
          // currentFormat = lt.substring(8, lt.length - 1)
        } else if (line.startsWith('%FLAG')) {
          const flag = line.substr(5).trim()
          curIdx = 0

          if (flag === 'TITLE') {
            mode = TitleMode
          } else if (flag === 'POINTERS') {
            mode = PointersMode
          } else if (flag === 'ATOM_NAME') {
            mode = AtomNameMode
          } else if (flag === 'CHARGE') {
            mode = ChargeMode
          } else if (flag === 'MASS') {
            mode = MassMode
          } else if (flag === 'RESIDUE_LABEL') {
            mode = ResidueLabelMode
          } else if (flag === 'RESIDUE_POINTER') {
            mode = ResiduePointerMode
          } else if (flag === 'BONDS_INC_HYDROGEN') {
            bondIdx = 0
            mode = BondsIncHydrogenMode
          } else if (flag === 'BONDS_WITHOUT_HYDROGEN') {
            bondIdx = pointersDict['NBONH']
            mode = BondsWithoutHydrogenMode
          } else if (flag === 'RADII') {
            mode = RadiiMode
          } else {
            mode = undefined
          }
        } else if (mode === TitleMode) {
          title.push(lt)
        } else if (mode === PointersMode) {
          const n = Math.min(curIdx + 10, 32)
          for (let i = 0; curIdx < n; ++i, ++curIdx) {
            pointersDict[pointers[curIdx]] = parseInt(
              line.substr(i * 8, 8).trim()
            )
          }
          atomNames = new Array(pointersDict.NATOM)
          charges = new Float32Array(pointersDict.NATOM)
          radii = new Float32Array(pointersDict.NATOM)
          atomStore.resize(pointersDict.NATOM)
          const bondCount = pointersDict.NBONH + pointersDict.MBONA
          bAtomIndex1 = new Uint32Array(bondCount)
          bAtomIndex2 = new Uint32Array(bondCount)
          bBondOrder = new Uint8Array(bondCount)
          residueLabels = new Array(pointersDict.NRES)
          residuePointers = new Uint32Array(pointersDict.NRES)
        } else if (mode === AtomNameMode) {
          const n = Math.min(curIdx + 20, pointersDict.NATOM)
          for (let i = 0; curIdx < n; ++i, ++curIdx) {
            atomNames[curIdx] = line.substr(i * 4, 4).trim()
          }
        } else if (mode === ChargeMode) {
          const n = Math.min(curIdx + 5, pointersDict.NATOM)
          for (let i = 0; curIdx < n; ++i, ++curIdx) {
            charges[curIdx] = parseFloat(line.substr(i * 16, 16)) / amberChargeUnitFactor
          }
        } else if (mode === MassMode) {

          // not currently used

        } else if (mode === ResidueLabelMode) {
          const n = Math.min(curIdx + 20, pointersDict.NRES)
          for (let i = 0; curIdx < n; ++i, ++curIdx) {
            residueLabels[curIdx] = line.substr(i * 4, 4).trim()
          }
        } else if (mode === ResiduePointerMode) {
          const n = Math.min(curIdx + 10, pointersDict.NRES)
          for (let i = 0; curIdx < n; ++i, ++curIdx) {
            residuePointers[curIdx] = parseIntSubstr(line, i * 8, 8)
          }
        } else if (mode === BondsIncHydrogenMode) {
          const n = Math.min(curIdx + 10, pointersDict.NBONH * 3)
          for (let i = 0; curIdx < n; ++i, ++curIdx) {
            const r = curIdx % 3
            if (r === 0) {
              bAtomIndex1[bondIdx] = parseIntSubstr(line, i * 8, 8) / 3
            } if (r === 1) {
              bAtomIndex2[bondIdx] = parseIntSubstr(line, i * 8, 8) / 3
              bBondOrder[bondIdx] = 1
              ++bondIdx
            }
          }
        } else if (mode === BondsWithoutHydrogenMode) {
          const n = Math.min(curIdx + 10, pointersDict.MBONA * 3)
          for (let i = 0; curIdx < n; ++i, ++curIdx) {
            const r = curIdx % 3
            if (r === 0) {
              bAtomIndex1[bondIdx] = parseIntSubstr(line, i * 8, 8) / 3
            } if (r === 1) {
              bAtomIndex2[bondIdx] = parseIntSubstr(line, i * 8, 8) / 3
              bBondOrder[bondIdx] = 1
              ++bondIdx
            }
          }
        } else if (mode === RadiiMode) {
          const n = Math.min(curIdx + 5, pointersDict.NATOM)
          for (let i = 0; curIdx < n; ++i, ++curIdx) {
            radii[curIdx] = parseFloat(line.substr(i * 16, 16))
          }
        }
      }
    }

    this.streamer.eachChunkOfLines(function (lines/*, chunkNo, chunkCount */) {
      _parseChunkOfLines(0, lines.length, lines)
    })

    s.title = title.join(' ')

    const atomCount = pointersDict.NATOM
    let curResIdx = 0
    let curResname = residueLabels[0]
    let curResno = 1
    for (let i = 0; i < atomCount; ++i) {
      if (i + 1 === residuePointers[curResIdx + 1]) {
        ++curResIdx
        curResname = residueLabels[curResIdx]
        curResno = curResIdx + 1
      }
      atomStore.atomTypeId[i] = atomMap.add(atomNames[i])
      atomStore.serial[i] = i + 1
      sb.addAtom(0, '', '', curResname, curResno)
    }

    atomStore.partialCharge.set(charges)
    atomStore.radius.set(radii)

    s.bondStore.length = bBondOrder.length
    s.bondStore.count = bBondOrder.length
    s.bondStore.atomIndex1 = bAtomIndex1
    s.bondStore.atomIndex2 = bAtomIndex2
    s.bondStore.bondOrder = bBondOrder

    sb.finalize()
    s.finalizeAtoms()
    s.finalizeBonds()
    calculateBondsWithin(s, true)
    calculateBondsBetween(s, true, true)
    calculateChainnames(s, true)
    assignResidueTypeBonds(s)

    if (Debug) Log.timeEnd('PrmtopParser._parse ' + this.name)
  }
}

ParserRegistry.add('prmtop', PrmtopParser)
ParserRegistry.add('parm7', PrmtopParser)

export default PrmtopParser
