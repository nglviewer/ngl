/**
 * @file Molecular Surface Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { RepresentationRegistry } from '../globals'
import { defaults } from '../utils'
import StructureRepresentation, { StructureRepresentationParameters, StructureRepresentationData } from './structure-representation'
import MolecularSurface, { MolecularSurfaceParameters } from '../surface/molecular-surface'
import SurfaceBuffer from '../buffer/surface-buffer'
import ContourBuffer from '../buffer/contour-buffer'
import DoubleSidedBuffer from '../buffer/doublesided-buffer'
import Selection from '../selection/selection'
import Viewer from '../viewer/viewer';
// @ts-ignore: unused import Volume required for declaration only
import { Structure, Vector3, Volume } from '../ngl';
import StructureView from '../structure/structure-view';
import { SurfaceDataFields } from './surface-representation';
import Surface, {SurfaceData} from '../surface/surface';

export interface MolecularSurfaceRepresentationParameters extends StructureRepresentationParameters {
  surfaceType: 'vws'|'sas'|'ms'|'ses'|'av'
  probeRadius: number
  smooth: number
  scaleFactor: number
  cutoff: number
  contour: boolean
  background: boolean
  opaqueBack: boolean
  filterSele: string
  colorVolume: any
  useWorker: boolean
}

export interface MolecularSurfaceInfo {
  molsurf?: MolecularSurface
  sele?: string
  surface?: Surface
}

/**
 * Molecular Surface Representation
 */
class MolecularSurfaceRepresentation extends StructureRepresentation {
  protected surfaceType: 'vws'|'sas'|'ms'|'ses'|'av'
  protected probeRadius: number
  protected smooth: number
  protected scaleFactor: number
  protected cutoff: number
  protected contour: boolean
  protected background: boolean
  protected opaqueBack: boolean
  protected filterSele: string
  protected colorVolume: any
  protected useWorker: boolean

  protected __infoList: MolecularSurfaceInfo[]
  protected __forceNewMolsurf: boolean
  protected __sele: string
  protected __surfaceParams: string

  constructor (structure: Structure, viewer: Viewer, params: Partial<MolecularSurfaceRepresentationParameters>) {
    super(structure, viewer, params)

    this.type = 'surface'

    this.parameters = Object.assign({

      surfaceType: {
        type: 'select',
        rebuild: true,
        options: {
          'vws': 'vws',
          'sas': 'sas',
          'ms': 'ms',
          'ses': 'ses',
          'av': 'av'
        }
      },
      probeRadius: {
        type: 'number',
        precision: 1,
        max: 20,
        min: 0,
        rebuild: true
      },
      smooth: {
        type: 'integer',
        precision: 1,
        max: 10,
        min: 0,
        rebuild: true
      },
      scaleFactor: {
        type: 'number',
        precision: 1,
        max: 5,
        min: 0,
        rebuild: true
      },
      cutoff: {
        type: 'number',
        precision: 2,
        max: 50,
        min: 0,
        rebuild: true
      },
      contour: {
        type: 'boolean', rebuild: true
      },
      background: {
        type: 'boolean', rebuild: true // FIXME
      },
      opaqueBack: {
        type: 'boolean', buffer: true
      },
      filterSele: {
        type: 'text', rebuild: true
      },
      colorVolume: {
        type: 'hidden'
      },
      useWorker: {
        type: 'boolean', rebuild: true
      }

    }, this.parameters, {

      radius: null,
      scale: null

    })

    this.__infoList = []

    // TODO find a more direct way
    this.structure.signals.refreshed.add(() => {
      this.__forceNewMolsurf = true
    })

    this.toBePrepared = true

    this.init(params)
  }

  init (params: Partial<MolecularSurfaceRepresentationParameters>) {
    const p = params || {}
    p.colorScheme = defaults(p.colorScheme, 'uniform')
    p.colorValue = defaults(p.colorValue, 0xDDDDDD)
    p.disablePicking = defaults(p.disablePicking, true)

    this.surfaceType = defaults(p.surfaceType, 'ms')
    this.probeRadius = defaults(p.probeRadius, 1.4)
    this.smooth = defaults(p.smooth, 2)
    this.scaleFactor = defaults(p.scaleFactor, 2.0)
    this.cutoff = defaults(p.cutoff, 0.0)
    this.contour = defaults(p.contour, false)
    this.background = defaults(p.background, false)
    this.opaqueBack = defaults(p.opaqueBack, true)
    this.filterSele = defaults(p.filterSele, '')
    this.colorVolume = defaults(p.colorVolume, undefined)
    this.useWorker = defaults(p.useWorker, true)

    super.init(params)
  }

  prepareData (sview: StructureView, i: number, callback: (i: number) => void) {
    let info: MolecularSurfaceInfo = this.__infoList[ i ]
    if (!info) {
      info = {}
      this.__infoList[ i ] = info
    }

    if (!info.molsurf || info.sele !== sview.selection.string) {
      if (this.filterSele) {
        const sviewFilter = sview.structure.getView(new Selection(this.filterSele))
        const bbSize = sviewFilter.boundingBox.getSize(new Vector3())
        const maxDim = Math.max(bbSize.x, bbSize.y, bbSize.z)
        const asWithin = sview.getAtomSetWithinPoint(sviewFilter.center, (maxDim / 2) + 6.0)
        sview = sview.getView(
          new Selection(sview.getAtomSetWithinSelection(asWithin, 3).toSeleString())
        )
        if (sview.atomCount === 0) {
          callback(i)
          return
        }
      }

      info.sele = sview.selection.string
      info.molsurf = new MolecularSurface(sview)

      const p = this.getSurfaceParams()
      const onSurfaceFinish = (surface: Surface) => {
        info.surface = surface
        callback(i)
      }

      if (this.useWorker) {
        info.molsurf.getSurfaceWorker(p as MolecularSurfaceParameters, onSurfaceFinish)
      } else {
        onSurfaceFinish(info.molsurf.getSurface(p as {name: string, type: 'av'|'edt' } & MolecularSurfaceRepresentationParameters))
      }
    } else {
      callback(i)
    }
  }

  prepare (callback: () => void) {
    if (this.__forceNewMolsurf || this.__sele !== this.selection.string ||
          this.__surfaceParams !== JSON.stringify(this.getSurfaceParams())) {
      this.__infoList.forEach((info: MolecularSurfaceInfo) => {
        if (info && info.molsurf) {
          info.molsurf.dispose()
        }
      })
      this.__infoList.length = 0
    }

    if (this.structureView.atomCount === 0) {
      callback()
      return
    }

    const after = () => {
      this.__sele = this.selection.string
      this.__surfaceParams = JSON.stringify(this.getSurfaceParams())
      this.__forceNewMolsurf = false
      callback()
    }

    const name = this.assembly === 'default' ? this.defaultAssembly : this.assembly
    const assembly = this.structure.biomolDict[ name ]

    if (assembly) {
      assembly.partList.forEach((part, i) => {
        const sview = part.getView(this.structureView)
        this.prepareData(sview as StructureView, i, (_i) => {
          if (_i === assembly.partList.length - 1) after()
        })
      })
    } else {
      this.prepareData(this.structureView, 0, after)
    }
  }

  createData (sview: StructureView, i: number) {
    const info = this.__infoList[ i ]
    const surface = info.surface

    if (!surface) {
      // Surface creation bailed (no surface generated for this sview)
      return
    }

    const surfaceData = {
      position: surface!.getPosition(),
      color: surface!.getColor(this.getColorParams()),
      index: surface!.getFilteredIndex(this.filterSele, sview)
    }

    const bufferList = []

    if (surface.contour) {
      const contourBuffer = new ContourBuffer(
        surfaceData,
        this.getBufferParams({
          wireframe: false
        })
      )

      bufferList.push(contourBuffer)
    } else {
      Object.assign(surfaceData, {
        normal: surface.getNormal(),
        picking: surface.getPicking(sview.getStructure())
      })

      const surfaceBuffer = new SurfaceBuffer(
        surfaceData,
        this.getBufferParams({
          background: this.background,
          opaqueBack: this.opaqueBack,
          dullInterior: false
        })
      )

      if (this.getBufferParams().side == 'double') {
        const doubleSidedBuffer = new DoubleSidedBuffer(surfaceBuffer)
        bufferList.push(doubleSidedBuffer)
      }
      else {
        bufferList.push(surfaceBuffer)
      }
    }

    return { bufferList, info } as StructureRepresentationData
  }

  updateData (what: SurfaceDataFields, data: StructureRepresentationData) {
    const surfaceData: Partial<SurfaceData> = {}

    if (what.position || what.radius) {
      this.__forceNewMolsurf = true
      this.build()
      return
    }

    if (what.color) {
      surfaceData.color = data.info.surface.getColor(this.getColorParams())
    }

    if (what.index) {
      surfaceData.index = data.info.surface.getFilteredIndex(this.filterSele, data.sview)
    }

    data.bufferList[ 0 ].setAttributes(surfaceData)
  }

  setParameters (params: Partial<MolecularSurfaceRepresentationParameters>, what: Partial<SurfaceDataFields> = {}, rebuild?: boolean) {
    if (params && params.filterSele) {
      what.index = true
    }

    if (params && params.colorVolume !== undefined) {
      what.color = true
    }

    // forbid setting wireframe to true when contour is true
    if (params && params.wireframe && (
      params.contour || (params.contour === undefined && this.contour)
    )
    ) {
      params.wireframe = false
    }

    super.setParameters(params, what, rebuild)

    return this
  }

  getSurfaceParams (params: Partial<MolecularSurfaceRepresentationParameters> = {}) {
    const p = Object.assign({
      type: this.surfaceType as string,
      probeRadius: this.probeRadius as number,
      scaleFactor: this.scaleFactor as number,
      smooth: this.smooth && !this.contour,
      cutoff: this.cutoff as number,
      contour: this.contour as boolean,
      useWorker: this.useWorker as boolean,
      radiusParams: this.getRadiusParams()
    }, params)

    return p
  }

  getColorParams () {
    const p = super.getColorParams()

    p.volume = this.colorVolume

    return p
  }

  getAtomRadius () {
    return 0
  }

  clear () {
    super.clear()
  }

  dispose () {
    this.__infoList.forEach((info: MolecularSurfaceInfo) => {
      if (info && info.molsurf) {
        info.molsurf.dispose()
      }
    })
    this.__infoList.length = 0

    super.dispose()
  }
}

RepresentationRegistry.add('surface', MolecularSurfaceRepresentation)

export default MolecularSurfaceRepresentation
