/**
 * @file Slice Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { defaults } from '../utils.js'
import Representation from './representation.js'
import ImageBuffer from '../buffer/image-buffer.js'
import VolumeSlice from '../surface/volume-slice.js'

class SliceRepresentation extends Representation {
  constructor (volume, viewer, params) {
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

  init (params) {
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

  attach (callback) {
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
            volumeSlice.getData({ colorParams: this.getColorParams() }),
            this.getBufferParams({
              filter: this.filter
            })
        )

    this.bufferList.push(sliceBuffer)
  }
}

export default SliceRepresentation
