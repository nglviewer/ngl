/**
 * @file Chain Proxy
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { UnknownBackboneType } from '../structure/structure-constants'

import Structure from '../structure/structure'
import Selection from '../selection/selection'

import ChainStore from '../store/chain-store'
import ResidueStore from '../store/residue-store'

import Polymer from '../proxy/polymer'
import ResidueProxy from '../proxy/residue-proxy'
import AtomProxy from '../proxy/atom-proxy'
import ModelProxy from './model-proxy';
import Entity from '../structure/entity';

/**
 * Chain proxy
 */
class ChainProxy {
  index: number

  chainStore: ChainStore
  residueStore: ResidueStore

  /**
   * @param {Structure} structure - the structure
   * @param {Integer} index - the index
   */
  constructor (readonly structure: Structure, index = 0) {
    this.index = index
    this.chainStore = structure.chainStore
    this.residueStore = structure.residueStore
  }

  /**
   * Entity
   * @type {Entity}
   */
  get entity (): Entity {
    return this.structure.entityList[ this.entityIndex ]
  }
  /**
   * Model
   * @type {ModelProxy}
   */
  get model (): ModelProxy {
    return this.structure.getModelProxy(this.modelIndex)
  }

  get entityIndex () {
    return this.chainStore.entityIndex[ this.index ]
  }
  set entityIndex (value) {
    this.chainStore.entityIndex[ this.index ] = value
  }

  get modelIndex () {
    return this.chainStore.modelIndex[ this.index ]
  }
  set modelIndex (value) {
    this.chainStore.modelIndex[ this.index ] = value
  }

  get residueOffset () {
    return this.chainStore.residueOffset[ this.index ]
  }
  set residueOffset (value) {
    this.chainStore.residueOffset[ this.index ] = value
  }

  /**
   * Residue count
   * @type {Integer}
   */
  get residueCount () {
    return this.chainStore.residueCount[ this.index ]
  }
  set residueCount (value) {
    this.chainStore.residueCount[ this.index ] = value
  }

  get residueEnd () {
    return this.residueOffset + this.residueCount - 1
  }

  get atomOffset () {
    return this.residueStore.atomOffset[ this.residueOffset ]
  }
  get atomEnd () {
    return (
      this.residueStore.atomOffset[ this.residueEnd ] +
      this.residueStore.atomCount[ this.residueEnd ] - 1
    )
  }
  /**
   * Atom count
   * @type {Integer}
   */
  get atomCount () {
    if (this.residueCount === 0) {
      return 0
    } else {
      return this.atomEnd - this.atomOffset + 1
    }
  }

  //

  /**
   * Chain name
   * @type {String}
   */
  get chainname () {
    return this.chainStore.getChainname(this.index)
  }
  set chainname (value) {
    this.chainStore.setChainname(this.index, value)
  }

  /**
   * Chain id
   * @type {String}
   */
  get chainid () {
    return this.chainStore.getChainid(this.index)
  }
  set chainid (value) {
    this.chainStore.setChainid(this.index, value)
  }

  //

  /**
   * Atom iterator
   * @param  {function(atom: AtomProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachAtom (callback: (ap: AtomProxy) => void, selection?: Selection) {
    this.eachResidue(function (rp) {
      rp.eachAtom(callback, selection)
    }, selection)
  }

  /**
   * Residue iterator
   * @param  {function(residue: ResidueProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachResidue (callback: (rp: ResidueProxy) => void, selection?: Selection) {
    const count = this.residueCount
    const offset = this.residueOffset
    const rp = this.structure._rp
    const end = offset + count

    if (selection && selection.test) {
      const residueOnlyTest = selection.residueOnlyTest
      if (residueOnlyTest) {
        for (let i = offset; i < end; ++i) {
          rp.index = i
          if (residueOnlyTest(rp)) {
            callback(rp)
          }
        }
      } else {
        for (let i = offset; i < end; ++i) {
          rp.index = i
          callback(rp)
        }
      }
    } else {
      for (let i = offset; i < end; ++i) {
        rp.index = i
        callback(rp)
      }
    }
  }

  /**
   * Multi-residue iterator
   * @param {Integer} n - window size
   * @param  {function(residueList: ResidueProxy[])} callback - the callback
   * @return {undefined}
   */
  eachResidueN (n: number, callback: (...rpArray: ResidueProxy[]) => void) {
    const count = this.residueCount
    const offset = this.residueOffset
    const end = offset + count
    if (count < n) return
    const array: ResidueProxy[] = new Array(n)

    for (let i = 0; i < n; ++i) {
      array[ i ] = this.structure.getResidueProxy(offset + i)
    }
    callback.apply(this, array)

    for (let j = offset + n; j < end; ++j) {
      for (let i = 0; i < n; ++i) {
        array[ i ].index += 1
      }
      callback.apply(this, array)
    }
  }

  /**
   * Polymer iterator
   * @param  {function(polymer: Polymer)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachPolymer (callback: (p: Polymer) => void, selection?: Selection) {
    let rStartIndex = 0
    let rNextIndex = 0
    const test = selection ? selection.residueOnlyTest : undefined
    const structure = this.model.structure

    const count = this.residueCount
    const offset = this.residueOffset
    const end = offset + count

    const rp1 = this.structure.getResidueProxy()
    const rp2 = this.structure.getResidueProxy(offset)

    const ap1 = this.structure.getAtomProxy()
    const ap2 = this.structure.getAtomProxy()

    let first = true

    for (let i = offset + 1; i < end; ++i) {
      rp1.index = rp2.index
      rp2.index = i

      const bbType1 = first ? rp1.backboneEndType : rp1.backboneType
      const bbType2 = rp2.backboneType

      if (first) {
        rStartIndex = rp1.index
        first = false
      }
      rNextIndex = rp2.index

      if (bbType1 !== UnknownBackboneType && bbType1 === bbType2) {
        ap1.index = rp1.backboneEndAtomIndex
        ap2.index = rp2.backboneStartAtomIndex
      } else {
        if (bbType1 !== UnknownBackboneType) {
          if (rp1.index - rStartIndex > 1) {
            // console.log("FOO1",rStartIndex, rp1.index)
            callback(new Polymer(structure, rStartIndex, rp1.index))
          }
        }
        rStartIndex = rNextIndex

        continue
      }

      if (!ap1 || !ap2 || !ap1.connectedTo(ap2) ||
        (test && (!test(rp1) || !test(rp2)))
      ) {
        if (rp1.index - rStartIndex > 1) {
          // console.log("FOO2",rStartIndex, rp1.index)
          callback(new Polymer(structure, rStartIndex, rp1.index))
        }
        rStartIndex = rNextIndex
      }
    }

    if (rNextIndex - rStartIndex > 1) {
      if (this.structure.getResidueProxy(rStartIndex).backboneEndType) {
        // console.log("FOO3",rStartIndex, rNextIndex)
        callback(new Polymer(structure, rStartIndex, rNextIndex))
      }
    }
  }

  //

  qualifiedName () {
    var name = ':' + this.chainname + '/' + this.modelIndex
    return name
  }

  /**
   * Clone object
   * @return {ChainProxy} cloned chain
   */
  clone () {
    return new ChainProxy(this.structure, this.index)
  }

  toObject () {
    return {
      index: this.index,
      residueOffset: this.residueOffset,
      residueCount: this.residueCount,

      chainname: this.chainname
    }
  }
}

export default ChainProxy
