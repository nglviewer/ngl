/**
 * @file Surface Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Matrix4, Vector3, Box3 } from 'three'

import { defaults } from '../utils'
import Representation, { RepresentationParameters } from './representation'
import Volume from '../surface/volume'
import SurfaceBuffer from '../buffer/surface-buffer'
import DoubleSidedBuffer from '../buffer/doublesided-buffer'
import ContourBuffer from '../buffer/contour-buffer'
import Surface from '../surface/surface';
import Viewer from '../viewer/viewer';
import {SurfaceData} from '../surface/surface'
// @ts-ignore: unused import ColormakerParameters required for declaration only
import { ColormakerParameters } from '../color/colormaker';
export type SurfaceDataFields = {position: boolean, color: boolean, index: boolean, normal: boolean, radius: boolean}

/**
 * Surface representation parameter object. Extends {@link RepresentationParameters}
 *
 * @typedef {Object} SurfaceRepresentationParameters - surface representation parameters
 *
 * @property {String} isolevelType - Meaning of the isolevel value. Either *value* for the literal value or *sigma* as a factor of the sigma of the data. For volume data only.
 * @property {Float} isolevel - The value at which to create the isosurface. For volume data only.
 * @property {Boolean} negateIsolevel - For volume data only.
 * @property {Boolean} isolevelScroll - For volume data only
 * @property {Integer} smooth - How many iterations of laplacian smoothing after surface triangulation. For volume data only.
 * @property {Boolean} background - Render the surface in the background, unlit.
 * @property {Boolean} opaqueBack - Render the back-faces (where normals point away from the camera) of the surface opaque, ignoring the transparency parameter.
 * @property {Integer} boxSize - Size of the box to triangulate volume data in. Set to zero to triangulate the whole volume. For volume data only.
 * @property {Boolean} useWorker - Weather or not to triangulate the volume asynchronously in a Web Worker. For volume data only.
 * @property {Boolean} wrap - Wrap volume data around the edges; use in conjuction with boxSize but not larger than the volume dimension. For volume data only.
 */
export interface SurfaceRepresentationParameters extends RepresentationParameters {
  isolevelType: 'value'|'sigma'
  isolevel: number
  smooth: number
  background: boolean
  opaqueBack: boolean
  boxSize: number
  useWorker: boolean
  wrap: boolean
}
/**
 * Surface representation
 */
/**
   * Create Surface representation object
   * @param {Surface|Volume} surface - the surface or volume to be represented
   * @param {Viewer} viewer - a viewer object
   * @param {SurfaceRepresentationParameters} params - surface representation parameters
   */
class SurfaceRepresentation extends Representation {
  protected surface: Surface|Volume|undefined
  protected volume: Volume|undefined
  protected boxCenter: Vector3
  protected __boxCenter: Vector3
  protected box: Box3
  protected __box: Box3
  protected _position: Vector3
  protected isolevelType: 'value'|'sigma'
  protected isolevel: number
  protected negateIsolevel: boolean
  protected isolevelScroll: boolean
  protected smooth: number
  protected background: boolean
  protected opaqueBack: boolean
  protected boxSize: number
  protected inverseMatrix: Matrix4
  protected colorVolume: Volume
  protected contour: boolean
  protected useWorker: boolean
  protected wrap: boolean

  protected __isolevel: number
  protected __smooth: number
  protected __contour: boolean
  protected __wrap: boolean
  protected __boxSize: number

  setBox: () => void

  constructor (surface: Surface, viewer: Viewer, params: Partial<SurfaceRepresentationParameters>) {
    super(surface, viewer, params)

    this.type = 'surface'

    this.parameters = Object.assign({

      isolevelType: {
        type: 'select',
        options: {
          'value': 'value', 'sigma': 'sigma'
        }
      },
      isolevel: {
        type: 'number', precision: 2, max: 1000, min: -1000
      },
      negateIsolevel: {
        type: 'boolean'
      },
      isolevelScroll: {
        type: 'boolean'
      },
      smooth: {
        type: 'integer', precision: 1, max: 10, min: 0
      },
      background: {
        type: 'boolean', rebuild: true // FIXME
      },
      opaqueBack: {
        type: 'boolean', buffer: true
      },
      boxSize: {
        type: 'integer', precision: 1, max: 100, min: 0
      },
      colorVolume: {
        type: 'hidden'
      },
      contour: {
        type: 'boolean', rebuild: true
      },
      useWorker: {
        type: 'boolean', rebuild: true
      },
      wrap: {
        type: 'boolean', rebuild: true
      }

    }, this.parameters)

    if (surface instanceof Volume) {
      this.surface = undefined
      this.volume = surface
    } else {
      this.surface = surface
      this.volume = undefined
    }

    this.boxCenter = new Vector3()
    this.__boxCenter = new Vector3()
    this.box = new Box3()
    this.__box = new Box3()

    this._position = new Vector3()
    this.inverseMatrix = new Matrix4()

    this.setBox = function setBox () {
      this._position.copy(viewer.translationGroup.position).negate()
      this._position.applyMatrix4(this.inverseMatrix)
      if (!this._position.equals(this.boxCenter)) {
        this.setParameters({ 'boxCenter': this._position })
      }
    }

    this.toBePrepared = true

    this.viewer.signals.ticked.add(this.setBox, this)

    this.init(params)
  }

  init (params: Partial<SurfaceRepresentationParameters>) {
    const p = params || {}
    p.colorScheme = defaults(p.colorScheme, 'uniform')
    p.colorValue = defaults(p.colorValue, 0xDDDDDD)

    this.isolevelType = defaults(p.isolevelType, 'sigma')
    this.isolevel = defaults(p.isolevel, 2.0)
    this.negateIsolevel = defaults(p.negateIsolevel, false)
    this.isolevelScroll = defaults(p.isolevelScroll, false)
    this.smooth = defaults(p.smooth, 0)
    this.background = defaults(p.background, false)
    this.opaqueBack = defaults(p.opaqueBack, true)
    this.boxSize = defaults(p.boxSize, 0)
    this.colorVolume = defaults(p.colorVolume, undefined)
    this.contour = defaults(p.contour, false)
    this.useWorker = defaults(p.useWorker, true)
    this.wrap = defaults(p.wrap, false)

    super.init(p)

    this.inverseMatrix.getInverse(this.matrix)

    this.build()
  }

  attach (callback: () => void) {
    this.bufferList.forEach(buffer => {
      this.viewer.add(buffer)
    })

    this.setVisibility(this.visible)

    callback()
  }

  prepare (callback: () => void) {
    if (this.volume) {
      let isolevel

      if (this.isolevelType === 'sigma') {
        isolevel = this.volume.getValueForSigma(this.isolevel)
      } else {
        isolevel = this.isolevel
      }
      if (this.negateIsolevel) isolevel *= -1

      if (!this.surface ||
        this.__isolevel !== isolevel ||
        this.__smooth !== this.smooth ||
        this.__contour !== this.contour ||
        this.__wrap !== this.wrap ||
        this.__boxSize !== this.boxSize ||
        (this.boxSize > 0 &&
            !this.__boxCenter.equals(this.boxCenter))
      ) {
        this.__isolevel = isolevel
        this.__smooth = this.smooth
        this.__contour = this.contour
        this.__wrap = this.wrap
        this.__boxSize = this.boxSize
        this.__boxCenter.copy(this.boxCenter)
        this.__box.copy(this.box)

        const onSurfaceFinish = (surface: Surface) => {
          this.surface = surface
          callback()
        }

        if (this.useWorker) {
          this.volume.getSurfaceWorker(
            isolevel, this.smooth, this.boxCenter, this.boxSize,
            this.contour, this.wrap, onSurfaceFinish
          )
        } else {
          onSurfaceFinish(
            this.volume.getSurface(
              isolevel, this.smooth, this.boxCenter, this.boxSize,
              this.contour, this.wrap
            )
          )
        }
      } else {
        callback()
      }
    } else {
      callback()
    }
  }

  create () {
    const sd = {
      position: (this.surface as Surface).getPosition(),
      color: (this.surface as Surface).getColor(this.getColorParams()),
      index: (this.surface as Surface).getIndex()
    }

    let buffer

    if (this.contour) {
      buffer = new ContourBuffer(
        sd,
        this.getBufferParams({ wireframe: false })
      )
    } else {
      Object.assign(sd, {
        normal: (this.surface as Surface).getNormal(),
        picking: (this.surface as Surface).getPicking()
      })

      const surfaceBuffer = new SurfaceBuffer(
        sd,
        this.getBufferParams({
          background: this.background,
          opaqueBack: this.opaqueBack,
          dullInterior: false
        })
      )

      buffer = new DoubleSidedBuffer(surfaceBuffer)
    }

    this.bufferList.push(buffer as ContourBuffer)
  }

  update (what: SurfaceDataFields) {
    if (this.bufferList.length === 0) return

    what = what || {}

    const surfaceData: Partial<SurfaceData> = {}

    if (what.position) {
      surfaceData.position = (this.surface as Surface).getPosition()
    }

    if (what.color) {
      surfaceData.color = (this.surface as Surface).getColor(
        this.getColorParams()
      )
    }

    if (what.index) {
      surfaceData.index = (this.surface as Surface).getIndex()
    }

    if (what.normal) {
      surfaceData.normal = (this.surface as Surface).getNormal()
    }

    this.bufferList.forEach(function (buffer) {
      buffer.setAttributes(surfaceData)
    })
  }

  /**
   * Set representation parameters
   * @alias SurfaceRepresentation#setParameters
   * @param {SurfaceRepresentationParameters} params - surface parameter object
   * @param {Object} [what] - buffer data attributes to be updated,
   *                        note that this needs to be implemented in the
   *                        derived classes. Generally it allows more
   *                        fine-grained control over updating than
   *                        forcing a rebuild.
   * @param {Boolean} what.position - update position data
   * @param {Boolean} what.color - update color data
   * @param {Boolean} [rebuild] - whether or not to rebuild the representation
   * @return {SurfaceRepresentation} this object
   */
  setParameters (params: Partial<SurfaceRepresentationParameters>, what?: SurfaceDataFields, rebuild?: boolean) {
    if (params && params.isolevelType !== undefined &&
      this.volume
    ) {
      if (this.isolevelType === 'value' &&
        params.isolevelType === 'sigma'
      ) {
        this.isolevel = this.volume.getSigmaForValue(this.isolevel)
      } else if (this.isolevelType === 'sigma' &&
        params.isolevelType === 'value'
      ) {
        this.isolevel = this.volume.getValueForSigma(this.isolevel)
      }

      this.isolevelType = params.isolevelType
    }

    if (params && params.boxCenter) {
      this.boxCenter.copy(params.boxCenter)
      delete params.boxCenter
    }

    // Forbid wireframe && contour as in molsurface
    if (params && params.wireframe && (
      params.contour || (params.contour === undefined && this.contour)
    )) {
      params.wireframe = false
    }

    super.setParameters(params, what, rebuild)

    if (params.matrix) {
      this.inverseMatrix.getInverse(params.matrix)
    }

    if (this.volume) {
      this.volume.getBox(this.boxCenter, this.boxSize, this.box)
    }

    if (params && params.colorVolume !== undefined) {
      if (what) what.color = true
    }

    if (this.surface && (
      params.isolevel !== undefined ||
      params.negateIsolevel !== undefined ||
      params.smooth !== undefined ||
      params.wrap !== undefined ||
      params.boxSize !== undefined ||
      (this.boxSize > 0 &&
        !this.__box.equals(this.box))
    )) {
      this.build({
        'position': true,
        'color': true,
        'index': true,
        'normal': !this.contour
      })
    }

    return this
  }

  getColorParams () {
    const p = super.getColorParams()

    p.volume = this.colorVolume

    return p
  }

  dispose () {
    this.viewer.signals.ticked.remove(this.setBox, this)

    super.dispose()
  }
}

export default SurfaceRepresentation
