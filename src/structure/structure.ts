/**
 * @file Structure
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3, Box3 } from 'three'
import { Signal } from 'signals'

import { Debug, Log, ColormakerRegistry } from '../globals'
import { defaults } from '../utils'
import { AtomPicker, BondPicker } from '../utils/picker'
import { copyWithin, arrayMin, arrayMax } from '../math/array-utils'
import BitArray from '../utils/bitarray'
import RadiusFactory, { RadiusParams } from '../utils/radius-factory'
import { Matrix } from '../math/matrix-utils'
import PrincipalAxes from '../math/principal-axes'
import SpatialHash from '../geometry/spatial-hash'
import FilteredVolume from '../surface/filtered-volume'
import StructureView from './structure-view'
import { AtomDataParams, AtomData, BondDataParams, BondData } from './structure-data'
import { Data, createData } from './data'

import Entity from './entity'
import Unitcell from '../symmetry/unitcell'
import Validation from './validation'
import Selection from '../selection/selection'
import Assembly from '../symmetry/assembly'
import Volume from '../surface/volume'
import Polymer from '../proxy/polymer'

import BondHash from '../store/bond-hash'
import BondStore from '../store/bond-store'
import AtomStore from '../store/atom-store'
import ResidueStore from '../store/residue-store'
import ChainStore from '../store/chain-store'
import ModelStore from '../store/model-store'

import AtomMap from '../store/atom-map'
import ResidueMap from '../store/residue-map'

import BondProxy from '../proxy/bond-proxy'
import AtomProxy from '../proxy/atom-proxy'
import ResidueProxy from '../proxy/residue-proxy'
import ChainProxy from '../proxy/chain-proxy'
import ModelProxy from '../proxy/model-proxy'

interface Structure {
  signals: StructureSignals

  name: string
  path: string
  title: string
  id: string

  data: Data

  atomCount: number
  bondCount: number

  header: StructureHeader
  extraData: StructureExtraData

  atomSetCache: { [k: string]: BitArray }
  atomSetDict: { [k: string]: BitArray }
  biomolDict: { [k: string]: Assembly }

  entityList: Entity[]
  unitcell?: Unitcell

  frames: Float32Array[]
  boxes: Float32Array[]

  validation?: Validation

  bondStore: BondStore
  backboneBondStore: BondStore
  rungBondStore: BondStore
  atomStore: AtomStore
  residueStore: ResidueStore
  chainStore: ChainStore
  modelStore: ModelStore

  atomMap: AtomMap
  residueMap: ResidueMap

  bondHash?: BondHash
  spatialHash?: SpatialHash

  atomSet?: BitArray
  bondSet?: BitArray

  center: Vector3
  boundingBox: Box3

  trajectory?: {
    name: string
    frame: number
  }

  getView(selection: Selection): StructureView

  _hasCoords?: boolean

  _bp: BondProxy
  _ap: AtomProxy
  _rp: ResidueProxy
  _cp: ChainProxy
}

export type StructureHeader = {
  releaseDate?: string
  depositionDate?: string
  resolution?: number
  rFree?: number
  rWork?: number
  experimentalMethods?: string[]
}

export type StructureExtraData = {
  cif?: object
  sdf?: object[]
}

export type StructureSignals = {
  refreshed: Signal
}

/**
 * Structure
 */
class Structure implements Structure{
  signals: StructureSignals = {
    refreshed: new Signal()
  }

  /**
   * @param {String} name - structure name
   * @param {String} path - source path
   */
  constructor (name = '', path = '') {
    this.init(name, path)
  }

  init (name: string, path: string) {
    this.name = name
    this.path = path
    this.title = ''
    this.id = ''

    this.data = createData(this)

    this.header = {}
    this.extraData = {}

    this.atomSetCache = {}
    this.atomSetDict = {}
    this.biomolDict = {}

    this.entityList = []
    this.unitcell = undefined

    this.frames = []
    this.boxes = []

    this.validation = undefined

    this.bondStore = new BondStore(0)
    this.backboneBondStore = new BondStore(0)
    this.rungBondStore = new BondStore(0)
    this.atomStore = new AtomStore(0)
    this.residueStore = new ResidueStore(0)
    this.chainStore = new ChainStore(0)
    this.modelStore = new ModelStore(0)

    this.atomMap = new AtomMap(this)
    this.residueMap = new ResidueMap(this)

    this.bondHash = undefined
    this.spatialHash = undefined

    this.atomSet = undefined
    this.bondSet = undefined

    this.center = new Vector3()
    this.boundingBox = new Box3()

    this._bp = this.getBondProxy()
    this._ap = this.getAtomProxy()
    this._rp = this.getResidueProxy()
    this._cp = this.getChainProxy()
  }

  get type () { return 'Structure' }

  finalizeAtoms () {
    this.atomSet = this.getAtomSet()
    this.atomCount = this.atomStore.count
    this.boundingBox = this.getBoundingBox(undefined, this.boundingBox)
    this.center = this.boundingBox.getCenter(new Vector3())
    this.spatialHash = new SpatialHash(this.atomStore, this.boundingBox)
  }

  finalizeBonds () {
    this.bondSet = this.getBondSet()
    this.bondCount = this.bondStore.count
    this.bondHash = new BondHash(this.bondStore, this.atomStore.count)

    this.atomSetCache = {}
    if (!this.atomSetDict.rung) {
      this.atomSetDict.rung = this.getAtomSet(false)
    }

    for (let name in this.atomSetDict) {
      this.atomSetCache[ '__' + name ] = this.atomSetDict[ name ].clone()
    }
  }

  //

  getBondProxy (index?: number) {
    return new BondProxy(this, index)
  }

  getAtomProxy (index?: number) {
    return new AtomProxy(this, index)
  }

  getResidueProxy (index?: number) {
    return new ResidueProxy(this, index)
  }

  getChainProxy (index?: number) {
    return new ChainProxy(this, index)
  }

  getModelProxy (index?: number) {
    return new ModelProxy(this, index)
  }

  //

  getBondSet (/* selection */) {
    // TODO implement selection parameter

    const n = this.bondStore.count
    const bondSet = new BitArray(n)
    const atomSet = this.atomSet

    if (atomSet) {
      if (atomSet.isAllSet()) {
        bondSet.setAll()
      } else if (atomSet.isAllClear()) {
        bondSet.clearAll()
      } else {
        const bp = this.getBondProxy()

        for (let i = 0; i < n; ++i) {
          bp.index = i
          if (atomSet.isSet(bp.atomIndex1, bp.atomIndex2)) {
            bondSet.set(bp.index)
          }
        }
      }
    } else {
      bondSet.setAll()
    }

    return bondSet
  }

  getBackboneBondSet (/* selection */) {
    // TODO implement selection parameter

    const n = this.backboneBondStore.count
    const backboneBondSet = new BitArray(n)
    const backboneAtomSet = this.atomSetCache.__backbone

    if (backboneAtomSet) {
      const bp = this.getBondProxy()
      bp.bondStore = this.backboneBondStore

      for (let i = 0; i < n; ++i) {
        bp.index = i
        if (backboneAtomSet.isSet(bp.atomIndex1, bp.atomIndex2)) {
          backboneBondSet.set(bp.index)
        }
      }
    } else {
      backboneBondSet.setAll()
    }

    return backboneBondSet
  }

  getRungBondSet (/* selection */) {
    // TODO implement selection parameter

    const n = this.rungBondStore.count
    const rungBondSet = new BitArray(n)
    const rungAtomSet = this.atomSetCache.__rung

    if (rungAtomSet) {
      const bp = this.getBondProxy()
      bp.bondStore = this.rungBondStore

      for (let i = 0; i < n; ++i) {
        bp.index = i
        if (rungAtomSet.isSet(bp.atomIndex1, bp.atomIndex2)) {
          rungBondSet.set(bp.index)
        }
      }
    } else {
      rungBondSet.setAll()
    }

    return rungBondSet
  }

  /**
   * Get a set of atoms
   * @param  {Boolean|Selection|BitArray} selection - object defining how to
   *                                      initialize the atom set.
   *                                      Boolean: init with value;
   *                                      Selection: init with selection;
   *                                      BitArray: return bit array
   * @return {BitArray} set of atoms
   */
  getAtomSet (selection?: boolean|Selection|BitArray) {
    const n = this.atomStore.count

    if (selection === undefined) {
      return new BitArray(n, true)
    } else if (selection instanceof BitArray) {
      return selection
    } else if (selection === true) {
      return new BitArray(n, true)
    } else if (selection && selection.test) {
      const seleString = selection.string
      if (seleString in this.atomSetCache) {
        return this.atomSetCache[ seleString ]
      } else {
        if (seleString === '') {
          return new BitArray(n, true)
        } else {
          const atomSet = new BitArray(n)
          this.eachAtom(function (ap: AtomProxy) {
            atomSet.set(ap.index)
          }, selection)
          this.atomSetCache[ seleString ] = atomSet
          return atomSet
        }
      }
    } else if (selection === false) {
      return new BitArray(n)
    }

    return new BitArray(n, true)
  }

  /**
   * Get set of atoms around a set of atoms from a selection
   * @param  {Selection} selection - the selection object
   * @param  {Number} radius - radius to select within
   * @return {BitArray} set of atoms
   */
  getAtomSetWithinSelection (selection: boolean|Selection|BitArray, radius: number) {
    const spatialHash = this.spatialHash
    const atomSet = this.getAtomSet(false)
    const ap = this.getAtomProxy()

    if (!spatialHash) return atomSet

    this.getAtomSet(selection).forEach(function (idx: number) {
      ap.index = idx
      spatialHash.within(ap.x, ap.y, ap.z, radius).forEach(function (idx2: number) {
        atomSet.set(idx2)
      })
    })

    return atomSet
  }

  /**
   * Get set of atoms around a point
   * @param  {Vector3|AtomProxy} point - the point
   * @param  {Number} radius - radius to select within
   * @return {BitArray} set of atoms
   */
  getAtomSetWithinPoint (point: Vector3|AtomProxy, radius: number) {
    const p = point
    const atomSet = this.getAtomSet(false)

    if (!this.spatialHash) return atomSet

    this.spatialHash.within(p.x, p.y, p.z, radius).forEach(function (idx: number) {
      atomSet.set(idx)
    })

    return atomSet
  }

  /**
   * Get set of atoms within a volume
   * @param  {Volume} volume - the volume
   * @param  {Number} radius - radius to select within
   * @param  {[type]} minValue - minimum value to be considered as within the volume
   * @param  {[type]} maxValue - maximum value to be considered as within the volume
   * @param  {[type]} outside - use only values falling outside of the min/max values
   * @return {BitArray} set of atoms
   */
  getAtomSetWithinVolume (volume: Volume, radius: number, minValue: number, maxValue: number, outside: boolean) {
    const fv = new FilteredVolume(volume, minValue, maxValue, outside) as any  // TODO

    const dp = fv.getDataPosition()
    const n = dp.length
    const r = fv.matrix.getMaxScaleOnAxis()
    const atomSet = this.getAtomSet(false)

    if (!this.spatialHash) return atomSet

    for (let i = 0; i < n; i += 3) {
      this.spatialHash.within(dp[ i ], dp[ i + 1 ], dp[ i + 2 ], r).forEach(function (idx) {
        atomSet.set(idx)
      })
    }

    return atomSet
  }

  /**
   * Get set of all atoms within the groups of a selection
   * @param  {Selection} selection - the selection object
   * @return {BitArray} set of atoms
   */
  getAtomSetWithinGroup (selection: boolean|Selection) {
    const atomResidueIndex = this.atomStore.residueIndex
    const atomSet = this.getAtomSet(false)
    const rp = this.getResidueProxy()

    this.getAtomSet(selection).forEach(function (idx) {
      rp.index = atomResidueIndex[ idx ]
      for (let idx2 = rp.atomOffset; idx2 <= rp.atomEnd; ++idx2) {
        atomSet.set(idx2)
      }
    })

    return atomSet
  }

  //

  getSelection (): undefined|Selection {
    return
  }

  getStructure (): Structure|StructureView {
    return this
  }

  /**
   * Entity iterator
   * @param  {function(entity: Entity)} callback - the callback
   * @param  {EntityType} type - entity type
   * @return {undefined}
   */
  eachEntity (callback: (entity: Entity) => void, type: number) {
    this.entityList.forEach(function (entity) {
      if (type === undefined || entity.getEntityType() === type) {
        callback(entity)
      }
    })
  }

  /**
   * Bond iterator
   * @param  {function(bond: BondProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachBond (callback: (entity: BondProxy) => void, selection?: Selection) {
    const bp = this.getBondProxy()
    let bondSet

    if (selection && selection.test) {
      bondSet = this.getBondSet(/*selection*/)
      if (this.bondSet) {
        bondSet.intersection(this.bondSet)
      }
    }

    if (bondSet) {
      bondSet.forEach(function (index) {
        bp.index = index
        callback(bp)
      })
    } else {
      const n = this.bondStore.count
      for (let i = 0; i < n; ++i) {
        bp.index = i
        callback(bp)
      }
    }
  }

  /**
   * Atom iterator
   * @param  {function(atom: AtomProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachAtom (callback: (entity: AtomProxy) => void, selection?: Selection) {
    if (selection && selection.test) {
      this.eachModel(function (mp) {
        mp.eachAtom(callback, selection)
      }, selection)
    } else {
      const an = this.atomStore.count
      const ap = this.getAtomProxy()
      for (let i = 0; i < an; ++i) {
        ap.index = i
        callback(ap)
      }
    }
  }

  /**
   * Residue iterator
   * @param  {function(residue: ResidueProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachResidue (callback: (entity: ResidueProxy) => void, selection?: Selection) {
    if (selection && selection.test) {
      const mn = this.modelStore.count
      const mp = this.getModelProxy()
      const modelOnlyTest = selection.modelOnlyTest
      if (modelOnlyTest) {
        for (let i = 0; i < mn; ++i) {
          mp.index = i
          if (modelOnlyTest(mp)) {
            mp.eachResidue(callback, selection)
          }
        }
      } else {
        for (let i = 0; i < mn; ++i) {
          mp.index = i
          mp.eachResidue(callback, selection)
        }
      }
    } else {
      const rn = this.residueStore.count
      const rp = this.getResidueProxy()
      for (let i = 0; i < rn; ++i) {
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
  eachResidueN (n: number, callback: (...entityArray: ResidueProxy[]) => void) {
    const rn = this.residueStore.count
    if (rn < n) return
    const array: ResidueProxy[] = new Array(n)

    for (let i = 0; i < n; ++i) {
      array[ i ] = this.getResidueProxy(i)
    }
    callback.apply(this, array)

    for (let j = n; j < rn; ++j) {
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
  eachPolymer (callback: (entity: Polymer) => void, selection?: Selection) {
    if (selection && selection.modelOnlyTest) {
      const modelOnlyTest = selection.modelOnlyTest

      this.eachModel(function (mp) {
        if (modelOnlyTest(mp)) {
          mp.eachPolymer(callback, selection)
        }
      })
    } else {
      this.eachModel(function (mp) {
        mp.eachPolymer(callback, selection)
      })
    }
  }

  /**
   * Chain iterator
   * @param  {function(chain: ChainProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachChain (callback: (entity: ChainProxy) => void, selection?: Selection) {
    if (selection && selection.test) {
      this.eachModel(function (mp) {
        mp.eachChain(callback, selection)
      })
    } else {
      const cn = this.chainStore.count
      const cp = this.getChainProxy()
      for (let i = 0; i < cn; ++i) {
        cp.index = i
        callback(cp)
      }
    }
  }

  /**
   * Model iterator
   * @param  {function(model: ModelProxy)} callback - the callback
   * @param  {Selection} [selection] - the selection
   * @return {undefined}
   */
  eachModel (callback: (entity: ModelProxy) => void, selection?: Selection) {
    const n = this.modelStore.count
    const mp = this.getModelProxy()

    if (selection && selection.test) {
      const modelOnlyTest = selection.modelOnlyTest
      if (modelOnlyTest) {
        for (let i = 0; i < n; ++i) {
          mp.index = i
          if (modelOnlyTest(mp)) {
            callback(mp)
          }
        }
      } else {
        for (let i = 0; i < n; ++i) {
          mp.index = i
          callback(mp)
        }
      }
    } else {
      for (let i = 0; i < n; ++i) {
        mp.index = i
        callback(mp)
      }
    }
  }

  //

  getAtomData (params: AtomDataParams) {
    const p = Object.assign({}, params)
    if (p.colorParams) p.colorParams.structure = this.getStructure()

    const what = p.what
    const atomSet = defaults(p.atomSet, this.atomSet)

    let radiusFactory: any  // TODO
    let colormaker: any  // TODO

    const atomData: AtomData = {}
    const ap = this.getAtomProxy()
    const atomCount = atomSet.getSize()

    if (!what || what.position) {
      atomData.position = new Float32Array(atomCount * 3)
    }
    if ((!what || what.color) && p.colorParams) {
      atomData.color = new Float32Array(atomCount * 3)
      colormaker = ColormakerRegistry.getScheme(p.colorParams)
    }
    if (!what || what.picking) {
      atomData.picking = new AtomPicker(new Float32Array(atomCount), this.getStructure())
    }
    if (!what || what.radius) {
      atomData.radius = new Float32Array(atomCount)
      radiusFactory = new RadiusFactory(p.radiusParams as RadiusParams)
    }
    if (!what || what.index) {
      atomData.index = new Uint32Array(atomCount)
    }

    const {position, color, picking, radius, index} = atomData

    atomSet.forEach((idx: number, i: number) => {
      const i3 = i * 3
      ap.index = idx
      if (position) {
        ap.positionToArray(position, i3)
      }
      if (color) {
        colormaker.atomColorToArray(ap, color, i3)
      }
      if (picking) {
        picking.array![ i ] = idx
      }
      if (radius) {
        radius[ i ] = radiusFactory.atomRadius(ap)
      }
      if (index) {
        index[ i ] = idx
      }
    })
    return atomData
  }

  getBondData (params: BondDataParams) {
    const p = Object.assign({}, params)
    if (p.colorParams) p.colorParams.structure = this.getStructure()

    const what = p.what
    const bondSet = defaults(p.bondSet, this.bondSet)
    const multipleBond = defaults(p.multipleBond, 'off')
    const isMulti = multipleBond !== 'off'
    const isOffset = multipleBond === 'offset'
    const bondScale = defaults(p.bondScale, 0.4)
    const bondSpacing = defaults(p.bondSpacing, 1.0)

    let radiusFactory: any  // TODO
    let colormaker: any  // TODO

    const bondData: BondData = {}
    const bp = this.getBondProxy()
    if (p.bondStore) bp.bondStore = p.bondStore
    const ap1 = this.getAtomProxy()
    const ap2 = this.getAtomProxy()

    let bondCount: number
    if (isMulti) {
      const storeBondOrder = bp.bondStore.bondOrder
      bondCount = 0
      bondSet.forEach(function (index: number) {
        bondCount += storeBondOrder[ index ]
      })
    } else {
      bondCount = bondSet.getSize()
    }

    if (!what || what.position) {
      bondData.position1 = new Float32Array(bondCount * 3)
      bondData.position2 = new Float32Array(bondCount * 3)
    }
    if ((!what || what.color) && p.colorParams) {
      bondData.color = new Float32Array(bondCount * 3)
      bondData.color2 = new Float32Array(bondCount * 3)
      colormaker = ColormakerRegistry.getScheme(p.colorParams)
    }
    if (!what || what.picking) {
      bondData.picking = new BondPicker(new Float32Array(bondCount), this.getStructure(), p.bondStore!) as any
    }
    if (!what || what.radius || (isMulti && what.position)) {
      radiusFactory = new RadiusFactory(p.radiusParams as RadiusParams)
    }
    if (!what || what.radius) {
      bondData.radius = new Float32Array(bondCount)
      if (p.radius2) {
        bondData.radius2 = new Float32Array(bondCount)
      }
    }

    const {position1, position2, color, color2, picking, radius, radius2} = bondData

    let i = 0
    let j, i3, k, bondOrder, absOffset
    let multiRadius

    const vt = new Vector3()
    const vShortening = new Vector3()
    const vShift = new Vector3()

    bondSet.forEach((index: number) => {
      i3 = i * 3
      bp.index = index
      ap1.index = bp.atomIndex1
      ap2.index = bp.atomIndex2
      bondOrder = bp.bondOrder
      if (position1) {
        if (isMulti && bondOrder > 1) {
          const atomRadius = radiusFactory.atomRadius(ap1)
          multiRadius = atomRadius * bondScale / (0.5 * bondOrder)

          bp.calculateShiftDir(vShift)

          if (isOffset) {
            absOffset = 2 * bondSpacing * atomRadius
            vShift.multiplyScalar(absOffset)
            vShift.negate()

            // Shortening is calculated so that neighbouring double
            // bonds on tetrahedral geometry (e.g. sulphonamide)
            // are not quite touching (arccos(1.9 / 2) ~ 109deg)
            // but don't shorten beyond 10% each end or it looks odd
            vShortening.subVectors(ap2 as any, ap1 as any).multiplyScalar(  // TODO
              Math.max(0.1, absOffset / 1.88)
            )
            ap1.positionToArray(position1, i3)
            ap2.positionToArray(position2, i3)

            if (bondOrder >= 2) {
              vt.addVectors(ap1 as any, vShift).add(vShortening).toArray(position1 as any, i3 + 3)  // TODO
              vt.addVectors(ap2 as any, vShift).sub(vShortening).toArray(position2 as any, i3 + 3)  // TODO

              if (bondOrder >= 3) {
                vt.subVectors(ap1 as any, vShift).add(vShortening).toArray(position1 as any, i3 + 6)  // TODO
                vt.subVectors(ap2 as any, vShift).sub(vShortening).toArray(position2 as any, i3 + 6)  // TODO
              }
            }
          } else {
            absOffset = (bondSpacing - bondScale) * atomRadius
            vShift.multiplyScalar(absOffset)

            if (bondOrder === 2) {
              vt.addVectors(ap1 as any, vShift).toArray(position1 as any, i3)  // TODO
              vt.subVectors(ap1 as any, vShift).toArray(position1 as any, i3 + 3)  // TODO
              vt.addVectors(ap2 as any, vShift).toArray(position2 as any, i3)  // TODO
              vt.subVectors(ap2 as any, vShift).toArray(position2 as any, i3 + 3)  // TODO
            } else if (bondOrder === 3) {
              ap1.positionToArray(position1, i3)
              vt.addVectors(ap1 as any, vShift).toArray(position1 as any, i3 + 3)  // TODO
              vt.subVectors(ap1 as any, vShift).toArray(position1 as any, i3 + 6)  // TODO
              ap2.positionToArray(position2, i3)
              vt.addVectors(ap2 as any, vShift).toArray(position2 as any, i3 + 3)  // TODO
              vt.subVectors(ap2 as any, vShift).toArray(position2 as any, i3 + 6)  // TODO
            } else {
              // todo, better fallback
              ap1.positionToArray(position1, i3)
              ap2.positionToArray(position2, i3)
            }
          }
        } else {
          ap1.positionToArray(position1, i3)
          ap2.positionToArray(position2, i3)
        }
      }
      if (color && color2) {
        colormaker.bondColorToArray(bp, 1, color, i3)
        colormaker.bondColorToArray(bp, 0, color2, i3)
        if (isMulti && bondOrder > 1) {
          for (j = 1; j < bondOrder; ++j) {
            k = j * 3 + i3
            copyWithin(color, i3, k, 3)
            copyWithin(color2, i3, k, 3)
          }
        }
      }
      if (picking && picking.array) {
        picking.array[ i ] = index
        if (isMulti && bondOrder > 1) {
          for (j = 1; j < bondOrder; ++j) {
            picking.array[ i + j ] = index
          }
        }
      }
      if (radius) {
        radius[ i ] = radiusFactory.atomRadius(ap1)
        if (isMulti && bondOrder > 1) {
          multiRadius = radius[ i ] * bondScale / (isOffset ? 1 : (0.5 * bondOrder))
          for (j = isOffset ? 1 : 0; j < bondOrder; ++j) {
            radius[ i + j ] = multiRadius
          }
        }
      }
      if (radius2) {
        radius2[ i ] = radiusFactory.atomRadius(ap2)
        if (isMulti && bondOrder > 1) {
          multiRadius = radius2[ i ] * bondScale / (isOffset ? 1 : (0.5 * bondOrder))
          for (j = isOffset ? 1 : 0; j < bondOrder; ++j) {
            radius2[ i + j ] = multiRadius
          }
        }
      }
      i += isMulti ? bondOrder : 1
    })

    return bondData
  }

  getBackboneAtomData (params: AtomDataParams) {
    params = Object.assign({
      atomSet: this.atomSetCache.__backbone
    }, params)

    return this.getAtomData(params)
  }

  getBackboneBondData (params: BondDataParams) {
    params = Object.assign({
      bondSet: this.getBackboneBondSet(),
      bondStore: this.backboneBondStore
    }, params)

    return this.getBondData(params)
  }

  getRungAtomData (params: AtomDataParams) {
    params = Object.assign({
      atomSet: this.atomSetCache.__rung
    }, params)

    return this.getAtomData(params)
  }

  getRungBondData (params: BondDataParams) {
    params = Object.assign({
      bondSet: this.getRungBondSet(),
      bondStore: this.rungBondStore
    }, params)

    return this.getBondData(params)
  }

  //

  /**
   * Gets the bounding box of the (selected) structure atoms
   * @param  {Selection} [selection] - the selection
   * @param  {Box3} [box] - optional target
   * @return {Vector3} the box
   */
  getBoundingBox (selection?: Selection, box?: Box3) {
    if (Debug) Log.time('getBoundingBox')

    box = box || new Box3()

    let minX = +Infinity
    let minY = +Infinity
    let minZ = +Infinity

    let maxX = -Infinity
    let maxY = -Infinity
    let maxZ = -Infinity

    this.eachAtom(ap => {
      const x = ap.x
      const y = ap.y
      const z = ap.z

      if (x < minX) minX = x
      if (y < minY) minY = y
      if (z < minZ) minZ = z

      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
      if (z > maxZ) maxZ = z
    }, selection)

    box.min.set(minX, minY, minZ)
    box.max.set(maxX, maxY, maxZ)

    if (Debug) Log.timeEnd('getBoundingBox')

    return box
  }

  /**
   * Gets the principal axes of the (selected) structure atoms
   * @param  {Selection} [selection] - the selection
   * @return {PrincipalAxes} the principal axes
   */
  getPrincipalAxes (selection?: Selection) {
    if (Debug) Log.time('getPrincipalAxes')

    let i = 0
    const coords = new Matrix(3, this.atomCount)
    const cd = coords.data

    this.eachAtom(a => {
      cd[ i + 0 ] = a.x
      cd[ i + 1 ] = a.y
      cd[ i + 2 ] = a.z
      i += 3
    }, selection)

    if (Debug) Log.timeEnd('getPrincipalAxes')

    return new PrincipalAxes(coords)
  }

  /**
   * Gets the center of the (selected) structure atoms
   * @param  {Selection} [selection] - the selection
   * @return {Vector3} the center
   */
  atomCenter (selection?: Selection) {
    if (selection) {
      return this.getBoundingBox(selection).getCenter(new Vector3())
    } else {
      return this.center.clone()
    }
  }

  hasCoords () {
    if (this._hasCoords === undefined) {
      const atomStore = this.atomStore
      this._hasCoords = (
        arrayMin(atomStore.x) !== 0 || arrayMax(atomStore.x) !== 0 ||
        arrayMin(atomStore.y) !== 0 || arrayMax(atomStore.y) !== 0 ||
        arrayMin(atomStore.z) !== 0 || arrayMax(atomStore.z) !== 0
      ) || (
        // allow models with a single atom at the origin
        atomStore.count / this.modelStore.count === 1
      )
    }
    return this._hasCoords;
  }

  getSequence (selection?: Selection) {
    const seq: string[] = []
    const rp = this.getResidueProxy()

    this.eachAtom(function (ap: AtomProxy) {
      rp.index = ap.residueIndex
      if (ap.index === rp.traceAtomIndex) {
        seq.push(rp.getResname1())
      }
    }, selection)

    return seq
  }

  getAtomIndices (selection?: Selection) {
    if (selection && selection.string) {
      const indices: number[] = []
      this.eachAtom(function (ap: AtomProxy) {
        indices.push(ap.index)
      }, selection)
      return new Uint32Array(indices)
    } else {
      const p = { what: { index: true } }
      return this.getAtomData(p).index
    }
  }

  /**
   * Get number of unique chainnames
   * @param  {Selection} selection - limit count to selection
   * @return {Integer} count
   */
  getChainnameCount (selection?: Selection) {
    const chainnames = new Set()
    this.eachChain(function (cp: ChainProxy) {
      if (cp.residueCount) {
        chainnames.add(cp.chainname)
      }
    }, selection)

    return chainnames.size
  }

  //

  updatePosition (position: Float32Array|number[]) {
    let i = 0

    this.eachAtom(function (ap: AtomProxy) {
      ap.positionFromArray(position, i)
      i += 3
    }, undefined)

    this._hasCoords = undefined  // to trigger recalculation
  }

  refreshPosition () {
    this.getBoundingBox(undefined, this.boundingBox)
    this.boundingBox.getCenter(this.center)
    this.spatialHash = new SpatialHash(this.atomStore, this.boundingBox)
  }

  /**
   * Calls dispose() method of property objects.
   * Unsets properties to help garbage collection.
   * @return {undefined}
   */
  dispose () {
    if (this.frames) this.frames.length = 0
    if (this.boxes) this.boxes.length = 0

    this.bondStore.dispose()
    this.backboneBondStore.dispose()
    this.rungBondStore.dispose()
    this.atomStore.dispose()
    this.residueStore.dispose()
    this.chainStore.dispose()
    this.modelStore.dispose()

    delete this.bondStore
    delete this.atomStore
    delete this.residueStore
    delete this.chainStore
    delete this.modelStore

    delete this.frames
    delete this.boxes

    delete this.bondSet
    delete this.atomSet
  }
}

export default Structure
