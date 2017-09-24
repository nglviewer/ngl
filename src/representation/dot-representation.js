/**
 * @file Dot Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ExtensionFragDepth } from '../globals.js'
import { defaults } from '../utils.js'
import Representation from './representation.js'
import Volume from '../surface/volume.js'
import FilteredVolume from '../surface/filtered-volume.js'
import SphereBuffer from '../buffer/sphere-buffer.js'
import PointBuffer from '../buffer/point-buffer.js'

/**
 * Dot representation parameter object. Extends {@link RepresentationParameters}
 *
 * @typedef {Object} DotRepresentationParameters - dot representation parameters
 *
 * @property {String} thresholdType - Meaning of the threshold values. Either *value* for the literal value or *sigma* as a factor of the sigma of the data. For volume data only.
 * @property {Number} thresholdMin - Minimum value to be displayed. For volume data only.
 * @property {Number} thresholdMax - Maximum value to be displayed. For volume data only.
 * @property {Number} thresholdOut - Show only values falling outside of the treshold minumum and maximum. For volume data only.
 */

/**
 * Dot representation
 */
class DotRepresentation extends Representation {
  /**
   * Create Dot representation object
   * @param {Surface|Volume} surface - the surface or volume to be represented
   * @param {Viewer} viewer - a viewer object
   * @param {DotRepresentationParameters} params - dot representation parameters
   */
  constructor (surface, viewer, params) {
    super(surface, viewer, params)

    this.type = 'dot'

    this.parameters = Object.assign({

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
      thresholdOut: {
        type: 'boolean', rebuild: true
      },
      dotType: {
        type: 'select',
        rebuild: true,
        options: {
          '': '',
          'sphere': 'sphere',
          'point': 'point'
        }
      },
      radiusType: {
        type: 'select',
        options: {
          '': '',
          'value': 'value',
          'abs-value': 'abs-value',
          'value-min': 'value-min',
          'deviation': 'deviation',
          'size': 'size'
        }
      },
      radius: {
        type: 'number', precision: 3, max: 10.0, min: 0.001, property: 'size'
      },
      scale: {
        type: 'number', precision: 3, max: 10.0, min: 0.001
      },
      sphereDetail: true,
      disableImpostor: true,

      pointSize: {
        type: 'number', precision: 1, max: 100, min: 0, buffer: true
      },
      sizeAttenuation: {
        type: 'boolean', buffer: true
      },
      sortParticles: {
        type: 'boolean', rebuild: true
      },
      useTexture: {
        type: 'boolean', buffer: true
      },
      alphaTest: {
        type: 'range', step: 0.001, max: 1, min: 0, buffer: true
      },
      forceTransparent: {
        type: 'boolean', buffer: true
      },
      edgeBleach: {
        type: 'range', step: 0.001, max: 1, min: 0, buffer: true
      }

    }, this.parameters, {

      colorScheme: {
        type: 'select',
        update: 'color',
        options: {
          '': '',
          'value': 'value',
          'uniform': 'uniform',
          'random': 'random'
        }
      }

    })

    if (surface instanceof Volume) {
      this.surface = undefined
      this.volume = new FilteredVolume(surface)
    } else {
      this.surface = surface
      this.volume = undefined
    }

    this.init(params)
  }

  init (params) {
    var p = params || {}
    p.colorScheme = defaults(p.colorScheme, 'uniform')
    p.colorValue = defaults(p.colorValue, 0xDDDDDD)

    this.thresholdType = defaults(p.thresholdType, 'sigma')
    this.thresholdMin = defaults(p.thresholdMin, 2.0)
    this.thresholdMax = defaults(p.thresholdMax, Infinity)
    this.thresholdOut = defaults(p.thresholdOut, false)
    this.dotType = defaults(p.dotType, 'point')
    this.radius = defaults(p.radius, 0.1)
    this.scale = defaults(p.scale, 1.0)

    this.pointSize = defaults(p.pointSize, 1)
    this.sizeAttenuation = defaults(p.sizeAttenuation, true)
    this.sortParticles = defaults(p.sortParticles, false)
    this.useTexture = defaults(p.useTexture, false)
    this.alphaTest = defaults(p.alphaTest, 0.5)
    this.forceTransparent = defaults(p.forceTransparent, false)
    this.edgeBleach = defaults(p.edgeBleach, 0.0)

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
    var dotData = {}

    if (this.volume) {
      var volume = this.volume
      var thresholdMin, thresholdMax

      if (this.thresholdType === 'sigma') {
        thresholdMin = volume.getValueForSigma(this.thresholdMin)
        thresholdMax = volume.getValueForSigma(this.thresholdMax)
      } else {
        thresholdMin = this.thresholdMin
        thresholdMax = this.thresholdMax
      }
      volume.setFilter(thresholdMin, thresholdMax, this.thresholdOut)

      dotData.position = volume.getDataPosition()
      dotData.color = volume.getDataColor(this.getColorParams())
      if (this.dotType === 'sphere') {
        dotData.radius = volume.getDataSize(this.radius, this.scale)
        dotData.picking = volume.getDataPicking()
      }
    } else {
      var surface = this.surface
      dotData.position = surface.getPosition()
      dotData.color = surface.getColor(this.getColorParams())
      if (this.dotType === 'sphere') {
        dotData.radius = surface.getSize(this.radius, this.scale)
        dotData.picking = surface.getPicking()
      }
    }

    if (this.dotType === 'sphere') {
      this.dotBuffer = new SphereBuffer(
        dotData,
        this.getBufferParams({
          sphereDetail: this.sphereDetail,
          disableImpostor: this.disableImpostor,
          dullInterior: false
        })
      )
    } else {
      this.dotBuffer = new PointBuffer(
        dotData,
        this.getBufferParams({
          pointSize: this.pointSize,
          sizeAttenuation: this.sizeAttenuation,
          sortParticles: this.sortParticles,
          useTexture: this.useTexture,
          alphaTest: this.alphaTest,
          forceTransparent: this.forceTransparent,
          edgeBleach: this.edgeBleach
        })
      )
    }

    this.bufferList.push(this.dotBuffer)
  }

  update (what) {
    if (this.bufferList.length === 0) return

    what = what || {}

    var dotData = {}

    if (what.color) {
      if (this.volume) {
        dotData.color = this.volume.getDataColor(
          this.getColorParams()
        )
      } else {
        dotData.color = this.surface.getColor(
          this.getColorParams()
        )
      }
    }

    if (this.dotType === 'sphere' && (what.radius || what.scale)) {
      if (this.volume) {
        dotData.radius = this.volume.getDataSize(
          this.radius, this.scale
        )
      } else {
        dotData.radius = this.surface.getSize(
          this.radius, this.scale
        )
      }
    }

    this.dotBuffer.setAttributes(dotData)
  }

  setParameters (params, what, rebuild) {
    what = what || {}

    if (params && params.thresholdType !== undefined &&
        this.volume instanceof Volume
    ) {
      if (this.thresholdType === 'value' &&
          params.thresholdType === 'sigma'
      ) {
        this.thresholdMin = this.volume.getSigmaForValue(
          this.thresholdMin
        )
        this.thresholdMax = this.volume.getSigmaForValue(
          this.thresholdMax
        )
      } else if (this.thresholdType === 'sigma' &&
                 params.thresholdType === 'value'
      ) {
        this.thresholdMin = this.volume.getValueForSigma(
          this.thresholdMin
        )
        this.thresholdMax = this.volume.getValueForSigma(
          this.thresholdMax
        )
      }

      this.thresholdType = params.thresholdType
    }

    if (params && params.radiusType !== undefined) {
      if (params.radiusType === 'radius') {
        this.radius = 0.1
      } else {
        this.radius = params.radiusType
      }
      what.radius = true
      if (this.dotType === 'sphere' &&
          (!ExtensionFragDepth || this.disableImpostor)
      ) {
        rebuild = true
      }
    }

    if (params && params.radius !== undefined) {
      what.radius = true
      if (this.dotType === 'sphere' &&
          (!ExtensionFragDepth || this.disableImpostor)
      ) {
        rebuild = true
      }
    }

    if (params && params.scale !== undefined) {
      what.scale = true
      if (this.dotType === 'sphere' &&
          (!ExtensionFragDepth || this.disableImpostor)
      ) {
        rebuild = true
      }
    }

    super.setParameters(params, what, rebuild)

    return this
  }
}

export default DotRepresentation
