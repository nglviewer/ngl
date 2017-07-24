/**
 * @file Residue Proxy
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import {
    SecStrucHelix, SecStrucSheet, SecStrucTurn,
    ProteinType, RnaType, DnaType, WaterType, IonType, SaccharideType,
    CgProteinBackboneType, CgRnaBackboneType, CgDnaBackboneType,
    AA1
} from '../structure/structure-constants.js'

/**
 * Residue proxy
 */
class ResidueProxy {
  /**
   * @param {Structure} structure - the structure
   * @param {Integer} index - the index
   */
  constructor (structure, index) {
    /**
     * @type {Structure}
     */
    this.structure = structure
    /**
     * @type {ChainStore}
     */
    this.chainStore = structure.chainStore
    /**
     * @type {ResidueStore}
     */
    this.residueStore = structure.residueStore
    /**
     * @type {AtomStore}
     */
    this.atomStore = structure.atomStore
    /**
     * @type {ResidueMap}
     */
    this.residueMap = structure.residueMap
    /**
     * @type {AtomMap}
     */
    this.atomMap = structure.atomMap
    /**
     * @type {Integer}
     */
    this.index = index
  }

  /**
   * Entity
   * @type {Entity}
   */
  get entity () {
    return this.structure.entityList[ this.entityIndex ]
  }
  get entityIndex () {
    return this.chainStore.entityIndex[ this.chainIndex ]
  }
  /**
   * Chain
   * @type {ChainProxy}
   */
  get chain () {
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
    this.residueStore.getInscode(this.index, value)
  }

  //

  get residueType () {
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

  /**
   * Atom iterator
   * @param  {function(atom: AtomProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachAtom (callback, selection) {
    var i
    var count = this.atomCount
    var offset = this.atomOffset
    var ap = this.structure._ap
    var end = offset + count

    if (selection && selection.atomOnlyTest) {
      var atomOnlyTest = selection.atomOnlyTest
      for (i = offset; i < end; ++i) {
        ap.index = i
        if (atomOnlyTest(ap)) callback(ap)
      }
    } else {
      for (i = offset; i < end; ++i) {
        ap.index = i
        callback(ap)
      }
    }
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
    var moleculeType = this.residueType.moleculeType
    return (
            moleculeType === RnaType ||
            moleculeType === DnaType
    )
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
    var backboneType = this.residueType.backboneType
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
      var moleculeType = this.residueType.moleculeType
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

  getAtomType (index) {
    return this.atomMap.get(this.atomStore.atomTypeId[ index ])
  }

  getResname1 () {
    // FIXME nucleic support
    return AA1[ this.resname.toUpperCase() ] || 'X'
  }

  getBackboneType (position) {
    switch (position) {
      case -1:
        return this.residueType.backboneStartType
      case 1:
        return this.residueType.backboneEndType
      default:
        return this.residueType.backboneType
    }
  }

  getAtomIndexByName (atomname) {
    var index = this.residueType.getAtomIndexByName(atomname)
    if (index !== undefined) {
      index += this.atomOffset
    }
    return index
  }

  getAtomByName (atomname) {
    return this.residueType.getAtomByName(atomname)
  }

  hasAtomWithName (atomname) {
    return this.residueType.hasAtomWithName(atomname)
  }

  getAtomnameList () {
    console.warn('getAtomnameList - might be expensive')

    var n = this.atomCount
    var offset = this.atomOffset
    var list = new Array(n)
    for (var i = 0; i < n; ++i) {
      list[ i ] = this.getAtomType(offset + i).atomname
    }
    return list
  }

  /**
   * If residue is connected to another
   * @param  {ResidueProxy} rNext - the other residue
   * @return {Boolean} - flag
   */
  connectedTo (rNext) {
    var bbAtomEnd = this.structure.getAtomProxy(this.backboneEndAtomIndex)
    var bbAtomStart = this.structure.getAtomProxy(rNext.backboneStartAtomIndex)
    if (bbAtomEnd && bbAtomStart) {
      return bbAtomEnd.connectedTo(bbAtomStart)
    } else {
      return false
    }
  }

  getNextConnectedResidue () {
    var rOffset = this.chainStore.residueOffset[ this.chainIndex ]
    var rCount = this.chainStore.residueCount[ this.chainIndex ]
    var nextIndex = this.index + 1
    if (nextIndex < rOffset + rCount) {
      var rpNext = this.structure.getResidueProxy(nextIndex)
      if (this.connectedTo(rpNext)) {
        return rpNext
      }
    } else if (nextIndex === rOffset + rCount) {  // cyclic
      var rpFirst = this.structure.getResidueProxy(rOffset)
      if (this.connectedTo(rpFirst)) {
        return rpFirst
      }
    }
    return undefined
  }

  getPreviousConnectedResidue () {
    var rOffset = this.chainStore.residueOffset[ this.chainIndex ]
    var prevIndex = this.index - 1
    if (prevIndex >= rOffset) {
      var rpPrev = this.structure.getResidueProxy(prevIndex)
      if (rpPrev.connectedTo(this)) {
        return rpPrev
      }
    } else if (prevIndex === rOffset - 1) {  // cyclic
      var rCount = this.chainStore.residueCount[ this.chainIndex ]
      var rpLast = this.structure.getResidueProxy(rOffset + rCount - 1)
      if (rpLast.connectedTo(this)) {
        return rpLast
      }
    }
    return undefined
  }

  getBonds () {
    return this.residueType.getBonds(this)
  }

  getRings () {
    return this.residueType.getRings()
  }

  qualifiedName (noResname) {
    var name = ''
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
    return new this.constructor(this.structure, this.index)
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
