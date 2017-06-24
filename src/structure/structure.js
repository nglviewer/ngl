/**
 * @file Structure
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3, Box3 } from '../../lib/three.es6.js'
import Signal from '../../lib/signals.es6.js'

import { Debug, Log, ColormakerRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import { AtomPicker, BondPicker } from '../utils/picker.js'
import { copyWithin } from '../math/array-utils.js'
import BitArray from '../utils/bitarray.js'
import RadiusFactory from '../utils/radius-factory.js'
import { Matrix } from '../math/matrix-utils.js'
import PrincipalAxes from '../math/principal-axes.js'
import SpatialHash from '../geometry/spatial-hash.js'
import FilteredVolume from '../surface/filtered-volume.js'
// import StructureView from "./structure-view.js";

import BondHash from '../store/bond-hash.js'
import BondStore from '../store/bond-store.js'
import AtomStore from '../store/atom-store.js'
import ResidueStore from '../store/residue-store.js'
import ChainStore from '../store/chain-store.js'
import ModelStore from '../store/model-store.js'

import AtomMap from '../store/atom-map.js'
import ResidueMap from '../store/residue-map.js'

import BondProxy from '../proxy/bond-proxy.js'
import AtomProxy from '../proxy/atom-proxy.js'
import ResidueProxy from '../proxy/residue-proxy.js'
import ChainProxy from '../proxy/chain-proxy.js'
import ModelProxy from '../proxy/model-proxy.js'

/**
 * Structure header object.
 * @typedef {Object} StructureHeader - structure meta data
 * @property {String} [releaseDate] - release data, YYYY-MM-DD
 * @property {String} [depositionDate] - deposition data, YYYY-MM-DD
 * @property {Float} [resolution] - experimental resolution
 * @property {Float} [rFree] - r-free value
 * @property {Float} [rWork] - r-work value
 * @property {String[]} [experimentalMethods] - experimental methods
 */

/**
 * Structure extra data.
 * @typedef {Object} StructureExtraData - structure extra data
 * @property {Object} [cif] - dictionary from cif parser
 * @property {Object[]} [sdf] - associated data items from sdf parser, one per compound
 */

/**
 * Structure
 */
class Structure {
    /**
     * @param {String} name - structure name
     * @param {String} path - source path
     */
  constructor (name, path) {
        /**
         * @type {{refreshed: Signal}}
         */
    this.signals = {
      refreshed: new Signal()
    }

    this.init(name, path)
  }

  init (name, path) {
    this.name = name
    this.path = path
    this.title = ''
    this.id = ''
        /**
         * @type {StructureHeader}
         */
    this.header = {}
        /**
         * @type {StructureExtraData}
         */
    this.extraData = {}

    this.atomSetCache = undefined
    this.atomSetDict = {}
    this.biomolDict = {}
        /**
         * @type {Entity[]}
         */
    this.entityList = []
        /**
         * @type {Unitcell}
         */
    this.unitcell = undefined

    this.frames = []
    this.boxes = []

        /**
         * @type {Validation}
         */
    this.validation = undefined

    this.bondStore = new BondStore(0)
    this.backboneBondStore = new BondStore(0)
    this.rungBondStore = new BondStore(0)
    this.atomStore = new AtomStore(0)
    this.residueStore = new ResidueStore(0)
    this.chainStore = new ChainStore(0)
    this.modelStore = new ModelStore(0)

        /**
         * @type {AtomMap}
         */
    this.atomMap = new AtomMap(this)
        /**
         * @type {ResidueMap}
         */
    this.residueMap = new ResidueMap(this)

        /**
         * @type {BondHash}
         */
    this.bondHash = undefined
        /**
         * @type {SpatialHash}
         */
    this.spatialHash = undefined

    this.atomSet = undefined
    this.bondSet = undefined

        /**
         * @type {Vector3}
         */
    this.center = undefined
        /**
         * @type {Box3}
         */
    this.boundingBox = undefined

    this._bp = this.getBondProxy()
    this._ap = this.getAtomProxy()
    this._rp = this.getResidueProxy()
    this._cp = this.getChainProxy()
  }

  get type () { return 'Structure' }

  finalizeAtoms () {
    this.atomSet = this.getAtomSet()
    this.atomCount = this.atomStore.count
    this.boundingBox = this.getBoundingBox()
    this.center = this.boundingBox.getCenter()
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

  getBondProxy (index) {
    return new BondProxy(this, index)
  }

  getAtomProxy (index) {
    return new AtomProxy(this, index)
  }

  getResidueProxy (index) {
    return new ResidueProxy(this, index)
  }

  getChainProxy (index) {
    return new ChainProxy(this, index)
  }

  getModelProxy (index) {
    return new ModelProxy(this, index)
  }

    //

  getBondSet (/* selection */) {
        // TODO implement selection parameter

    const n = this.bondStore.count
    const bondSet = new BitArray(n)
    const atomSet = this.atomSet

    if (atomSet) {
      const bp = this.getBondProxy()

      for (let i = 0; i < n; ++i) {
        bp.index = i
        if (atomSet.isSet(bp.atomIndex1, bp.atomIndex2)) {
          bondSet.set(bp.index)
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
      backboneBondSet.set_all(true)
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
      rungBondSet.set_all(true)
    }

    return rungBondSet
  }

  getAtomSet (selection) {
    let atomSet
    const n = this.atomStore.count

    if (selection instanceof BitArray) {
      atomSet = selection
    } else if (selection && selection.test) {
      var seleString = selection.string

      if (seleString in this.atomSetCache) {
        atomSet = this.atomSetCache[ seleString ]
      } else {
        atomSet = new BitArray(n)
        this.eachAtom(function (ap) {
          atomSet.set(ap.index)
        }, selection)
        this.atomSetCache[ seleString ] = atomSet
      }
    } else if (selection === false) {
      atomSet = new BitArray(n)
    } else {
      atomSet = new BitArray(n, true)
    }

    return atomSet
  }

    /**
     * Get set of atom around a set of atoms from a selection
     * @param  {Selection} selection - the selection object
     * @param  {Number} radius - radius to select within
     * @return {BitArray} set of atoms
     */
  getAtomSetWithinSelection (selection, radius) {
    const spatialHash = this.spatialHash
    const atomSet = this.getAtomSet(false)
    const ap = this.getAtomProxy()

    this.getAtomSet(selection).forEach(function (idx) {
      ap.index = idx
      spatialHash.within(ap.x, ap.y, ap.z, radius).forEach(function (idx2) {
        atomSet.set(idx2)
      })
    })

    return atomSet
  }

  getAtomSetWithinPoint (point, radius) {
    const p = point
    var atomSet = this.getAtomSet(false)

    this.spatialHash.within(p.x, p.y, p.z, radius).forEach(function (idx) {
      atomSet.set(idx)
    })

    return atomSet
  }

  getAtomSetWithinVolume (volume, radius, minValue, maxValue, outside) {
    const fv = new FilteredVolume(volume, minValue, maxValue, outside)

    const dp = fv.getDataPosition()
    const n = dp.length
    const r = fv.matrix.getMaxScaleOnAxis()
    const atomSet = this.getAtomSet(false)

    for (let i = 0; i < n; i += 3) {
      this.spatialHash.within(dp[ i ], dp[ i + 1 ], dp[ i + 2 ], r).forEach(function (idx) {
        atomSet.set(idx)
      })
    }

    return atomSet
  }

  getAtomSetWithinGroup (selection) {
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

  getSelection () {
    return false
  }

  getStructure () {
    return this
  }

    /**
     * Entity iterator
     * @param  {function(entity: Entity)} callback - the callback
     * @param  {EntityType} type - entity type
     * @return {undefined}
     */
  eachEntity (callback, type) {
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
  eachBond (callback, selection) {
    const bp = this.getBondProxy()
    let bondSet

    if (selection && selection.test) {
      bondSet = this.getBondSet(selection)
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
  eachAtom (callback, selection) {
    if (selection && selection.test) {
      this.eachModel(function (mp) {
        mp.eachAtom(callback, selection)
      }, selection)
    } else {
      var an = this.atomStore.count
      var ap = this.getAtomProxy()
      for (var i = 0; i < an; ++i) {
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
  eachResidue (callback, selection) {
    var i
    if (selection && selection.test) {
      var mn = this.modelStore.count
      var mp = this.getModelProxy()
      var modelOnlyTest = selection.modelOnlyTest
      if (modelOnlyTest) {
        for (i = 0; i < mn; ++i) {
          mp.index = i
          if (modelOnlyTest(mp)) {
            mp.eachResidue(callback, selection)
          }
        }
      } else {
        for (i = 0; i < mn; ++i) {
          mp.index = i
          mp.eachResidue(callback, selection)
        }
      }
    } else {
      var rn = this.residueStore.count
      var rp = this.getResidueProxy()
      for (i = 0; i < rn; ++i) {
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
    var i, j
    var rn = this.residueStore.count
    if (rn < n) return
    var array = new Array(n)

    for (i = 0; i < n; ++i) {
      array[ i ] = this.getResidueProxy(i)
    }
    callback.apply(this, array)

    for (j = n; j < rn; ++j) {
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
    if (selection && selection.modelOnlyTest) {
      var modelOnlyTest = selection.modelOnlyTest

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
  eachChain (callback, selection) {
    if (selection && selection.test) {
      this.eachModel(function (mp) {
        mp.eachChain(callback, selection)
      })
    } else {
      var cn = this.chainStore.count
      var cp = this.getChainProxy()
      for (var i = 0; i < cn; ++i) {
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
  eachModel (callback, selection) {
    var i
    var n = this.modelStore.count
    var mp = this.getModelProxy()

    if (selection && selection.test) {
      var modelOnlyTest = selection.modelOnlyTest
      if (modelOnlyTest) {
        for (i = 0; i < n; ++i) {
          mp.index = i
          if (modelOnlyTest(mp)) {
            callback(mp, selection)
          }
        }
      } else {
        for (i = 0; i < n; ++i) {
          mp.index = i
          callback(mp, selection)
        }
      }
    } else {
      for (i = 0; i < n; ++i) {
        mp.index = i
        callback(mp)
      }
    }
  }

    //

  getAtomData (params) {
    var p = Object.assign({}, params)
    if (p.colorParams) p.colorParams.structure = this.getStructure()

    var what = p.what
    var atomSet = defaults(p.atomSet, this.atomSet)

    var radiusFactory, colormaker
    var position, color, picking, radius, index

    var atomData = {}
    var ap = this.getAtomProxy()
    var atomCount = atomSet.getSize()

    if (!what || what.position) {
      position = new Float32Array(atomCount * 3)
      atomData.position = position
    }
    if (!what || what.color) {
      color = new Float32Array(atomCount * 3)
      atomData.color = color
      colormaker = ColormakerRegistry.getScheme(p.colorParams)
    }
    if (!what || what.picking) {
      picking = new Float32Array(atomCount)
      atomData.picking = new AtomPicker(picking, this.getStructure())
    }
    if (!what || what.radius) {
      radius = new Float32Array(atomCount)
      atomData.radius = radius
      radiusFactory = new RadiusFactory(p.radiusParams.radius, p.radiusParams.scale)
    }
    if (!what || what.index) {
      index = new Float32Array(atomCount)
      atomData.index = index
    }

    atomSet.forEach((idx, i) => {
      var i3 = i * 3
      ap.index = idx
      if (position) {
        ap.positionToArray(position, i3)
      }
      if (color) {
        colormaker.atomColorToArray(ap, color, i3)
      }
      if (picking) {
        picking[ i ] = idx
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

  getBondData (params) {
    var p = Object.assign({}, params)
    if (p.colorParams) p.colorParams.structure = this.getStructure()

    var what = p.what
    var bondSet = defaults(p.bondSet, this.bondSet)
    var multipleBond = defaults(p.multipleBond, 'off')
    var isMulti = multipleBond !== 'off'
    var isOffset = multipleBond === 'offset'
    var bondScale = defaults(p.bondScale, 0.4)
    var bondSpacing = defaults(p.bondSpacing, 1.0)

    var radiusFactory, colormaker
    var position1, position2, color1, color2, picking, radius1, radius2

    var bondData = {}
    var bp = this.getBondProxy()
    if (p.bondStore) bp.bondStore = p.bondStore
    var ap1 = this.getAtomProxy()
    var ap2 = this.getAtomProxy()
    var bondCount
    if (isMulti) {
      var storeBondOrder = bp.bondStore.bondOrder
      bondCount = 0
      bondSet.forEach(function (index) {
        bondCount += storeBondOrder[ index ]
      })
    } else {
      bondCount = bondSet.getSize()
    }

    if (!what || what.position) {
      position1 = new Float32Array(bondCount * 3)
      position2 = new Float32Array(bondCount * 3)
      bondData.position1 = position1
      bondData.position2 = position2
    }
    if (!what || what.color) {
      color1 = new Float32Array(bondCount * 3)
      color2 = new Float32Array(bondCount * 3)
      bondData.color = color1
      bondData.color2 = color2
      colormaker = ColormakerRegistry.getScheme(p.colorParams)
    }
    if (!what || what.picking) {
      picking = new Float32Array(bondCount)
      bondData.picking = new BondPicker(picking, this.getStructure(), p.bondStore)
    }
    if (!what || what.radius || (isMulti && what.position)) {
      radiusFactory = new RadiusFactory(p.radiusParams.radius, p.radiusParams.scale)
    }
    if (!what || what.radius) {
      radius1 = new Float32Array(bondCount)
      bondData.radius = radius1
      if (p.radius2) {
        radius2 = new Float32Array(bondCount)
        bondData.radius2 = radius2
      }
    }

    var i = 0

    var j, i3, k, bondOrder, radius, multiRadius, absOffset

    var vt = new Vector3()
    var vShortening = new Vector3()
    var vShift = new Vector3()

    bondSet.forEach(index => {
      i3 = i * 3
      bp.index = index
      ap1.index = bp.atomIndex1
      ap2.index = bp.atomIndex2
      bondOrder = bp.bondOrder
      if (position1) {
        if (isMulti && bondOrder > 1) {
          radius = radiusFactory.atomRadius(ap1)
          multiRadius = radius * bondScale / (0.5 * bondOrder)

          bp.calculateShiftDir(vShift)

          if (isOffset) {
            absOffset = 2 * bondSpacing * radius
            vShift.multiplyScalar(absOffset)
            vShift.negate()

                        // Shortening is calculated so that neighbouring double
                        // bonds on tetrahedral geometry (e.g. sulphonamide)
                        // are not quite touching (arccos(1.9 / 2) ~ 109deg)
                        // but don't shorten beyond 10% each end or it looks odd
            vShortening.subVectors(ap2, ap1).multiplyScalar(
                            Math.max(0.1, absOffset / 1.88)
                        )
            ap1.positionToArray(position1, i3)
            ap2.positionToArray(position2, i3)

            if (bondOrder >= 2) {
              vt.addVectors(ap1, vShift).add(vShortening).toArray(position1, i3 + 3)
              vt.addVectors(ap2, vShift).sub(vShortening).toArray(position2, i3 + 3)

              if (bondOrder >= 3) {
                vt.subVectors(ap1, vShift).add(vShortening).toArray(position1, i3 + 6)
                vt.subVectors(ap2, vShift).sub(vShortening).toArray(position2, i3 + 6)
              }
            }
          } else {
            absOffset = (bondSpacing - bondScale) * radius
            vShift.multiplyScalar(absOffset)

            if (bondOrder === 2) {
              vt.addVectors(ap1, vShift).toArray(position1, i3)
              vt.subVectors(ap1, vShift).toArray(position1, i3 + 3)
              vt.addVectors(ap2, vShift).toArray(position2, i3)
              vt.subVectors(ap2, vShift).toArray(position2, i3 + 3)
            } else if (bondOrder === 3) {
              ap1.positionToArray(position1, i3)
              vt.addVectors(ap1, vShift).toArray(position1, i3 + 3)
              vt.subVectors(ap1, vShift).toArray(position1, i3 + 6)
              ap2.positionToArray(position2, i3)
              vt.addVectors(ap2, vShift).toArray(position2, i3 + 3)
              vt.subVectors(ap2, vShift).toArray(position2, i3 + 6)
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
      if (color1) {
        colormaker.bondColorToArray(bp, 1, color1, i3)
        colormaker.bondColorToArray(bp, 0, color2, i3)
        if (isMulti && bondOrder > 1) {
          for (j = 1; j < bondOrder; ++j) {
            k = j * 3 + i3
            copyWithin(color1, i3, k, 3)
            copyWithin(color2, i3, k, 3)
          }
        }
      }
      if (picking) {
        picking[ i ] = index
        if (isMulti && bondOrder > 1) {
          for (j = 1; j < bondOrder; ++j) {
            picking[ i + j ] = index
          }
        }
      }
      if (radius1) {
        radius1[ i ] = radiusFactory.atomRadius(ap1)
        if (isMulti && bondOrder > 1) {
          multiRadius = radius1[ i ] * bondScale / (isOffset ? 1 : (0.5 * bondOrder))
          for (j = isOffset ? 1 : 0; j < bondOrder; ++j) {
            radius1[ i + j ] = multiRadius
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

  getBackboneAtomData (params) {
    params = Object.assign({
      atomSet: this.atomSetCache.__backbone
    }, params)

    return this.getAtomData(params)
  }

  getBackboneBondData (params) {
    params = Object.assign({
      bondSet: this.getBackboneBondSet(),
      bondStore: this.backboneBondStore
    }, params)

    return this.getBondData(params)
  }

  getRungAtomData (params) {
    params = Object.assign({
      atomSet: this.atomSetCache.__rung
    }, params)

    return this.getAtomData(params)
  }

  getRungBondData (params) {
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
  getBoundingBox (selection, box) {
    if (Debug) Log.time('getBoundingBox')

    box = box || new Box3()

    var minX = +Infinity
    var minY = +Infinity
    var minZ = +Infinity

    var maxX = -Infinity
    var maxY = -Infinity
    var maxZ = -Infinity

    this.eachAtom(function (ap) {
      var x = ap.x
      var y = ap.y
      var z = ap.z

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
  getPrincipalAxes (selection) {
    if (Debug) Log.time('getPrincipalAxes')

    var i = 0
    var coords = new Matrix(3, this.atomCount)
    var cd = coords.data

    this.eachAtom(function (a) {
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
  atomCenter (selection) {
    if (selection) {
      return this.getBoundingBox(selection).getCenter()
    } else {
      return this.center.clone()
    }
  }

  getSequence (selection) {
    var seq = []
    var rp = this.getResidueProxy()

    this.eachAtom(function (ap) {
      rp.index = ap.residueIndex
      if (ap.index === rp.traceAtomIndex) {
        seq.push(rp.getResname1())
      }
    }, selection)

    return seq
  }

  getAtomIndices (selection) {
    var indices

    if (selection && selection.string) {
      indices = []
      this.eachAtom(function (ap) {
        indices.push(ap.index)
      }, selection)
    } else {
      var p = { what: { index: true } }
      indices = this.getAtomData(p).index
    }

    return indices
  }

    /**
     * Get number of unique chainnames
     * @param  {Selection} selection - limit count to selection
     * @return {Integer} count
     */
  getChainnameCount (selection) {
    var chainnames = new Set()
    this.eachChain(function (cp) {
      if (cp.residueCount) {
        chainnames.add(cp.chainname)
      }
    }, selection)

    return chainnames.size
  }

    //

  updatePosition (position) {
    var i = 0

    this.eachAtom(function (ap) {
      ap.positionFromArray(position, i)
      i += 3
    })
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
    delete this.cif

    delete this.bondSet
    delete this.atomSet
  }
}

export default Structure
