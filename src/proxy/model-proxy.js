/**
 * @file Model Proxy
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

/**
 * Model proxy
 */
class ModelProxy {
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
     * @type {ModelStore}
     */
    this.modelStore = structure.modelStore
    /**
     * @type {ChainStore}
     */
    this.chainStore = structure.chainStore
    /**
     * @type {ResidueStore}
     */
    this.residueStore = structure.residueStore
    /**
     * @type {Number}
     */
    this.index = index
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
  eachAtom (callback, selection) {
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
  eachResidue (callback, selection) {
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
  eachPolymer (callback, selection) {
    if (selection && selection.chainOnlyTest) {
      var chainOnlyTest = selection.chainOnlyTest

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
  eachChain (callback, selection) {
    var i
    var count = this.chainCount
    var offset = this.chainOffset
    var cp = this.structure._cp
    var end = offset + count

    if (selection && selection.test) {
      var chainOnlyTest = selection.chainOnlyTest
      if (chainOnlyTest) {
        for (i = offset; i < end; ++i) {
          cp.index = i
          if (chainOnlyTest(cp)) {
            callback(cp, selection)
          }
        }
      } else {
        for (i = offset; i < end; ++i) {
          cp.index = i
          callback(cp, selection)
        }
      }
    } else {
      for (i = offset; i < end; ++i) {
        cp.index = i
        callback(cp)
      }
    }
  }

  //

  qualifiedName () {
    var name = '/' + this.index
    return name
  }

  /**
   * Clone object
   * @return {ModelProxy} cloned model
   */
  clone () {
    return new this.constructor(this.structure, this.index)
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
