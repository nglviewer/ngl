/**
 * @file Top Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log, ParserRegistry } from '../globals.js'
import StructureParser from './structure-parser.js'
import { WaterNames } from '../structure/structure-constants.js'
import {
  assignResidueTypeBonds, calculateBondsBetween,
  calculateBondsWithin, getChainname
} from '../structure/structure-utils.js'

const SystemMode = 1
const MoleculesMode = 2
const MoleculetypeMode = 3
const AtomsMode = 4
const BondsMode = 5

const reField = /\[ (.+) \]/
const reWhitespace = /\s+/

class TopParser extends StructureParser {
  get type () { return 'top' }

  _parse () {
    // http://manual.gromacs.org/online/top.html

    if (Debug) Log.time('TopParser._parse ' + this.name)

    const s = this.structure
    const sb = this.structureBuilder

    //

    const atomMap = s.atomMap
    const bondStore = s.bondStore

    const atomStore = s.atomStore
    atomStore.addField('partialCharge', 1, 'float32')

    const molecules = []
    const moleculetypeDict = {}

    let currentMoleculetype
    let mode

    function _parseChunkOfLines (_i, _n, lines) {
      for (let i = _i; i < _n; ++i) {
        const line = lines[ i ]
        let lt = line.trim()

        if (!lt || lt[0] === '*' || lt[0] === ';') {
          continue
        }

        if (lt.startsWith('#include')) {
          throw new Error('TopParser: #include statements not allowed')
        }

        const fieldMatch = line.match(reField)
        if (fieldMatch !== null) {
          const name = fieldMatch[1]
          if (name === 'moleculetype') {
            mode = MoleculetypeMode
            currentMoleculetype = {
              atoms: [],
              bonds: []
            }
          } else if (name === 'atoms') {
            mode = AtomsMode
          } else if (name === 'bonds') {
            mode = BondsMode
          } else if (name === 'system') {
            mode = SystemMode
          } else if (name === 'molecules') {
            mode = MoleculesMode
          } else {
            mode = undefined
          }
          continue
        }

        const cIdx = lt.indexOf(';')
        if (cIdx !== -1) {
          lt = lt.substring(0, cIdx).trim()
        }
        if (mode === MoleculetypeMode) {
          const molName = lt.split(reWhitespace)[0]
          moleculetypeDict[molName] = currentMoleculetype
        } else if (mode === AtomsMode) {
          const ls = lt.split(reWhitespace)
          currentMoleculetype.atoms.push([
            parseInt(ls[2]),   // resnr
            ls[3],             // residue
            ls[4],             // atom
            parseFloat(ls[6])  // charge
          ])
        } else if (mode === BondsMode) {
          const ls = lt.split(reWhitespace)
          currentMoleculetype.bonds.push([
            parseInt(ls[0]),  // ai
            parseInt(ls[1])   // aj
          ])
        } else if (mode === SystemMode) {
          s.title = lt
        } else if (mode === MoleculesMode) {
          const ls = lt.split(reWhitespace)
          molecules.push([
            ls[0],           // name
            parseInt(ls[1])  // count
          ])
        }
      }
    }

    this.streamer.eachChunkOfLines(function (lines/*, chunkNo, chunkCount */) {
      _parseChunkOfLines(0, lines.length, lines)
    })

    let atomCount = 0
    let bondCount = 0
    molecules.forEach(function (val) {
      const [name, molCount] = val
      const molType = moleculetypeDict[name]
      atomCount += molCount * molType.atoms.length
      bondCount += molCount * molType.bonds.length
    })

    atomStore.resize(atomCount)
    bondStore.resize(bondCount)

    let atomIdx = 0
    let resIdx = 0
    let chainidIdx = 0
    let chainnameIdx = 0
    let bondIdx = 0
    let atomOffset = 0
    let lastResno

    molecules.forEach(function (val) {
      const [name, molCount] = val
      const molType = moleculetypeDict[name]
      const chainname = getChainname(chainnameIdx)
      for (let i = 0; i < molCount; ++i) {
        lastResno = -1
        const chainid = WaterNames.includes(name) ? chainname : getChainname(chainidIdx)
        molType.atoms.forEach(function (atomData) {
          const [resno, resname, atomname, charge] = atomData
          if (resno !== lastResno) {
            ++resIdx
          }
          atomStore.atomTypeId[atomIdx] = atomMap.add(atomname)
          atomStore.serial[atomIdx] = atomIdx + 1
          atomStore.partialCharge[atomIdx] = charge
          sb.addAtom(0, chainname, chainid, resname, resIdx + 1)
          ++atomIdx
          lastResno = resno
        })
        molType.bonds.forEach(function (bondData) {
          bondStore.atomIndex1[bondIdx] = atomOffset + bondData[0] - 1
          bondStore.atomIndex2[bondIdx] = atomOffset + bondData[1] - 1
          ++bondIdx
        })
        ++chainidIdx
        atomOffset += molType.atoms.length
      }
      ++chainnameIdx
    })

    bondStore.count = bondCount

    sb.finalize()
    s.finalizeAtoms()
    s.finalizeBonds()
    calculateBondsWithin(s, true)
    calculateBondsBetween(s, true, true)
    assignResidueTypeBonds(s)

    if (Debug) Log.timeEnd('TopParser._parse ' + this.name)
  }
}

ParserRegistry.add('top', TopParser)

export default TopParser
