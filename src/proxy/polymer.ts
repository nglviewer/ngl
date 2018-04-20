/**
 * @file Polymer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

// import { Log } from '../globals'

import Structure from '../structure/structure'
import Selection from '../selection/selection'

import ChainStore from '../store/chain-store'
import ResidueStore from '../store/residue-store'
import AtomStore from '../store/atom-store'

import ResidueProxy from '../proxy/residue-proxy'
import AtomProxy from '../proxy/atom-proxy'

/**
 * Polymer
 */
class Polymer {
  chainStore: ChainStore
  residueStore: ResidueStore
  atomStore: AtomStore

  residueCount: number

  isPrevConnected: boolean
  isNextConnected: boolean
  isNextNextConnected: boolean
  isCyclic: boolean

  private __residueProxy: ResidueProxy

  /**
   * @param {Structure} structure - the structure
   * @param {Integer} residueIndexStart - the index of the first residue
   * @param {Integer} residueIndexEnd - the index of the last residue
   */
  constructor (readonly structure: Structure, readonly residueIndexStart: number, readonly residueIndexEnd: number) {
    this.chainStore = structure.chainStore
    this.residueStore = structure.residueStore
    this.atomStore = structure.atomStore

    /**
     * @type {Integer}
     */
    this.residueCount = residueIndexEnd - residueIndexStart + 1

    const rpStart = this.structure.getResidueProxy(this.residueIndexStart)
    const rpEnd = this.structure.getResidueProxy(this.residueIndexEnd)
    this.isPrevConnected = rpStart.getPreviousConnectedResidue() !== undefined
    const rpNext = rpEnd.getNextConnectedResidue()
    this.isNextConnected = rpNext !== undefined
    this.isNextNextConnected = rpNext !== undefined && rpNext.getNextConnectedResidue() !== undefined
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

  getBackboneType (position: number) {
    this.__residueProxy.index = this.residueIndexStart
    return this.__residueProxy.getBackboneType(position)
  }

  getAtomIndexByType (index: number, type: string) {
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

    const rp = this.__residueProxy
    rp.index = this.residueIndexStart + index
    let aIndex

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
        aIndex = rp.getAtomIndexByName(type)
    }

    // if (!ap){
    //   console.log(this, type, rp.residueType)
    //   // console.log(rp.qualifiedName(), rp.index, index, this.residueCount - 1)
    //   // rp.index = this.residueIndexStart;
    //   // console.log(rp.qualifiedName(), this.residueIndexStart)
    //   // rp.index = this.residueIndexEnd;
    //   // console.log(rp.qualifiedName(), this.residueIndexEnd)
    // }

    return aIndex
  }

  /**
   * Atom iterator
   * @param  {function(atom: AtomProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachAtom (callback: (ap: AtomProxy) => void, selection?: Selection) {
    this.eachResidue(function (rp) {
      rp.eachAtom(callback, selection)
    })
  }

  eachAtomN (n: number, callback: (...apArray: AtomProxy[]) => void, type: string) {
    const m = this.residueCount
    const array: AtomProxy[] = new Array(n)

    for (let i = 0; i < n; ++i) {
      array[ i ] = this.structure.getAtomProxy(this.getAtomIndexByType(i, type))
    }
    callback.apply(this, array)

    for (var j = n; j < m; ++j) {
      for (let i = 1; i < n; ++i) {
        array[ i - 1 ].index = array[ i ].index
      }
      array[ n - 1 ].index = this.getAtomIndexByType(j, type)!  // TODO
      callback.apply(this, array)
    }
  }

  /**
   * Residue iterator
   * @param  {function(residue: ResidueProxy)} callback - the callback
   * @return {undefined}
   */
  eachResidue (callback: (rp: ResidueProxy) => void) {
    const rp = this.structure.getResidueProxy()
    const n = this.residueCount
    const rStartIndex = this.residueIndexStart

    for (let i = 0; i < n; ++i) {
      rp.index = rStartIndex + i
      callback(rp)
    }
  }

  qualifiedName () {
    const rpStart = this.structure.getResidueProxy(this.residueIndexStart)
    const rpEnd = this.structure.getResidueProxy(this.residueIndexEnd)
    return rpStart.qualifiedName() + ' - ' + rpEnd.qualifiedName()
  }
}

export default Polymer
