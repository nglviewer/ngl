/**
 * @file Residue Proxy
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { NumberArray } from '../types'
import { defaults } from '../utils'
import {
    SecStrucHelix, SecStrucSheet, SecStrucTurn,
    ProteinType, RnaType, DnaType, WaterType, IonType, SaccharideType,
    CgProteinBackboneType, CgRnaBackboneType, CgDnaBackboneType,
    AA1
} from '../structure/structure-constants'

import Structure from '../structure/structure'
import Selection from '../selection/selection'

import ChainStore from '../store/chain-store'
import ResidueStore from '../store/residue-store'
import AtomStore from '../store/atom-store'

import AtomMap from '../store/atom-map'
import ResidueMap from '../store/residue-map'

import AtomProxy from '../proxy/atom-proxy'
import ResidueType, { RingData } from '../store/residue-type';
import { ResidueBonds } from '../structure/structure-utils';
import AtomType from '../store/atom-type';
import ChainProxy from './chain-proxy';
import Entity from '../structure/entity';

/**
 * Residue proxy
 */
class ResidueProxy {
  index: number

  chainStore: ChainStore
  residueStore: ResidueStore
  atomStore: AtomStore

  residueMap: ResidueMap
  atomMap: AtomMap

  /**
   * @param {Structure} structure - the structure
   * @param {Integer} index - the index
   */
  constructor (readonly structure: Structure, index = 0) {
    this.index = index
    this.chainStore = structure.chainStore
    this.residueStore = structure.residueStore
    this.atomStore = structure.atomStore
    this.residueMap = structure.residueMap
    this.atomMap = structure.atomMap
  }

  /**
   * Entity
   * @type {Entity}
   */
  get entity (): Entity {
    return this.structure.entityList[ this.entityIndex ]
  }
  get entityIndex () {
    return this.chainStore.entityIndex[ this.chainIndex ]
  }
  /**
   * Chain
   * @type {ChainProxy}
   */
  get chain (): ChainProxy {
    return this.structure.getChainProxy(this.chainIndex)
  }

  get chainIndex () {
    return this.residueStore.chainIndex[ this.index ]
  }
  set chainIndex (value) {
    this.residueStore.chainIndex[ this.index ] = value
  }

  get atomOffset () {
    return this.residueStore.atomOffset[ this.index ]
  }
  set atomOffset (value) {
    this.residueStore.atomOffset[ this.index ] = value
  }

  /**
   * Atom count
   * @type {Integer}
   */
  get atomCount () {
    return this.residueStore.atomCount[ this.index ]
  }
  set atomCount (value) {
    this.residueStore.atomCount[ this.index ] = value
  }

  get atomEnd () {
    return this.atomOffset + this.atomCount - 1
  }

  //

  get modelIndex () {
    return this.chainStore.modelIndex[ this.chainIndex ]
  }
  /**
   * Chain name
   * @type {String}
   */
  get chainname () {
    return this.chainStore.getChainname(this.chainIndex)
  }
  /**
   * Chain id
   * @type {String}
   */
  get chainid () {
    return this.chainStore.getChainid(this.chainIndex)
  }

  //

  /**
   * Residue number/label
   * @type {Integer}
   */
  get resno () {
    return this.residueStore.resno[ this.index ]
  }
  set resno (value) {
    this.residueStore.resno[ this.index ] = value
  }

  /**
   * Secondary structure code
   * @type {String}
   */
  get sstruc () {
    return this.residueStore.getSstruc(this.index)
  }
  set sstruc (value) {
    this.residueStore.setSstruc(this.index, value)
  }

  /**
   * Insertion code
   * @type {String}
   */
  get inscode () {
    return this.residueStore.getInscode(this.index)
  }
  set inscode (value) {
    this.residueStore.setInscode(this.index, value)
  }

  //

  get residueType (): ResidueType {
    return this.residueMap.get(this.residueStore.residueTypeId[ this.index ])
  }

  /**
   * Residue name
   * @type {String}
   */
  get resname () {
    return this.residueType.resname
  }
  /**
   * Hetero flag
   * @type {Boolean}
   */
  get hetero () {
    return this.residueType.hetero
  }
  get moleculeType () {
    return this.residueType.moleculeType
  }
  get backboneType () {
    return this.residueType.backboneType
  }
  get backboneStartType () {
    return this.residueType.backboneStartType
  }
  get backboneEndType () {
    return this.residueType.backboneEndType
  }
  get traceAtomIndex () {
    return this.residueType.traceAtomIndex + this.atomOffset
  }
  get direction1AtomIndex () {
    return this.residueType.direction1AtomIndex + this.atomOffset
  }
  get direction2AtomIndex () {
    return this.residueType.direction2AtomIndex + this.atomOffset
  }
  get backboneStartAtomIndex () {
    return this.residueType.backboneStartAtomIndex + this.atomOffset
  }
  get backboneEndAtomIndex () {
    return this.residueType.backboneEndAtomIndex + this.atomOffset
  }
  get rungEndAtomIndex () {
    return this.residueType.rungEndAtomIndex + this.atomOffset
  }

  //

  get x () {
    let x = 0
    for (let i = this.atomOffset; i <= this.atomEnd; ++i) {
      x += this.atomStore.x[ i ]
    }
    return x / this.atomCount
  }

  get y () {
    let y = 0
    for (let i = this.atomOffset; i <= this.atomEnd; ++i) {
      y += this.atomStore.y[ i ]
    }
    return y / this.atomCount
  }

  get z () {
    let z = 0
    for (let i = this.atomOffset; i <= this.atomEnd; ++i) {
      z += this.atomStore.z[ i ]
    }
    return z / this.atomCount
  }

  //

  /**
   * Atom iterator
   * @param  {function(atom: AtomProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachAtom (callback: (ap: AtomProxy) => void, selection?: Selection) {
    const count = this.atomCount
    const offset = this.atomOffset
    const ap = this.structure._ap
    const end = offset + count

    if (selection && selection.atomOnlyTest) {
      const atomOnlyTest = selection.atomOnlyTest
      for (let i = offset; i < end; ++i) {
        ap.index = i
        if (atomOnlyTest(ap)) callback(ap)
      }
    } else {
      for (let i = offset; i < end; ++i) {
        ap.index = i
        callback(ap)
      }
    }
  }

  //

  /**
   * Write residue center position to array
   * @param  {Array|TypedArray} [array] - target array
   * @param  {Integer} [offset] - the offset
   * @return {Array|TypedArray} target array
   */
  positionToArray (array: NumberArray = [], offset = 0) {
    array[ offset + 0 ] = this.x
    array[ offset + 1 ] = this.y
    array[ offset + 2 ] = this.z

    return array
  }

  //

  /**
   * If residue is from a protein
   * @return {Boolean} flag
   */
  isProtein () {
    return this.residueType.moleculeType === ProteinType
  }

  /**
   * If residue is nucleic
   * @return {Boolean} flag
   */
  isNucleic () {
    const moleculeType = this.residueType.moleculeType
    return moleculeType === RnaType || moleculeType === DnaType
  }

  /**
   * If residue is rna
   * @return {Boolean} flag
   */
  isRna () {
    return this.residueType.moleculeType === RnaType
  }

  /**
   * If residue is dna
   * @return {Boolean} flag
   */
  isDna () {
    return this.residueType.moleculeType === DnaType
  }

  /**
   * If residue is coarse-grain
   * @return {Boolean} flag
   */
  isCg () {
    const backboneType = this.residueType.backboneType
    return (
      backboneType === CgProteinBackboneType ||
      backboneType === CgRnaBackboneType ||
      backboneType === CgDnaBackboneType
    )
  }

  /**
   * If residue is from a polymer
   * @return {Boolean} flag
   */
  isPolymer () {
    if (this.structure.entityList.length > 0) {
      return this.entity.isPolymer()
    } else {
      const moleculeType = this.residueType.moleculeType
      return (
        moleculeType === ProteinType ||
        moleculeType === RnaType ||
        moleculeType === DnaType
      )
    }
  }

  /**
   * If residue is hetero
   * @return {Boolean} flag
   */
  isHetero () {
    return this.residueType.hetero === 1
  }

  /**
   * If residue is a water molecule
   * @return {Boolean} flag
   */
  isWater () {
    return this.residueType.moleculeType === WaterType
  }

  /**
   * If residue is an ion
   * @return {Boolean} flag
   */
  isIon () {
    return this.residueType.moleculeType === IonType
  }

  /**
   * If residue is a saccharide
   * @return {Boolean} flag
   */
  isSaccharide () {
    return this.residueType.moleculeType === SaccharideType
  }

  isStandardAminoacid () {
    return this.residueType.isStandardAminoacid()
  }

  isStandardBase () {
    return this.residueType.isStandardBase()
  }

  /**
   * If residue is part of a helix
   * @return {Boolean} flag
   */
  isHelix () {
    return SecStrucHelix.includes(this.sstruc)
  }

  /**
   * If residue is part of a sheet
   * @return {Boolean} flag
   */
  isSheet () {
    return SecStrucSheet.includes(this.sstruc)
  }

  /**
   * If residue is part of a turn
   * @return {Boolean} flag
   */
  isTurn () {
    return SecStrucTurn.includes(this.sstruc) && this.isProtein()
  }

  getAtomType (index: number): AtomType {
    return this.atomMap.get(this.atomStore.atomTypeId[ index ])
  }

  getResname1 () {
    // FIXME nucleic support
    return AA1[ this.resname.toUpperCase() ] || 'X'
  }

  getBackboneType (position: number) {
    switch (position) {
      case -1:
        return this.residueType.backboneStartType
      case 1:
        return this.residueType.backboneEndType
      default:
        return this.residueType.backboneType
    }
  }

  getAtomIndexByName (atomname: string) {
    let index = this.residueType.getAtomIndexByName(atomname)
    if (index !== undefined) {
      index += this.atomOffset
    }
    return index
  }

  hasAtomWithName (atomname: string) {
    return this.residueType.hasAtomWithName(atomname)
  }

  getAtomnameList () {
    console.warn('getAtomnameList - might be expensive')

    const n = this.atomCount
    const offset = this.atomOffset
    const list = new Array(n)
    for (let i = 0; i < n; ++i) {
      list[ i ] = this.getAtomType(offset + i).atomname
    }
    return list
  }

  /**
   * If residue is connected to another
   * @param  {ResidueProxy} rNext - the other residue
   * @return {Boolean} - flag
   */
  connectedTo (rNext: ResidueProxy) {
    const bbAtomEnd = this.structure.getAtomProxy(this.backboneEndAtomIndex)
    const bbAtomStart = this.structure.getAtomProxy(rNext.backboneStartAtomIndex)
    if (bbAtomEnd && bbAtomStart) {
      return bbAtomEnd.connectedTo(bbAtomStart)
    } else {
      return false
    }
  }

  getNextConnectedResidue () {
    const rOffset = this.chainStore.residueOffset[ this.chainIndex ]
    const rCount = this.chainStore.residueCount[ this.chainIndex ]
    const nextIndex = this.index + 1
    if (nextIndex < rOffset + rCount) {
      const rpNext = this.structure.getResidueProxy(nextIndex)
      if (this.connectedTo(rpNext)) {
        return rpNext
      }
    } else if (nextIndex === rOffset + rCount) {  // cyclic
      const rpFirst = this.structure.getResidueProxy(rOffset)
      if (this.connectedTo(rpFirst)) {
        return rpFirst
      }
    }
    return undefined
  }

  getPreviousConnectedResidue (residueProxy?: ResidueProxy) {
    const rOffset = this.chainStore.residueOffset[ this.chainIndex ]
    const prevIndex = this.index - 1
    if (prevIndex >= rOffset) {
      const rpPrev = defaults(residueProxy, this.structure.getResidueProxy())
      rpPrev.index = prevIndex
      if (rpPrev.connectedTo(this)) {
        return rpPrev
      }
    } else if (prevIndex === rOffset - 1) {  // cyclic
      const rCount = this.chainStore.residueCount[ this.chainIndex ]
      const rpLast = defaults(residueProxy, this.structure.getResidueProxy())
      rpLast.index = rOffset + rCount - 1
      if (rpLast.connectedTo(this)) {
        return rpLast
      }
    }
    return undefined
  }

  getBonds (): ResidueBonds {
    return this.residueType.getBonds(this)
  }

  getRings (): RingData|undefined {
    return this.residueType.getRings()
  }

  getAromaticRings () {
    return this.residueType.getAromaticRings(this)
  }

  qualifiedName (noResname = false) {
    let name = ''
    if (this.resname && !noResname) name += '[' + this.resname + ']'
    if (this.resno !== undefined) name += this.resno
    if (this.inscode) name += '^' + this.inscode
    if (this.chain) name += ':' + this.chainname
    name += '/' + this.modelIndex
    return name
  }

  /**
   * Clone object
   * @return {ResidueProxy} cloned residue
   */
  clone () {
    return new ResidueProxy(this.structure, this.index)
  }

  toObject () {
    return {
      index: this.index,
      chainIndex: this.chainIndex,
      atomOffset: this.atomOffset,
      atomCount: this.atomCount,

      resno: this.resno,
      resname: this.resname,
      sstruc: this.sstruc
    }
  }
}

export default ResidueProxy
