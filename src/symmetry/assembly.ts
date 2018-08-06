/**
 * @file Assembly
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Matrix4, Box3, Vector3 } from 'three'

import { uniqueArray } from '../utils'
import Selection from '../selection/selection'
import Structure from '../structure/structure'
import StructureView from '../structure/structure-view';

function selectionFromChains (chainList: string[]) {
  let sele = ''
  if (chainList.length > 0) {
    sele = ':' + uniqueArray(chainList).join(' OR :')
  }
  return new Selection(sele)
}

/**
 * Assembly of transformed parts of a {@link Structure}
 */
class Assembly {
  partList: AssemblyPart[] = []

  /**
   * @param {String} name - assembly name
   */
  constructor (readonly name = '') {}

  get type () { return 'Assembly' }

  /**
   * Add transformed parts to the assembly
   * @example
   * var m1 = new NGL.Matrix4().set( ... );
   * var m2 = new NGL.Matrix4().set( ... );
   * var assembly = new NGL.Assembly( "myAssembly" );
   * // add part that transforms chain 'A' and 'B' using matrices `m1` and `m2`
   * assembly.addPart( [ m1, m2 ], [ "A", "B" ] )
   *
   * @param {Matrix4[]} matrixList - array of 4x4 transformation matrices
   * @param {String[]} chainList - array of chain names
   * @return {AssemblyPart} the added assembly part
   */
  addPart (matrixList?: Matrix4[], chainList?: string[]) {
    const part = new AssemblyPart(matrixList, chainList)
    this.partList.push(part)
    return part
  }

  /**
   * Get the number of atom for a given structure
   * @param  {Structure} structure - the given structure
   * @return {Integer} number of atoms in the assembly
   */
  getAtomCount (structure: Structure) {
    return this.partList.reduce(
      (count, part) => count + part.getAtomCount(structure), 0
    )
  }

  /**
   * Get the number of residues for a given structure
   * @param  {Structure} structure - the given structure
   * @return {Integer} number of residues in the assembly
   */
  getResidueCount (structure: Structure) {
    return this.partList.reduce(
      (count, part) => count + part.getResidueCount(structure), 0
    )
  }

  /**
   * Get number of instances the assembly will produce, i.e.
   * the number of transformations performed by the assembly
   * @return {Integer} number of instances
   */
  getInstanceCount () {
    let instanceCount = 0

    this.partList.forEach(function (part) {
      instanceCount += part.matrixList.length
    })

    return instanceCount
  }

  /**
   * Determine if the assembly is the full and untransformed structure
   * @param  {Structure}  structure - the given structure
   * @return {Boolean} whether the assembly is identical to the structure
   */
  isIdentity (structure: Structure) {
    if (this.partList.length !== 1) return false

    const part = this.partList[ 0 ]
    if (part.matrixList.length !== 1) return false

    const identityMatrix = new Matrix4()
    if (!identityMatrix.equals(part.matrixList[ 0 ])) return false

    let structureChainList: string[] = []
    structure.eachChain(function (cp) {
      structureChainList.push(cp.chainname)
    })
    structureChainList = uniqueArray(structureChainList)
    if (part.chainList.length !== structureChainList.length) return false

    return true
  }

  getBoundingBox (structure: Structure) {
    const boundingBox = new Box3()

    this.partList.forEach(function (part) {
      const partBox = part.getBoundingBox(structure)
      boundingBox.expandByPoint(partBox.min)
      boundingBox.expandByPoint(partBox.max)
    })

    return boundingBox
  }

  getCenter (structure: Structure) {
    return this.getBoundingBox(structure).getCenter(new Vector3())
  }

  getSelection () {
    let chainList: string[] = []
    this.partList.forEach(function (part) {
      chainList = chainList.concat(part.chainList)
    })
    return selectionFromChains(chainList)
  }
}

export class AssemblyPart {
  constructor (readonly matrixList: Matrix4[] = [], readonly chainList: string[] = []) {}

  get type () { return 'AssemblyPart' }

  _getCount (structure: Structure, propertyName: 'atomCount'|'residueCount') {
    let count = 0

    structure.eachChain(cp => {
      if (this.chainList.length === 0 || this.chainList.includes(cp.chainname)) {
        count += cp[ propertyName ]
      }
    })

    return this.matrixList.length * count
  }

  getAtomCount (structure: Structure) {
    return this._getCount(structure, 'atomCount')
  }

  getResidueCount (structure: Structure) {
    return this._getCount(structure, 'residueCount')
  }

  getBoundingBox (structure: Structure) {
    const partBox = new Box3()
    const instanceBox = new Box3()

    const selection = this.getSelection()
    const structureBox = structure.getBoundingBox(selection)

    this.matrixList.forEach(function (matrix) {
      instanceBox.copy(structureBox).applyMatrix4(matrix)
      partBox.expandByPoint(instanceBox.min)
      partBox.expandByPoint(instanceBox.max)
    })

    return partBox
  }

  getSelection () {
    return selectionFromChains(this.chainList)
  }

  getView (structure: Structure): Structure | StructureView {
    const selection = this.getSelection()
    if (selection) {
      return structure.getView(selection)
    } else {
      return structure
    }
  }

  getInstanceList () {
    const instanceList = []
    for (let j = 0, jl = this.matrixList.length; j < jl; ++j) {
      instanceList.push({
        id: j + 1,
        name: j,
        matrix: this.matrixList[ j ]
      })
    }
    return instanceList
  }
}

export default Assembly
