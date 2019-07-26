/**
 * @file Psf Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log, ParserRegistry } from '../globals'
import StructureParser from './structure-parser'
import {
  assignResidueTypeBonds, calculateBondsBetween,
  calculateBondsWithin, getChainname
} from '../structure/structure-utils'

const TitleMode = 1
const AtomMode = 2
const BondMode = 3
const AngleMode = 4
const DihedralMode = 5
const ImproperMode = 6

const reWhitespace = /\s+/
const reTitle = /(^\*|REMARK)*/

class PsfParser extends StructureParser {
  get type () { return 'psf' }

  _parse () {
    // http://www.ks.uiuc.edu/Training/Tutorials/namd/namd-tutorial-unix-html/node23.html

    if (Debug) Log.time('PsfParser._parse ' + this.name)

    const s = this.structure
    const sb = this.structureBuilder

    //

    const atomMap = s.atomMap
    const atomStore = s.atomStore
    atomStore.addField('partialCharge', 1, 'float32')

    const title: string[] = []

    let mode: number|undefined
    let chainid: string
    let lastSegid: string
    let idx = 0
    let chainIdx = 0
    let bondIdx = 0
    let bAtomIndex1: Uint32Array, bAtomIndex2: Uint32Array, bBondOrder: Uint8Array

    function _parseChunkOfLines (_i: number, _n: number, lines: string[]) {
      for (let i = _i; i < _n; ++i) {
        const line = lines[ i ].trim()

        if (!line) {
          mode = undefined
          continue
        }

        if (mode === AtomMode) {
          const ls = line.split(reWhitespace)

          const serial = parseInt(ls[ 0 ])
          const segid = ls[ 1 ]
          const resno = parseInt(ls[ 2 ])
          const resname = ls[ 3 ]
          const atomname = ls[ 4 ]
          const charge = parseFloat(ls[ 6 ])

          if (segid !== lastSegid) {
            chainid = getChainname(chainIdx)
            ++chainIdx
          }

          atomStore.growIfFull()
          atomStore.atomTypeId[ idx ] = atomMap.add(atomname)

          atomStore.serial[ idx ] = serial
          atomStore.partialCharge[ idx ] = charge

          sb.addAtom(0, chainid, chainid, resname, resno)

          idx += 1
          lastSegid = segid
        } else if (mode === BondMode) {
          const ls = line.split(reWhitespace)

          for (let j = 0, m = ls.length; j < m; j += 2) {
            bAtomIndex1[ bondIdx ] = parseInt(ls[ j ]) - 1
            bAtomIndex2[ bondIdx ] = parseInt(ls[ j + 1 ]) - 1
            bBondOrder[ bondIdx ] = 1
            bondIdx += 1
          }
        } else if (mode === TitleMode) {
          title.push(line.replace(reTitle, '').trim())
        } else if (mode === AngleMode) {

          // currently not used

        } else if (mode === DihedralMode) {

          // currently not used

        } else if (mode === ImproperMode) {

          // currently not used

        } else if (line.includes('!NATOM')) {
          mode = AtomMode

          const numAtoms = parseInt(line.split(reWhitespace)[ 0 ])
          atomStore.resize(numAtoms)
        } else if (line.includes('!NBOND')) {
          mode = BondMode

          const numBonds = parseInt(line.split(reWhitespace)[ 0 ])
          bAtomIndex1 = new Uint32Array(numBonds)
          bAtomIndex2 = new Uint32Array(numBonds)
          bBondOrder = new Uint8Array(numBonds)
        } else if (line.includes('!NTITLE')) {
          mode = TitleMode
        } else if (line.includes('!NTHETA')) {
          mode = AngleMode
        } else if (line.includes('!NPHI')) {
          mode = DihedralMode
        } else if (line.includes('!NIMPHI')) {
          mode = ImproperMode
        }
      }
    }

    this.streamer.eachChunkOfLines(function (lines/*, chunkNo, chunkCount */) {
      _parseChunkOfLines(0, lines.length, lines)
    })

    s.title = title.join(' ')

    s.bondStore.length = bBondOrder!.length
    s.bondStore.count = bondIdx
    s.bondStore.atomIndex1 = bAtomIndex1!
    s.bondStore.atomIndex2 = bAtomIndex2!
    s.bondStore.bondOrder = bBondOrder!

    sb.finalize()
    s.finalizeAtoms()
    s.finalizeBonds()
    calculateBondsWithin(s, true)
    calculateBondsBetween(s, true, true)
    assignResidueTypeBonds(s)

    if (Debug) Log.timeEnd('PsfParser._parse ' + this.name)
  }
}

ParserRegistry.add('psf', PsfParser)

export default PsfParser
