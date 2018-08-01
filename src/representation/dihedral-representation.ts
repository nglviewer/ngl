/**
 * @file Dihedral Representation
 * @author Fred Ludlow <fred.ludlow@gmail.com>
 * @private
 */
import { Color } from 'three'

import { RepresentationRegistry } from '../globals'
import MeasurementRepresentation, { calcArcPoint, parseNestedAtoms, MeasurementRepresentationParameters, LabelDataField } from './measurement-representation'
import { defaults } from '../utils'

import MeshBuffer from '../buffer/mesh-buffer'
import TextBuffer, { TextBufferData } from '../buffer/text-buffer'
import WideLineBuffer from '../buffer/wideline-buffer'

import { copyArray, uniformArray, uniformArray3 } from '../math/array-utils'
import { v3add, v3cross, v3dot, v3multiplyScalar, v3fromArray, v3length,
  v3negate, v3new, v3normalize, v3sub, v3toArray } from '../math/vector-utils'
import { RAD2DEG } from '../math/math-constants'
import { getFixedLengthWrappedDashData } from '../geometry/dash'
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import StructureView from '../structure/structure-view';
import { CylinderBufferData } from '../buffer/cylinder-buffer';
import { BufferData } from '../buffer/buffer';
import { StructureRepresentationData } from './structure-representation';

/**
 * @typedef {Object} DihedralRepresentationParameters - dihedral representation parameters
 * @mixes RepresentationParameters
 * @mixes StructureRepresentationParameters
 * @mixes MeasurementRepresentationParameters
 *
 * @property {String} atomQuad - list of quadruplets of selection strings
 *                               or atom indices
 * @property {Boolean} extendLine - Extend lines in planes
 * @property {Number} lineOpacity - Opacity for the line part of the representation
 * @property {Boolean} lineVisible - Display the line part of the representation
 * @property {Number} linewidth - width for line part of representation
 * @property {Boolean} planeVisible - Display the two planes corresponding to dihedral
 * @property {Boolean} sectorVisible - Display the filled arc for each angle
 */

export interface DihedralRepresentationParameters extends MeasurementRepresentationParameters {
  atomQuad: (number|string)[][]
  extendLine: boolean
  lineOpacity: number
  lineVisible: boolean
  linewidth: number
  planeVisible: boolean
  sectorVisible: boolean
}

/**
 * Dihedral representation object
 *
 * Reperesentation consists of three parts, visibility can be set for each
 * label - text label indicating dihedral angle
 * line - line indicating four positions that define the dihedral
 * sector - filled arc section
 *
 * @param {Structure} structure - the structure to measure angles in
 * @param {Viewer} viewer - a viewer object
 * @param {AngleRepresentationParameters} params - angle representation parameters
 */
class DihedralRepresentation extends MeasurementRepresentation {
  protected atomQuad: (number|string)[][]
  protected extendLine: boolean
  protected lineOpacity: number
  protected lineVisible: boolean
  protected linewidth: number
  protected planeVisible: boolean
  protected sectorVisible: boolean

  protected lineLength: number
  protected planeLength: number
  protected sectorLength: number

  protected lineBuffer: WideLineBuffer
  protected planeBuffer: MeshBuffer
  protected sectorBuffer: MeshBuffer

  constructor (structure: Structure, viewer: Viewer, params: Partial<DihedralRepresentationParameters>) {
    super(structure, viewer, params)

    this.type = 'dihedral'

    this.parameters = Object.assign({
      atomQuad: {
        type: 'hidden', rebuild: true
      },
      extendLine: {
        type: 'boolean', rebuild: true, default: true
      },
      lineVisible: {
        type: 'boolean', default: true
      },
      planeVisible: {
        type: 'boolean', default: true
      },
      sectorVisible: {
        type: 'boolean', default: true
      }
    }, this.parameters)

    this.init(params)
  }

  init (params: Partial<DihedralRepresentationParameters>) {
    const p = params || {}
    p.side = defaults(p.side, 'double')
    p.opacity = defaults(p.opacity, 0.5)

    this.atomQuad = defaults(p.atomQuad, [])
    this.extendLine = defaults(p.extendLine, true)
    this.lineVisible = defaults(p.lineVisible, true)
    this.planeVisible = defaults(p.planeVisible, true)
    this.sectorVisible = defaults(p.sectorVisible, true)

    super.init(p)
  }

  createData (sview: StructureView) {
    if (!sview.atomCount || !this.atomQuad.length) return

    const atomPosition = parseNestedAtoms(sview, this.atomQuad)
    const dihedralData = getDihedralData(
      atomPosition, {
        extendLine: this.extendLine
      }
    )

    const n = this.n = dihedralData.labelText.length
    const labelColor = new Color(this.labelColor)

    this.textBuffer = new TextBuffer({
      position: dihedralData.labelPosition,
      size: uniformArray(n, this.labelSize),
      color: uniformArray3(n, labelColor.r, labelColor.g, labelColor.b),
      text: dihedralData.labelText
    } as TextBufferData, this.getLabelBufferParams())

    const c = new Color(this.colorValue)
    this.lineLength = dihedralData.linePosition1.length / 3
    const lineColor = uniformArray3(this.lineLength, c.r, c.g, c.b)

    this.lineBuffer = new WideLineBuffer(
      getFixedLengthWrappedDashData({
        position1: dihedralData.linePosition1,
        position2: dihedralData.linePosition2,
        color: lineColor,
        color2: lineColor
      } as CylinderBufferData) ,
      this.getBufferParams({
        linewidth: this.linewidth,
        visible: this.lineVisible,
        opacity: this.lineOpacity
      })
    )

    this.planeLength = dihedralData.planePosition.length / 3
    this.planeBuffer = new MeshBuffer({
      position: dihedralData.planePosition,
      color: uniformArray3(this.planeLength, c.r, c.g, c.b)
    } as BufferData, this.getBufferParams({
      visible: this.planeVisible
    }))

    this.sectorLength = dihedralData.sectorPosition.length / 3
    this.sectorBuffer = new MeshBuffer({
      position: dihedralData.sectorPosition,
      color: uniformArray3(this.sectorLength, c.r, c.g, c.b)
    } as BufferData, this.getBufferParams({
      visible: this.sectorVisible
    }))

    return {
      bufferList: [
        this.textBuffer,
        this.lineBuffer,
        this.planeBuffer,
        this.sectorBuffer
      ]
    }
  }

  updateData (what: LabelDataField & {color?: boolean}, data: StructureRepresentationData) {
    super.updateData(what, data)
    const lineData = {}
    const planeData = {}
    const sectorData = {}

    if (what.color) {
      const c = new Color(this.colorValue)
      Object.assign(lineData, {
        color: uniformArray3(this.lineLength, c.r, c.g, c.b),
        color2: uniformArray3(this.lineLength, c.r, c.g, c.b)
      })
      Object.assign(planeData, {
        color: uniformArray3(this.planeLength, c.r, c.g, c.b)
      })
      Object.assign(sectorData, {
        color: uniformArray3(this.sectorLength, c.r, c.g, c.b)
      })
    }

    this.lineBuffer.setAttributes(lineData)
    this.planeBuffer.setAttributes(planeData)
    this.sectorBuffer.setAttributes(sectorData)
  }

  setParameters (params: Partial<DihedralRepresentationParameters>) {
    var rebuild = false
    var what = {}

    super.setParameters(params, what, rebuild)

    if (params && (
      params.lineVisible !== undefined ||
      params.sectorVisible !== undefined ||
      params.planeVisible !== undefined)) {
      this.setVisibility(this.visible)
    }

    if (params && params.lineOpacity) {
      this.lineBuffer.setParameters({ opacity: params.lineOpacity })
    }

    if (params && params.opacity !== undefined) {
      this.lineBuffer.setParameters({ opacity: this.lineOpacity })
    }

    if (params && params.linewidth) {
      this.lineBuffer.setParameters({ linewidth: params.linewidth })
    }

    return this
  }

  setVisibility (value: boolean, noRenderRequest?: boolean) {
    super.setVisibility(value, true)

    if (this.lineBuffer) {
      this.lineBuffer.setVisibility(this.lineVisible && this.visible)
    }

    if (this.planeBuffer) {
      this.planeBuffer.setVisibility(this.planeVisible && this.visible)
    }

    if (this.sectorBuffer) {
      this.sectorBuffer.setVisibility(this.sectorVisible && this.visible)
    }

    if (!noRenderRequest) this.viewer.requestRender()

    return this
  }
}

/**
 * Build the data required to create {Buffer} objects, given positions
 * @param  {Float32Array} atomPosition 3*4*nDihedral array of coordinates
 * @return {Object}              Arrays for building buffers
 */
function getDihedralData (position: Float32Array, params: Partial<DihedralRepresentationParameters> = {}) {
  const angleStep = defaults(params.angleStep, Math.PI / 90)
  const nPos = position.length
  const n = position.length / 12
  const angles = new Float32Array(n)
  const labelPosition = new Float32Array(n * 3)
  const labelText = new Array(n)

  // Temporary arrays as don't know output length yet
  const lineTmp1 = new Array(n)
  const lineTmp2 = new Array(n)
  const sectorTmp = new Array(n)
  const planeTmp = new Array(n)

  // Eventual sizes of output arrays
  let totalLines = 0
  let totalSegments = 0
  let totalPlanes = 0

  const p1 = v3new()
  const p2 = v3new()
  const p3 = v3new()
  const p4 = v3new()

  const v21 = v3new()
  const v23 = v3new()
  const v34 = v3new()

  const tmp = v3new()
  const mid = v3new()
  const inPlane1 = v3new()
  const inPlane2 = v3new()
  const start = v3new()
  const end = v3new()

  const cross = v3new()
  const arcPoint = v3new()

  let i = 0 // Actual output index (after skipping inappropriate)

  for (var p = 0; p < nPos; p += 12) {
    // Set Positions
    v3fromArray(p1, position, p)
    v3fromArray(p2, position, p + 3)
    v3fromArray(p3, position, p + 6)
    v3fromArray(p4, position, p + 9)

    // Vectors between points
    v3sub(v21, p1, p2)
    v3sub(v23, p3, p2)
    if (v3length(v23) === 0.0) {
      continue // Can't define axis
    }

    v3sub(v34, p4, p3)

    v3multiplyScalar(tmp, v23, 0.5)
    v3add(mid, p2, tmp)

    v3normalize(v21, v21)
    v3normalize(v23, v23)
    v3normalize(v34, v34)

    // Which side of plane are p1, p4 (are we measuring something that
    // looks more like an improper? e.g. C, CA, CB, N)
    v3sub(tmp, p1, mid)
    const improperStart = v3dot(tmp, v23) > 0.0
    v3sub(tmp, p4, mid)
    const improperEnd = v3dot(tmp, v23) < 0.0

    // Calculate vectors perp to v23 (lying in plane (1,2,3) and (2,3,4))
    v3multiplyScalar(tmp, v23, v3dot(v23, v21))
    v3sub(inPlane1, v21, tmp)

    v3multiplyScalar(tmp, v23, v3dot(v23, v34))
    v3sub(inPlane2, v34, tmp)

    if (v3length(inPlane1) === 0.0 || v3length(inPlane2) === 0.0) {
      continue // Indeterminate angle
    }

    v3normalize(inPlane1, inPlane1)
    v3normalize(inPlane2, inPlane2)

    // Can use acos as normalized and non-zero
    const angle = angles[ i ] = Math.acos(v3dot(inPlane1, inPlane2))
    labelText[ i ] = (RAD2DEG * angle).toFixed(1) + String.fromCharCode(0x00B0)

    v3cross(cross, inPlane1, v23)
    v3normalize(cross, cross)
    if (v3dot(cross, inPlane2) < 0.0) {
      v3negate(cross, cross) // Ensure cp faces correct way
    }

    calcArcPoint(tmp, mid, inPlane1, cross, angle / 2.0)
    v3toArray(tmp, labelPosition, 3 * i)

    const nSegments = Math.ceil(angle / angleStep)
    // For extended display mode, 4 straight lines plus arc/segment edge
    // For non-extended, 2 straight lines plus segment edge
    const nLines = nSegments + ((params.extendLine) ? 4 : 2)

    // Don't draw planes if not extending lines
    const nPlanes = params.extendLine ? 36 : 0

    const line1 = new Float32Array(nLines * 3)
    const line2 = new Float32Array(nLines * 3)
    const sector = new Float32Array(nSegments * 9)
    // 2 planes, 2 triangles each per dihedral (2*2*9)
    const plane = new Float32Array(nPlanes)

    lineTmp1[ i ] = line1
    lineTmp2[ i ] = line2
    sectorTmp[ i ] = sector
    planeTmp[ i ] = plane

    // Start points for lines/planes, only required
    // if extending lines
    if (params.extendLine) {
      if (improperStart) { // We'll start on the v3->1 line (tmp)
        v3sub(tmp, p1, p3)
        v3normalize(tmp, tmp)
        v3multiplyScalar(start, tmp, 1.0 / v3dot(inPlane1, tmp))
        v3add(start, start, p3)
      } else { // start on the 2->1 line
        v3multiplyScalar(start, v21, 1.0 / v3dot(inPlane1, v21))
        v3add(start, start, p2)
      }

      if (improperEnd) { // Finish on 2->4 line
        v3sub(tmp, p4, p2)
        v3normalize(tmp, tmp)
        v3multiplyScalar(end, tmp, 1.0 / v3dot(inPlane2, tmp))
        v3add(end, end, p2)
      } else { // end on the 3->4 line
        v3multiplyScalar(end, v34, 1.0 / v3dot(inPlane2, v34))
        v3add(end, end, p3)
      }
    }

    v3add(arcPoint, mid, inPlane1)

    // index into line1, line2
    let li = 0
    // If extending lines, there's a bit of stuff to do here
    // figuring out start and end positions
    if (params.extendLine) {
      v3toArray(p1, line1, li)
      v3toArray(start, line2, li)
      li += 3
      v3toArray(start, line1, li)
      v3toArray(arcPoint, line2, li)
      li += 3

      // Construct plane at start, if not extening lines
      // this is skipped
      v3toArray(start, plane, 0)
      v3toArray(arcPoint, plane, 3)
      v3toArray(improperStart ? p3 : p2, plane, 6)
      v3toArray(improperStart ? p3 : p2, plane, 9)
      v3toArray(arcPoint, plane, 12)
      v3toArray(mid, plane, 15)
    } else {
      // Not extending lines
      v3toArray(mid, line1, li)
      v3toArray(arcPoint, line2, li)
      li += 3
    }

    const appendArcSection = function (a: number, j: number) {
      const si = j * 9

      v3toArray(mid, sector, si)
      v3toArray(arcPoint, sector, si + 3)
      v3toArray(arcPoint, line1, li)

      calcArcPoint(arcPoint, mid, inPlane1, cross, a)

      v3toArray(arcPoint, sector, si + 6)
      v3toArray(arcPoint, line2, li)
      li += 3
    }

    let j = 0
    for (let a = angleStep; a < angle; a += angleStep) {
      appendArcSection(a, j++)
    }
    appendArcSection(angle, j++)

    if (params.extendLine) {
      v3toArray(arcPoint, line1, (nLines - 2) * 3)
      v3toArray(end, line2, (nLines - 2) * 3)
      v3toArray(end, line1, (nLines - 1) * 3)
      v3toArray(p4, line2, (nLines - 1) * 3)

      // Construct plane at end
      v3toArray(end, plane, 18)
      v3toArray(arcPoint, plane, 21)
      v3toArray(improperEnd ? p2 : p3, plane, 24)
      v3toArray(improperEnd ? p2 : p3, plane, 27)
      v3toArray(arcPoint, plane, 30)
      v3toArray(mid, plane, 33)
    } else {
      v3toArray(arcPoint, line1, li)
      v3toArray(mid, line2, li)
      li += 3
    }

    totalLines += nLines * 3
    totalSegments += nSegments * 9
    totalPlanes += nPlanes
    i += 1
  }

  const nSuccess = i

  const linePosition1 = new Float32Array(totalLines)
  const linePosition2 = new Float32Array(totalLines)
  const sectorPosition = new Float32Array(totalSegments)
  const planePosition = new Float32Array(totalPlanes)

  let lineOffset = 0
  let sectorOffset = 0
  let planeOffset = 0

  for (let i = 0; i < nSuccess; i++) {
    const lp1 = lineTmp1[ i ]
    const lp2 = lineTmp2[ i ]
    const sp = sectorTmp[ i ]
    const pp = planeTmp[ i ]

    copyArray(lp1, linePosition1, 0, lineOffset, lp1.length)
    copyArray(lp2, linePosition2, 0, lineOffset, lp2.length)
    copyArray(sp, sectorPosition, 0, sectorOffset, sp.length)
    copyArray(pp, planePosition, 0, planeOffset, pp.length)

    lineOffset += lp1.length
    sectorOffset += sp.length
    planeOffset += pp.length
  }

  return {
    labelPosition: labelPosition.subarray(0, nSuccess * 3),
    labelText: labelText.slice(0, nSuccess),
    linePosition1,
    linePosition2,
    planePosition,
    sectorPosition
  }
}

RepresentationRegistry.add('dihedral', DihedralRepresentation)

export default DihedralRepresentation
