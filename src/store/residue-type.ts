/**
 * @file Residue Type
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Fred Ludlow
 * @private
 */

import { defaults } from '../utils'
import PrincipalAxes from '../math/principal-axes'
import { Matrix } from '../math/matrix-utils'
import { calculateResidueBonds, ResidueBonds } from '../structure/structure-utils'
import {
  Elements,
  ProteinType, RnaType, DnaType, WaterType, IonType, SaccharideType, UnknownType,
  ProteinBackboneType, RnaBackboneType, DnaBackboneType, UnknownBackboneType,
  CgProteinBackboneType, CgRnaBackboneType, CgDnaBackboneType,
  ChemCompProtein, ChemCompRna, ChemCompDna, ChemCompSaccharide,
  AA3, PurinBases, RnaBases, DnaBases, Bases, IonNames, WaterNames, SaccharideNames,
  ProteinBackboneAtoms, NucleicBackboneAtoms, ResidueTypeAtoms
} from '../structure/structure-constants'
import Structure from '../structure/structure'
import ResidueProxy from '../proxy/residue-proxy'
import AtomProxy from '../proxy/atom-proxy'

export interface BondGraph {
  [k: number]: number[]
}

export interface RingData {
  atomRings: number[][]  // sparse array:
                         // atomRings[atomIdx] -> array of ring indices
  rings: number[][]  // rings as arrays of indices
}

/**
 * Residue type
 */
export default class ResidueType {
  resname: string
  atomTypeIdList: number[]
  hetero: number
  chemCompType: string
  bonds?: ResidueBonds
  rings?: RingData
  bondGraph?: BondGraph
  aromaticAtoms?: Uint8Array
  aromaticRings?: number[][]

  atomCount: number

  moleculeType: number
  backboneType: number
  backboneEndType: number
  backboneStartType: number
  backboneIndexList: number[]

  traceAtomIndex: number
  direction1AtomIndex: number
  direction2AtomIndex: number
  backboneStartAtomIndex: number
  backboneEndAtomIndex: number
  rungEndAtomIndex: number

  // Sparse array containing the reference atom index for each bond.
  bondReferenceAtomIndices: number[] = []

  /**
   * @param {Structure} structure - the structure object
   * @param {String} resname - name of the residue
   * @param {Array} atomTypeIdList - list of IDs of {@link AtomType}s corresponding
   *                                 to the atoms of the residue
   * @param {Boolean} hetero - hetero flag
   * @param {String} chemCompType - chemical component type
   * @param {Object} [bonds] - TODO
   */
  constructor (readonly structure: Structure, resname: string, atomTypeIdList: number[], hetero: boolean, chemCompType: string, bonds?: ResidueBonds) {
    this.resname = resname
    this.atomTypeIdList = atomTypeIdList
    this.hetero = hetero ? 1 : 0
    this.chemCompType = chemCompType
    this.bonds = bonds
    this.atomCount = atomTypeIdList.length

    this.moleculeType = this.getMoleculeType()
    this.backboneType = this.getBackboneType(0)
    this.backboneEndType = this.getBackboneType(-1)
    this.backboneStartType = this.getBackboneType(1)
    this.backboneIndexList = this.getBackboneIndexList()

    const atomnames = ResidueTypeAtoms[ this.backboneType ]
    const atomnamesStart = ResidueTypeAtoms[ this.backboneStartType ]
    const atomnamesEnd = ResidueTypeAtoms[ this.backboneEndType ]

    const traceIndex = this.getAtomIndexByName(atomnames.trace)
    this.traceAtomIndex = defaults(traceIndex, -1)

    const dir1Index = this.getAtomIndexByName(atomnames.direction1)
    this.direction1AtomIndex = defaults(dir1Index, -1)

    const dir2Index = this.getAtomIndexByName(atomnames.direction2)
    this.direction2AtomIndex = defaults(dir2Index, -1)

    const bbStartIndex = this.getAtomIndexByName(atomnamesStart.backboneStart)
    this.backboneStartAtomIndex = defaults(bbStartIndex, -1)

    const bbEndIndex = this.getAtomIndexByName(atomnamesEnd.backboneEnd)
    this.backboneEndAtomIndex = defaults(bbEndIndex, -1)

    let rungEndIndex
    if (PurinBases.includes(resname)) {
      rungEndIndex = this.getAtomIndexByName('N1')
    } else {
      rungEndIndex = this.getAtomIndexByName('N3')
    }
    this.rungEndAtomIndex = defaults(rungEndIndex, -1)
  }

  getBackboneIndexList () {
    const backboneIndexList: number[] = []
    let atomnameList
    switch (this.moleculeType) {
      case ProteinType:
        atomnameList = ProteinBackboneAtoms
        break
      case RnaType:
      case DnaType:
        atomnameList = NucleicBackboneAtoms
        break
      default:
        return backboneIndexList
    }
    const atomMap = this.structure.atomMap
    const atomTypeIdList = this.atomTypeIdList
    for (let i = 0, il = this.atomCount; i < il; ++i) {
      const atomType = atomMap.get(atomTypeIdList[ i ])
      if (atomnameList.includes(atomType.atomname)) {
        backboneIndexList.push(i)
      }
    }
    return backboneIndexList
  }

  getMoleculeType () {
    if (this.isProtein()) {
      return ProteinType
    } else if (this.isRna()) {
      return RnaType
    } else if (this.isDna()) {
      return DnaType
    } else if (this.isWater()) {
      return WaterType
    } else if (this.isIon()) {
      return IonType
    } else if (this.isSaccharide()) {
      return SaccharideType
    } else {
      return UnknownType
    }
  }

  getBackboneType (position: number) {
    if (this.hasProteinBackbone(position)) {
      return ProteinBackboneType
    } else if (this.hasRnaBackbone(position)) {
      return RnaBackboneType
    } else if (this.hasDnaBackbone(position)) {
      return DnaBackboneType
    } else if (this.hasCgProteinBackbone(position)) {
      return CgProteinBackboneType
    } else if (this.hasCgRnaBackbone(position)) {
      return CgRnaBackboneType
    } else if (this.hasCgDnaBackbone(position)) {
      return CgDnaBackboneType
    } else {
      return UnknownBackboneType
    }
  }

  isProtein () {
    if (this.chemCompType) {
      return ChemCompProtein.includes(this.chemCompType)
    } else {
      return (
        this.hasAtomWithName('CA', 'C', 'N') ||
        AA3.includes(this.resname)
      )
    }
  }

  isCg () {
    const backboneType = this.backboneType
    return (
      backboneType === CgProteinBackboneType ||
      backboneType === CgRnaBackboneType ||
      backboneType === CgDnaBackboneType
    )
  }

  isNucleic () {
    return this.isRna() || this.isDna()
  }

  isRna () {
    if (this.chemCompType) {
      return ChemCompRna.includes(this.chemCompType)
    } else if (this.hetero === 1) {
      return false
    } else {
      return (
        this.hasAtomWithName(
          [ 'P', "O3'", 'O3*' ], [ "C4'", 'C4*' ], [ "O2'", 'O2*', "F2'", 'F2*' ]
        ) ||
        (RnaBases.includes(this.resname) &&
          (this.hasAtomWithName([ "O2'", 'O2*', "F2'", 'F2*' ])))
      )
    }
  }

  isDna () {
    if (this.chemCompType) {
      return ChemCompDna.includes(this.chemCompType)
    } else if (this.hetero === 1) {
      return false
    } else {
      return (
        (this.hasAtomWithName([ 'P', "O3'", 'O3*' ], [ "C3'", 'C3*' ]) &&
          !this.hasAtomWithName([ "O2'", 'O2*', "F2'", 'F2*' ])) ||
        DnaBases.includes(this.resname)
      )
    }
  }

  isHetero () {
    return this.hetero === 1
  }

  isIon () {
    return IonNames.includes(this.resname)
  }

  isWater () {
    return WaterNames.includes(this.resname)
  }

  isSaccharide () {
    if (this.chemCompType) {
      return ChemCompSaccharide.includes(this.chemCompType)
    } else {
      return SaccharideNames.includes(this.resname)
    }
  }

  isStandardAminoacid () {
    return AA3.includes(this.resname)
  }

  isStandardBase () {
    return Bases.includes(this.resname)
  }

  hasBackboneAtoms (position: number, type: number) {
    const atomnames = ResidueTypeAtoms[ type ]
    if (position === -1) {
      return this.hasAtomWithName(
        atomnames.trace,
        atomnames.backboneEnd,
        atomnames.direction1,
        atomnames.direction2
      )
    } else if (position === 0) {
      return this.hasAtomWithName(
        atomnames.trace,
        atomnames.direction1,
        atomnames.direction2
      )
    } else if (position === 1) {
      return this.hasAtomWithName(
        atomnames.trace,
        atomnames.backboneStart,
        atomnames.direction1,
        atomnames.direction2
      )
    } else {
      return this.hasAtomWithName(
        atomnames.trace,
        atomnames.backboneStart,
        atomnames.backboneEnd,
        atomnames.direction1,
        atomnames.direction2
      )
    }
  }

  hasProteinBackbone (position: number) {
    return (
      this.isProtein() &&
      this.hasBackboneAtoms(position, ProteinBackboneType)
    )
  }

  hasRnaBackbone (position: number) {
    return (
      this.isRna() &&
      this.hasBackboneAtoms(position, RnaBackboneType)
    )
  }

  hasDnaBackbone (position: number) {
    return (
      this.isDna() &&
      this.hasBackboneAtoms(position, DnaBackboneType)
    )
  }

  hasCgProteinBackbone (position: number) {
    return (
      this.atomCount < 7 &&
      this.isProtein() &&
      this.hasBackboneAtoms(position, CgProteinBackboneType)
    )
  }

  hasCgRnaBackbone (position: number) {
    return (
      this.atomCount < 11 &&
      this.isRna() &&
      this.hasBackboneAtoms(position, CgRnaBackboneType)
    )
  }

  hasCgDnaBackbone (position: number) {
    return (
      this.atomCount < 11 &&
      this.isDna() &&
      this.hasBackboneAtoms(position, CgDnaBackboneType)
    )
  }

  hasBackbone (position: number) {
    return (
      this.hasProteinBackbone(position) ||
      this.hasRnaBackbone(position) ||
      this.hasDnaBackbone(position) ||
      this.hasCgProteinBackbone(position) ||
      this.hasCgRnaBackbone(position) ||
      this.hasCgDnaBackbone(position)
    )
  }

  getAtomIndexByName (atomname: string|string[]) {
    const n = this.atomCount
    const atomMap = this.structure.atomMap
    const atomTypeIdList = this.atomTypeIdList
    if (Array.isArray(atomname)) {
      for (let i = 0; i < n; ++i) {
        const index = atomTypeIdList[ i ]
        if (atomname.includes(atomMap.get(index).atomname)) {
          return i
        }
      }
    } else {
      for (let i = 0; i < n; ++i) {
        const index = atomTypeIdList[ i ]
        if (atomname === atomMap.get(index).atomname) {
          return i
        }
      }
    }
    return undefined
  }

  hasAtomWithName (...atomnames: (string|string[])[]) {
    const n = atomnames.length
    for (let i = 0; i < n; ++i) {
      if (atomnames[ i ] === undefined) continue
      if (this.getAtomIndexByName(atomnames[ i ]) === undefined) {
        return false
      }
    }
    return true
  }

  getBonds (r?: ResidueProxy) {
    if (this.bonds === undefined) {
      this.bonds = calculateResidueBonds(r!)  // TODO
    }
    return this.bonds
  }

  getRings () {
    if (this.rings === undefined) {
      this.calculateRings()
    }
    return this.rings
  }

  getBondGraph () {
    if (this.bondGraph === undefined) {
      this.calculateBondGraph()
    }
    return this.bondGraph
  }

  getAromatic (a?: AtomProxy) {
    if (this.aromaticAtoms === undefined) {
      this.calculateAromatic(this.structure.getResidueProxy((a!).residueIndex))  // TODO
    }
    return this.aromaticAtoms
  }

  getAromaticRings (r?: ResidueProxy) {
    if (this.aromaticRings === undefined) {
      this.calculateAromatic(r!)  // TODO
    }
    return this.aromaticRings
  }

  /**
   * @return {Object} bondGraph - represents the bonding in this
   *   residue: { ai1: [ ai2, ai3, ...], ...}
   */
  calculateBondGraph () {
    const bondGraph: BondGraph = this.bondGraph = {}
    const bonds = this.getBonds()
    const nb = bonds.atomIndices1.length
    const atomIndices1 = bonds.atomIndices1
    const atomIndices2 = bonds.atomIndices2

    for (let i = 0; i < nb; ++i) {
      const ai1 = atomIndices1[i]
      const ai2 = atomIndices2[i]

      const a1 = bondGraph[ ai1 ] = bondGraph[ ai1 ] || []
      a1.push(ai2)

      const a2 = bondGraph[ ai2 ] = bondGraph[ ai2 ] || []
      a2.push(ai1)
    }
  }

  /**
   * Find all rings up to 2 * RingFinderMaxDepth
   */
  calculateRings () {
    const bondGraph = this.getBondGraph()!  // TODO
    const state = RingFinderState(bondGraph, this.atomCount)

    for (let i = 0; i < state.count; i++) {
      if (state.visited[i] >= 0) continue
      findRings(state, i)
    }

    this.rings = { atomRings: state.atomRings, rings: state.rings }
  }

  isAromatic (atom: AtomProxy) {
    this.aromaticAtoms = this.getAromatic(atom)!  // TODO
    return this.aromaticAtoms[atom.index - atom.residueAtomOffset] === 1
  }

  calculateAromatic (r: ResidueProxy) {
    const aromaticAtoms = this.aromaticAtoms = new Uint8Array(this.atomCount)
    const rings = this.getRings()!.rings

    const aromaticRingFlags = rings.map(ring => {
      return isRingAromatic(ring.map(idx => {
        return this.structure.getAtomProxy(idx + r.atomOffset)
      }))
    })

    const aromaticRings: number[][] = this.aromaticRings = []
    rings.forEach((ring, i) => {
      if (aromaticRingFlags[i]) {
        aromaticRings.push(ring)
        ring.forEach(idx => aromaticAtoms[idx] = 1)
      }
    })
  }

  /**
   * For bonds with order > 1, pick a reference atom
   * @return {undefined}
   */
  assignBondReferenceAtomIndices () {
    const bondGraph = this.getBondGraph()!  // TODO
    const rings = this.getRings()!  // TODO
    const atomRings = rings.atomRings
    const ringData = rings.rings

    const bonds = this.bonds!  // TODO
    const atomIndices1 = bonds.atomIndices1
    const atomIndices2 = bonds.atomIndices2
    const bondOrders = bonds.bondOrders
    const bondReferenceAtomIndices = this.bondReferenceAtomIndices

    const nb = bonds.atomIndices1.length

    bondReferenceAtomIndices.length = 0  // reset array

    for (let i = 0; i < nb; ++i) {
      // Not required for single bonds
      if (bondOrders[i] <= 1) continue

      let refRing

      const ai1 = atomIndices1[i]
      const ai2 = atomIndices2[i]

      const rings1 = atomRings[ ai1 ]
      const rings2 = atomRings[ ai2 ]
      // Are both atoms in a ring?
      if (rings1 && rings2) {
        // Are they in the same ring? (If not, ignore ring info)
        for (let ri1 = 0; ri1 < rings1.length; ri1++){
          if (rings2.indexOf(rings1[ ri1 ]) !== -1) {
            refRing = ringData[ rings1[ ri1 ] ]
            break
          }
        }
      }

      // Find the first neighbour.
      if (bondGraph[ ai1 ].length > 1) {
        for (let j = 0; j < bondGraph[ ai1 ].length; ++j) {
          const ai3 = bondGraph[ ai1 ][ j ]
          if (ai3 !== ai2) {
            if (refRing === undefined || refRing.indexOf(ai3) !== -1){
              bondReferenceAtomIndices[i] = ai3
              break
            }
          }
        }
      } else if (bondGraph[ ai2 ].length > 1) {
        for (let j = 0; j < bondGraph[ ai2 ].length; ++j) {
          const ai3 = bondGraph[ ai2 ][ j ]
          if (ai3 !== ai1) {
            if (refRing === undefined || refRing.indexOf(ai3) !== -1){
              bondReferenceAtomIndices[i] = ai3
              break
            }
          }
        }
      } // No reference atom could be found (e.g. diatomic molecule/fragment)
    }
  }

  getBondIndex (atomIndex1: number, atomIndex2: number) {
    const bonds = this.bonds!  // TODO
    const atomIndices1 = bonds.atomIndices1
    const atomIndices2 = bonds.atomIndices2
    let idx1 = atomIndices1.indexOf(atomIndex1)
    let idx2 = atomIndices2.indexOf(atomIndex2)
    const _idx2 = idx2
    while (idx1 !== -1) {
      while (idx2 !== -1) {
        if (idx1 === idx2) return idx1
        idx2 = atomIndices2.indexOf(atomIndex2, idx2 + 1)
      }
      idx1 = atomIndices1.indexOf(atomIndex1, idx1 + 1)
      idx2 = _idx2
    }
    // returns undefined when no bond is found
  }

  getBondReferenceAtomIndex (atomIndex1: number, atomIndex2: number) {
    const bondIndex = this.getBondIndex(atomIndex1, atomIndex2)
    if (bondIndex === undefined) return undefined
    if (this.bondReferenceAtomIndices.length === 0) {
      this.assignBondReferenceAtomIndices()
    }
    return this.bondReferenceAtomIndices[ bondIndex ]
  }
}

//

const AromaticRingElements = [
  Elements.B, Elements.C, Elements.N, Elements.O,
  Elements.SI, Elements.P, Elements.S,
  Elements.GE, Elements.AS,
  Elements.SN, Elements.SB,
  Elements.BI
]
const AromaticRingPlanarityThreshold = 0.05

function isRingAromatic (ring: AtomProxy[]) {
  if (ring.some(a => !AromaticRingElements.includes(a.number))) return false

  let i = 0
  const coords = new Matrix(3, ring.length)
  const cd = coords.data

  ring.forEach(a => {
    cd[ i + 0 ] = a.x
    cd[ i + 1 ] = a.y
    cd[ i + 2 ] = a.z
    i += 3
  })

  const pa = new PrincipalAxes(coords)

  return pa.vecC.length() < AromaticRingPlanarityThreshold
}

//

/**
 * Ring finding code below adapted from MolQL
 * Copyright (c) 2017 MolQL contributors, licensed under MIT
 * @author David Sehnal <david.sehnal@gmail.com>
 */

function addRing(state: RingFinderState, a: number, b: number) {
  // only "monotonous" rings
  if (b < a) return

  const { pred, color, left, right } = state
  const nc = ++state.currentColor

  let current = a

  for (let t = 0; t < RingFinderMaxDepth; t++) {
    color[current] = nc
    current = pred[current]
    if (current < 0) break
  }

  let leftOffset = 0
  let rightOffset = 0

  let found = false
  let target = 0
  current = b
  for (let t = 0; t < RingFinderMaxDepth; t++) {
    if (color[current] === nc) {
      target = current
      found = true
      break
    }
    right[rightOffset++] = current
    current = pred[current]
    if (current < 0) break
  }
  if (!found) return

  current = a
  for (let t = 0; t < RingFinderMaxDepth; t++) {
    left[leftOffset++] = current
    if (target === current) break
    current = pred[current]
    if (current < 0) break
  }

  const rn = leftOffset + rightOffset
  const ring: number[] = new Array(rn)
  let ringOffset = 0;
  for (let t = 0; t < leftOffset; t++) {
    ring[ringOffset++] = left[t]
  }
  for (let t = rightOffset - 1; t >= 0; t--) {
    ring[ringOffset++] = right[t]
  }

  const ri = state.rings.length
  // set atomRing indices:
  for (let i = 0; i < rn; ++i) {
    const ai = ring[i]
    if (state.atomRings[ai]) {
      state.atomRings[ai].push(ri)
    } else {
      state.atomRings[ai] = [ri]
    }
  }

  state.rings.push(ring)
}

function findRings(state: RingFinderState, from: number) {
  const { bonds, visited, queue, pred } = state

  visited[from] = 1
  queue[0] = from

  let head = 0
  let size = 1

  while (head < size) {
    const top = queue[head++]
    const start = 0
    if (bonds[top] === undefined) {
      continue
    }
    const end = bonds[top].length

    for (let i = start; i < end; i++) {
      const other = bonds[top][i]

      if (visited[other] > 0) {
        if (pred[other] !== top && pred[top] !== other) {
          addRing(state, top, other)
        }
        continue
      }

      visited[other] = 1
      queue[size++] = other
      pred[other] = top
    }
  }
}

const RingFinderMaxDepth = 4

interface RingFinderState {
  count: number,
  visited: Int32Array,
  queue: Int32Array,
  color: Int32Array,
  pred: Int32Array,

  left: Int32Array,
  right: Int32Array,

  currentColor: number,

  rings: number[][],
  atomRings: number[][],

  bonds: BondGraph
}

function RingFinderState(bonds: BondGraph, capacity: number): RingFinderState {
  const state = {
    count: capacity,
    visited: new Int32Array(capacity),
    queue: new Int32Array(capacity),
    pred: new Int32Array(capacity),
    left: new Int32Array(RingFinderMaxDepth),
    right: new Int32Array(RingFinderMaxDepth),
    color: new Int32Array(capacity),
    currentColor: 0,
    rings: [],
    atomRings: [],
    bonds
  }
  for (let i = 0; i < capacity; i++) {
    state.visited[i] = -1
    state.pred[i] = -1
  }
  return state
}
