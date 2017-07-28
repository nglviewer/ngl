/**
 * @file Atom Proxy
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3 } from '../../lib/three.es6.js'

import {
    SecStrucHelix, SecStrucSheet, SecStrucTurn,
    ProteinType, RnaType, DnaType, WaterType, IonType, SaccharideType,
    CgProteinBackboneType, CgRnaBackboneType, CgDnaBackboneType
} from '../structure/structure-constants.js'

/**
 * Atom proxy
 */
class AtomProxy {
  /**
   * @param {Structure} structure - the structure
   * @param {Integer} index - the index
   */
  constructor (structure, index) {
    /**
     * The structure the atom belongs to.
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
     * The index of the atom, pointing to the data in the corresponding {@link AtomStore}
     * @type {Integer}
     */
    this.index = index
  }

  /**
   * @type {BondHash}
   */
  get bondHash () { return this.structure.bondHash }

  /**
   * Molecular enity
   * @type {Entity}
   */
  get entity () {
    return this.structure.entityList[ this.entityIndex ]
  }
  get entityIndex () {
    return this.chainStore.entityIndex[ this.chainIndex ]
  }
  get modelIndex () {
    return this.chainStore.modelIndex[ this.chainIndex ]
  }
  get chainIndex () {
    return this.residueStore.chainIndex[ this.residueIndex ]
  }
  /**
   * @type {ResidueProxy}
   */
  get residue () {
    console.warn('residue - might be expensive')
    return this.structure.getResidueProxy(this.residueIndex)
  }

  get residueIndex () {
    return this.atomStore.residueIndex[ this.index ]
  }
  set residueIndex (value) {
    this.atomStore.residueIndex[ this.index ] = value
  }

  //

  /**
   * Secondary structure code
   * @type {String}
   */
  get sstruc () {
    return this.residueStore.getSstruc(this.residueIndex)
  }
  /**
   * Insertion code
   * @type {String}
   */
  get inscode () {
    return this.residueStore.getInscode(this.residueIndex)
  }
  /**
   * Residue number/label
   * @type {Integer}
   */
  get resno () {
    return this.residueStore.resno[ this.residueIndex ]
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
   * @type {ResidueType}
   */
  get residueType () {
    return this.residueMap.get(this.residueStore.residueTypeId[ this.residueIndex ])
  }
  /**
   * @type {AtomType}
   */
  get atomType () {
    return this.atomMap.get(this.atomStore.atomTypeId[ this.index ])
  }
  get residueAtomOffset () {
    return this.residueStore.atomOffset[ this.residueIndex ]
  }

  //

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

  //

  /**
   * Atom name
   * @type {String}
   */
  get atomname () {
    return this.atomType.atomname
  }
  /**
   * Element
   * @type {String}
   */
  get element () {
    return this.atomType.element
  }
  /**
   * Van-der-Waals radius
   * @type {Float}
   */
  get vdw () {
    return this.atomType.vdw
  }
  /**
   * Covalent radius
   * @type {Float}
   */
  get covalent () {
    return this.atomType.covalent
  }

  //

  /**
   * X coordinate
   * @type {Float}
   */
  get x () {
    return this.atomStore.x[ this.index ]
  }
  set x (value) {
    this.atomStore.x[ this.index ] = value
  }

  /**
   * Y coordinate
   * @type {Float}
   */
  get y () {
    return this.atomStore.y[ this.index ]
  }
  set y (value) {
    this.atomStore.y[ this.index ] = value
  }

  /**
   * Z coordinate
   * @type {Float}
   */
  get z () {
    return this.atomStore.z[ this.index ]
  }
  set z (value) {
    this.atomStore.z[ this.index ] = value
  }

  /**
   * Serial number
   * @type {Integer}
   */
  get serial () {
    return this.atomStore.serial[ this.index ]
  }
  set serial (value) {
    this.atomStore.serial[ this.index ] = value
  }

  /**
   * B-factor value
   * @type {Float}
   */
  get bfactor () {
    return this.atomStore.bfactor[ this.index ]
  }
  set bfactor (value) {
    this.atomStore.bfactor[ this.index ] = value
  }

  /**
   * Occupancy value
   * @type {Float}
   */
  get occupancy () {
    return this.atomStore.occupancy[ this.index ]
  }
  set occupancy (value) {
    this.atomStore.occupancy[ this.index ] = value
  }

  /**
   * Alternate location identifier
   * @type {String}
   */
  get altloc () {
    return this.atomStore.getAltloc(this.index)
  }
  set altloc (value) {
    this.atomStore.setAltloc(this.index, value)
  }

  /**
   * Partial charge
   * @type {Float|null}
   */
  get partialCharge () {
    return this.atomStore.partialCharge ? this.atomStore.partialCharge[ this.index ] : null
  }
  set partialCharge (value) {
    if (this.atomStore.partialCharge) {
      this.atomStore.partialCharge[ this.index ] = value
    }
  }

  /**
   * Formal charge
   * @type {Integer|null}
   */
  get formalCharge () {
    return this.atomStore.formalCharge ? this.atomStore.formalCharge[ this.index ] : null
  }
  set formalCharge (value) {
    if (this.atomStore.formalCharge) {
      this.atomStore.formalCharge[ this.index ] = value
    }
  }

  //

  /**
   * Iterate over each bond
   * @param  {function(bond: BondProxy)} callback - iterator callback function
   * @param  {BondProxy} [bp] - optional target bond proxy for use in the callback
   * @return {undefined}
   */
  eachBond (callback, bp) {
    bp = bp || this.structure._bp
    const idx = this.index
    const bondHash = this.bondHash
    const indexArray = bondHash.indexArray
    const n = bondHash.countArray[ idx ]
    const offset = bondHash.offsetArray[ idx ]

    for (let i = 0; i < n; ++i) {
      bp.index = indexArray[ offset + i ]
      callback(bp)
    }
  }

  /**
   * Iterate over each bonded atom
   * @param  {function(atom: AtomProxy)} callback - iterator callback function
   * @param  {AtomProxy} [ap] - optional target atom proxy for use in the callback
   * @return {undefined}
   */
  eachBondedAtom (callback, ap) {
    ap = ap || this.structure._ap
    var idx = this.index

    this.eachBond(function (bp) {
      if (idx !== bp.atomIndex1) {
        ap.index = bp.atomIndex1
      } else {
        ap.index = bp.atomIndex2
      }
      callback(ap)
    })
  }

  /**
   * Check if this atom is bonded to the given atom,
   * assumes both atoms are from the same structure
   * @param  {AtomProxy} ap - the given atom
   * @return {Boolean} whether a bond exists or not
   */
  hasBondTo (ap) {
    let hasBond = false
    this.eachBondedAtom(function (bap) {
      if (ap.index === bap.index) hasBond = true
    })
    return hasBond
  }

  //

  /**
   * If atom is part of a backbone
   * @return {Boolean} flag
   */
  isBackbone () {
    var backboneIndexList = this.residueType.backboneIndexList
    if (backboneIndexList.length > 0) {
      var atomOffset = this.residueStore.atomOffset[ this.residueIndex ]
      return backboneIndexList.includes(this.index - atomOffset)
    } else {
      return false
    }
  }

  /**
   * If atom is part of a polymer
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
   * If atom is part of a sidechin
   * @return {Boolean} flag
   */
  isSidechain () {
    return this.isPolymer() && !this.isBackbone()
  }

  /**
   * If atom is part of a coarse-grain group
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
   * If atom is part of a hetero group
   * @return {Boolean} flag
   */
  isHetero () {
    return this.residueType.hetero === 1
  }

  /**
   * If atom is part of a protein molecule
   * @return {Boolean} flag
   */
  isProtein () {
    return this.residueType.moleculeType === ProteinType
  }

  /**
   * If atom is part of a nucleic molecule
   * @return {Boolean} flag
   */
  isNucleic () {
    const moleculeType = this.residueType.moleculeType
    return (
            moleculeType === RnaType ||
            moleculeType === DnaType
    )
  }

  /**
   * If atom is part of a rna
   * @return {Boolean} flag
   */
  isRna () {
    return this.residueType.moleculeType === RnaType
  }

  /**
   * If atom is part of a dna
   * @return {Boolean} flag
   */
  isDna () {
    return this.residueType.moleculeType === DnaType
  }

  /**
   * If atom is part of a water molecule
   * @return {Boolean} flag
   */
  isWater () {
    return this.residueType.moleculeType === WaterType
  }

  /**
   * If atom is part of an ion
   * @return {Boolean} flag
   */
  isIon () {
    return this.residueType.moleculeType === IonType
  }

  /**
   * If atom is part of a saccharide
   * @return {Boolean} flag
   */
  isSaccharide () {
    return this.residueType.moleculeType === SaccharideType
  }

  /**
   * If atom is part of a helix
   * @return {Boolean} flag
   */
  isHelix () {
    return SecStrucHelix.includes(this.sstruc)
  }

  /**
   * If atom is part of a sheet
   * @return {Boolean} flag
   */
  isSheet () {
    return SecStrucSheet.includes(this.sstruc)
  }

  /**
   * If atom is part of a turn
   * @return {Boolean} flag
   */
  isTurn () {
    return SecStrucTurn.includes(this.sstruc) && this.isProtein()
  }

  isBonded () {
    return this.bondHash.countArray[ this.index ] !== 0
  }

  /**
   * If atom is part of a ring
   * @return {Boolean} flag
   */
  isRing () {
    var ringFlags = this.residueType.getRings().flags
    return ringFlags[ this.index - this.residueAtomOffset ] === 1
  }

  /**
   * Distance to another atom
   * @param  {AtomProxy} atom - the other atom
   * @return {Number} the distance
   */
  distanceTo (atom) {
    var taa = this.atomStore
    var aaa = atom.atomStore
    var ti = this.index
    var ai = atom.index
    var x = taa.x[ ti ] - aaa.x[ ai ]
    var y = taa.y[ ti ] - aaa.y[ ai ]
    var z = taa.z[ ti ] - aaa.z[ ai ]
    var distSquared = x * x + y * y + z * z
    return Math.sqrt(distSquared)
  }

  /**
   * If connected to another atom
   * @param  {AtomProxy} atom - the other atom
   * @return {Boolean} flag
   */
  connectedTo (atom) {
    var taa = this.atomStore
    var aaa = atom.atomStore
    var ti = this.index
    var ai = atom.index

    if (taa.altloc && aaa.altloc) {
      var ta = taa.altloc[ ti ]  // use Uint8 value to compare
      var aa = aaa.altloc[ ai ]  // no need to convert to char
      // 0 is the Null character, 32 is the space character
      if (!(ta === 0 || aa === 0 || ta === 32 || aa === 32 || (ta === aa))) return false
    }

    var x = taa.x[ ti ] - aaa.x[ ai ]
    var y = taa.y[ ti ] - aaa.y[ ai ]
    var z = taa.z[ ti ] - aaa.z[ ai ]

    var distSquared = x * x + y * y + z * z

    // if( this.residue.isCg() ) console.log( this.qualifiedName(), Math.sqrt( distSquared ), distSquared )
    if (distSquared < 64.0 && this.isCg()) return true

    if (isNaN(distSquared)) return false

    var d = this.covalent + atom.covalent
    var d1 = d + 0.3
    var d2 = d - 0.5

    return distSquared < (d1 * d1) && distSquared > (d2 * d2)
  }

  /**
   * Set atom position from array
   * @param  {Array|TypedArray} array - input array
   * @param  {Integer} [offset] - the offset
   * @return {AtomProxy} this object
   */
  positionFromArray (array, offset) {
    if (offset === undefined) offset = 0

    this.x = array[ offset + 0 ]
    this.y = array[ offset + 1 ]
    this.z = array[ offset + 2 ]

    return this
  }

  /**
   * Write atom position to array
   * @param  {Array|TypedArray} [array] - target array
   * @param  {Integer} [offset] - the offset
   * @return {Array|TypedArray} target array
   */
  positionToArray (array, offset) {
    if (array === undefined) array = []
    if (offset === undefined) offset = 0

    var index = this.index
    var atomStore = this.atomStore

    array[ offset + 0 ] = atomStore.x[ index ]
    array[ offset + 1 ] = atomStore.y[ index ]
    array[ offset + 2 ] = atomStore.z[ index ]

    return array
  }

  /**
   * Write atom position to vector
   * @param  {Vector3} [v] - target vector
   * @return {Vector3} target vector
   */
  positionToVector3 (v) {
    if (v === undefined) v = new Vector3()

    v.x = this.x
    v.y = this.y
    v.z = this.z

    return v
  }

  /**
   * Set atom position from vector
   * @param  {Vector3} v - input vector
   * @return {AtomProxy} this object
   */
  positionFromVector3 (v) {
    this.x = v.x
    this.y = v.y
    this.z = v.z

    return this
  }

  /**
   * Add vector to atom position
   * @param  {Vector3} v - input vector
   * @return {AtomProxy} this object
   */
  positionAdd (v) {
    this.x += v.x
    this.y += v.y
    this.z += v.z

    return this
  }

  /**
   * Subtract vector from atom position
   * @param  {Vector3} v - input vector
   * @return {AtomProxy} this object
   */
  positionSub (v) {
    this.x -= v.x
    this.y -= v.y
    this.z -= v.z

    return this
  }

  /**
   * Get intra group/residue bonds
   * @param  {Boolean} firstOnly - immediately return the first connected atomIndex
   * @return {Integer[]|Integer|undefined} connected atomIndices
   */
  getResidueBonds (firstOnly) {
    var residueAtomOffset = this.residueAtomOffset
    var relativeIndex = this.index - this.residueAtomOffset
    var bonds = this.residueType.getBonds()
    var atomIndices1 = bonds.atomIndices1
    var atomIndices2 = bonds.atomIndices2
    var idx1, idx2, connectedAtomIndex, connectedAtomIndices

    if (!firstOnly) connectedAtomIndices = []

    idx1 = atomIndices1.indexOf(relativeIndex)
    while (idx1 !== -1) {
      connectedAtomIndex = atomIndices2[ idx1 ] + residueAtomOffset
      if (firstOnly) return connectedAtomIndex
      connectedAtomIndices.push(connectedAtomIndex)
      idx1 = atomIndices1.indexOf(relativeIndex, idx1 + 1)
    }

    idx2 = atomIndices2.indexOf(relativeIndex)
    while (idx2 !== -1) {
      connectedAtomIndex = atomIndices1[ idx2 ] + residueAtomOffset
      if (firstOnly) return connectedAtomIndex
      connectedAtomIndices.push(connectedAtomIndex)
      idx2 = atomIndices2.indexOf(relativeIndex, idx2 + 1)
    }

    return connectedAtomIndices
  }

  //

  qualifiedName (noResname) {
    var name = ''
    if (this.resname && !noResname) name += '[' + this.resname + ']'
    if (this.resno !== undefined) name += this.resno
    if (this.inscode) name += '^' + this.inscode
    if (this.chainname) name += ':' + this.chainname
    if (this.atomname) name += '.' + this.atomname
    if (this.altloc) name += '%' + this.altloc
    if (this.structure.modelStore.count > 1) name += '/' + this.modelIndex
    return name
  }

  /**
   * Clone object
   * @return {AtomProxy} cloned atom
   */
  clone () {
    return new this.constructor(this.structure, this.index)
  }

  toObject () {
    return {
      index: this.index,
      residueIndex: this.residueIndex,

      atomno: this.atomno,
      resname: this.resname,
      x: this.x,
      y: this.y,
      z: this.z,
      element: this.element,
      chainname: this.chainname,
      resno: this.resno,
      serial: this.serial,
      vdw: this.vdw,
      covalent: this.covalent,
      hetero: this.hetero,
      bfactor: this.bfactor,
      altloc: this.altloc,
      atomname: this.atomname,
      modelindex: this.modelindex
    }
  }
}

export default AtomProxy
