/**
 * @file Dihedral Histogram Representation
 * @author Rudolfs Petrovs <rudolfs.petrovs@astx.com>
 * @private
 */
import { Color } from 'three'

import { calcArcPoint, parseNestedAtoms } from './measurement-representation'
import StructureRepresentation, { StructureRepresentationParameters } from './structure-representation'

import { RepresentationRegistry } from '../globals'
import { Structure } from '../ngl'
import { defaults } from '../utils'

import { BufferData } from '../buffer/buffer'
import MeshBuffer from '../buffer/mesh-buffer'
import WideLineBuffer, { WideLineBufferData } from '../buffer/wideline-buffer'

import { copyArray, uniformArray3, arraySum } from '../math/array-utils'
import {
  v3add, v3cross, v3dot, v3multiplyScalar, v3fromArray,
  v3negate, v3new, v3normalize, v3sub, v3toArray, v3length
} from '../math/vector-utils'

import StructureView from '../structure/structure-view'

import Viewer from '../viewer/viewer'


const pointLength = 3 // One Point Length (number of coordinates of one point in 3D)
const pointsInTriangle = 3

type ColorDefinition = Color | string | number | undefined

interface HistogramColorParameters {
  histogramBinBorderColor: ColorDefinition
  adjacentBondArrowColor: ColorDefinition
  distantBondArrowColor: ColorDefinition
  frontHistogramColor: ColorDefinition
  backHistogramColor: ColorDefinition
  opaqueMiddleDiscColor: ColorDefinition
}

interface HistogramInputData extends Partial<HistogramColorParameters> {
  atomQuad: (number | string)[]
  histogram360: number[]
}

interface HistogramData extends HistogramInputData {
  atomPositions: Float32Array
  histogram360Scaled: number[]
}

interface WideLineData {
  startPoints: Float32Array
  endPoints: Float32Array
  startColors: Float32Array
  endColors: Float32Array
}

interface MeshData {
  triangles: Float32Array
  triangleColors: Float32Array
}

function createUpdatedObject(o: Object, updateSource: Object) {
  function hasKey<O>(obj: O, key: keyof any): key is keyof O {
    return key in obj
  }

  const result = { ...o } // Shallow copy
  for (const key in result) {
    if (hasKey(result, key) && hasKey(updateSource, key)) {
      result[key] = defaults(updateSource[key], result[key])
    }
  }
  return result
}

function createColorArray(color: ColorDefinition, arrayLength: number) {
  const colorValue = new Color(color)
  const targetArray = new Float32Array(arrayLength * 3)
  uniformArray3(arrayLength, colorValue.r, colorValue.g, colorValue.b, targetArray)
  return targetArray
}

/**
 * @typedef {Object} DihedralHistogramRepresentationParameters - dihedral representation parameters
 * @mixes RepresentationParameters
 * @mixes StructureRepresentationParameters
 *
 * @property {HistogramInputData[]} histogramsData
 * List of HistogramInputData objects, which properties specifies each particular
 * histogram, and can contain particular histogram-specific parameters.
 * Obligatory properties are:
 * atomQuad - Quadruplet of selection strings or atom indices
 * histogram360 - List of values, representing histogram from 0 to 360 degrees.
 * @property {Boolean} histogramBinBorderVisible - Display the lines that separate circular histogram bins
 * @property {Boolean} scaleBinToSectorArea - Should sector-based histogram bins'
 * area be proportional to the bins' value
 */

export interface DihedralHistogramRepresentationParameters extends StructureRepresentationParameters {
  histogramsData: HistogramInputData[]

  histogramBinBorderVisible: boolean
  scaleBinToSectorArea: boolean
}

/**
 * Dihedral Histogram representation object
 *
 * Reperesentation consists of several parts:
 * opaqueMiddleDisc - opaque disc in the middle of the dihedral between front and back histograms
 * frontHistogram - circular histogram from the adjacent bond viewpoint
 * backHistogram - circular histogram from the distant bond viewpoint
 * histogramBinBorder - lines, which separate histogram bins
 * bondArrows - lines, which show the actual angle on the histogram disc
 *
 * @param {Structure} structure - the structure to measure angles in
 * @param {Viewer} viewer - a viewer object
 * @param {DihedralHistogramRepresentationParameters} params - Dihedral histogram representation parameters
 */
class DihedralHistogramRepresentation extends StructureRepresentation {
  protected histogramsData: HistogramData[]

  protected histogramBinBorderVisible: boolean
  protected histogramBinBorderWidth: number
  protected histogramBinBorderColor: ColorDefinition
  protected histogramBinBorderOpacity: number

  protected bondArrowVisible: boolean
  protected bondArrowWidth: number
  protected bondArrowOpacity: number

  protected adjacentBondArrowColor: ColorDefinition
  protected distantBondArrowColor: ColorDefinition

  protected histogramOpacity: number
  protected frontHistogramColor: ColorDefinition
  protected backHistogramColor: ColorDefinition

  protected opaqueMiddleDiscVisible: boolean
  protected opaqueMiddleDiscColor: ColorDefinition
  protected opaqueMiddleDiscOpacity: number

  protected scaleBinToSectorArea: boolean

  constructor(structure: Structure, viewer: Viewer, params: DihedralHistogramRepresentationParameters) {
    super(structure, viewer, params)

    this.type = 'dihedral-histogram'

    this.parameters = Object.assign({
      histogramsData: {
        type: 'hidden', rebuild: true
      },
      histogramBinBorderVisible: {
        type: 'boolean', default: true
      },
      scaleBinToSectorArea: {
        type: 'boolean',
        rebuild: true,
        default: false
      }
    }, this.parameters)

    this.init(params)
  }

  init(params: Partial<DihedralHistogramRepresentationParameters>) {
    const p = params || {}

    const defaultColorData = {
      histogramBinBorderColor: 'grey',
      adjacentBondArrowColor: 'black',
      distantBondArrowColor: 'magenta',
      frontHistogramColor: 'green',
      backHistogramColor: 'blue',
      opaqueMiddleDiscColor: 'white'
    }

    const colorData = createUpdatedObject(defaultColorData, p)
    Object.assign(this, colorData)

    const defaultParameters = {
      histogramsData: [],
      histogramOpacity: 1.0,

      opaqueMiddleDiscVisible: true,
      opaqueMiddleDiscOpacity: 1.0,

      histogramBinBorderVisible: true,
      histogramBinBorderWidth: 1,
      histogramBinBorderOpacity: 0.5,

      bondArrowVisible: true,
      bondArrowWidth: 2,
      bondArrowOpacity: 1.0,

      scaleBinToSectorArea: false,
    }
    const parameters = createUpdatedObject(defaultParameters, p)
    Object.assign(this, parameters)

    this.histogramsData.forEach(x => {
      const specificColorData = createUpdatedObject(colorData, x)
      Object.assign(x, specificColorData)
    })

    p.side = defaults(p.side, 'double')
    p.opacity = defaults(p.opacity, 0.5)
    p.radiusType = defaults(p.radiusType, 'size')
    p.radiusSize = defaults(p.radiusSize, 0.15)

    super.init(p)
  }

  getHistogramBinBorderBufferParameters() {
    return this.getBufferParams({
      linewidth: this.histogramBinBorderWidth,
      visible: this.histogramBinBorderVisible,
      opacity: this.histogramBinBorderOpacity,
    })
  }

  getBondArrowsBufferParameters() {
    return this.getBufferParams({
      linewidth: this.bondArrowWidth,
      visible: this.bondArrowVisible,
      opacity: this.bondArrowOpacity,
    })
  }

  getOpaqueMiddleDiscBufferParameters() {
    return this.getBufferParams({
      visible: this.opaqueMiddleDiscVisible,
      opacity: this.opaqueMiddleDiscOpacity
    })
  }

  getHistogramBufferParameters() {
    return this.getBufferParams({
      visible: true,
      opacity: this.histogramOpacity,
      side: "double"
    })
  }

  createData(sview: StructureView) {
    if (!sview.atomCount || !this.histogramsData.length) return
    this.histogramsData.forEach(x => x.atomPositions = parseNestedAtoms(sview, [x.atomQuad]))
    const scaleData = this.scaleBinToSectorArea ? function (y: number) { return Math.sqrt(y) } : function (y: number) { return y }
    this.histogramsData.forEach(x => x.histogram360Scaled = x.histogram360.map(scaleData))
    function Float32Concat(arrays: Float32Array[]) {
      const lengths = arrays.map(x => x.length)
      const result = new Float32Array(arraySum(lengths))
      let accumulatedOffset = 0
      for (let i = 0; i < arrays.length; i++) {
        result.set(arrays[i], accumulatedOffset)
        accumulatedOffset += arrays[i].length
      }
      return result
    }

    function createWideLineBuffer(linesList: WideLineData[], params: {}) {
      return new WideLineBuffer(
        {
          position1: Float32Concat(linesList.map(x => x.startPoints)),
          position2: Float32Concat(linesList.map(x => x.endPoints)),
          color: Float32Concat(linesList.map(x => x.startColors)),
          color2: Float32Concat(linesList.map(x => x.endColors)),
        } as WideLineBufferData,
        params)
    }

    function createMeshBuffer(mesh: MeshData[], params: {}) {
      return new MeshBuffer(
        {
          position: Float32Concat(mesh.map(x => x.triangles)),
          color: Float32Concat(mesh.map(x => x.triangleColors))
        } as BufferData,
        params)
    }

    const dihedralDataArray = []

    for (let i = 0; i < this.histogramsData.length; i++) {
      let dihedralData = undefined
      let currentHistogramData = this.histogramsData[i]
      let currentHistogram360 = currentHistogramData.histogram360
      if (currentHistogram360.length >= 3) {
        dihedralData = calculateDihedralHistogram(currentHistogramData)
      }
      if (typeof dihedralData === "undefined") continue
      dihedralDataArray.push(dihedralData)
    }

    this.frontHistogramBinBordersBuffer = createWideLineBuffer(
      dihedralDataArray.map(x => x.frontHistogramBinBorders),
      this.getHistogramBinBorderBufferParameters()
    )

    this.backHistogramBinBordersBuffer = createWideLineBuffer(
      dihedralDataArray.map(x => x.backHistogramBinBorders),
      this.getHistogramBinBorderBufferParameters()
    )

    this.adjacentBondArrowsBuffer = createWideLineBuffer(
      dihedralDataArray.map(x => x.adjacentBondArrows),
      this.getBondArrowsBufferParameters()
    )

    this.distantBondArrowsBuffer = createWideLineBuffer(
      dihedralDataArray.map(x => x.distantBondArrows),
      this.getBondArrowsBufferParameters()
    )

    this.opaqueMiddleDiscBuffer = createMeshBuffer(
      dihedralDataArray.map(x => x.opaqueMiddleDisc),
      this.getOpaqueMiddleDiscBufferParameters()
    )

    this.frontHistogramBuffer = createMeshBuffer(
      dihedralDataArray.map(x => x.frontHistogram),
      this.getHistogramBufferParameters()
    )

    this.backHistogramBuffer = createMeshBuffer(
      dihedralDataArray.map(x => x.backHistogram),
      this.getHistogramBufferParameters()
    )

    return {
      bufferList: [].concat(
        this.frontHistogramBinBordersBuffer,
        this.backHistogramBinBordersBuffer,
        this.adjacentBondArrowsBuffer,
        this.distantBondArrowsBuffer,
        this.opaqueMiddleDiscBuffer,
        this.frontHistogramBuffer,
        this.backHistogramBuffer
      )
    }
  }

  setParameters(params: Partial<DihedralHistogramRepresentationParameters>) {
    const rebuild = false
    const what = {}
    super.setParameters(params, what, rebuild)

    if (params && (params.histogramBinBorderVisible !== undefined)) {
      this.setVisibility(this.visible)
    }
    return this
  }

  setVisibility(value: boolean, noRenderRequest?: boolean) {
    super.setVisibility(value, true)
    if (this.frontHistogramBinBordersBuffer) {
      this.frontHistogramBinBordersBuffer.setVisibility(this.histogramBinBorderVisible)
    }
    if (this.backHistogramBinBordersBuffer) {
      this.backHistogramBinBordersBuffer.setVisibility(this.histogramBinBorderVisible)
    }
    if (!noRenderRequest) this.viewer.requestRender()
    return this
  }
}

/**
 * Calculates the data required to create {Buffer} objects for one histogram, given positions
 * @param  Float32Array positionOfDihedralAtoms 3*4 array of coordinates
 * @param  NumberArray histogram array of coordinates
 * @return Arrays for building buffers
 */
function calculateDihedralHistogram(histogramData: HistogramData) {
  const positionOfDihedralAtoms = histogramData.atomPositions
  const histogram = histogramData.histogram360Scaled;
  const totalSectorTrianglesInOpaqueMiddleDisc = histogram.length <= 180 ? 360 : histogram.length * 2
  const frontAndBack = 2

  const opaqueMiddleDisc = {
    triangles: new Float32Array(totalSectorTrianglesInOpaqueMiddleDisc * pointsInTriangle * pointLength),
    triangleColors: createColorArray(histogramData.opaqueMiddleDiscColor, totalSectorTrianglesInOpaqueMiddleDisc * pointsInTriangle)
  }

  const frontHistogram = {
    triangles: new Float32Array(histogram.length * pointsInTriangle * pointLength),
    triangleColors: createColorArray(histogramData.frontHistogramColor, histogram.length * pointsInTriangle)
  }

  const backHistogram = {
    triangles: new Float32Array(histogram.length * pointsInTriangle * pointLength),
    triangleColors: createColorArray(histogramData.backHistogramColor, histogram.length * pointsInTriangle)
  }

  const frontHistogramBinBorders = {
    startPoints: new Float32Array(histogram.length * pointLength),
    endPoints: new Float32Array(histogram.length * pointLength),
    startColors: createColorArray(histogramData.histogramBinBorderColor, histogram.length),
    endColors: createColorArray(histogramData.histogramBinBorderColor, histogram.length)
  }

  const backHistogramBinBorders = {
    startPoints: new Float32Array(histogram.length * pointLength),
    endPoints: new Float32Array(histogram.length * pointLength),
    startColors: createColorArray(histogramData.histogramBinBorderColor, histogram.length),
    endColors: createColorArray(histogramData.histogramBinBorderColor, histogram.length)
  }

  const adjacentBondArrows = {
    startPoints: new Float32Array(frontAndBack * pointLength),
    endPoints: new Float32Array(frontAndBack * pointLength),
    startColors: createColorArray(histogramData.adjacentBondArrowColor, histogram.length),
    endColors: createColorArray(histogramData.adjacentBondArrowColor, histogram.length)
  }
  const distantBondArrows = {
    startPoints: new Float32Array(frontAndBack * pointLength),
    endPoints: new Float32Array(frontAndBack * pointLength),
    startColors: createColorArray(histogramData.distantBondArrowColor, histogram.length),
    endColors: createColorArray(histogramData.distantBondArrowColor, histogram.length)
  }

  const p1 = v3new()
  const p2 = v3new()
  const p3 = v3new()
  const p4 = v3new()

  const v21 = v3new()
  const v23 = v3new()
  const v32 = v3new()
  const v34 = v3new()

  const mid = v3new()
  const inPlane1 = v3new()
  const inPlane2 = v3new()

  const cross1 = v3new()
  const cross2 = v3new()

  const arcPoint = v3new()
  const tmp = v3new()
  const tmp2 = v3new()

  // Set Atom Coordinates
  const dihedralAtomVectors = [p1, p2, p3, p4]

  for (let i = 0; i < dihedralAtomVectors.length; i++) {
    v3fromArray(dihedralAtomVectors[i], positionOfDihedralAtoms, i * pointLength)
  }

  // Vectors between points
  v3sub(v21, p1, p2)
  v3sub(v23, p3, p2)
  v3sub(v34, p4, p3)
  if (v3length(v23) === 0.0) {
    return // Can't define axis
  }

  v3multiplyScalar(tmp, v23, 0.5)
  v3add(mid, p2, tmp)

  v3normalize(v21, v21)
  v3normalize(v23, v23)
  v3normalize(v34, v34)

  v3negate(v32, v23)
  // Calculate vectors perp to v23 (lying in plane (1,2,3) and (2,3,4))
  v3multiplyScalar(tmp, v32, v3dot(v32, v21))
  v3sub(inPlane1, v21, tmp)

  v3multiplyScalar(tmp, v23, v3dot(v23, v34))
  v3sub(inPlane2, v34, tmp)

  if (v3length(inPlane1) === 0.0 || v3length(inPlane2) === 0.0) {
    return // Indeterminate angle
  }

  v3normalize(inPlane1, inPlane1)
  v3normalize(inPlane2, inPlane2)

  // Can use acos as normalized and non-zero
  const absAngle = Math.acos(v3dot(inPlane1, inPlane2))

  v3cross(cross1, v32, inPlane1)
  v3cross(cross2, v23, inPlane2)
  v3normalize(cross1, cross1)
  v3normalize(cross2, cross2)

  let angle = absAngle
  if (v3dot(cross1, inPlane2) < 0.0) {
    angle = -absAngle
  }

  v3add(arcPoint, mid, inPlane1)

  // Calculate necessary constants
  const maxHist = Math.max.apply(null, histogram)
  const histBinAngleStep = (Math.PI * 2) / histogram.length

  function setHistogramBinCoordinates(out: Float32Array, ind: number, zeroDegreeVector: Float32Array, crossVector: Float32Array, histBinAngleStep: number) {
    const startOffset = ind * pointsInTriangle * pointLength
    v3toArray(mid, out, startOffset)
    const scalingFactor = Number(histogram[ind]) / maxHist
    v3multiplyScalar(tmp, zeroDegreeVector, scalingFactor)
    v3multiplyScalar(tmp2, crossVector, scalingFactor)
    calcArcPoint(arcPoint, mid, tmp, tmp2, ind * histBinAngleStep)
    v3toArray(arcPoint, out, startOffset + 1 * pointLength)
    calcArcPoint(arcPoint, mid, tmp, tmp2, (ind + 1) * histBinAngleStep)
    v3toArray(arcPoint, out, startOffset + 2 * pointLength)
  }

  function setOneSideHistogram(discHistogram: MeshData, binBorders: { startPoints: Float32Array, endPoints: Float32Array }, ind: number, zeroDegreeVector: Float32Array, crossVector: Float32Array) {
    // Set Bond Arrows

    copyArray(mid, adjacentBondArrows.startPoints, 0, ind * pointLength, mid.length)
    calcArcPoint(tmp, mid, zeroDegreeVector, crossVector, 0 + histBinAngleStep * 0)
    copyArray(tmp, adjacentBondArrows.endPoints, 0, ind * pointLength, mid.length)

    copyArray(mid, distantBondArrows.startPoints, 0, ind * pointLength, mid.length)
    calcArcPoint(tmp, mid, zeroDegreeVector, crossVector, angle)
    copyArray(tmp, distantBondArrows.endPoints, 0, ind * pointLength, mid.length)

    // Set Histogram Bin Borders

    for (let i = 0; i < histogram.length; i++) {
      copyArray(mid, binBorders.startPoints, 0, i * 3, mid.length)
      calcArcPoint(tmp, mid, zeroDegreeVector, crossVector, 0 + histBinAngleStep * i)
      copyArray(tmp, binBorders.endPoints, 0, i * 3, tmp.length)
    }

    // Set Histogram Bins

    for (let sectionIndex = 0; sectionIndex < histogram.length; sectionIndex++) {
      setHistogramBinCoordinates(discHistogram.triangles, sectionIndex, zeroDegreeVector, crossVector, histBinAngleStep)
    }
  }

  // Opaque disc
  const opaqueCircleSectorAngleStep = Math.PI * 2 / totalSectorTrianglesInOpaqueMiddleDisc

  for (let sectionIndex = 0; sectionIndex < totalSectorTrianglesInOpaqueMiddleDisc; sectionIndex++) {
    const startOffset = sectionIndex * pointsInTriangle * pointLength
    v3toArray(mid, opaqueMiddleDisc.triangles, startOffset)
    calcArcPoint(arcPoint, mid, inPlane1, cross1, sectionIndex * opaqueCircleSectorAngleStep)
    v3toArray(arcPoint, opaqueMiddleDisc.triangles, startOffset + 1 * pointLength)
    calcArcPoint(arcPoint, mid, inPlane1, cross1, (sectionIndex + 1) * opaqueCircleSectorAngleStep)
    v3toArray(arcPoint, opaqueMiddleDisc.triangles, startOffset + 2 * pointLength)
  }

  // Front Histogram
  const distanceToOpaqueDisc = 0.01
  v3multiplyScalar(tmp, v23, -distanceToOpaqueDisc) // Get a vector to move "mid" just a bit from opaque disc
  v3add(mid, mid, tmp)
  setOneSideHistogram(frontHistogram, frontHistogramBinBorders, 0, inPlane1, cross1)

  // Back Histogram
  v3multiplyScalar(tmp, v23, 2 * distanceToOpaqueDisc) // Get a vector to move "mid" back and plus just a bit from opaque disc the other way
  v3add(mid, mid, tmp)
  setOneSideHistogram(backHistogram, backHistogramBinBorders, 1, inPlane2, cross2)

  return {
    opaqueMiddleDisc,
    frontHistogram,
    backHistogram,
    frontHistogramBinBorders,
    backHistogramBinBorders,
    adjacentBondArrows,
    distantBondArrows
  }
}

RepresentationRegistry.add('dihedral-histogram', DihedralHistogramRepresentation)

export default DihedralHistogramRepresentation
