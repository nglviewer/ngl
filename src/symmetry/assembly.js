/**
 * @file Assembly
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Matrix4, Box3 } from '../../lib/three.es6.js'

import { uniqueArray } from '../utils.js'
import Selection from '../selection/selection.js'

function selectionFromChains (chainList) {
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
  /**
   * @param {String} name - assembly name
   */
  constructor (name) {
    this.name = name || ''
    this.partList = []
  }

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
  addPart (matrixList, chainList) {
    const part = new AssemblyPart(matrixList, chainList)
    this.partList.push(part)
    return part
  }

  _getCount (structure, methodName) {
    let count = 0

    this.partList.forEach(function (part) {
      count += part[ methodName ](structure)
    })

    return count
  }

  /**
   * Get the number of atom for a given structure
   * @param  {Structure} structure - the given structure
   * @return {Integer} number of atoms in the assembly
   */
  getAtomCount (structure) {
    return this._getCount(structure, 'getAtomCount')
  }

  /**
   * Get the number of residues for a given structure
   * @param  {Structure} structure - the given structure
   * @return {Integer} number of residues in the assembly
   */
  getResidueCount (structure) {
    return this._getCount(structure, 'getResidueCount')
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
  isIdentity (structure) {
    if (this.partList.length !== 1) return false

    const part = this.partList[ 0 ]
    if (part.matrixList.length !== 1) return false

    const identityMatrix = new Matrix4()
    if (!identityMatrix.equals(part.matrixList[ 0 ])) return false

    let structureChainList = []
    structure.eachChain(function (cp) {
      structureChainList.push(cp.chainname)
    })
    structureChainList = uniqueArray(structureChainList)
    if (part.chainList.length !== structureChainList.length) return false

    return true
  }

  getBoundingBox (structure) {
    const boundingBox = new Box3()

    this.partList.forEach(function (part) {
      const partBox = part.getBoundingBox(structure)
      boundingBox.expandByPoint(partBox.min)
      boundingBox.expandByPoint(partBox.max)
    })

    return boundingBox
  }

  getCenter (structure) {
    return this.getBoundingBox(structure).getCenter()
  }

  getSelection () {
    let chainList = []
    this.partList.forEach(function (part) {
      chainList = chainList.concat(part.chainList)
    })
    return selectionFromChains(chainList)
  }
}

class AssemblyPart {
  constructor (matrixList, chainList) {
    this.matrixList = matrixList || []
    this.chainList = chainList || []
  }

  get type () { return 'AssemblyPart' }

  _getCount (structure, propertyName) {
    let count = 0
    const chainList = this.chainList

    structure.eachChain(function (cp) {
      if (chainList.length === 0 || chainList.includes(cp.chainname)) {
        count += cp[ propertyName ]
      }
    })

    return this.matrixList.length * count
  }

  getAtomCount (structure) {
    return this._getCount(structure, 'atomCount')
  }

  getResidueCount (structure) {
    return this._getCount(structure, 'residueCount')
  }

  getBoundingBox (structure) {
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

  getView (structure) {
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
