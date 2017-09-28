/**
 * @file Chain Proxy
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { UnknownBackboneType } from '../structure/structure-constants.js'
import Polymer from './polymer.js'

/**
 * Chain proxy
 */
class ChainProxy {
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
  /**
   * Model
   * @type {ModelProxy}
   */
  get model () {
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
  eachAtom (callback, selection) {
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
  eachResidue (callback, selection) {
    var i
    var count = this.residueCount
    var offset = this.residueOffset
    var rp = this.structure._rp
    var end = offset + count

    if (selection && selection.test) {
      var residueOnlyTest = selection.residueOnlyTest
      if (residueOnlyTest) {
        for (i = offset; i < end; ++i) {
          rp.index = i
          if (residueOnlyTest(rp)) {
            callback(rp, selection)
          }
        }
      } else {
        for (i = offset; i < end; ++i) {
          rp.index = i
          callback(rp, selection)
        }
      }
    } else {
      for (i = offset; i < end; ++i) {
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
  eachResidueN (n, callback) {
    var i
    var count = this.residueCount
    var offset = this.residueOffset
    var end = offset + count
    if (count < n) return
    var array = new Array(n)

    for (i = 0; i < n; ++i) {
      array[ i ] = this.structure.getResidueProxy(offset + i)
    }
    callback.apply(this, array)

    for (var j = offset + n; j < end; ++j) {
      for (i = 0; i < n; ++i) {
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
  eachPolymer (callback, selection) {
    var rStartIndex, rNextIndex
    var test = selection ? selection.residueOnlyTest : undefined
    var structure = this.model.structure

    var count = this.residueCount
    var offset = this.residueOffset
    var end = offset + count

    var rp1 = this.structure.getResidueProxy()
    var rp2 = this.structure.getResidueProxy(offset)

    var ap1 = this.structure.getAtomProxy()
    var ap2 = this.structure.getAtomProxy()

    var first = true

    for (var i = offset + 1; i < end; ++i) {
      rp1.index = rp2.index
      rp2.index = i

      var bbType1 = first ? rp1.backboneEndType : rp1.backboneType
      var bbType2 = rp2.backboneType

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
    return new this.constructor(this.structure, this.index)
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
