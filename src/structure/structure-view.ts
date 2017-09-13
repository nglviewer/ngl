/**
 * @file Structure View
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3, Box3 } from 'three'

import { Debug, Log } from '../globals'
import Structure from './structure'
import Selection from '../selection/selection'
import BitArray from '../utils/bitarray'

import BondProxy from '../proxy/bond-proxy'
import AtomProxy from '../proxy/atom-proxy'
import ResidueProxy from '../proxy/residue-proxy'
import ChainProxy from '../proxy/chain-proxy'
import ModelProxy from '../proxy/model-proxy'

/**
 * Get view on structure restricted to the selection
 * @param  {Selection} selection - the selection
 * @return {StructureView} the view on the structure
 */
Structure.prototype.getView = function (this: Structure, selection: Selection) {
  // added here to avoid cyclic import dependency
  return new StructureView(this, selection)
}

/**
 * View on the structure, restricted to the selection
 */
class StructureView extends Structure {
  structure: Structure
  selection: Selection

  /**
   * @param {Structure} structure - the structure
   * @param {Selection} selection - the selection
   */
  constructor (structure: Structure, selection: Selection) {
    super()

    this.structure = structure
    this.selection = selection

    this.center = new Vector3()
    this.boundingBox = new Box3()

    this._bp = this.getBondProxy()
    this._ap = this.getAtomProxy()
    this._rp = this.getResidueProxy()
    this._cp = this.getChainProxy()

    if (this.selection) {
      this.selection.signals.stringChanged.add(this.refresh, this)
    }

    this.structure.signals.refreshed.add(this.refresh, this)

    this.refresh()
  }

  init () {}

  get type () { return 'StructureView' }

  get name () { return this.structure.name }
  get path () { return this.structure.path }
  get title () { return this.structure.title }
  get id () { return this.structure.id }
  get atomSetDict () { return this.structure.atomSetDict }
  get biomolDict () { return this.structure.biomolDict }
  get entityList () { return this.structure.entityList }
  get unitcell () { return this.structure.unitcell }
  get frames () { return this.structure.frames }
  get boxes () { return this.structure.boxes }
  get validation () { return this.structure.validation }
  get bondStore () { return this.structure.bondStore }
  get backboneBondStore () { return this.structure.backboneBondStore }
  get rungBondStore () { return this.structure.rungBondStore }
  get atomStore () { return this.structure.atomStore }
  get residueStore () { return this.structure.residueStore }
  get chainStore () { return this.structure.chainStore }
  get modelStore () { return this.structure.modelStore }
  get atomMap () { return this.structure.atomMap }
  get residueMap () { return this.structure.residueMap }
  get bondHash () { return this.structure.bondHash }
  get spatialHash () { return this.structure.spatialHash }

  /**
   * Updates atomSet, bondSet, atomSetCache, atomCount, bondCount, boundingBox, center.
   * @emits {Structure.signals.refreshed} when refreshed
   * @return {undefined}
   */
  refresh () {
    if (Debug) Log.time('StructureView.refresh')

    this.atomSetCache = {}

    this.atomSet = this.getAtomSet(this.selection, true)
    if (this.structure.atomSet) {
      this.atomSet = this.atomSet.intersection(this.structure.atomSet)
    }

    this.bondSet = this.getBondSet()

    for (let name in this.atomSetDict) {
      const atomSet = this.atomSetDict[ name ]
      this.atomSetCache[ '__' + name ] = atomSet.makeIntersection(this.atomSet)
    }

    this.atomCount = this.atomSet.getSize()
    this.bondCount = this.bondSet.getSize()

    this.boundingBox = this.getBoundingBox()
    this.center = this.boundingBox.getCenter()

    if (Debug) Log.timeEnd('StructureView.refresh')

    this.signals.refreshed.dispatch()
  }

  //

  setSelection (selection: Selection) {
    this.selection = selection

    this.refresh()
  }

  getSelection (selection?: Selection) {
    const seleList: string[] = []

    if (selection && selection.string) {
      seleList.push(selection.string)
    }

    const parentSelection = this.structure.getSelection()
    if (parentSelection && parentSelection.string) {
      seleList.push(parentSelection.string)
    }

    if (this.selection && this.selection.string) {
      seleList.push(this.selection.string)
    }

    let sele = ''
    if (seleList.length > 0) {
      sele = `( ${seleList.join(' ) AND ( ')} )`
    }

    return new Selection(sele)
  }

  getStructure () {
    return this.structure.getStructure()
  }

  //

  eachBond (callback: (entity: BondProxy) => any, selection?: Selection) {
    this.structure.eachBond(callback, this.getSelection(selection))
  }

  eachAtom (callback: (entity: AtomProxy) => any, selection?: Selection) {
    const ap = this.getAtomProxy()
    const atomSet = this.getAtomSet(selection)
    const n = this.atomStore.count

    if (atomSet.getSize() < n) {
      atomSet.forEach(function (index) {
        ap.index = index
        callback(ap)
      })
    } else {
      for (let i = 0; i < n; ++i) {
        ap.index = i
        callback(ap)
      }
    }
  }

  eachResidue (callback: (entity: ResidueProxy) => any, selection?: Selection) {
    this.structure.eachResidue(callback, this.getSelection(selection))
  }

  /**
   * Not implemented
   * @alias StructureView#eachResidueN
   * @return {undefined}
   */
  eachResidueN (n: number, callback: (entity: ResidueProxy) => any) {
    console.error('StructureView.eachResidueN() not implemented')
  }

  eachChain (callback: (entity: ChainProxy) => any, selection?: Selection) {
    this.structure.eachChain(callback, this.getSelection(selection))
  }

  eachModel (callback: (entity: ModelProxy) => any, selection?: Selection) {
    this.structure.eachModel(callback, this.getSelection(selection))
  }

    //

  getAtomSet (selection?: boolean|Selection|BitArray, ignoreView = false) {
    let atomSet = this.structure.getAtomSet(selection)
    if (!ignoreView && this.atomSet) {
      atomSet = atomSet.makeIntersection(this.atomSet)
    }

    return atomSet
  }

  //

  getAtomIndices (selection?: Selection) {
    return this.structure.getAtomIndices(this.getSelection(selection))
  }

  refreshPosition () {
    return this.structure.refreshPosition()
  }

  //

  dispose () {
    if (this.selection) {
      this.selection.signals.stringChanged.remove(this.refresh, this)
    }

    this.structure.signals.refreshed.remove(this.refresh, this)

    delete this.structure

    delete this.atomSet
    delete this.bondSet

    delete this.atomCount
    delete this.bondCount
  }
}

export default StructureView
