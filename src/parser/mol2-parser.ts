/**
 * @file Mol2 Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log, ParserRegistry } from '../globals'
import {
  assignResidueTypeBonds,
  calculateChainnames, calculateSecondaryStructure,
  calculateBondsBetween, calculateBondsWithin
} from '../structure/structure-utils'
import StructureParser from './structure-parser'

const reWhitespace = /\s+/
const bondTypes: {[k: string]: number} = {
  '1': 1,
  '2': 2,
  '3': 3,
  'am': 1, // amide
  'ar': 1, // aromatic
  'du': 1, // dummy
  'un': 1, // unknown
  'nc': 0 // not connected
}

class Mol2Parser extends StructureParser {
  get type () { return 'mol2' }

  _parse () {
    // http://paulbourke.net/dataformats/mol2/

    if (Debug) Log.time('Mol2Parser._parse ' + this.name)

    const s = this.structure
    const sb = this.structureBuilder

    const firstModelOnly = this.firstModelOnly
    const asTrajectory = this.asTrajectory

    const frames = s.frames
    let doFrames = false
    let currentFrame: Float32Array, currentCoord: number

    const atomMap = s.atomMap
    const atomStore = s.atomStore
    atomStore.resize(Math.round(this.streamer.data.length / 60))
    atomStore.addField('partialCharge', 1, 'float32')

    let idx = 0
    let moleculeLineNo = 0
    let modelAtomIdxStart = 0
    let modelIdx = -1
    let numAtoms = 0

    let currentRecordType = 0
    let moleculeRecordType = 1
    let atomRecordType = 2
    let bondRecordType = 3

    const ap1 = s.getAtomProxy()
    const ap2 = s.getAtomProxy()

    function _parseChunkOfLines (_i: number, _n: number, lines: string[]) {
      for (let i = _i; i < _n; ++i) {
        const line = lines[ i ].trim()

        if (line === '' || line[ 0 ] === '#') continue

        if (line[ 0 ] === '@') {
          if (line === '@<TRIPOS>MOLECULE') {
            currentRecordType = moleculeRecordType
            moleculeLineNo = 0

            ++modelIdx
          } else if (line === '@<TRIPOS>ATOM') {
            currentRecordType = atomRecordType
            modelAtomIdxStart = atomStore.count

            if (asTrajectory) {
              currentCoord = 0
              currentFrame = new Float32Array(numAtoms * 3)
              frames.push(currentFrame)

              if (modelIdx > 0) doFrames = true
            }
          } else if (line === '@<TRIPOS>BOND') {
            currentRecordType = bondRecordType
          } else {
            currentRecordType = 0
          }
        } else if (currentRecordType === moleculeRecordType) {
          if (moleculeLineNo === 0) {
            s.title = line
            s.id = line
          } else if (moleculeLineNo === 1) {
            const ls = line.split(reWhitespace)
            numAtoms = parseInt(ls[ 0 ])
            // num_atoms [num_bonds [num_subst [num_feat [num_sets]]]]
          } else if (moleculeLineNo === 2) {

            // const molType = line;
            // SMALL, BIOPOLYMER, PROTEIN, NUCLEIC_ACID, SACCHARIDE

          } else if (moleculeLineNo === 3) {

            // const chargeType = line;
            // NO_CHARGES, DEL_RE, GASTEIGER, GAST_HUCK, HUCKEL,
            // PULLMAN, GAUSS80_CHARGES, AMPAC_CHARGES,
            // MULLIKEN_CHARGES, DICT_ CHARGES, MMFF94_CHARGES,
            // USER_CHARGES

          } else if (moleculeLineNo === 4) {

            // const statusBits = line;

          } else if (moleculeLineNo === 5) {

            // const molComment = line;

          }

          ++moleculeLineNo
        } else if (currentRecordType === atomRecordType) {
          const ls = line.split(reWhitespace)

          if (firstModelOnly && modelIdx > 0) continue

          const x = parseFloat(ls[ 2 ])
          const y = parseFloat(ls[ 3 ])
          const z = parseFloat(ls[ 4 ])

          if (asTrajectory) {
            const j = currentCoord * 3

            currentFrame[ j + 0 ] = x
            currentFrame[ j + 1 ] = y
            currentFrame[ j + 2 ] = z

            currentCoord += 1

            if (doFrames) continue
          }

          const serial = ls[ 0 ]
          const atomname = ls[ 1 ]
          const element = ls[ 5 ].split('.')[ 0 ]
          const resno = ls[ 6 ] ? parseInt(ls[ 6 ]) : 1
          const resname = ls[ 7 ] ? ls[ 7 ] : ''
          const partialCharge = ls[ 8 ] ? parseFloat(ls[ 8 ]) : 0.0

          atomStore.growIfFull()
          atomStore.atomTypeId[ idx ] = atomMap.add(atomname, element)

          atomStore.x[ idx ] = x
          atomStore.y[ idx ] = y
          atomStore.z[ idx ] = z
          atomStore.serial[ idx ] = serial
          atomStore.partialCharge[ idx ] = partialCharge

          sb.addAtom(modelIdx, '', '', resname, resno, 1)

          idx += 1
        } else if (currentRecordType === bondRecordType) {
          if (firstModelOnly && modelIdx > 0) continue
          if (asTrajectory && modelIdx > 0) continue

          const ls = line.split(reWhitespace)

          // ls[ 0 ] is bond id
          ap1.index = parseInt(ls[ 1 ]) - 1 + modelAtomIdxStart
          ap2.index = parseInt(ls[ 2 ]) - 1 + modelAtomIdxStart
          const order = bondTypes[ ls[ 3 ] ]

          s.bondStore.addBond(ap1, ap2, order)
        }
      }
    }

    this.streamer.eachChunkOfLines(function (lines/*, chunkNo, chunkCount */) {
      _parseChunkOfLines(0, lines.length, lines)
    })

    sb.finalize()
    s.finalizeAtoms()
    calculateChainnames(s)
    calculateBondsWithin(s, true)
    calculateBondsBetween(s, true)
    s.finalizeBonds()
    assignResidueTypeBonds(s)
    calculateSecondaryStructure(s)

    if (Debug) Log.timeEnd('Mol2Parser._parse ' + this.name)
  }
}

ParserRegistry.add('mol2', Mol2Parser)

export default Mol2Parser
