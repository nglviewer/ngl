/**
 * @file Measurement Representation
 * @author Fred Ludlow <fred.ludlow@gmail.com>
 * @private
 */

// @ts-ignore: unused import Vector3, Matrix4 required for declaration only
import { Color, Vector3, Matrix4 } from 'three'

import Selection from '../selection/selection'
import { Browser } from '../globals'
import { defaults } from '../utils'
import StructureRepresentation, { StructureRepresentationParameters } from './structure-representation'
import { uniformArray, uniformArray3 } from '../math/array-utils'
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import StructureView from '../structure/structure-view';
import { LabelRepresentationParameters } from './label-representation';
import TextBuffer, { TextBufferData } from '../buffer/text-buffer';

export interface LabelDataField {
  position?: boolean
  labelColor?: boolean
  labelSize?: boolean
  radius?: boolean
  labelText?: boolean
}

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
export interface MeasurementRepresentationParameters extends StructureRepresentationParameters {
  labelVisible: boolean
  labelSize: number
  labelColor: number
  labelType: 'atomname'|'atomindex'|'occupancy'|'bfactor'|'serial'|'element'|'atom'|'resname'|'resno'|'res'|'text'|'qualified'
  labelText: string
  labelFormat: string
  labelGrouping: 'atom'|'residue'
  labelFontFamily: 'sans-serif'|'monospace'|'serif'
  labelFontStyle: 'normal'|'italic'
  labelFontWeight: 'normal'|'bold'
  labelsdf: boolean
  labelXOffset: number
  labelYOffset: number
  labelZOffset: number
  labelAttachment: 'bottom-left'|'bottom-center'|'bottom-right'|'middle-left'|'middle-center'|'middle-right'|'top-left'|'top-center'|'top-right'
  labelBorder: boolean
  labelBorderColor: number
  labelBorderWidth: number
  labelBackground: boolean
  labelBackgroundColor: number
  labelBackgroundMargin: number
  labelBackgroundOpacity: number
  labelFixedSize: boolean
  lineOpacity: number
  linewidth: number
}

/**
 * Measurement representation
 * @interface
 */
abstract class MeasurementRepresentation extends StructureRepresentation {
  protected n: number
  protected labelVisible: boolean
  protected labelSize: number
  protected labelColor: number
  protected labelType: 'atomname'|'atomindex'|'occupancy'|'bfactor'|'serial'|'element'|'atom'|'resname'|'resno'|'res'|'text'|'qualified'
  protected labelText: string
  protected labelFormat: string
  protected labelGrouping: 'atom'|'residue'
  protected labelFontFamily: 'sans-serif'|'monospace'|'serif'
  protected labelFontStyle: 'normal'|'italic'
  protected labelFontWeight: 'normal'|'bold'
  protected labelsdf: boolean
  protected labelXOffset: number
  protected labelYOffset: number
  protected labelZOffset: number
  protected labelAttachment: 'bottom-left'|'bottom-center'|'bottom-right'|'middle-left'|'middle-center'|'middle-right'|'top-left'|'top-center'|'top-right'
  protected labelBorder: boolean
  protected labelBorderColor: number
  protected labelBorderWidth: number
  protected labelBackground: boolean
  protected labelBackgroundColor: number
  protected labelBackgroundMargin: number
  protected labelBackgroundOpacity: number
  protected labelFixedSize: boolean
  protected lineOpacity: number
  protected linewidth: number
  protected lineVisible: boolean

  protected textBuffer: TextBuffer
  /**
   * Handles common label settings and position logic for
   * distance, angle and dihedral representations
   */
  constructor (structure: Structure, viewer: Viewer, params: Partial<MeasurementRepresentationParameters>) {
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
      },
      labelFixedSize: {
        type: 'boolean', buffer: 'fixedSize'
      },
      lineOpacity: {
        type: 'range', min: 0.0, max: 1.0, step: 0.01
      },
      linewidth: {
        type: 'integer', max: 50, min: 1, buffer: true
      }
    }, this.parameters, {
      flatShaded: null
    })
  }

  init (params: Partial<MeasurementRepresentationParameters>) {
    const p = params || {}
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
    this.labelFixedSize = defaults(p.labelFixedSize, false)
    this.lineOpacity = defaults(p.lineOpacity, 1.0)
    this.linewidth = defaults(p.linewidth, 2)

    super.init(p)
  }

  // All measurements need to rebuild on position change
  update (what: LabelDataField) {
    if (what.position) {
      this.build()
    } else {
      super.update(what)
    }
  }

  updateData (what: LabelDataField & {[k: string]: any}, data: any) {
    const textData: TextBufferData | {} = {}
    if (!what || what.labelSize) {
      Object.assign(textData, {size: uniformArray(this.n, this.labelSize)})
    }

    if (!what || what.labelColor) {
      const c = new Color(this.labelColor)
      Object.assign(textData, {color: uniformArray3(this.n, c.r, c.g, c.b)})
    }

    this.textBuffer.setAttributes(textData as TextBufferData)
  }

  setParameters (params: Partial<MeasurementRepresentationParameters>, what: LabelDataField = {}, rebuild = false) {
    if (params && params.labelSize) {
      what.labelSize = true
    }

    if (params && (params.labelColor || params.labelColor === 0x000000)) {
      what.labelColor = true
      rebuild = true
    }

    super.setParameters(params, what, rebuild)

    if (params && params.opacity !== undefined) {
      this.textBuffer.setParameters({ opacity: 1.0 }) // only opaque labels
    }

    if (params && params.labelVisible !== undefined) {
      this.setVisibility(this.visible)
    }

    return this
  }

  setVisibility (value: boolean, noRenderRequest?: boolean) {
    super.setVisibility(value, true)
    if (this.textBuffer) {
      this.textBuffer.setVisibility(
        this.labelVisible && this.visible
      )
    }

    if (!noRenderRequest) this.viewer.requestRender()

    return this
  }

  getLabelBufferParams (params: Partial<LabelRepresentationParameters> = {}) {
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
      fixedSize: this.labelFixedSize,
      disablePicking: true,
      visible: this.labelVisible
    }, params, {
      opacity: 1.0 // only opaque labels
    }))
  }

  getAtomRadius () {
    return 0
  }
}

/**
 * MeasurementRepresentations take atom[Pair|Triple|Quad] parameters.
 *
 * Parses nested array of either integer atom indices or selection
 * expressions into a flat array of coordinates.
 *
 * @param  {Structure} sview The structure to which the atoms refer
 * @param  {Array} atoms Nested array of atom pairs|triples|quads as
 *   Integer indices or selection expressions
 * @return {Float32Array} Flattened array of position coordinates
 */
function parseNestedAtoms (sview: StructureView, atoms: (number|string)[][]) {
  const ap = sview.getAtomProxy()
  const sele = new Selection()

  const nSets = atoms.length
  if (nSets === 0) return new Float32Array(0)

  // Peek-ahead at first item to determine order and parse mode
  const order = atoms[ 0 ].length
  const selected = sview.getAtomSet()

  const a = new Float32Array(nSets * order * 3)

  let p = 0
  atoms.forEach(function (group) {
    let _break = false
    for (let j = 0; j < order; j++) {
      const value = group[ j ]
      if (typeof (value) === 'number' && Number.isInteger(value)) {
        if (selected.get(value)) {
          ap.index = value
        } else {
          _break = true
          break
        }
      } else {
        sele.setString(value as string)
        const atomIndices = sview.getAtomIndices(sele)
        if (atomIndices!.length) {
          ap.index = atomIndices![ 0 ]
        } else {
          _break = true
          break
        }
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
function calcArcPoint (out: Float32Array, center: Float32Array, v1: Float32Array, v2: Float32Array, angle: number) {
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
