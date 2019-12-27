/**
 * @file Prmtop Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log, ParserRegistry } from '../globals'
import StructureParser from './structure-parser'
import {
  assignResidueTypeBonds, calculateBondsBetween,
  calculateBondsWithin, calculateChainnames
} from '../structure/structure-utils'

const amberChargeUnitFactor = 18.2223

const enum Mode {
  Title,
  Pointers,
  AtomName,
  Charge,
  Mass,
  ResidueLabel,
  ResiduePointer,
  BondsIncHydrogen,
  BondsWithoutHydrogen,
  Radii
}

function parseIntSubstr (line: string, start: number, length: number) {
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

    const title: string[] = []
    const pointersDict: {[k: string]: number} = {}
    const pointers = [
      'NATOM', 'NTYPES', 'NBONH', 'MBONA', 'NTHETH', 'MTHETA',
      'NPHIH', 'MPHIA', 'NHPARM', 'NPARM', 'NNB', 'NRES',
      'NBONA', 'NTHETA', 'NPHIA', 'NUMBND', 'NUMANG', 'NPTRA',
      'NATYP', 'NPHB', 'IFPERT', 'NBPER', 'NGPER', 'NDPER',
      'MBPER', 'MGPER', 'MDPER', 'IFBOX', 'NMXRS', 'IFCAP',
      'NUMEXTRA', 'NCOPY'
    ]
    pointers.forEach(name => { pointersDict[ name ] = 0 })

    let atomNames: string[]
    let charges: Float32Array
    let radii: Float32Array
    let bAtomIndex1: Uint32Array
    let bAtomIndex2: Uint32Array
    let bBondOrder: Uint8Array = new Uint8Array(0)
    let residueLabels: string[]
    let residuePointers: Uint32Array

    let mode: number|undefined
    // let currentFormat
    let curIdx: number
    let bondIdx: number

    function _parseChunkOfLines (_i: number, _n: number, lines: string[]) {
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
            mode = Mode.Title
          } else if (flag === 'POINTERS') {
            mode = Mode.Pointers
          } else if (flag === 'ATOM_NAME') {
            mode = Mode.AtomName
          } else if (flag === 'CHARGE') {
            mode = Mode.Charge
          } else if (flag === 'MASS') {
            mode = Mode.Mass
          } else if (flag === 'RESIDUE_LABEL') {
            mode = Mode.ResidueLabel
          } else if (flag === 'RESIDUE_POINTER') {
            mode = Mode.ResiduePointer
          } else if (flag === 'BONDS_INC_HYDROGEN') {
            bondIdx = 0
            mode = Mode.BondsIncHydrogen
          } else if (flag === 'BONDS_WITHOUT_HYDROGEN') {
            bondIdx = pointersDict['NBONH']
            mode = Mode.BondsWithoutHydrogen
          } else if (flag === 'RADII') {
            mode = Mode.Radii
          } else {
            mode = undefined
          }
        } else if (mode === Mode.Title) {
          title.push(lt)
        } else if (mode === Mode.Pointers) {
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
        } else if (mode === Mode.AtomName) {
          const n = Math.min(curIdx + 20, pointersDict.NATOM)
          for (let i = 0; curIdx < n; ++i, ++curIdx) {
            atomNames[curIdx] = line.substr(i * 4, 4).trim()
          }
        } else if (mode === Mode.Charge) {
          const n = Math.min(curIdx + 5, pointersDict.NATOM)
          for (let i = 0; curIdx < n; ++i, ++curIdx) {
            charges[curIdx] = parseFloat(line.substr(i * 16, 16)) / amberChargeUnitFactor
          }
        } else if (mode === Mode.Mass) {

          // not currently used

        } else if (mode === Mode.ResidueLabel) {
          const n = Math.min(curIdx + 20, pointersDict.NRES)
          for (let i = 0; curIdx < n; ++i, ++curIdx) {
            residueLabels[curIdx] = line.substr(i * 4, 4).trim()
          }
        } else if (mode === Mode.ResiduePointer) {
          const n = Math.min(curIdx + 10, pointersDict.NRES)
          for (let i = 0; curIdx < n; ++i, ++curIdx) {
            residuePointers[curIdx] = parseIntSubstr(line, i * 8, 8)
          }
        } else if (mode === Mode.BondsIncHydrogen) {
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
        } else if (mode === Mode.BondsWithoutHydrogen) {
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
        } else if (mode === Mode.Radii) {
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
    let curResname = residueLabels![0]
    let curResno = 1
    for (let i = 0; i < atomCount; ++i) {
      if (i + 1 === residuePointers![curResIdx + 1]) {
        ++curResIdx
        curResname = residueLabels![curResIdx]
        curResno = curResIdx + 1
      }
      atomStore.atomTypeId[i] = atomMap.add(atomNames![i])
      atomStore.serial[i] = i + 1
      sb.addAtom(0, '', '', curResname, curResno)
    }

    atomStore.partialCharge.set(charges!)
    atomStore.radius.set(radii!)

    s.bondStore.length = bBondOrder!.length
    s.bondStore.count = bBondOrder!.length
    s.bondStore.atomIndex1 = bAtomIndex1!
    s.bondStore.atomIndex2 = bAtomIndex2!
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
