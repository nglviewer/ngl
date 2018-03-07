/**
 * @file Model Proxy
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Structure from '../structure/structure'
import Selection from '../selection/selection'

import ModelStore from '../store/model-store'
import ChainStore from '../store/chain-store'
import ResidueStore from '../store/residue-store'

import ChainProxy from '../proxy/chain-proxy'
import Polymer from '../proxy/polymer'
import ResidueProxy from '../proxy/residue-proxy'
import AtomProxy from '../proxy/atom-proxy'

/**
 * Model proxy
 */
class ModelProxy {
  index: number

  modelStore: ModelStore
  chainStore: ChainStore
  residueStore: ResidueStore

  /**
   * @param {Structure} structure - the structure
   * @param {Integer} index - the index
   */
  constructor (readonly structure: Structure, index = 0) {
    this.index = index
    this.modelStore = structure.modelStore
    this.chainStore = structure.chainStore
    this.residueStore = structure.residueStore
  }

  get chainOffset () {
    return this.modelStore.chainOffset[ this.index ]
  }
  set chainOffset (value) {
    this.modelStore.chainOffset[ this.index ] = value
  }

  get chainCount () {
    return this.modelStore.chainCount[ this.index ]
  }
  set chainCount (value) {
    this.modelStore.chainCount[ this.index ] = value
  }

  get residueOffset () {
    return this.chainStore.residueOffset[ this.chainOffset ]
  }
  get atomOffset () {
    return this.residueStore.atomOffset[ this.residueOffset ]
  }

  get chainEnd () {
    return this.chainOffset + this.chainCount - 1
  }
  get residueEnd () {
    return (
      this.chainStore.residueOffset[ this.chainEnd ] +
      this.chainStore.residueCount[ this.chainEnd ] - 1
    )
  }
  get atomEnd () {
    return (
      this.residueStore.atomOffset[ this.residueEnd ] +
      this.residueStore.atomCount[ this.residueEnd ] - 1
    )
  }

  /**
   * Residue count
   * @type {Integer}
   */
  get residueCount () {
    if (this.chainCount === 0) {
      return 0
    } else {
      return this.residueEnd - this.residueOffset + 1
    }
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
   * Atom iterator
   * @param  {function(atom: AtomProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachAtom (callback: (ap: AtomProxy) => void, selection?: Selection) {
    this.eachChain(function (cp) {
      cp.eachAtom(callback, selection)
    }, selection)
  }

  /**
   * Residue iterator
   * @param  {function(residue: ResidueProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachResidue (callback: (rp: ResidueProxy) => void, selection?: Selection) {
    this.eachChain(function (cp) {
      cp.eachResidue(callback, selection)
    }, selection)
  }

  /**
   * Polymer iterator
   * @param  {function(polymer: Polymer)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachPolymer (callback: (p: Polymer) => void, selection?: Selection) {
    if (selection && selection.chainOnlyTest) {
      const chainOnlyTest = selection.chainOnlyTest

      this.eachChain(function (cp) {
        if (chainOnlyTest(cp)) {
          cp.eachPolymer(callback, selection)
        }
      })
    } else {
      this.eachChain(function (cp) {
        cp.eachPolymer(callback, selection)
      })
    }
  }

  /**
   * Chain iterator
   * @param  {function(chain: ChainProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachChain (callback: (cp: ChainProxy) => void, selection?: Selection) {
    const count = this.chainCount
    const offset = this.chainOffset
    const cp = this.structure._cp
    const end = offset + count

    if (selection && selection.test) {
      const chainOnlyTest = selection.chainOnlyTest
      if (chainOnlyTest) {
        for (let i = offset; i < end; ++i) {
          cp.index = i
          if (chainOnlyTest(cp)) {
            callback(cp)
          }
        }
      } else {
        for (let i = offset; i < end; ++i) {
          cp.index = i
          callback(cp)
        }
      }
    } else {
      for (let i = offset; i < end; ++i) {
        cp.index = i
        callback(cp)
      }
    }
  }

  //

  qualifiedName () {
    const name = '/' + this.index
    return name
  }

  /**
   * Clone object
   * @return {ModelProxy} cloned model
   */
  clone () {
    return new ModelProxy(this.structure, this.index)
  }

  toObject () {
    return {
      index: this.index,
      chainOffset: this.chainOffset,
      chainCount: this.chainCount
    }
  }
}

export default ModelProxy
