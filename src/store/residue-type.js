/**
 * @file Residue Type
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Fred Ludlow
 * @private
 */

import { calculateResidueBonds } from '../structure/structure-utils.js'
import {
    ProteinType, RnaType, DnaType, WaterType, IonType, SaccharideType, UnknownType,
    ProteinBackboneType, RnaBackboneType, DnaBackboneType, UnknownBackboneType,
    CgProteinBackboneType, CgRnaBackboneType, CgDnaBackboneType,
    ChemCompProtein, ChemCompRna, ChemCompDna, ChemCompSaccharide,
    AA3, PurinBases, RnaBases, DnaBases, IonNames, WaterNames, SaccharideNames,
    ProteinBackboneAtoms, NucleicBackboneAtoms, ResidueTypeAtoms
} from '../structure/structure-constants.js'

/**
 * Residue type
 */
class ResidueType {
  /**
   * @param {Structure} structure - the structure object
   * @param {String} resname - name of the residue
   * @param {Array} atomTypeIdList - list of IDs of {@link AtomType}s corresponding
   *                                 to the atoms of the residue
   * @param {Boolean} hetero - hetero flag
   * @param {String} chemCompType - chemical component type
   * @param {Object} [bonds] - TODO
   */
  constructor (structure, resname, atomTypeIdList, hetero, chemCompType, bonds) {
    this.structure = structure

    this.resname = resname
    this.atomTypeIdList = atomTypeIdList
    this.hetero = hetero ? 1 : 0
    this.chemCompType = chemCompType
    this.bonds = bonds
    this.rings = undefined
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
    this.traceAtomIndex = traceIndex !== undefined ? traceIndex : -1

    const dir1Index = this.getAtomIndexByName(atomnames.direction1)
    this.direction1AtomIndex = dir1Index !== undefined ? dir1Index : -1

    const dir2Index = this.getAtomIndexByName(atomnames.direction2)
    this.direction2AtomIndex = dir2Index !== undefined ? dir2Index : -1

    const bbStartIndex = this.getAtomIndexByName(atomnamesStart.backboneStart)
    this.backboneStartAtomIndex = bbStartIndex !== undefined ? bbStartIndex : -1

    const bbEndIndex = this.getAtomIndexByName(atomnamesEnd.backboneEnd)
    this.backboneEndAtomIndex = bbEndIndex !== undefined ? bbEndIndex : -1

    let rungEndIndex
    if (PurinBases.includes(resname)) {
      rungEndIndex = this.getAtomIndexByName('N1')
    } else {
      rungEndIndex = this.getAtomIndexByName('N3')
    }
    this.rungEndAtomIndex = rungEndIndex !== undefined ? rungEndIndex : -1

    // Sparse array containing the reference atom index for each bond.
    this.bondReferenceAtomIndices = []
  }

  getBackboneIndexList () {
    const backboneIndexList = []
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

  getBackboneType (position) {
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

  hasBackboneAtoms (position, type) {
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

  hasProteinBackbone (position) {
    return (
      this.isProtein() &&
      this.hasBackboneAtoms(position, ProteinBackboneType)
    )
  }

  hasRnaBackbone (position) {
    return (
      this.isRna() &&
      this.hasBackboneAtoms(position, RnaBackboneType)
    )
  }

  hasDnaBackbone (position) {
    return (
      this.isDna() &&
      this.hasBackboneAtoms(position, DnaBackboneType)
    )
  }

  hasCgProteinBackbone (position) {
    return (
      this.atomCount < 7 &&
      this.isProtein() &&
      this.hasBackboneAtoms(position, CgProteinBackboneType)
    )
  }

  hasCgRnaBackbone (position) {
    return (
      this.atomCount < 11 &&
      this.isRna() &&
      this.hasBackboneAtoms(position, CgRnaBackboneType)
    )
  }

  hasCgDnaBackbone (position) {
    return (
      this.atomCount < 11 &&
      this.isDna() &&
      this.hasBackboneAtoms(position, CgDnaBackboneType)
    )
  }

  hasBackbone (position) {
    return (
      this.hasProteinBackbone(position) ||
      this.hasRnaBackbone(position) ||
      this.hasDnaBackbone(position) ||
      this.hasCgProteinBackbone(position) ||
      this.hasCgRnaBackbone(position) ||
      this.hasCgDnaBackbone(position)
    )
  }

  getAtomIndexByName (atomname) {
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

  hasAtomWithName (/* atomname */) {
    const n = arguments.length
    for (let i = 0; i < n; ++i) {
      if (arguments[ i ] === undefined) continue
      if (this.getAtomIndexByName(arguments[ i ]) === undefined) {
        return false
      }
    }
    return true
  }

  getBonds (r) {
    if (this.bonds === undefined) {
      this.bonds = calculateResidueBonds(r)
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

  /**
   * @return {Object} bondGraph - represents the bonding in this
   *   residue: { ai1: [ ai2, ai3, ...], ...}
   */
  calculateBondGraph () {
    const bondGraph = this.bondGraph = {}
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
   * Calculates ring atoms within a residue
   * Adaptation of RDKit's fastFindRings method by G. Landrum:
   * https://github.com/rdkit/rdkit/blob/master/Code/GraphMol/FindRings.cpp
   *
   * @param {ResidueProxy} r   - The residue for which we are to find rings
   * @return {Object} ringData - contains ringFlags (1/0) and rings
   *                             (nested array)
   *
   * Note this method finds all ring atoms, but in cases of fused or
   * connected rings will not detect all rings.
   * The resulting rings object will provide 'a ring' for each ring atom
   * but which ring depends on atom order and connectivity
   *
   * @return {undefined}
   */
  calculateRings () {
    const bondGraph = this.getBondGraph()

    const state = new Int8Array(this.atomCount)
    const flags = new Int8Array(this.atomCount)
    const rings = []
    const visited = []

    function DFS (i, connected, from) {
      // Sanity check
      if (state[ i ]) { throw new Error('DFS revisited atom') }
      state[ i ] = 1
      visited.push(i)
      var nc = connected.length

      // For each neighbour
      for (var ci = 0; ci < nc; ++ci) {
        var j = connected[ci]

        // If unvisited:
        if (state[ j ] === 0) {
          // And has >= 2 neighbours:
          if (bondGraph[ j ] && bondGraph[ j ].length >= 2) {
            // Recurse
            DFS(j, bondGraph[ j ], i)
          } else {
            // Not interesting
            state[ j ] = 2
          }

        // Else unclosed ring:
        } else if (state[ j ] === 1) {
          if (from && from !== j) {
            var ring = [ j ]
            flags[ j ] = 1
            rings.push(ring)
            for (var ki = visited.length - 1; ki >= 0; --ki) {
              var k = visited[ ki ]
              if (k === j) {
                break
              }
              ring.push(k)
              flags[ k ] = 1
            }
          }
        }
      }
      state[ i ] = 2 // Completed processing for this atom

      visited.pop()
    }

    for (let i = 0; i < this.atomCount; ++i) {
      if (state[ i ]) { continue } // Already processed

      const connected = bondGraph[ i ]
      if (!connected || connected.length < 2) {
        // Finished
        state[ i ] = 2
        continue
      }

      visited.length = 0
      DFS(i, connected)
    }

    this.rings = { flags, rings }
  }

  /**
   * For bonds with order > 1, pick a reference atom
   * @return {undefined}
   */
  assignBondReferenceAtomIndices () {
    const bondGraph = this.getBondGraph()
    const rings = this.getRings()
    const ringFlags = rings.flags
    const ringData = rings.rings

    const atomIndices1 = this.bonds.atomIndices1
    const atomIndices2 = this.bonds.atomIndices2
    const bondOrders = this.bonds.bondOrders
    const bondReferenceAtomIndices = this.bondReferenceAtomIndices

    const nb = this.bonds.atomIndices1.length

    bondReferenceAtomIndices.length = 0  // reset array

    for (let i = 0; i < nb; ++i) {
      // Not required for single bonds
      if (bondOrders[i] <= 1) continue

      const ai1 = atomIndices1[i]
      const ai2 = atomIndices2[i]

      // Are both atoms in a ring?
      if (ringFlags[ ai1 ] && ringFlags[ ai2 ]) {
        // Select another ring atom
        // I *think* we can simply take the first ring atom
        // we find in a ring that contains either ai1 or ai2
        // where the ring atom is not ai1 or ai2
        for (let ri = 0; ri < ringData.length; ++ri) {
          // Have we already found it?
          if (bondReferenceAtomIndices[i] !== undefined) { break }

          const ring = ringData[ ri ]
          // Try to find this atom and reference atom in no more than 1 full
          // iteration through loop
          let refAtom = null
          let found = false
          for (let rai = 0; rai < ring.length; ++rai) {
            const ai3 = ring[ rai ]
            if (ai3 === ai1 || ai3 === ai2) {
              found = true
            } else {
              // refAtom is any other atom
              refAtom = ai3
            }
            if (found && refAtom !== null) {
              bondReferenceAtomIndices[i] = refAtom
              break
            }
          }
        }
        if (bondReferenceAtomIndices[i] !== undefined) { continue }
      }

      // Not a ring (or not one we can process), simply take the first
      // neighbouring atom

      if (bondGraph[ ai1 ].length > 1) {
        for (let j = 0; j < bondGraph[ ai1 ].length; ++j) {
          const ai3 = bondGraph[ ai1 ][ j ]
          if (ai3 !== ai2) {
            bondReferenceAtomIndices[i] = ai3
            break
          }
        }
        continue
      } else if (bondGraph[ ai2 ].length > 1) {
        for (let j = 0; j < bondGraph[ ai2 ].length; ++j) {
          const ai3 = bondGraph[ ai2 ][ j ]
          if (ai3 !== ai1) {
            bondReferenceAtomIndices[i] = ai3
            break
          }
        }
        continue
      } // No reference atom could be found (e.g. diatomic molecule/fragment)
    }
  }

  getBondIndex (atomIndex1, atomIndex2) {
    const bonds = this.bonds
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

  getBondReferenceAtomIndex (atomIndex1, atomIndex2) {
    const bondIndex = this.getBondIndex(atomIndex1, atomIndex2)
    if (bondIndex === undefined) return undefined
    if (this.bondReferenceAtomIndices.length === 0) {
      this.assignBondReferenceAtomIndices()
    }
    return this.bondReferenceAtomIndices[ bondIndex ]
  }
}

export default ResidueType
