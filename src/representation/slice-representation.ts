/**
 * @file Slice Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { defaults } from '../utils'
import Representation, { RepresentationParameters } from './representation'
import ImageBuffer, { ImageBufferParameters, ImageBufferData } from '../buffer/image-buffer'
import VolumeSlice from '../surface/volume-slice'
import Viewer from '../viewer/viewer';
import { Volume } from '../ngl';

/**
 * Slice representation parameter object. Extends {@link RepresentationParameters}
 *
 * @typedef {Object} SliceRepresentationParameters - slice representation parameters
 *
 * @property {String} filter - filter applied to map the volume data on the slice, one of "nearest", "linear", "cubic-bspline", "cubic-catmulrom", "cubic-mitchell".
 * @property {String} positionType - Meaning of the position value. Either "percent" od "coordinate".
 * @property {Number} position - position of the slice.
 * @property {String} dimension - one of "x", "y" or "z"
 * @property {String} thresholdType - Meaning of the threshold values. Either *value* for the literal value or *sigma* as a factor of the sigma of the data. For volume data only.
 * @property {Number} thresholdMin - Minimum value to be displayed. For volume data only.
 * @property {Number} thresholdMax - Maximum value to be displayed. For volume data only.
 * @property {Boolean} normalize - Flag indicating wheather to normalize the data in a slice when coloring.
 */
export interface SliceRepresentationParameters extends RepresentationParameters {
  filter: 'nearest'|'linear'|'cubic-bspline'|'cubic-catmulrom'|'cubic-mitchell'
  positionType: 'percent'|'coordinate'
  position: number
  dimension: 'x'|'y'|'z'
  thresholdType: 'value'|'sigma'
  thresholdMin: number
  thresholdMax: number
  normalize: boolean
}
/**
 * Slice representation
 */
class SliceRepresentation extends Representation {
  protected filter: 'nearest'|'linear'|'cubic-bspline'|'cubic-catmulrom'|'cubic-mitchell'
  protected positionType: 'percent'|'coordinate'
  protected position: number
  protected dimension: 'x'|'y'|'z'
  protected thresholdType: 'value'|'sigma'
  protected thresholdMin: number
  protected thresholdMax: number
  protected normalize: boolean
  protected volume: Volume
  /**
   * Create Slice representation object
   * @param {Volume} surface - the volume to be represented
   * @param {Viewer} viewer - a viewer object
   * @param {SliceRepresentationParameters} params - slice representation parameters
   */
  constructor (volume: Volume, viewer: Viewer, params: Partial<SliceRepresentationParameters>) {
    super(volume, viewer, params)

    this.type = 'slice'

    this.parameters = Object.assign({

      filter: {
        type: 'select',
        buffer: true,
        options: {
          'nearest': 'nearest',
          'linear': 'linear',
          'cubic-bspline': 'cubic-bspline',
          'cubic-catmulrom': 'cubic-catmulrom',
          'cubic-mitchell': 'cubic-mitchell'
        }
      },
      positionType: {
        type: 'select',
        rebuild: true,
        options: {
          'percent': 'percent', 'coordinate': 'coordinate'
        }
      },
      position: {
        type: 'range',
        step: 0.1,
        max: 100,
        min: 1,
        rebuild: true
      },
      dimension: {
        type: 'select',
        rebuild: true,
        options: {
          'x': 'x', 'y': 'y', 'z': 'z'
        }
      },
      thresholdType: {
        type: 'select',
        rebuild: true,
        options: {
          'value': 'value', 'sigma': 'sigma'
        }
      },
      thresholdMin: {
        type: 'number', precision: 3, max: Infinity, min: -Infinity, rebuild: true
      },
      thresholdMax: {
        type: 'number', precision: 3, max: Infinity, min: -Infinity, rebuild: true
      },
      normalize: {
        type: 'boolean', rebuild: true
      }

    }, this.parameters, {

      flatShaded: null,
      side: null,
      wireframe: null,
      linewidth: null,
      colorScheme: null,

      roughness: null,
      metalness: null,
      diffuse: null

    })

    this.volume = volume

    this.init(params)
  }

  init (params: Partial<SliceRepresentationParameters>) {
    const v = this.volume
    const p = params || {}
    p.colorDomain = defaults(p.colorDomain, [ v.min, v.max ])
    p.colorScheme = defaults(p.colorScheme, 'value')
    p.colorScale = defaults(p.colorScale, 'Spectral')

    this.colorScheme = 'value'
    this.dimension = defaults(p.dimension, 'x')
    this.filter = defaults(p.filter, 'cubic-bspline')
    this.positionType = defaults(p.positionType, 'percent')
    this.position = defaults(p.position, 30)
    this.thresholdType = defaults(p.thresholdType, 'sigma')
    this.thresholdMin = defaults(p.thresholdMin, -Infinity)
    this.thresholdMax = defaults(p.thresholdMax, Infinity)
    this.normalize = defaults(p.normalize, false)

    super.init(p)

    this.build()
  }

  attach (callback: () => void) {
    this.bufferList.forEach(buffer => {
      this.viewer.add(buffer)
    })
    this.setVisibility(this.visible)

    callback()
  }

  create () {
    const volumeSlice = new VolumeSlice(this.volume, {
      positionType: this.positionType,
      position: this.position,
      dimension: this.dimension,
      thresholdType: this.thresholdType,
      thresholdMin: this.thresholdMin,
      thresholdMax: this.thresholdMax,
      normalize: this.normalize
    })

    const sliceBuffer = new ImageBuffer(
      volumeSlice.getData({ colorParams: this.getColorParams() }) as ImageBufferData,
      this.getBufferParams({
        filter: this.filter
      }) as ImageBufferParameters
    )

    this.bufferList.push(sliceBuffer)
  }
}

export default SliceRepresentation
