/**
 * @file Mmtf Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Matrix4 } from 'three'

import { Debug, Log, ParserRegistry } from '../globals'
import StructureParser from './structure-parser'
import {
  buildUnitcellAssembly, calculateBondsBetween, calculateBondsWithin
} from '../structure/structure-utils'
import { ChemCompHetero } from '../structure/structure-constants'
import Entity from '../structure/entity'
import Unitcell from '../symmetry/unitcell'
import Assembly, { AssemblyPart } from '../symmetry/assembly'

import { decodeMsgpack, decodeMmtf } from '../../lib/mmtf.es6'

const SstrucMap: {[k: string]: number} = {
  '0': 'i'.charCodeAt(0), // pi helix
  '1': 's'.charCodeAt(0), // bend
  '2': 'h'.charCodeAt(0), // alpha helix
  '3': 'e'.charCodeAt(0), // extended
  '4': 'g'.charCodeAt(0), // 3-10 helix
  '5': 'b'.charCodeAt(0), // bridge
  '6': 't'.charCodeAt(0), // turn
  '7': 'l'.charCodeAt(0), // coil
  '-1': ''.charCodeAt(0) // NA
}

class MmtfParser extends StructureParser {
  get type () { return 'mmtf' }
  get isBinary () { return true }

  _parse () {
    // https://github.com/rcsb/mmtf

    if (Debug) Log.time('MmtfParser._parse ' + this.name)

    let i, il, j, jl, groupData

    const s = this.structure
    const sd: {[k: string]: any} = decodeMmtf(decodeMsgpack(this.streamer.data))

    // structure header
    const headerFields = [
      'depositionDate', 'releaseDate', 'resolution',
      'rFree', 'rWork', 'experimentalMethods'
    ]
    headerFields.forEach(function (name) {
      if (sd[ name ] !== undefined) {
        s.header[ name ] = sd[ name ]
      }
    })

    let numBonds, numAtoms, numGroups, numChains, numModels
    let chainsPerModel

    s.id = sd.structureId
    s.title = sd.title

    s.atomStore.addField('formalCharge', 1, 'int8')

    if (this.firstModelOnly || this.asTrajectory) {
      numModels = 1
      numChains = sd.chainsPerModel[ 0 ]

      numGroups = 0
      for (i = 0, il = numChains; i < il; ++i) {
        numGroups += sd.groupsPerChain[ i ]
      }

      numAtoms = 0
      for (i = 0, il = numGroups; i < il; ++i) {
        groupData = sd.groupList[ sd.groupTypeList[ i ] ]
        numAtoms += groupData.atomNameList.length
      }

      numBonds = sd.numBonds

      chainsPerModel = [ numChains ]
    } else {
      numBonds = sd.numBonds
      numAtoms = sd.numAtoms
      numGroups = sd.numGroups
      numChains = sd.numChains
      numModels = sd.numModels

      chainsPerModel = sd.chainsPerModel
    }

    numBonds += numGroups // add numGroups to have space for polymer bonds

    //

    if (this.asTrajectory) {
      for (i = 0, il = sd.numModels; i < il; ++i) {
        const frame = new Float32Array(numAtoms * 3)
        const frameAtomOffset = numAtoms * i

        for (j = 0; j < numAtoms; ++j) {
          const j3 = j * 3
          const offset = j + frameAtomOffset
          frame[ j3 ] = sd.xCoordList[ offset ]
          frame[ j3 + 1 ] = sd.yCoordList[ offset ]
          frame[ j3 + 2 ] = sd.zCoordList[ offset ]
        }

        s.frames.push(frame)
      }
    }

    // bondStore
    const bAtomIndex1 = new Uint32Array(numBonds)
    const bAtomIndex2 = new Uint32Array(numBonds)
    const bBondOrder = new Uint8Array(numBonds)

    const aGroupIndex = new Uint32Array(numAtoms)
    const aFormalCharge = new Int8Array(numAtoms)

    const gChainIndex = new Uint32Array(numGroups)
    const gAtomOffset = new Uint32Array(numGroups)
    const gAtomCount = new Uint16Array(numGroups)

    const cModelIndex = new Uint16Array(numChains)
    const cGroupOffset = new Uint32Array(numChains)
    const cGroupCount = new Uint32Array(numChains)

    const mChainOffset = new Uint32Array(numModels)
    const mChainCount = new Uint32Array(numModels)

    // set-up model-chain relations
    let chainOffset = 0
    for (i = 0, il = numModels; i < il; ++i) {
      const modelChainCount = chainsPerModel[ i ]
      mChainOffset[ i ] = chainOffset
      mChainCount[ i ] = modelChainCount
      for (j = 0; j < modelChainCount; ++j) {
        cModelIndex[ j + chainOffset ] = i
      }
      chainOffset += modelChainCount
    }

    // set-up chain-residue relations
    const groupsPerChain = sd.groupsPerChain
    let groupOffset = 0
    for (i = 0, il = numChains; i < il; ++i) {
      const chainGroupCount = groupsPerChain[ i ]
      cGroupOffset[ i ] = groupOffset
      cGroupCount[ i ] = chainGroupCount
      for (j = 0; j < chainGroupCount; ++j) {
        gChainIndex[ j + groupOffset ] = i
      }
      groupOffset += chainGroupCount
    }

    /// ///
    // get data from group map

    let atomOffset = 0
    let bondOffset = 0

    for (i = 0, il = numGroups; i < il; ++i) {
      groupData = sd.groupList[ sd.groupTypeList[ i ] ]
      const groupAtomCount = groupData.atomNameList.length
      const groupFormalChargeList = groupData.formalChargeList

      const groupBondAtomList = groupData.bondAtomList
      const groupBondOrderList = groupData.bondOrderList

      for (j = 0, jl = groupBondOrderList.length; j < jl; ++j) {
        bAtomIndex1[ bondOffset ] = atomOffset + groupBondAtomList[ j * 2 ]
        bAtomIndex2[ bondOffset ] = atomOffset + groupBondAtomList[ j * 2 + 1 ]
        bBondOrder[ bondOffset ] = groupBondOrderList[ j ]
        bondOffset += 1
      }

      //

      gAtomOffset[ i ] = atomOffset
      gAtomCount[ i ] = groupAtomCount

      for (j = 0; j < groupAtomCount; ++j) {
        aGroupIndex[ atomOffset ] = i
        aFormalCharge[ atomOffset ] = groupFormalChargeList[ j ]
        atomOffset += 1
      }
    }

    // extra bonds

    const bondAtomList = sd.bondAtomList
    if (bondAtomList) {
      if (sd.bondOrderList) {
        bBondOrder.set(sd.bondOrderList, bondOffset)
      }

      for (i = 0, il = bondAtomList.length; i < il; i += 2) {
        const atomIndex1 = bondAtomList[ i ]
        const atomIndex2 = bondAtomList[ i + 1 ]
        if (atomIndex1 < numAtoms && atomIndex2 < numAtoms) {
          bAtomIndex1[ bondOffset ] = atomIndex1
          bAtomIndex2[ bondOffset ] = atomIndex2
          bondOffset += 1
        }
      }
    }

    //

    s.bondStore.length = bBondOrder.length
    s.bondStore.count = bondOffset
    s.bondStore.atomIndex1 = bAtomIndex1
    s.bondStore.atomIndex2 = bAtomIndex2
    s.bondStore.bondOrder = bBondOrder

    s.atomStore.length = numAtoms
    s.atomStore.count = numAtoms
    s.atomStore.residueIndex = aGroupIndex
    s.atomStore.atomTypeId = new Uint16Array(numAtoms)
    s.atomStore.x = sd.xCoordList.subarray(0, numAtoms)
    s.atomStore.y = sd.yCoordList.subarray(0, numAtoms)
    s.atomStore.z = sd.zCoordList.subarray(0, numAtoms)
    s.atomStore.serial = sd.atomIdList.subarray(0, numAtoms)
    s.atomStore.bfactor = sd.bFactorList.subarray(0, numAtoms)
    s.atomStore.altloc = sd.altLocList.subarray(0, numAtoms)
    s.atomStore.occupancy = sd.occupancyList.subarray(0, numAtoms)
    s.atomStore.formalCharge = aFormalCharge

    s.residueStore.length = numGroups
    s.residueStore.count = numGroups
    s.residueStore.chainIndex = gChainIndex
    s.residueStore.residueTypeId = sd.groupTypeList
    s.residueStore.atomOffset = gAtomOffset
    s.residueStore.atomCount = gAtomCount
    s.residueStore.resno = sd.groupIdList.subarray(0, numGroups)
    s.residueStore.sstruc = sd.secStructList.subarray(0, numGroups)
    s.residueStore.inscode = sd.insCodeList.subarray(0, numGroups)

    s.chainStore.length = numChains
    s.chainStore.count = numChains
    s.chainStore.entityIndex = new Uint16Array(numChains)
    s.chainStore.modelIndex = cModelIndex
    s.chainStore.residueOffset = cGroupOffset
    s.chainStore.residueCount = cGroupCount
    s.chainStore.chainname = sd.chainNameList.subarray(0, numChains * 4)
    s.chainStore.chainid = sd.chainIdList.subarray(0, numChains * 4)

    s.modelStore.length = numModels
    s.modelStore.count = numModels
    s.modelStore.chainOffset = mChainOffset
    s.modelStore.chainCount = mChainCount

    //

    let groupTypeDict: {[k: number]: any} = {}
    for (i = 0, il = sd.groupList.length; i < il; ++i) {
      const groupType = sd.groupList[ i ]
      const atomTypeIdList: number[] = []
      for (j = 0, jl = groupType.atomNameList.length; j < jl; ++j) {
        const element = groupType.elementList[ j ].toUpperCase()
        const atomname = groupType.atomNameList[ j ]
        atomTypeIdList.push(s.atomMap.add(atomname, element))
      }
      const chemCompType = groupType.chemCompType.toUpperCase()
      const hetFlag = ChemCompHetero.includes(chemCompType)

      const numGroupBonds = groupType.bondOrderList.length
      const atomIndices1 = new Array(numGroupBonds)
      const atomIndices2 = new Array(numGroupBonds)
      for (j = 0; j < numGroupBonds; ++j) {
        atomIndices1[ j ] = groupType.bondAtomList[ j * 2 ]
        atomIndices2[ j ] = groupType.bondAtomList[ j * 2 + 1 ]
      }
      const bonds = {
        atomIndices1: atomIndices1,
        atomIndices2: atomIndices2,
        bondOrders: groupType.bondOrderList
      }

      groupTypeDict[ i ] = s.residueMap.add(
        groupType.groupName, atomTypeIdList, hetFlag, chemCompType, bonds
      )
    }

    for (i = 0, il = numGroups; i < il; ++i) {
      s.residueStore.residueTypeId[ i ] = groupTypeDict[ s.residueStore.residueTypeId[ i ] ]
    }

    for (i = 0, il = s.atomStore.count; i < il; ++i) {
      const residueIndex = s.atomStore.residueIndex[ i ]
      const residueType = s.residueMap.list[ s.residueStore.residueTypeId[ residueIndex ] ]
      const resAtomOffset = s.residueStore.atomOffset[ residueIndex ]
      s.atomStore.atomTypeId[ i ] = residueType.atomTypeIdList[ i - resAtomOffset ]
    }

    if (sd.secStructList) {
      const secStructLength: number = sd.secStructList.length
      for (i = 0, il = s.residueStore.count; i < il; ++i) {
        // with ( i % secStructLength ) secStruct entries are reused
        const sstruc = SstrucMap[ s.residueStore.sstruc[ i % secStructLength ] ]
        if (sstruc !== undefined) s.residueStore.sstruc[ i ] = sstruc
      }
    }

    //

    if (sd.entityList) {
      sd.entityList.forEach(function (e: Entity, i: number) {
        s.entityList[ i ] = new Entity(
          s, i, e.description, e.type, e.chainIndexList
        )
      })
    }

    if (sd.bioAssemblyList) {
      sd.bioAssemblyList.forEach(function (_assembly: any, k: number) {
        const id = k + 1
        const assembly = new Assembly('' + id)
        s.biomolDict[ 'BU' + id ] = assembly
        let chainToPart: {[k: string]: AssemblyPart} = {}
        _assembly.transformList.forEach(function (_transform: any) {
          const matrix = new Matrix4().fromArray(_transform.matrix).transpose()
          const chainList: string[] = _transform.chainIndexList.map(function (chainIndex: number) {
            let chainname = ''
            for (let k = 0; k < 4; ++k) {
              const code = sd.chainNameList[ chainIndex * 4 + k ]
              if (code) {
                chainname += String.fromCharCode(code)
              } else {
                break
              }
            }
            return chainname
          })
          const part = chainToPart[ chainList.toString() ]
          if (part) {
            part.matrixList.push(matrix)
          } else {
            chainToPart[ chainList.toString() ] = assembly.addPart([ matrix ], chainList)
          }
        })
      })
    }

    if (sd.ncsOperatorList) {
      const ncsName = 'NCS'
      const ncsAssembly = new Assembly(ncsName)
      const ncsPart = ncsAssembly.addPart()
      sd.ncsOperatorList.forEach(function (_operator: number[]) {
        const matrix = new Matrix4().fromArray(_operator).transpose()
        ncsPart.matrixList.push(matrix)
      })
      if (ncsPart.matrixList.length > 0) {
        s.biomolDict[ ncsName ] = ncsAssembly
      }
    }

    const uc = sd.unitCell
    if (uc && Array.isArray(uc) && uc[ 0 ]) {
      s.unitcell = new Unitcell({
        a: uc[ 0 ],
        b: uc[ 1 ],
        c: uc[ 2 ],
        alpha: uc[ 3 ],
        beta: uc[ 4 ],
        gamma: uc[ 5 ],
        spacegroup: sd.spaceGroup
      })
    } else {
      s.unitcell = undefined
    }

    // calculate backbone bonds
    calculateBondsBetween(s, true)

    // calculate rung bonds
    calculateBondsWithin(s, true)

    s.finalizeAtoms()
    s.finalizeBonds()

    buildUnitcellAssembly(s)

    if (Debug) Log.timeEnd('MmtfParser._parse ' + this.name)
  }
}

ParserRegistry.add('mmtf', MmtfParser)

export default MmtfParser
