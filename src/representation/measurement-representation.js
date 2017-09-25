/**
 * @file Measurement Representation
 * @private
 */

import { Browser } from '../globals.js'
import StructureRepresentation from './structure-representation.js'
import { defaults } from '../utils.js'

/**
 * Measurement representation parameter object.
 * @typedef {Object} MeasurementRepresentationParameters - measurement representation parameters
 * @mixes RepresentationParameters
 * @mixes StructureRepresentationParameters
 *
 * @property {Float} labelSize - size of the distance label
 * @property {Color} labelColor - color of the distance label
 * @property {Boolean} labelVisible - visibility of the distance label
 * @property {Float} labelZOffset - offset in z-direction (i.e. in camera direction)
 */

/**
 * Measurement representation
 */
class MeasurementRepresentation extends StructureRepresentation {
  /**
   * Handles common label settings and position logic for
   * distance and angle representations
   *
   */
  constructor (structure, viewer, params) {
    super(structure, viewer, params)

    this.parameters = Object.assign({

      labelSize: {
        type: 'number', precision: 3, max: 10.0, min: 0.001
      },
      labelColor: {
        type: 'color'
      },
      labelVisible: {
        type: 'boolean'
      },
      labelZOffset: {
        type: 'number', precision: 1, max: 20, min: -20, buffer: 'zOffset'
      }
    }, this.parameters, {
      flatShaded: null,
      assembly: null
    })
  }

  init (params) {
    var p = params || {}
    this.fontFamily = defaults(p.fontFamily, 'sans-serif')
    this.fontStyle = defaults(p.fontStyle, 'normal')
    this.fontWeight = defaults(p.fontWeight, 'bold')
    this.sdf = defaults(p.sdf, Browser !== 'Firefox')  // FIXME
    this.labelSize = defaults(p.labelSize, 2.0)
    this.labelColor = defaults(p.labelColor, 0xFFFFFF)
    this.labelVisible = defaults(p.labelVisible, true)
    this.labelZOffset = defaults(p.labelZOffset, 0.5)

    super.init(p)
  }

  // All measurements need to rebuild on position change
  update (what) {
    if (what.position) {
      this.build()
    } else {
      super.update(what)
    }
  }

  /* TODO: Pull up textbuffer behaviour
  updateData (what, data) {}
  setVisibility (value, noRenderRequest) {}
  */

  setParameters (params) {
    var rebuild = false
    var what = {}

    if (params && params.labelSize) {
      what.labelSize = true
    }

    if (params && (params.labelColor || params.labelColor === 0x000000)) {
      what.labelColor = true
    }

    super.setParameters(params, what, rebuild)

    if (params && params.labelVisible !== undefined) {
      this.setVisibility(this.visible)
    }

    return this
  }
}

export default MeasurementRepresentation
