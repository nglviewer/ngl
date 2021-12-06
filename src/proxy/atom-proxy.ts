/**
 * @file Atom Proxy
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3 } from 'three'

import { NumberArray } from '../types'
import {
  Elements,
  SecStrucHelix, SecStrucSheet, SecStrucTurn,
  ProteinType, RnaType, DnaType, WaterType, IonType, SaccharideType,
  CgProteinBackboneType, CgRnaBackboneType, CgDnaBackboneType
} from '../structure/structure-constants'

import Structure from '../structure/structure'

import ChainStore from '../store/chain-store'
import ResidueStore from '../store/residue-store'
import AtomStore from '../store/atom-store'

import AtomMap from '../store/atom-map'
import ResidueMap from '../store/residue-map'

import BondProxy from '../proxy/bond-proxy'
import AtomType from '../store/atom-type';
import ResidueType from '../store/residue-type';
import ResidueProxy from './residue-proxy';
import Entity from '../structure/entity';
import BondHash from '../store/bond-hash';

/**
 * Atom proxy
 */
class AtomProxy {
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
   * @type {BondHash}
   */
  get bondHash (): BondHash|undefined { return this.structure.bondHash }

  /**
   * Molecular enity
   * @type {Entity}
   */
  get entity (): Entity {
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
  get residue (): ResidueProxy {
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
  get residueType (): ResidueType {
    return this.residueMap.get(this.residueStore.residueTypeId[ this.residueIndex ])
  }
  /**
   * @type {AtomType}
   */
  get atomType (): AtomType {
    return this.atomMap.get(this.atomStore.atomTypeId[ this.index ])
  }
  get residueAtomOffset () {
    return this.residueStore.atomOffset[ this.residueIndex ]
  }

  //

  /**
   * Residue name
   */
  get resname () {
    return this.residueType.resname
  }
  /**
   * Hetero flag
   */
  get hetero () {
    return this.residueType.hetero
  }

  //

  /**
   * Atom name
   */
  get atomname () {
    return this.atomType.atomname
  }
  /**
   * Atomic number
   */
  get number () {
    return this.atomType.number
  }
  /**
   * Element
   */
  get element () {
    return this.atomType.element
  }
  /**
   * Van-der-Waals radius
   */
  get vdw () {
    return this.atomType.vdw
  }
  /**
   * Covalent radius
   */
  get covalent () {
    return this.atomType.covalent
  }

  //

  /**
   * X coordinate
   */
  get x () {
    return this.atomStore.x[ this.index ]
  }
  set x (value) {
    this.atomStore.x[ this.index ] = value
  }

  /**
   * Y coordinate
   */
  get y () {
    return this.atomStore.y[ this.index ]
  }
  set y (value) {
    this.atomStore.y[ this.index ] = value
  }

  /**
   * Z coordinate
   */
  get z () {
    return this.atomStore.z[ this.index ]
  }
  set z (value) {
    this.atomStore.z[ this.index ] = value
  }

  /**
   * Serial number
   */
  get serial () {
    return this.atomStore.serial[ this.index ]
  }
  set serial (value) {
    this.atomStore.serial[ this.index ] = value
  }

  /**
   * B-factor value
   */
  get bfactor () {
    return this.atomStore.bfactor[ this.index ]
  }
  set bfactor (value) {
    this.atomStore.bfactor[ this.index ] = value
  }

  /**
   * Occupancy value
   */
  get occupancy () {
    return this.atomStore.occupancy[ this.index ]
  }
  set occupancy (value) {
    this.atomStore.occupancy[ this.index ] = value
  }

  /**
   * Alternate location identifier
   */
  get altloc () {
    return this.atomStore.getAltloc(this.index)
  }
  set altloc (value) {
    this.atomStore.setAltloc(this.index, value)
  }

  /**
   * Partial charge
   */
  get partialCharge () {
    return this.atomStore.partialCharge ? this.atomStore.partialCharge[ this.index ] : null
  }
  set partialCharge (value) {
    if (this.atomStore.partialCharge) {
      this.atomStore.partialCharge[ this.index ] = value as number
    }
  }

  /**
   * Explicit radius
   */
  get radius () {
    return this.atomStore.radius ? this.atomStore.radius[ this.index ] : null
  }
  set radius (value) {
    if (this.atomStore.radius) {
      this.atomStore.radius[ this.index ] = value as number
    }
  }

  /**
   * Formal charge
   */
  get formalCharge () {
    return this.atomStore.formalCharge ? this.atomStore.formalCharge[ this.index ] : null
  }
  set formalCharge (value) {
    if (this.atomStore.formalCharge) {
      this.atomStore.formalCharge[ this.index ] = value as number
    }
  }

  /**
   * Aromaticity flag
   */
  get aromatic () {
    if (this.atomStore.aromatic) {
      return this.atomStore.aromatic[ this.index ] as number
    } else {
      return this.residueType.isAromatic(this) ? 1 : 0
    }
  }
  set aromatic (value) {
    if (this.atomStore.aromatic) {
      this.atomStore.aromatic[ this.index ] = value as number
    }
  }

  //

  get bondCount () {
    return this.bondHash!.countArray[ this.index ]  // TODO
  }

  //

  /**
   * Iterate over each bond
   * @param  {function(bond: BondProxy)} callback - iterator callback function
   * @param  {BondProxy} [bp] - optional target bond proxy for use in the callback
   * @return {undefined}
   */
  eachBond (callback: (bp: BondProxy) => void, bp?: BondProxy) {
    bp = bp || this.structure._bp
    const idx = this.index
    const bondHash = this.bondHash!  // TODO
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
  eachBondedAtom (callback: (ap: AtomProxy) => void, _ap?: AtomProxy) {
    const ap = _ap ? _ap : this.structure._ap
    const idx = this.index

    this.eachBond(function (bp) {
      ap.index = idx !== bp.atomIndex1 ? bp.atomIndex1 : bp.atomIndex2
      callback(ap)
    })
    this.index = idx
  }

  /**
   * Check if this atom is bonded to the given atom,
   * assumes both atoms are from the same structure
   * @param  {AtomProxy} ap - the given atom
   * @return {Boolean} whether a bond exists or not
   */
  hasBondTo (ap: AtomProxy) {
    let flag = false
    this.eachBondedAtom(function (bap) {
      if (ap.index === bap.index) flag = true
    })
    return flag
  }

  bondToElementCount (element: Elements) {
    let count = 0
    const idx = this.index // Avoid reentrancy problems
    this.eachBondedAtom(function (bap) {
      if (bap.number === element) count += 1
    })
    this.index = idx
    return count
  }

  hasBondToElement (element: Elements) {
    return this.bondToElementCount(element) > 0
  }

  //

  /**
   * If atom is part of a backbone
   * @return {Boolean} flag
   */
  isBackbone () {
    const backboneIndexList = this.residueType.backboneIndexList
    if (backboneIndexList.length > 0) {
      return backboneIndexList.includes(this.index - this.residueAtomOffset)
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
      const moleculeType = this.residueType.moleculeType
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
    const backboneType = this.residueType.backboneType
    return (
      backboneType === CgProteinBackboneType ||
      backboneType === CgRnaBackboneType ||
      backboneType === CgDnaBackboneType
    )
  }

  isTrace () {
    return this.index === (this.residueType.traceAtomIndex + this.residueAtomOffset)
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
    return moleculeType === RnaType || moleculeType === DnaType
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
    return this.bondHash!.countArray[ this.index ] !== 0   // TODO
  }

  /**
   * If atom is part of a ring
   * @return {Boolean} flag
   */
  isRing () {
    const atomRings = this.residueType.getRings()!.atomRings  // TODO
    return atomRings[ this.index - this.residueAtomOffset ] !== undefined
  }

  isAromatic () {
    return this.aromatic === 1
  }

  isPolarHydrogen () {
    let result = false

    if (this.number !== 1) return result

    result = !this.hasBondToElement(Elements.C)

    return result
  }

  isMetal () { return this.atomType.isMetal() }
  isNonmetal () { return this.atomType.isNonmetal() }
  isMetalloid () { return this.atomType.isMetalloid() }
  isHalogen () { return this.atomType.isHalogen() }
  isDiatomicNonmetal () { return this.atomType.isDiatomicNonmetal() }
  isPolyatomicNonmetal () { return this.atomType.isPolyatomicNonmetal() }
  isAlkaliMetal () { return this.atomType.isAlkaliMetal() }
  isAlkalineEarthMetal () { return this.atomType.isAlkalineEarthMetal() }
  isNobleGas () { return this.atomType.isNobleGas() }
  isTransitionMetal () { return this.atomType.isTransitionMetal() }
  isPostTransitionMetal () { return this.atomType.isPostTransitionMetal() }
  isLanthanide () { return this.atomType.isLanthanide() }
  isActinide () { return this.atomType.isActinide() }

  getDefaultValence () { return this.atomType.getDefaultValence() }
  getValenceList () { return this.atomType.getValenceList() }
  getOuterShellElectronCount () { return this.atomType.getOuterShellElectronCount() }

  /**
   * Distance to another atom
   * @param  {AtomProxy} atom - the other atom
   * @return {Number} the distance
   */
  distanceTo (atom: AtomProxy) {
    const taa = this.atomStore
    const aaa = atom.atomStore
    const ti = this.index
    const ai = atom.index
    const x = taa.x[ ti ] - aaa.x[ ai ]
    const y = taa.y[ ti ] - aaa.y[ ai ]
    const z = taa.z[ ti ] - aaa.z[ ai ]
    const distSquared = x * x + y * y + z * z
    return Math.sqrt(distSquared)
  }

  /**
   * If connected to another atom
   * @param  {AtomProxy} atom - the other atom
   * @return {Boolean} flag
   */
  connectedTo (atom: AtomProxy) {
    const taa = this.atomStore
    const aaa = atom.atomStore
    const ti = this.index
    const ai = atom.index

    if (taa.altloc && aaa.altloc) {
      const ta = taa.altloc[ ti ]  // use Uint8 value to compare
      const aa = aaa.altloc[ ai ]  // no need to convert to char
      // 0 is the Null character, 32 is the space character
      if (!(ta === 0 || aa === 0 || ta === 32 || aa === 32 || (ta === aa))) return false
    }

    const x = taa.x[ ti ] - aaa.x[ ai ]
    const y = taa.y[ ti ] - aaa.y[ ai ]
    const z = taa.z[ ti ] - aaa.z[ ai ]

    const distSquared = x * x + y * y + z * z

    // if( this.isCg() ) console.log( this.qualifiedName(), Math.sqrt( distSquared ), distSquared )
    if (distSquared < 48.0 && this.isCg()) return true

    if (isNaN(distSquared)) return false

    const d = this.covalent + atom.covalent
    const d1 = d + 0.3
    const d2 = d - 0.5

    return distSquared < (d1 * d1) && distSquared > (d2 * d2)
  }

  /**
   * Set atom position from array
   * @param  {Array|TypedArray} array - input array
   * @param  {Integer} [offset] - the offset
   * @return {AtomProxy} this object
   */
  positionFromArray (array: NumberArray, offset = 0) {
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
  positionToArray (array: NumberArray = [], offset = 0) {
    const index = this.index
    const atomStore = this.atomStore

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
  positionToVector3 (v?: Vector3) {
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
  positionFromVector3 (v: Vector3) {
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
  positionAdd (v: Vector3|AtomProxy) {
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
  positionSub (v: Vector3|AtomProxy) {
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
  getResidueBonds (firstOnly = false) {
    const residueAtomOffset = this.residueAtomOffset
    const relativeIndex = this.index - this.residueAtomOffset
    const bonds = this.residueType.getBonds()!  // TODO
    const atomIndices1 = bonds.atomIndices1
    const atomIndices2 = bonds.atomIndices2
    let idx1, idx2, connectedAtomIndex
    let connectedAtomIndices: number[]|undefined

    if (!firstOnly) connectedAtomIndices = []

    idx1 = atomIndices1.indexOf(relativeIndex)
    while (idx1 !== -1) {
      connectedAtomIndex = atomIndices2[ idx1 ] + residueAtomOffset
      if (connectedAtomIndices) {
        connectedAtomIndices.push(connectedAtomIndex)
        idx1 = atomIndices1.indexOf(relativeIndex, idx1 + 1)
      } else {
        return connectedAtomIndex
      }
    }

    idx2 = atomIndices2.indexOf(relativeIndex)
    while (idx2 !== -1) {
      connectedAtomIndex = atomIndices1[ idx2 ] + residueAtomOffset
      if (connectedAtomIndices) {
        connectedAtomIndices.push(connectedAtomIndex)
        idx2 = atomIndices2.indexOf(relativeIndex, idx2 + 1)
      } else {
        return connectedAtomIndex
      }
    }

    return connectedAtomIndices
  }

  //

  qualifiedName (noResname = false) {
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
    return new AtomProxy(this.structure, this.index)
  }

  toObject () {
    return {
      index: this.index,
      residueIndex: this.residueIndex,

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
      modelIndex: this.modelIndex
    }
  }
}

export default AtomProxy
