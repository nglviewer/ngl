/**
 * @file Structure Builder
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Structure from './structure'

class StructureBuilder {
  currentModelindex: number|null = null
  currentChainid: string|null = null
  currentResname: string|null = null
  currentResno: number|null = null
  currentInscode: string|undefined = undefined
  currentHetero: boolean|null = null

  previousResname: string|null = ''
  previousHetero: boolean|null = null

  ai = -1
  ri = -1
  ci = -1
  mi = -1

  constructor(readonly structure: Structure) {}

  addResidueType (ri: number) {
    const atomStore = this.structure.atomStore
    const residueStore = this.structure.residueStore
    const residueMap = this.structure.residueMap

    const count = residueStore.atomCount[ ri ]
    const offset = residueStore.atomOffset[ ri ]
    const atomTypeIdList = new Array(count)
    for (let i = 0; i < count; ++i) {
      atomTypeIdList[ i ] = atomStore.atomTypeId[ offset + i ]
    }
    residueStore.residueTypeId[ ri ] = residueMap.add(
      this.previousResname!, atomTypeIdList, this.previousHetero!  // TODO
    )
  }

  addAtom (modelindex: number, chainname: string, chainid: string, resname: string, resno: number, hetero: boolean, sstruc?: string|undefined, inscode?: string|undefined) {
    const atomStore = this.structure.atomStore
    const residueStore = this.structure.residueStore
    const chainStore = this.structure.chainStore
    const modelStore = this.structure.modelStore

    let addModel = false
    let addChain = false
    let addResidue = false

    if (this.currentModelindex !== modelindex) {
      addModel = true
      addChain = true
      addResidue = true
      this.mi += 1
      this.ci += 1
      this.ri += 1
    } else if (this.currentChainid !== chainid) {
      addChain = true
      addResidue = true
      this.ci += 1
      this.ri += 1
    } else if (this.currentResno !== resno || this.currentResname !== resname || this.currentInscode !== inscode) {
      addResidue = true
      this.ri += 1
    }
    this.ai += 1

    if (addModel) {
      modelStore.growIfFull()
      modelStore.chainOffset[ this.mi ] = this.ci
      modelStore.chainCount[ this.mi ] = 0
      modelStore.count += 1
      chainStore.modelIndex[ this.ci ] = this.mi
    }

    if (addChain) {
      chainStore.growIfFull()
      chainStore.setChainname(this.ci, chainname)
      chainStore.setChainid(this.ci, chainid)
      chainStore.residueOffset[ this.ci ] = this.ri
      chainStore.residueCount[ this.ci ] = 0
      chainStore.count += 1
      chainStore.modelIndex[ this.ci ] = this.mi
      modelStore.chainCount[ this.mi ] += 1
      residueStore.chainIndex[ this.ri ] = this.ci
    }

    if (addResidue) {
      this.previousResname = this.currentResname
      this.previousHetero = this.currentHetero
      if (this.ri > 0) this.addResidueType(this.ri - 1)
      residueStore.growIfFull()
      residueStore.resno[ this.ri ] = resno
      if (sstruc !== undefined) {
        residueStore.sstruc[ this.ri ] = sstruc.charCodeAt(0)
      }
      if (inscode !== undefined) {
        residueStore.inscode[ this.ri ] = inscode.charCodeAt(0)
      }
      residueStore.atomOffset[ this.ri ] = this.ai
      residueStore.atomCount[ this.ri ] = 0
      residueStore.count += 1
      residueStore.chainIndex[ this.ri ] = this.ci
      chainStore.residueCount[ this.ci ] += 1
    }

    atomStore.count += 1
    atomStore.residueIndex[ this.ai ] = this.ri
    residueStore.atomCount[ this.ri ] += 1

    this.currentModelindex = modelindex
    this.currentChainid = chainid
    this.currentResname = resname
    this.currentResno = resno
    this.currentInscode = inscode
    this.currentHetero = hetero
  }

  finalize () {
    this.previousResname = this.currentResname
    this.previousHetero = this.currentHetero
    if (this.ri > -1) this.addResidueType(this.ri)
  }
}

export default StructureBuilder
