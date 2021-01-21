/**
 * @file Structure Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ExtensionFragDepth, Mobile } from '../globals'
import { defaults } from '../utils'
import { RepresentationParameters, default as Representation } from './representation'
import Selection from '../selection/selection'
import RadiusFactory, { RadiusFactoryTypes, RadiusType } from '../utils/radius-factory'
import Structure from '../structure/structure'
import Viewer from '../viewer/viewer'
// @ts-ignore: unused import Volume required for declaration only
import { Assembly, Volume } from '../ngl';
import StructureView from '../structure/structure-view';
import AtomProxy from '../proxy/atom-proxy';
import Polymer from '../proxy/polymer';
import Buffer from '../buffer/buffer';
import { AtomDataFields, BondDataFields, AtomDataParams, BondDataParams } from '../structure/structure-data';
// @ts-ignore: unused import Surface required for declaration only
import Surface from '../surface/surface'

/**
 * Structure representation parameter object.
 * @typedef {Object} StructureRepresentationParameters - structure representation parameters
 * @mixes RepresentationParameters
 *
 * @property {String} radiusType - A list of possible sources of the radius used for rendering the representation. The radius can be based on the *vdW radius*, the *covalent radius* or the *B-factor* value of the corresponding atom. Additionally the radius can be based on the *secondary structure*. Alternatively, when set to *size*, the value from the *radius* parameter is used for all atoms.
 * @property {Float} radius - A number providing a fixed radius used for rendering the representation.
 * @property {Float} scale - A number that scales the value defined by the *radius* or the *radiusType* parameter.
 * @property {String} assembly - name of an assembly object. Included are the asymmetric unit (*AU*) corresponding to the coordinates given in the structure file, biological assemblies from *PDB*, *mmCIF* or *MMTF* files (*BU1*, *BU2*, ...), a filled (crystallographic) unitcell of a given space group (*UNITCELL*), a supercell consisting of a center unitcell and its 26 direct neighbors (*SUPERCELL*). Set to *default* to use the default asemmbly of the structure object.
 */
export interface StructureRepresentationParameters extends RepresentationParameters {
  radiusType: string
  radius: number
  scale: number
  assembly: string
}
export interface StructureRepresentationData {
  bufferList: Buffer[]
  polymerList?: Polymer[]
  sview?: StructureView | Structure
  [k: string]: any
}
/**
 * Structure representation
 * @interface
 */
abstract class StructureRepresentation extends Representation {

  protected selection: Selection
  protected dataList: StructureRepresentationData[]
  structure: Structure
  structureView: StructureView

  protected radiusType: RadiusType
  protected radiusData: {[k: number]: number}
  protected radiusSize: number
  protected radiusScale: number
  protected assembly: string
  protected defaultAssembly: string
  protected needsBuild: boolean

  /**
   * Create Structure representation object
   * @param {Structure} structure - the structure to be represented
   * @param {Viewer} viewer - a viewer object
   * @param {StructureRepresentationParameters} params - structure representation parameters
   */
  constructor (structure: Structure, viewer: Viewer, params: Partial<StructureRepresentationParameters>) {
    const p = params || {}

    super(structure, viewer, p)

    this.type = 'structure'

    this.parameters = Object.assign({
      radiusType: {
        type: 'select', options: RadiusFactory.types
      },
      radiusData: {
        type: 'hidden'
      },
      radiusSize: {
        type: 'number', precision: 3, max: 10.0, min: 0.001
      },
      radiusScale: {
        type: 'number', precision: 3, max: 10.0, min: 0.001
      },
      assembly: null,
      defaultAssembly: {
        type: 'hidden'
      }
    }, this.parameters)

    /**
     * @type {Selection}
     * @private
     */
    this.selection = new Selection(p.sele)

    /**
     * @type {Array}
     * @private
     */
    this.dataList = []

    /**
     * @type {Structure}
     */
    this.structure = structure

    /**
     * @type {StructureView}
     */
    this.structureView = this.structure.getView(this.selection)

    if (structure.biomolDict) {
      const biomolOptions:{[key: string]: string} = {
        'default': 'default',
        '': (structure.unitcell ? 'AU' : 'FULL')
      }
      Object.keys(structure.biomolDict).forEach(function (k) {
        biomolOptions[ k ] = k
      })
      this.parameters.assembly = {
        type: 'select',
        options: biomolOptions,
        rebuild: true
      }
    } else {
      this.parameters.assembly = null
    }
  }

  get defaultScale () {
    return {
      'vdw': 1.0,
      'covalent': 1.0,
      'bfactor': 0.01,
      'sstruc': 1.0
    }
  }

  init (params: Partial<StructureRepresentationParameters>) {
    const p = params || {}
    p.colorScheme = defaults(p.colorScheme, 'element')

    this.setRadius(p.radius, p)

    this.radiusType = defaults(p.radiusType, 'vdw')
    this.radiusData = defaults(p.radiusData, {})
    this.radiusSize = defaults(p.radiusSize, 1.0)
    this.radiusScale = defaults(p.radiusScale, 1.0)
    this.assembly = defaults(p.assembly, 'default')
    this.defaultAssembly = defaults(p.defaultAssembly, '')

    if (p.quality === 'auto') {
      p.quality = this.getQuality()
    }

    super.init(p)

    this.selection.signals.stringChanged.add((/* sele */) => {
      this.build()
    })

    this.build()
  }

  setRadius (value: string | number | undefined, p: Partial<StructureRepresentationParameters>) {
    const types = Object.keys(RadiusFactoryTypes)

    if (typeof value === 'string' && types.includes(value.toLowerCase())) {
      p.radiusType = value
    } else if (value !== undefined) {
      p.radiusType = 'size'
      p.radiusSize = value
    }

    return this
  }

  getAssembly (): Assembly {
    const name = this.assembly === 'default' ? this.defaultAssembly : this.assembly
    return this.structure.biomolDict[ name ]
  }

  getQuality () {
    let atomCount
    const s = this.structureView
    const assembly = this.getAssembly()
    if (assembly) {
      atomCount = assembly.getAtomCount(s)
    } else {
      atomCount = s.atomCount
    }
    if (Mobile) {
      atomCount *= 4
    }
    const backboneOnly = s.atomStore.count / s.residueStore.count < 2
    if (backboneOnly) {
      atomCount *= 10
    }

    if (atomCount < 15000) {
      return 'high'
    } else if (atomCount < 80000) {
      return 'medium'
    } else {
      return 'low'
    }
  }

  create () {
    if (this.structureView.atomCount === 0) return

    if (!this.structureView.hasCoords()) {
      this.needsBuild = true
      return
    } else {
      this.needsBuild = false
    }

    const assembly = this.getAssembly()

    if (assembly) {
      assembly.partList.forEach((part, i) => {
        const sview = <StructureView>part.getView(this.structureView)
        if (sview.atomCount === 0) return
        const data = this.createData(sview, i)
        if (data) {
          data.sview = sview
          data.instanceList = part.getInstanceList()
          this.dataList.push(data)
        }
      })
    } else {
      const data = this.createData(this.structureView, 0)
      if (data) {
        data.sview = this.structureView
        this.dataList.push(data)
      }
    }
  }

  abstract createData (sview: StructureView, k?: number): StructureRepresentationData|undefined

  update (what: AtomDataFields|BondDataFields) {
    if (this.lazy && !this.visible) {
      Object.assign(this.lazyProps.what, what)
      return
    }

    if (this.needsBuild) {
      this.build()
      return
    }

    this.dataList.forEach((data) => {
      if (data.bufferList.length > 0) {
        this.updateData(what, data)
      }
    }, this)
  }

  updateData (what?: AtomDataFields|BondDataFields, data?: any) {
    this.build()
  }

  getColorParams () {
    return {
      ...super.getColorParams(),
      structure: this.structure
    }
  }

  getRadiusParams (param?: any) {
    return {
      type: this.radiusType,
      scale: this.radiusScale,
      size: this.radiusSize,
      data: this.radiusData
    }
  }

  getAtomParams (what?: AtomDataFields, params?: AtomDataParams) {
    return Object.assign({
      what: what,
      colorParams: this.getColorParams(),
      radiusParams: this.getRadiusParams()
    }, params)
  }

  getBondParams (what?: BondDataFields, params?: BondDataParams) {
    return Object.assign({
      what: what,
      colorParams: this.getColorParams(),
      radiusParams: this.getRadiusParams()
    }, params)
  }

  getAtomRadius (atom: AtomProxy) {
    if (this.structureView.atomSet!.isSet(atom.index)) {
      const radiusFactory = new RadiusFactory(this.getRadiusParams())
      return radiusFactory.atomRadius(atom)
    }
    return 0
  }

  /**
   * Set representation parameters
   * @alias StructureRepresentation#setSelection
   * @param {String} string - selection string, see {@tutorial selection-language}
   * @param {Boolean} [silent] - don't trigger a change event in the selection
   * @return {StructureRepresentation} this object
   */
  setSelection (string: string, silent?: boolean) {
    this.selection.setString(string, silent)

    return this
  }

  /**
   * Set representation parameters
   * @alias StructureRepresentation#setParameters
   * @param {StructureRepresentationParameters} params - structure parameter object
   * @param {Object} [what] - buffer data attributes to be updated,
   *                        note that this needs to be implemented in the
   *                        derived classes. Generally it allows more
   *                        fine-grained control over updating than
   *                        forcing a rebuild.
   * @param {Boolean} what.position - update position data
   * @param {Boolean} what.color - update color data
   * @param {Boolean} [rebuild] - whether or not to rebuild the representation
   * @return {StructureRepresentation} this object
   */
  setParameters (params: Partial<StructureRepresentationParameters>, what: AtomDataFields = {}, rebuild = false) {
    const p = params || {}

    this.setRadius(p.radius, p)

    if (p.radiusType !== undefined || p.radiusData !== undefined || p.radiusSize !== undefined || p.radiusScale !== undefined) {
      what.radius = true
      if (!ExtensionFragDepth || this.disableImpostor) {
        rebuild = true
      }
    }

    if (p.defaultAssembly !== undefined &&
        p.defaultAssembly !== this.defaultAssembly &&
        ((this.assembly === 'default' && p.assembly === undefined) ||
          p.assembly === 'default')
    ) {
      rebuild = true
    }

    super.setParameters(p, what, rebuild)

    return this
  }

  getParameters () {
    const params = Object.assign(
      super.getParameters(),
      {
        sele: this.selection ? this.selection.string : undefined,
        defaultAssembly: this.defaultAssembly
      }
    )

    return params
  }

  attach (callback: ()=> void) {
    const viewer = this.viewer
    const bufferList = this.bufferList

    this.dataList.forEach(function (data) {
      data.bufferList.forEach(function (buffer) {
        bufferList.push(buffer)
        viewer.add(buffer, data.instanceList)
      })
    })

    this.setVisibility(this.visible)
    callback()
  }

  clear () {
    this.dataList.length = 0

    super.clear()
  }

  dispose () {
    this.structureView.dispose()

    delete this.structure
    delete this.structureView

    super.dispose()
  }
}

export default StructureRepresentation
