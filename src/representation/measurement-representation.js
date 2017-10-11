/**
 * @file Measurement Representation
 * @private
 */
import { Color } from '../../lib/three.es6.js'
import Selection from '../selection/selection.js'
import { Browser } from '../globals.js'
import { defaults } from '../utils.js'
import StructureRepresentation from './structure-representation.js'
import { uniformArray, uniformArray3 } from '../math/array-utils.js'

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

    this.n = 0 // Subclass create sets value
    this.parameters = Object.assign({

      labelVisible: {
        type: 'boolean'
      },
      labelSize: {
        type: 'number', precision: 3, max: 10.0, min: 0.001
      },
      labelColor: {
        type: 'color'
      },
      labelFontFamily: {
        type: 'select',
        options: {
          'sans-serif': 'sans-serif',
          'monospace': 'monospace',
          'serif': 'serif'
        },
        buffer: 'fontFamily'
      },
      labelFontStyle: {
        type: 'select',
        options: {
          'normal': 'normal',
          'italic': 'italic'
        },
        buffer: 'fontStyle'
      },
      labelFontWeight: {
        type: 'select',
        options: {
          'normal': 'normal',
          'bold': 'bold'
        },
        buffer: 'fontWeight'
      },
      labelsdf: {
        type: 'boolean', buffer: 'sdf'
      },
      labelXOffset: {
        type: 'number', precision: 1, max: 20, min: -20, buffer: 'xOffset'
      },
      labelYOffset: {
        type: 'number', precision: 1, max: 20, min: -20, buffer: 'yOffset'
      },
      labelZOffset: {
        type: 'number', precision: 1, max: 20, min: -20, buffer: 'zOffset'
      },
      labelAttachment: {
        type: 'select',
        options: {
          'bottom-left': 'bottom-left',
          'bottom-center': 'bottom-center',
          'bottom-right': 'bottom-right',
          'middle-left': 'middle-left',
          'middle-center': 'middle-center',
          'middle-right': 'middle-right',
          'top-left': 'top-left',
          'top-center': 'top-center',
          'top-right': 'top-right'
        },
        rebuild: true
      },
      labelBorder: {
        type: 'boolean', buffer: 'showBorder'
      },
      labelBorderColor: {
        type: 'color', buffer: 'borderColor'
      },
      labelBorderWidth: {
        type: 'number', precision: 2, max: 0.3, min: 0, buffer: 'borderWidth'
      },
      labelBackground: {
        type: 'boolean', rebuild: true
      },
      labelBackgroundColor: {
        type: 'color', buffer: 'backgroundColor'
      },
      labelBackgroundMargin: {
        type: 'number', precision: 2, max: 2, min: 0, rebuild: true
      },
      labelBackgroundOpacity: {
        type: 'range', step: 0.01, max: 1, min: 0, buffer: 'backgroundOpacity'
      }
    }, this.parameters, {
      flatShaded: null,
      assembly: null
    })
  }

  init (params) {
    var p = params || {}
    this.labelVisible = defaults(p.labelVisible, true)
    this.labelSize = defaults(p.labelSize, 2.0)
    this.labelColor = defaults(p.labelColor, 0xFFFFFF)
    this.labelFontFamily = defaults(p.labelFontFamily, 'sans-serif')
    this.labelFontStyle = defaults(p.labelFontstyle, 'normal')
    this.labelFontWeight = defaults(p.labelFontWeight, 'bold')
    this.labelsdf = defaults(p.labelsdf, Browser === 'Chrome')
    this.labelXOffset = defaults(p.labelXOffset, 0.0)
    this.labelYOffset = defaults(p.labelYOffset, 0.0)
    this.labelZOffset = defaults(p.labelZOffset, 0.5)
    this.labelAttachment = defaults(p.labelAttachment, 'bottom-left')
    this.labelBorder = defaults(p.labelBorder, false)
    this.labelBorderColor = defaults(p.labelBorderColor, 'lightgrey')
    this.labelBorderWidth = defaults(p.labelBorderWidth, 0.15)
    this.labelBackground = defaults(p.labelBackground, false)
    this.labelBackgroundColor = defaults(p.labelBackgroundColor, 'lightgrey')
    this.labelBackgroundMargin = defaults(p.labelBackgroundMargin, 0.5)
    this.labelBackgroundOpacity = defaults(p.labelBackgroundOpacity, 1.0)

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

  updateData (what, data) {
    const textData = {}
    if (what.labelSize) {
      textData.size = uniformArray(this.n, this.labelSize)
    }

    if (what.labelColor) {
      const c = new Color(this.labelColor)
      textData.color = uniformArray3(this.n, c.r, c.g, c.b)
    }

    this.textBuffer.setAttributes(textData)
  }

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

    if (params && params.opacity !== undefined) {
      this.textBuffer.setParameters(
        {opacity: 1.0}) // Don't allow opaque labels?
    }

    if (params && params.labelVisible !== undefined) {
      this.setVisibility(this.visible)
    }

    return this
  }

  setVisibility (value, noRenderRequest) {
    super.setVisibility(value, true)
    if (this.textBuffer) {
      this.textBuffer.setVisibility(
        this.labelVisible && this.visible
      )
    }

    if (!noRenderRequest) this.viewer.requestRender()

    return this
  }

  getLabelBufferParams (params) {
    return super.getBufferParams(Object.assign({
      fontFamily: this.labelFontFamily,
      fontStyle: this.labelFontStyle,
      fontWeight: this.labelFontWeight,
      sdf: this.labelsdf,
      xOffset: this.labelXOffset,
      yOffset: this.labelYOffset,
      zOffset: this.labelZOffset,
      attachment: this.labelAttachment,
      showBorder: this.labelBorder,
      borderColor: this.labelBorderColor,
      borderWidth: this.labelBorderWidth,
      showBackground: this.labelBackground,
      backgroundColor: this.labelBackgroundColor,
      backgroundMargin: this.labelBackgroundMargin,
      backgroundOpacity: this.labelBackgroundOpacity,
      visible: this.labelVisible
    }, params, {
      opacity: 1.0 // Force labels at 100% opacity
    }))
  }
}

/**
 * MeasurementRepresentations take atom[Pair|Triple|Quad] parameters.
 *
 * Parses nested array of either integer atom indices or selection
 * expressions into a flat array of coordinates.
 *
 * NB: Unlike previous version, this peeks at first entry to determine
 * if atoms are given by int index or selection expression. It cannot
 * cope with mixtures
 *
 * @param  {Structure} sview The structure to which the atoms refer
 * @param  {Array} atoms Nested array of atom pairs|triples|quads as
 *   Integer indices or selection expressions
 * @return {Float32Array} Flattened array of position coordinates
 */
function parseNestedAtoms (sview, atoms) {
  const ap = sview.getAtomProxy()
  const sele = new Selection()

  const nSets = atoms.length
  if (nSets === 0) return new Float32Array(0)

  // Peek-ahead at first item to determine order and parse mode
  const order = atoms[ 0 ].length
  const seleMode = !(Number.isInteger(atoms[ 0 ][ 0 ]))

  const a = new Float32Array(nSets * order * 3)

  let p = 0
  atoms.forEach(function (group) {
    let _break = false
    for (var j = 0; j < order; j++) {
      if (seleMode) {
        sele.setString(group[ j ])
        const atomIndices = sview.getAtomIndices(sele)
        if (atomIndices.length) {
          ap.index = atomIndices[ 0 ]
        } else {
          _break = true
          break
        }
      } else {
        ap.index = group[ j ]
      }
      let offset = p + j * 3
      a[ offset++ ] = ap.x
      a[ offset++ ] = ap.y
      a[ offset++ ] = ap.z
    }
    if (!_break) p += 3 * order
  })

  return a.subarray(0, p)
}

/* out = v1 * cos(angle) + v2 * sin(angle) */
function calcArcPoint (out, center, v1, v2, angle) {
  const x = Math.cos(angle)
  const y = Math.sin(angle)
  out[ 0 ] = center[ 0 ] + v1[ 0 ] * x + v2[ 0 ] * y
  out[ 1 ] = center[ 1 ] + v1[ 1 ] * x + v2[ 1 ] * y
  out[ 2 ] = center[ 2 ] + v1[ 2 ] * x + v2[ 2 ] * y
}

export {
  MeasurementRepresentation as default,
  calcArcPoint,
  parseNestedAtoms
}
