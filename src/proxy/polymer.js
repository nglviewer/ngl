/**
 * @file Polymer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Log } from '../globals.js'

/**
 * Polymer
 */
class Polymer {
  /**
   * @param {Structure} structure - the structure
   * @param {Integer} residueIndexStart - the index of the first residue
   * @param {Integer} residueIndexEnd - the index of the last residue
   */
  constructor (structure, residueIndexStart, residueIndexEnd) {
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
     * @type {AtomStore}
     */
    this.atomStore = structure.atomStore

    /**
     * @type {Integer}
     */
    this.residueIndexStart = residueIndexStart
    /**
     * @type {Integer}
     */
    this.residueIndexEnd = residueIndexEnd
    /**
     * @type {Integer}
     */
    this.residueCount = residueIndexEnd - residueIndexStart + 1

    var rpStart = this.structure.getResidueProxy(this.residueIndexStart)
    var rpEnd = this.structure.getResidueProxy(this.residueIndexEnd)
    this.isPrevConnected = rpStart.getPreviousConnectedResidue() !== undefined
    var rpNext = rpEnd.getNextConnectedResidue()
    this.isNextConnected = rpNext !== undefined
    this.isNextNextConnected = this.isNextConnected && rpNext.getNextConnectedResidue() !== undefined
    this.isCyclic = rpEnd.connectedTo(rpStart)

    this.__residueProxy = this.structure.getResidueProxy()

    // console.log( this.qualifiedName(), this );
  }

  get chainIndex () {
    return this.residueStore.chainIndex[ this.residueIndexStart ]
  }
  get modelIndex () {
    return this.chainStore.modelIndex[ this.chainIndex ]
  }

  /**
   * @type {String}
   */
  get chainname () {
    return this.chainStore.getChainname(this.chainIndex)
  }

  //

  /**
   * If first residue is from aprotein
   * @return {Boolean} flag
   */
  isProtein () {
    this.__residueProxy.index = this.residueIndexStart
    return this.__residueProxy.isProtein()
  }

  /**
   * If atom is part of a coarse-grain group
   * @return {Boolean} flag
   */
  isCg () {
    this.__residueProxy.index = this.residueIndexStart
    return this.__residueProxy.isCg()
  }

  /**
   * If atom is part of a nucleic molecule
   * @return {Boolean} flag
   */
  isNucleic () {
    this.__residueProxy.index = this.residueIndexStart
    return this.__residueProxy.isNucleic()
  }

  getMoleculeType () {
    this.__residueProxy.index = this.residueIndexStart
    return this.__residueProxy.moleculeType
  }

  getBackboneType (position) {
    this.__residueProxy.index = this.residueIndexStart
    return this.__residueProxy.getBackboneType(position)
  }

  getAtomIndexByType (index, type) {
    // TODO pre-calculate, add to residueStore???

    if (this.isCyclic) {
      if (index === -1) {
        index = this.residueCount - 1
      } else if (index === this.residueCount) {
        index = 0
      }
    } else {
      if (index === -1 && !this.isPrevConnected) index += 1
      if (index === this.residueCount && !this.isNextNextConnected) index -= 1
      // if( index === this.residueCount - 1 && !this.isNextConnected ) index -= 1;
    }

    var rp = this.__residueProxy
    rp.index = this.residueIndexStart + index
    var aIndex

    switch (type) {
      case 'trace':
        aIndex = rp.traceAtomIndex
        break
      case 'direction1':
        aIndex = rp.direction1AtomIndex
        break
      case 'direction2':
        aIndex = rp.direction2AtomIndex
        break
      default:
        var ap = rp.getAtomByName(type)
        aIndex = ap ? ap.index : undefined
    }

    // if( !ap ){
    //     console.log( this, type, rp.residueType )
    //     // console.log( rp.qualifiedName(), rp.index, index, this.residueCount - 1 )
    //     // rp.index = this.residueIndexStart;
    //     // console.log( rp.qualifiedName(), this.residueIndexStart )
    //     // rp.index = this.residueIndexEnd;
    //     // console.log( rp.qualifiedName(), this.residueIndexEnd )
    // }

    return aIndex
  }

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

  eachAtomN (n, callback, type) {
    var i
    var m = this.residueCount

    var array = new Array(n)
    for (i = 0; i < n; ++i) {
      array[ i ] = this.structure.getAtomProxy(this.getAtomIndexByType(i, type))
    }
    callback.apply(this, array)

    for (var j = n; j < m; ++j) {
      for (i = 1; i < n; ++i) {
        array[ i - 1 ].index = array[ i ].index
      }
      array[ n - 1 ].index = this.getAtomIndexByType(j, type)
      callback.apply(this, array)
    }
  }

  eachAtomN2 (n, callback, type) {
    // console.log(this.residueOffset,this.residueCount)

    var offset = this.atomOffset
    var count = this.atomCount
    var end = offset + count
    if (count < n) return

    var array = new Array(n)
    for (var i = 0; i < n; ++i) {
      array[ i ] = this.structure.getAtomProxy()
    }
    // console.log( array, offset, end, count )

    let atomSet = this.structure.atomSetCache[ '__' + type ]
    if (atomSet === undefined) {
      Log.warn('no precomputed atomSet for: ' + type)
      atomSet = this.structure.getAtomSet(false)
      this.eachResidue(function (rp) {
        var ap = rp.getAtomByName(type)
        atomSet.set(ap.index)
      })
    }
    var j = 0

    atomSet.forEach(function (index) {
      if (index >= offset && index < end) {
        for (var i = 1; i < n; ++i) {
          array[ i - 1 ].index = array[ i ].index
        }
        array[ n - 1 ].index = index
        j += 1
        if (j >= n) {
          callback.apply(this, array)
        }
      }
    })
  }

  /**
   * Residue iterator
   * @param  {function(residue: ResidueProxy)} callback - the callback
   * @return {undefined}
   */
  eachResidue (callback) {
    var rp = this.structure.getResidueProxy()
    var n = this.residueCount
    var rStartIndex = this.residueIndexStart

    for (var i = 0; i < n; ++i) {
      rp.index = rStartIndex + i
      callback(rp)
    }
  }

  qualifiedName () {
    var rpStart = this.structure.getResidueProxy(this.residueIndexStart)
    var rpEnd = this.structure.getResidueProxy(this.residueIndexEnd)
    return rpStart.qualifiedName() + ' - ' + rpEnd.qualifiedName()
  }
}

export default Polymer
