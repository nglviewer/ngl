/**
 * @file Angle Representation
 * @author Fred Ludlow <fred.ludlow@gmail.com>
 * @private
 */
import { Color } from 'three'

import { RepresentationRegistry } from '../globals'
import MeasurementRepresentation, { parseNestedAtoms, calcArcPoint, MeasurementRepresentationParameters, LabelDataField } from './measurement-representation'
import { defaults } from '../utils'

import MeshBuffer from '../buffer/mesh-buffer'
import TextBuffer, { TextBufferData, TextBufferParameters } from '../buffer/text-buffer'
import WideLineBuffer, { WideLineBufferData } from '../buffer/wideline-buffer'

import { v3add, v3cross, v3dot, v3fromArray, v3length, v3new,
  v3normalize, v3sub, v3toArray } from '../math/vector-utils'
import { copyArray, uniformArray, uniformArray3 } from '../math/array-utils'
import { RAD2DEG } from '../math/math-constants'
import { getFixedLengthWrappedDashData } from '../geometry/dash'
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import StructureView from '../structure/structure-view';
import { BufferData } from '../buffer/buffer';
import { StructureRepresentationData, StructureRepresentationParameters } from './structure-representation';

/**
 * @typedef {Object} AngleRepresentationParameters - angle representation parameters
 * @mixes RepresentationParameters
 * @mixes StructureRepresentationParameters
 * @mixes MeasurementRepresentationParameters
 *
 * @property {String} atomTriple - list of triplets of selection strings
 *                                 or atom indices
 * @property {Boolean} vectorVisible - Indicate the 3 points for each angle by drawing lines 1-2-3
 * @property {Boolean} arcVisible - Show the arc outline for each angle
 * @property {Number}  lineOpacity - opacity for the line part of the representation
 * @property {Number} linewidth - width for line part of representation
 * @property {Boolean} sectorVisible - Show the filled arc for each angle
 */

export interface AngleRepresentationParameters extends MeasurementRepresentationParameters {
  atomTriple: (number|string)[][]
  vectorVisible: boolean
  arcVisible: boolean
  lineOpacity: number
  lineWidth: number
  sectorVisible: boolean
}

/**
 * Angle representation object
 *
 * Reperesentation consists of four parts, visibility can be set for each
 * label - the text label with the angle size
 * vectors - lines joining the three points
 * sector - triangles representing the angle
 * arc - line bordering the sector
 *
 * @param {Structure} structure - the structure to measure angles in
 * @param {Viewer} viewer - a viewer object
 * @param {AngleRepresentationParameters} params - angle representation parameters
 */
class AngleRepresentation extends MeasurementRepresentation {
  protected atomTriple: (number|string)[][]
  protected vectorVisible: boolean
  protected arcVisible: boolean
  protected lineOpacity: number
  protected lineWidth: number
  protected sectorVisible: boolean
  protected vectorBuffer: WideLineBuffer
  arcLength: number
  sectorLength: number
  arcBuffer: WideLineBuffer
  sectorBuffer: MeshBuffer

  constructor (structure: Structure, viewer: Viewer, params: Partial<AngleRepresentationParameters>) {
    super(structure, viewer, params)

    this.type = 'angle'

    this.parameters = Object.assign({
      atomTriple: {
        type: 'hidden', rebuild: true
      },
      vectorVisible: {
        type: 'boolean', default: true
      },
      arcVisible: {
        type: 'boolean', default: true
      },
      sectorVisible: {
        type: 'boolean', default: true
      }
    }, this.parameters)

    this.init(params)
  }

  init (params: Partial<AngleRepresentationParameters>) {
    const p = params || {}
    p.side = defaults(p.side, 'double')
    p.opacity = defaults(p.opacity, 0.5)

    this.atomTriple = defaults(p.atomTriple, [])
    this.arcVisible = defaults(p.arcVisible, true)
    this.sectorVisible = defaults(p.sectorVisible, true)
    this.vectorVisible = defaults(p.vectorVisible, true)

    super.init(p)
  }

  createData (sview: StructureView) {
    if (!sview.atomCount || !this.atomTriple.length) return

    const atomPosition = atomTriplePositions(sview, this.atomTriple)
    const angleData = getAngleData(atomPosition)
    const n = this.n = angleData.labelPosition.length / 3

    const labelColor = new Color(this.labelColor)

    // Create buffers
    this.textBuffer = new TextBuffer({
      position: angleData.labelPosition,
      size: uniformArray(n, this.labelSize),
      color: uniformArray3(n, labelColor.r, labelColor.g, labelColor.b),
      text: angleData.labelText
    } as TextBufferData, this.getLabelBufferParams() as TextBufferParameters)

    const c = new Color(this.colorValue)

    this.vectorBuffer = new WideLineBuffer(
      getFixedLengthWrappedDashData({
        position1: angleData.vectorPosition1,
        position2: angleData.vectorPosition2,
        color: uniformArray3(2 * n, c.r, c.g, c.b),
        color2: uniformArray3(2 * n, c.r, c.g, c.b)
      } as WideLineBufferData),
      this.getBufferParams({
        linewidth: this.linewidth,
        visible: this.vectorVisible,
        opacity: this.lineOpacity
      })
    )

    this.arcLength = angleData.arcPosition1.length / 3

    this.arcBuffer = new WideLineBuffer(
      getFixedLengthWrappedDashData({
        position1: angleData.arcPosition1,
        position2: angleData.arcPosition2,
        color: uniformArray3(this.arcLength, c.r, c.g, c.b),
        color2: uniformArray3(this.arcLength, c.r, c.g, c.b)
      } as WideLineBufferData), this.getBufferParams({
        linewidth: this.linewidth,
        visible: this.arcVisible,
        opacity: this.lineOpacity
      }))

    this.sectorLength = angleData.sectorPosition.length / 3

    this.sectorBuffer = new MeshBuffer({
      position: angleData.sectorPosition,
      color: uniformArray3(this.sectorLength, c.r, c.g, c.b)
    } as BufferData, this.getBufferParams({
      visible: this.sectorVisible
    }))

    return {
      bufferList: [
        this.textBuffer,
        this.vectorBuffer,
        this.arcBuffer,
        this.sectorBuffer
      ]
    }
  }

  updateData (what: LabelDataField & {color?: boolean}, data: StructureRepresentationData) {
    super.updateData(what, data)
    const vectorData = {}
    const arcData = {}
    const sectorData = {}

    if (what.color) {
      const c = new Color(this.colorValue)
      Object.assign(vectorData, {
        color: uniformArray3(this.n * 2, c.r, c.g, c.b),
        color2: uniformArray3(this.n * 2, c.r, c.g, c.b)
      })
      Object.assign(arcData, {
        color: uniformArray3(this.arcLength, c.r, c.g, c.b),
        color2: uniformArray3(this.arcLength, c.r, c.g, c.b)
      })
      Object.assign(sectorData, {
        color: uniformArray3(this.sectorLength, c.r, c.g, c.b)
      })
    }

    // if (what.sectorOpacity) {
    //   this.sectorBuffer.opacity = what.sectorOpacity
    // }

    this.vectorBuffer.setAttributes(vectorData)
    this.arcBuffer.setAttributes(arcData)
    this.sectorBuffer.setAttributes(sectorData)
  }

  setParameters (params: Partial<AngleRepresentationParameters>) {
    var rebuild = false
    var what = {}

    super.setParameters(params, what, rebuild)

    if (params && (
      params.vectorVisible !== undefined ||
      params.arcVisible !== undefined ||
      params.sectorVisible !== undefined)) {
      this.setVisibility(this.visible)
    }

    if (params && params.lineOpacity) {
      this.vectorBuffer.setParameters({ opacity: params.lineOpacity })
      this.arcBuffer.setParameters({ opacity: params.lineOpacity })
    }

    if (params && params.opacity !== undefined) {
      this.vectorBuffer.setParameters({ opacity: this.lineOpacity })
      this.arcBuffer.setParameters({ opacity: this.lineOpacity })
    }

    if (params && params.linewidth) {
      this.vectorBuffer.setParameters({ linewidth: params.linewidth })
      this.arcBuffer.setParameters({ linewidth: params.linewidth })
    }

    return this
  }

  setVisibility (value: boolean, noRenderRequest?: boolean) {
    super.setVisibility(value, true)

    if (this.vectorBuffer) {
      this.vectorBuffer.setVisibility(this.vectorVisible && this.visible)
    }

    if (this.arcBuffer) {
      this.arcBuffer.setVisibility(this.arcVisible && this.visible)
    }

    if (this.sectorBuffer) {
      this.sectorBuffer.setVisibility(this.sectorVisible && this.visible)
    }

    if (!noRenderRequest) this.viewer.requestRender()

    return this
  }
}

/**
 * Ensure mid point does not coincide with first or second
 * @param  {Float32Array} position 9*nAngle array of coordinates
 * @return {Float32Array}          Filtered position array, may be shorter
 */
function validatePositions (position: Float32Array) {
  const include = []
  const n = position.length / 9
  for (let i = 0; i < n; i++) {
    // Check that first point not same as second and that second not same as third
    let okay = true
    for (let j = i; j < i + 3; j += 3) {
      if (position[j] === position[j + 3] &&
        position[j + 1] === position[j + 4] &&
        position[j + 2] === position[j + 5]) {
        okay = false
      }
    }
    if (okay) include.push(i)
  }
  const outPosition = new Float32Array(include.length * 9)
  let outIdx = 0
  include.forEach(function (i) {
    copyArray(position, outPosition, i * 9, outIdx * 9, 9)
    outIdx++
  })
  return outPosition
}

function atomTriplePositions (sview: StructureView, atomTriple: (number|string)[][]) {
  return validatePositions(parseNestedAtoms(sview, atomTriple))
}

/**
 * Converts triple positions into data required to build various buffers.
 */
function getAngleData (position: Float32Array, params: Partial<StructureRepresentationParameters> = {}) {
  const angleStep = defaults(params.angleStep, Math.PI / 90)
  const n = position.length / 9
  const angles = new Float32Array(n)
  const labelPosition = new Float32Array(n * 3)
  const labelText = new Array(n)

  const vectorPosition1 = new Float32Array(n * 6) // Two lines per angle
  const vectorPosition2 = new Float32Array(n * 6)

  const arcPositionTmp1 = new Array(n) // Start points for arc lines
  const arcPositionTmp2 = new Array(n) // End points for arc lines
  const sectorPositionTmp = new Array(n) // Triangle points

  let totalSegments = 0

  // Re-used vectors etc
  const p1 = v3new() // Positions of points for each angel
  const p2 = v3new()
  const p3 = v3new()
  const v21 = v3new() // Vectors
  const v23 = v3new()
  const cross = v3new() // Cross product v21xv23
  const cross2 = v3new() // In-plane cross product v21 x (v21 x v23)
  const labelTmp = v3new()
  const arcPoint = v3new()

  for (var i = 0; i < n; i++) {
    let p = 9 * i
    v3fromArray(p1, position, p)
    v3fromArray(p2, position, p + 3)
    v3fromArray(p3, position, p + 6)

    let v = 6 * i
    v3toArray(p1, vectorPosition1, v)
    v3toArray(p2, vectorPosition2, v)
    v3toArray(p2, vectorPosition1, v + 3)
    v3toArray(p3, vectorPosition2, v + 3)

    v3sub(v21, p1, p2)
    v3sub(v23, p3, p2)

    v3normalize(v21, v21) // validatePositions ensures valid
    v3normalize(v23, v23)

    v3cross(cross, v21, v23)
    const crossLength = v3length(cross)
    const dot = v3dot(v21, v23)

    const angle = angles[i] = Math.atan2(crossLength, dot)
    labelText[i] = (RAD2DEG * angle).toFixed(1) + String.fromCharCode(0x00B0)

    if (v3length(cross) === 0.0) {
      // Angle exactly 0/180, pick an arbitrary direction
      cross[ 0 ] = 1.0
      cross[ 1 ] = 0.0
      cross[ 2 ] = 0.0
    }
    v3cross(cross2, cross, v21)
    v3normalize(cross2, cross2)

    calcArcPoint(labelTmp, p2, v21, cross2, angle / 2.0)
    // TODO: Scale label position?
    v3toArray(labelTmp, labelPosition, 3 * i)

    // Build the arc and sector

    const nSegments = Math.ceil(angle / angleStep)
    const sectorVertices = new Float32Array(nSegments * 9)
    sectorPositionTmp[ i ] = sectorVertices
    const arcVertices1 = new Float32Array(nSegments * 3)
    const arcVertices2 = new Float32Array(nSegments * 3)
    arcPositionTmp1[ i ] = arcVertices1
    arcPositionTmp2[ i ] = arcVertices2

    v3add(arcPoint, p2, v21) // Our initial arc point

    const appendArcSection = function (a: number, j: number) {
      const si = j * 9
      const ai = j * 3
      v3toArray(p2, sectorVertices, si)
      v3toArray(arcPoint, sectorVertices, si + 3)
      v3toArray(arcPoint, arcVertices1, ai)

      calcArcPoint(arcPoint, p2, v21, cross2, a)

      v3toArray(arcPoint, sectorVertices, si + 6)
      v3toArray(arcPoint, arcVertices2, ai)
    }

    let j = 0
    for (let a = angleStep; a < angle; a += angleStep) {
      appendArcSection(a, j)
      j++
    }
    appendArcSection(angle, j)
    totalSegments += nSegments
  }

  // Flatten nested arrays of arc/segment points
  const arcSize = totalSegments * 3
  const sectorSize = totalSegments * 9
  const arcPosition1 = new Float32Array(arcSize)
  const arcPosition2 = new Float32Array(arcSize)
  const sectorPosition = new Float32Array(sectorSize)

  let sectorOffset = 0
  let arcOffset = 0
  for (let i = 0; i < n; i++) {
    const ap1 = arcPositionTmp1[ i ]
    const ap2 = arcPositionTmp2[ i ]
    copyArray(ap1, arcPosition1, 0, arcOffset, ap1.length)
    copyArray(ap2, arcPosition2, 0, arcOffset, ap2.length)
    arcOffset += ap1.length // === ap2.length

    const sp = sectorPositionTmp[ i ]
    copyArray(sp, sectorPosition, 0, sectorOffset, sp.length)
    sectorOffset += sp.length
  }

  return {
    labelPosition,
    labelText,
    vectorPosition1,
    vectorPosition2,
    arcPosition1,
    arcPosition2,
    sectorPosition
  }
}

RepresentationRegistry.add('angle', AngleRepresentation)

export default AngleRepresentation
