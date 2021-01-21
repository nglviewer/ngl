/**
 * @file Pdb Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Matrix4 } from 'three'

import { Debug, Log, ParserRegistry } from '../globals'
import { defaults } from '../utils'
import StructureParser from './structure-parser'
import Entity, { EntityTypeString } from '../structure/entity'
import Unitcell, { UnitcellParams } from '../symmetry/unitcell'
import Assembly, { AssemblyPart } from '../symmetry/assembly'
import { WaterNames } from '../structure/structure-constants'
import {
  assignSecondaryStructure, buildUnitcellAssembly,
  calculateBonds, calculateChainnames, calculateSecondaryStructure
} from '../structure/structure-utils'
import Streamer from '../streamer/streamer';
import { ParserParameters } from './parser';
import { NumberArray } from '../types';
import { Structure } from '../ngl';

// PDB helix record encoding
const HelixTypes: {[k: number]: string} = {
  1: 'h', // Right-handed alpha (default)
  2: 'h', // Right-handed omega
  3: 'i', // Right-handed pi
  4: 'h', // Right-handed gamma
  5: 'g', // Right-handed 310
  6: 'h', // Left-handed alpha
  7: 'h', // Left-handed omega
  8: 'h', // Left-handed gamma
  9: 'h', // 27 ribbon/helix
  10: 'h', // Polyproline
  0: 'h' //Used to be ''
}

const dAminoAcids = [
  'DAL', // D-ALANINE
  'DAR', // D-ARGININE
  'DSG', // D-ASPARAGINE
  'DAS', // D-ASPARTIC ACID
  'DCY', // D-CYSTEINE
  'DGL', // D-GLUTAMIC ACID
  'DGN', // D-GLUTAMINE
  'DHI', // D-HISTIDINE
  'DIL', // D-ISOLEUCINE
  'DLE', // D-LEUCINE
  'DLY', // D-LYSINE
  'MED', // D-METHIONINE
  'DPN', // D-PHENYLALANINE
  'DPR', // D-PROLINE
  'DSN', // D-SERINE
  'DTH', // D-THREONINE
  'DTR', // D-TRYPTOPHAN
  'DTY', // D-TYROSINE
  'DVA', // D-VALINE

  'DNE' // D-NORLEUCINE

  // ???  // D-SELENOCYSTEINE
]

const entityKeyList = [
  'MOL_ID', 'MOLECULE', 'CHAIN', 'FRAGMENT', 'SYNONYM',
  'EC', 'ENGINEERED', 'MUTATION', 'OTHER_DETAILS'
]

const reWhitespace = /\s+/

function getModresId (resno: number, chainname?: string, inscode?: string) {
  let id = `${resno}`
  if (chainname) id += `:${chainname}`
  if (inscode) id += `^${inscode}`
  return id
}
export interface PdbParserParameters extends ParserParameters {
  hex: boolean
}

class PdbParser extends StructureParser {
  /**
   * Create a pdb parser
   * @param  {Streamer} streamer - streamer object
   * @param  {Object} params - params object
   * @param  {Boolean} params.hex - hexadecimal parsing of
   *                                atom numbers >99.999 and
   *                                residue numbers >9.999
   * @return {undefined}
   */
  constructor (streamer: Streamer, params?: Partial<PdbParserParameters>) {
    const p = params || {}

    super(streamer, p)

    this.hex = defaults(p.hex, false)
  }

  get type () { return 'pdb' }

  _parse () {
    // http://www.wwpdb.org/documentation/file-format.php

    if (Debug) Log.time('PdbParser._parse ' + this.name)

    let isLegacy = false
    const headerLine = this.streamer.peekLines(1)[ 0 ]
    const headerId = headerLine.substr(62, 4)
    const legacyId = headerLine.substr(72, 4)
    if (headerId === legacyId && legacyId.trim()) {
      isLegacy = true
    }

    const isPqr = this.type === 'pqr'
    const isPdbqt = this.type === 'pdbqt'

    const s: Structure = this.structure
    const sb = this.structureBuilder

    const hex = this.hex
    let serialRadix = 10
    let resnoRadix = 10

    const firstModelOnly = this.firstModelOnly
    const asTrajectory = this.asTrajectory
    const cAlphaOnly = this.cAlphaOnly

    const frames = s.frames
    const boxes = s.boxes
    let doFrames = false
    let currentFrame: NumberArray, currentCoord: number

    const biomolDict = s.biomolDict
    let currentBiomol: Assembly
    let currentPart: AssemblyPart
    let currentMatrix: Matrix4

    let line, recordName
    let serial, chainname: string, resno: number, resname: string, occupancy: number
    let inscode: string, atomname, hetero: number, bfactor: number, altloc

    let startChain, startResi, startIcode
    let endChain, endResi, endIcode

    let serialDict: {[k: number]: number} = {}
    const unitcellDict: Partial<{
      origx: Matrix4
      scale: Matrix4
      a: number
      b: number
      c: number
      alpha: number
      beta: number
      gamma: number
      spacegroup: string
    }> = {}
    const bondDict: {[k: string]: boolean} = {}

    const entityDataList: {chainList: string[], name: string}[] = []
    let currentEntityData: {chainList: string[], name: string}
    let currentEntityKey: 'MOL_ID'|'MOLECULE'|'CHAIN'|'FRAGMENT'|'SYNONYM'|'EC'|'ENGINEERED'|'MUTATION'|'OTHER_DETAILS'
    // MOL_ID                 Numbers each component; also used in  SOURCE to associate
    //                        the information.
    // MOLECULE               Name of the macromolecule.
    // CHAIN                  Comma-separated list of chain  identifier(s).
    // FRAGMENT               Specifies a domain or region of the  molecule.
    // SYNONYM                Comma-separated list of synonyms for  the MOLECULE.
    // EC                     The Enzyme Commission number associated  with the molecule.
    //                        If there is more than one EC number,  they are presented
    //                        as a comma-separated list.
    // ENGINEERED             Indicates that the molecule was  produced using
    //                        recombinant technology or by purely  chemical synthesis.
    // MUTATION               Indicates if there is a mutation.
    // OTHER_DETAILS          Additional comments.

    const hetnameDict: {[k: string]: string} = {}
    const modresDict: {[k: string]: any} = {}

    const chainDict: {[k: string]: number} = {}
    let chainIdx: number, chainid: string, newChain: boolean
    let currentChainname: string, currentResno: number, currentResname: string, currentInscode: string

    const seqresDict: {[k: string]: string[]} = {}
    let currentSeqresChainname: string

    const secStruct = {
      helices: [] as any[],
      sheets: [] as any[]
    }
    const helices = secStruct.helices
    const sheets = secStruct.sheets

    const atomMap = s.atomMap
    const atomStore = s.atomStore
    atomStore.resize(Math.round(this.streamer.data.length / 80))
    if (isPqr || isPdbqt) atomStore.addField('partialCharge', 1, 'float32')
    if (isPqr) atomStore.addField('radius', 1, 'float32')

    const ap1 = s.getAtomProxy()
    const ap2 = s.getAtomProxy()

    let idx = 0
    let modelIdx = 0
    let pendingStart = true

    function _parseChunkOfLines (_i: number, _n: number, lines: string[]) {
      for (let i = _i; i < _n; ++i) {
        line = lines[ i ]
        recordName = line.substr(0, 6)

        if (recordName === 'ATOM  ' || recordName === 'HETATM') {
          // http://www.wwpdb.org/documentation/file-format-content/format33/sect9.html#ATOM
          // PQR: Field_name Atom_number Atom_name Residue_name Chain_ID Residue_number X Y Z Charge Radius

          if (pendingStart) {
            if (asTrajectory) {
              if (doFrames) {
                currentFrame = new Float32Array(atomStore.count * 3)
                frames.push(currentFrame)
              } else {
                currentFrame = []
              }
              currentCoord = 0
            } else {
              if (!firstModelOnly) serialDict = {}
            }

            chainIdx = 1
            chainid = chainIdx.toString()
            newChain = true

            pendingStart = false
          }

          if (firstModelOnly && modelIdx > 0) continue

          let x, y, z, ls: string[], dd = 0

          if (isPqr) {
            ls = line.split(reWhitespace)
            dd = ls.length === 10 ? 1 : 0

            atomname = ls[ 2 ]
            if (cAlphaOnly && atomname !== 'CA') continue

            x = parseFloat(ls[ 6 - dd ])
            y = parseFloat(ls[ 7 - dd ])
            z = parseFloat(ls[ 8 - dd ])
          } else {
            atomname = line.substr(12, 4).trim()
            if (cAlphaOnly && atomname !== 'CA') continue

            x = parseFloat(line.substr(30, 8))
            y = parseFloat(line.substr(38, 8))
            z = parseFloat(line.substr(46, 8))
          }

          if (asTrajectory) {
            const j = currentCoord * 3

            currentFrame[ j + 0 ] = x
            currentFrame[ j + 1 ] = y
            currentFrame[ j + 2 ] = z

            currentCoord += 1

            if (doFrames) continue
          }

          let element

          if (isPqr) {
            serial = parseInt(ls![ 1 ])
            element = ''
            hetero = (line[ 0 ] === 'H') ? 1 : 0
            chainname = dd ? '' : ls![ 4 ]
            resno = parseInt(ls![ 5 - dd! ])
            inscode = ''
            resname = ls![ 3 ]
            altloc = ''
            occupancy = 1.0
          } else {
            serial = parseInt(line.substr(6, 5), serialRadix)
            if (hex && serial === 99999) {
              serialRadix = 16
            }
            hetero = (line[ 0 ] === 'H') ? 1 : 0
            chainname = line[ 21 ].trim()
            resno = parseInt(line.substr(22, 4), resnoRadix)
            if (hex && resno === 9999) {
              resnoRadix = 16
            }
            inscode = line[ 26 ].trim()
            resname = line.substr(17, 4).trim() || 'MOL'
            bfactor = parseFloat(line.substr(60, 6))
            altloc = line[ 16 ].trim()
            occupancy = parseFloat(line.substr(54, 6))

            if (!isLegacy) {
              if (isPdbqt) {
                element = line.substr(12, 2).trim()
              } else {
                element = line.substr(76, 2).trim()
                if (!chainname) {
                  chainname = line.substr(72, 4).trim() // segid
                }
              }
            }
          }

          atomStore.growIfFull()
          atomStore.atomTypeId[ idx ] = atomMap.add(atomname, element)

          atomStore.x[ idx ] = x
          atomStore.y[ idx ] = y
          atomStore.z[ idx ] = z
          atomStore.serial[ idx ] = serial
          atomStore.altloc[ idx ] = altloc.charCodeAt(0)
          atomStore.occupancy[ idx ] = isNaN(occupancy) ? 0 : occupancy

          if (isPqr) {
            atomStore.partialCharge![ idx ] = parseFloat(ls![ 9 - dd! ])
            atomStore.radius[ idx ] = parseFloat(ls![ 10 - dd! ])
          } else {
            atomStore.bfactor[ idx ] = isNaN(bfactor) ? 0 : bfactor
            if (isPdbqt) {
              atomStore.partialCharge![ idx ] = parseFloat(line.substr(70, 6))
            }
          }

          const modresId = getModresId(resno, chainname, inscode)

          // TODO instead of looking at MODRES look at SEQRES and
          //      missing residues in REMARK 465
          if (hetero && !modresDict[modresId] && !dAminoAcids.includes(resname)) {
            if (currentChainname !== chainname || currentResname !== resname ||
                (!WaterNames.includes(resname) &&
                  (currentResno !== resno || currentInscode !== inscode))
            ) {
              chainIdx += 1
              chainid = chainIdx.toString()

              currentResno = resno
              currentResname = resname
              currentInscode = inscode
            }
          } else if (!newChain && currentChainname !== chainname) {
            chainIdx += 1
            chainid = chainIdx.toString()
          }

          sb.addAtom(modelIdx, chainname, chainid, resname, resno, hetero, undefined, inscode)

          serialDict[ serial ] = idx
          idx += 1
          newChain = false
          currentChainname = chainname
        } else if (recordName === 'CONECT') {
          const fromIdx = serialDict[ parseInt(line.substr(6, 5)) ]
          const pos = [ 11, 16, 21, 26 ]
          const bondIndex: {[k: number]: number} = {}

          if (fromIdx === undefined) {
            // Log.log( "missing CONNECT serial" );
            continue
          }

          for (let j = 0; j < 4; ++j) {
            let toIdx = parseInt(line.substr(pos[ j ], 5))
            if (Number.isNaN(toIdx)) continue
            toIdx = serialDict[ toIdx ]
            if (toIdx === undefined) {
              // Log.log( "missing CONNECT serial" );
              continue
            }/* else if( toIdx < fromIdx ){
                // likely a duplicate in standard PDB format
                // but not necessarily, so better remove duplicates
                // in a pass after parsing (and auto bonding)
                continue;
            } */

            if (fromIdx < toIdx) {
              ap1.index = fromIdx
              ap2.index = toIdx
            } else {
              ap1.index = toIdx
              ap2.index = fromIdx
            }

            // interpret records where a 'toIdx' atom is given multiple times
            // as double/triple bonds, e.g. CONECT 1529 1528 1528 is a double bond
            if (bondIndex[ toIdx ] !== undefined) {
              s.bondStore.bondOrder[ bondIndex[ toIdx ] ] += 1
            } else {
              const hash = ap1.index + '|' + ap2.index
              if (bondDict[ hash ] === undefined) {
                bondDict[ hash ] = true
                bondIndex[ toIdx ] = s.bondStore.count
                s.bondStore.addBond(ap1, ap2, 1) // start/assume with single bond
              }
            }
          }
        } else if (recordName === 'HELIX ') {
          startChain = line[ 19 ].trim()
          startResi = parseInt(line.substr(21, 4))
          startIcode = line[ 25 ].trim()
          endChain = line[ 31 ].trim()
          endResi = parseInt(line.substr(33, 4))
          endIcode = line[ 37 ].trim()
          let helixType = parseInt(line.substr(39, 1))
          helixType = (HelixTypes[ helixType ] || HelixTypes[0]).charCodeAt(0)
          helices.push([
            startChain, startResi, startIcode,
            endChain, endResi, endIcode,
            helixType
          ])
        } else if (recordName === 'SHEET ') {
          startChain = line[ 21 ].trim()
          startResi = parseInt(line.substr(22, 4))
          startIcode = line[ 26 ].trim()
          endChain = line[ 32 ].trim()
          endResi = parseInt(line.substr(33, 4))
          endIcode = line[ 37 ].trim()
          sheets.push([
            startChain, startResi, startIcode,
            endChain, endResi, endIcode
          ])
        } else if (recordName === 'HETNAM') {
          hetnameDict[ line.substr(11, 3) ] = line.substr(15).trim()
        } else if (recordName === 'SEQRES') {
          const seqresChainname = line[11].trim()
          if (seqresChainname !== currentSeqresChainname) {
            seqresDict[ seqresChainname ] = []
            currentSeqresChainname = seqresChainname
          }
          seqresDict[ seqresChainname ].push(
            ...line.substr(19).trim().split(reWhitespace)
          )
        } else if (recordName === 'MODRES') {
          // MODRES 2SRC PTR A  527  TYR  O-PHOSPHOTYROSINE
          const resname = line.substr(12, 3).trim()
          const chainname = line[16].trim()
          const inscode = line[22].trim()
          const resno = parseInt(line.substr(18, 4).trim())
          const id = getModresId(resno, chainname, inscode)
          modresDict[ id ] = { resname, chainname, inscode, resno }
        } else if (recordName === 'COMPND') {
          const comp = line.substr(10, 70).trim()
          const keyEnd = comp.indexOf(':')
          const key = comp.substring(0, keyEnd)
          let value

          if (entityKeyList.includes(key)) {
            currentEntityKey = key as 'MOL_ID'|'MOLECULE'|'CHAIN'|'FRAGMENT'|'SYNONYM'|'EC'|'ENGINEERED'|'MUTATION'|'OTHER_DETAILS'
            value = comp.substring(keyEnd + 2)
          } else {
            value = comp
          }
          value = value.replace(/;$/, '')

          if (currentEntityKey === 'MOL_ID') {
            currentEntityData = {
              chainList: [],
              name: ''
            }
            entityDataList.push(currentEntityData)
          } else if (currentEntityKey === 'MOLECULE') {
            if (currentEntityData.name) currentEntityData.name += ' '
            currentEntityData.name += value
          } else if (currentEntityKey === 'CHAIN') {
            Array.prototype.push.apply(
              currentEntityData.chainList,
              value.split(/\s*,\s*/)
            )
          }
        } else if (line.startsWith('TER')) {
          const cp = s.getChainProxy(s.chainStore.count - 1)
          chainDict[ cp.chainname ] = cp.index
          chainIdx += 1
          chainid = chainIdx.toString()
          newChain = true
        } else if (recordName === 'REMARK' && line.substr(7, 3) === '350') {
          if (line.substr(11, 12) === 'BIOMOLECULE:') {
            let name = line.substr(23).trim()
            if (/^(0|[1-9][0-9]*)$/.test(name)) name = 'BU' + name

            currentBiomol = new Assembly(name)
            biomolDict[ name ] = currentBiomol
          } else if (line.substr(13, 5) === 'BIOMT') {
            const biomt = line.split(/\s+/)
            const row = parseInt(line[ 18 ]) - 1

            if (row === 0) {
              currentMatrix = new Matrix4()
              currentPart.matrixList.push(currentMatrix)
            }

            const biomtElms = currentMatrix.elements

            biomtElms[ 4 * 0 + row ] = parseFloat(biomt[ 4 ])
            biomtElms[ 4 * 1 + row ] = parseFloat(biomt[ 5 ])
            biomtElms[ 4 * 2 + row ] = parseFloat(biomt[ 6 ])
            biomtElms[ 4 * 3 + row ] = parseFloat(biomt[ 7 ])
          } else if (
            line.substr(11, 30) === 'APPLY THE FOLLOWING TO CHAINS:' ||
            line.substr(11, 30) === '                   AND CHAINS:'
          ) {
            if (line.substr(11, 5) === 'APPLY') {
              currentPart = currentBiomol.addPart()
            }

            const chainList = line.substr(41, 30).split(',')
            for (let j = 0, jl = chainList.length; j < jl; ++j) {
              const c = chainList[ j ].trim()
              if (c) currentPart.chainList.push(c)
            }
          }
        } else if (recordName === 'HEADER') {
          s.id = line.substr(62, 4)
        } else if (recordName === 'TITLE ') {
          s.title += (s.title ? ' ' : '') + line.substr(10, 70).trim()
        } else if (recordName === 'MODEL ') {
          pendingStart = true
        } else if (recordName === 'ENDMDL' || line.trim() === 'END') {
          if (pendingStart) continue

          if (asTrajectory && !doFrames) {
            frames.push(new Float32Array(currentFrame))
            doFrames = true
          }

          modelIdx += 1
          pendingStart = true
        } else if (line.substr(0, 5) === 'MTRIX') {
          // ignore 'given' operators
          if (line[ 59 ] === '1') continue

          if (!currentBiomol || currentBiomol.name !== 'NCS') {
            const ncsName = 'NCS'
            currentBiomol = new Assembly(ncsName)
            biomolDict[ ncsName ] = currentBiomol
            currentPart = currentBiomol.addPart()
          }

          const ncs = line.split(/\s+/)
          const ncsRow = parseInt(line[ 5 ]) - 1

          if (ncsRow === 0) {
            currentMatrix = new Matrix4()
            currentPart.matrixList.push(currentMatrix)
          }

          const ncsElms = currentMatrix.elements

          ncsElms[ 4 * 0 + ncsRow ] = parseFloat(ncs[ 2 ])
          ncsElms[ 4 * 1 + ncsRow ] = parseFloat(ncs[ 3 ])
          ncsElms[ 4 * 2 + ncsRow ] = parseFloat(ncs[ 4 ])
          ncsElms[ 4 * 3 + ncsRow ] = parseFloat(ncs[ 5 ])
        } else if (line.substr(0, 5) === 'ORIGX') {
          if (!unitcellDict.origx) {
            unitcellDict.origx = new Matrix4()
          }

          const orgix = line.split(/\s+/)
          const origxRow = parseInt(line[ 5 ]) - 1
          const origxElms = unitcellDict.origx.elements

          origxElms[ 4 * 0 + origxRow ] = parseFloat(orgix[ 1 ])
          origxElms[ 4 * 1 + origxRow ] = parseFloat(orgix[ 2 ])
          origxElms[ 4 * 2 + origxRow ] = parseFloat(orgix[ 3 ])
          origxElms[ 4 * 3 + origxRow ] = parseFloat(orgix[ 4 ])
        } else if (line.substr(0, 5) === 'SCALE') {
          if (!unitcellDict.scale) {
            unitcellDict.scale = new Matrix4()
          }

          const scale = line.split(/\s+/)
          const scaleRow = parseInt(line[ 5 ]) - 1
          const scaleElms = unitcellDict.scale.elements

          scaleElms[ 4 * 0 + scaleRow ] = parseFloat(scale[ 1 ])
          scaleElms[ 4 * 1 + scaleRow ] = parseFloat(scale[ 2 ])
          scaleElms[ 4 * 2 + scaleRow ] = parseFloat(scale[ 3 ])
          scaleElms[ 4 * 3 + scaleRow ] = parseFloat(scale[ 4 ])
        } else if (recordName === 'CRYST1') {
          // CRYST1   55.989   55.989   55.989  90.00  90.00  90.00 P 1           1
          //  7 - 15       Real(9.3)      a (Angstroms)
          // 16 - 24       Real(9.3)      b (Angstroms)
          // 25 - 33       Real(9.3)      c (Angstroms)
          // 34 - 40       Real(7.2)      alpha         alpha (degrees).
          // 41 - 47       Real(7.2)      beta          beta (degrees).
          // 48 - 54       Real(7.2)      gamma         gamma (degrees).
          // 56 - 66       LString        sGroup        Space group.
          // 67 - 70       Integer        z             Z value.

          const aLength = parseFloat(line.substr(6, 9))
          const bLength = parseFloat(line.substr(15, 9))
          const cLength = parseFloat(line.substr(24, 9))

          const alpha = parseFloat(line.substr(33, 7))
          const beta = parseFloat(line.substr(40, 7))
          const gamma = parseFloat(line.substr(47, 7))

          const sGroup = line.substr(55, 11).trim()
          // const zValue = parseInt( line.substr( 66, 4 ) );

          const box = new Float32Array(9)
          box[ 0 ] = aLength
          box[ 4 ] = bLength
          box[ 8 ] = cLength
          boxes.push(box)

          if (modelIdx === 0) {
            unitcellDict.a = aLength
            unitcellDict.b = bLength
            unitcellDict.c = cLength
            unitcellDict.alpha = alpha
            unitcellDict.beta = beta
            unitcellDict.gamma = gamma
            unitcellDict.spacegroup = sGroup
          }
        }
      }
    }

    this.streamer.eachChunkOfLines(function (lines/*, chunkNo, chunkCount */) {
      _parseChunkOfLines(0, lines.length, lines)
    })


    // finalize ensures resname will be defined for all rp.resname
    // (required in entity handling below)
    sb.finalize()

    //

    const en = entityDataList.length

    if (en) {
      s.eachChain(function (cp) {
        cp.entityIndex = en
      })

      entityDataList.forEach(function (e, i) {
        const chainIndexList = e.chainList.map(function (chainname) {
          return chainDict[ chainname ]
        })
        s.entityList.push(new Entity(
          s, i, e.name, 'polymer', chainIndexList
        ))
      })

      let ei = entityDataList.length
      const rp = s.getResidueProxy()
      const residueDict: {[k: string]: number[]} = {}

      s.eachChain(function (cp) {
        if (cp.entityIndex === en) {
          rp.index = cp.residueOffset
          if (!residueDict[ rp.resname ]) {
            residueDict[ rp.resname ] = []
          }
          residueDict[ rp.resname ].push(cp.index)
        }
      })

      Object.keys(residueDict).forEach(function (resname) {
        const chainList = residueDict[ resname ]
        let type: EntityTypeString = 'non-polymer'
        let name = hetnameDict[ resname ] || resname
        if (WaterNames.includes(resname)) {
          name = 'water'
          type = 'water'
        }
        s.entityList.push(new Entity(
          s, ei, name, type, chainList
        ))
        ei += 1
      })
    }

    //

    if (unitcellDict.a !== undefined) {
      s.unitcell = new Unitcell(unitcellDict as UnitcellParams)
    } else {
      s.unitcell = undefined
    }

    if (helices.length || sheets.length) {
      assignSecondaryStructure(s, secStruct)
    }

    s.finalizeAtoms()
    if (!isLegacy) calculateChainnames(s)
    calculateBonds(s)
    s.finalizeBonds()

    if (!helices.length && !sheets.length) {
      calculateSecondaryStructure(s)
    }
    buildUnitcellAssembly(s)

    if (Debug) Log.timeEnd('PdbParser._parse ' + this.name)
  }
}

ParserRegistry.add('pdb', PdbParser)
ParserRegistry.add('pdb1', PdbParser)
ParserRegistry.add('ent', PdbParser)

export default PdbParser

export {
  HelixTypes
}
