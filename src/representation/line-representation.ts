/**
 * @file Line Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { defaults } from '../utils'
import { RepresentationRegistry } from '../globals'
import StructureRepresentation, { StructureRepresentationParameters, StructureRepresentationData } from './structure-representation'
import WideLineBuffer from '../buffer/wideline-buffer'
import { AtomPicker } from '../utils/picker'
// @ts-ignore: unused import Volume required for declaration only
import { Structure, Volume } from '../ngl';
import StructureView from '../structure/structure-view';
import Viewer from '../viewer/viewer';
import AtomProxy from '../proxy/atom-proxy';
// @ts-ignore: unused import Surface required for declaration only
import Surface from '../surface/surface';
// @ts-ignore: unused import BondDataFields, BondDataParams required for declaration only
import { BondDataFields, BondDataParams } from '../structure/structure-data';

/**
 * Determine which atoms in  a Structure[View] form no bonds to any other atoms
 * in that Structure.
 *
 * This differs from setting the selection to "nonbonded" as it finds atoms
 * that have no bonds within the current selection.
 * @param  {Structure} structure - The Structure or StructureView object
 * @return {AtomSet} AtomSet of lone atoms
 */
function getLoneAtomSet (structure: Structure | StructureView) {
  const atomSet = structure.getAtomSet()
  const bondSet = structure.getBondSet()
  const bp = structure.getBondProxy()
  bondSet.forEach(function (idx) {
    bp.index = idx
    atomSet.clear(bp.atomIndex1)
    atomSet.clear(bp.atomIndex2)
  })
  return atomSet
}

export interface LineRepresentationParameters extends StructureRepresentationParameters {
  multipleBond: 'off' | 'symmetric' | 'offset'
  bondSpacing: number
  linewidth: number
  lines: boolean
  crosses: 'off' | 'all' | 'lone'
  crossSize: number
}

export interface CrossData {
  position1?: Float32Array
  position2?: Float32Array
  color?: Float32Array
  color2?: Float32Array
  picking?: AtomPicker
}

/**
 * Line representation
 */
class LineRepresentation extends StructureRepresentation {
  protected multipleBond: 'off' | 'symmetric' | 'offset'
  protected bondSpacing: number
  protected linewidth: number
  protected lines: boolean
  protected crosses: 'off' | 'all' | 'lone'
  protected crossSize: number
  /**
   * Create Line representation object
   * @param {Structure} structure - the structure to be represented
   * @param {Viewer} viewer - a viewer object
   * @param {RepresentationParameters} params - representation parameters, plus the properties listed below
   * @property {String} multipleBond - one off "off", "symmetric", "offset"
   * @param {Float} params.bondSpacing - spacing for multiple bond rendering
   * @param {Integer} params.linewidth - width of lines
   * @param {Boolean} params.lines - render bonds as lines
   * @param {String} params.crosses - render atoms as crosses: "off", "all" or "lone" (default)
   * @param {Float} params.crossSize - size of cross
   * @param {null} params.flatShaded - not available
   * @param {null} params.side - not available
   * @param {null} params.wireframe - not available
   * @param {null} params.roughness - not available
   * @param {null} params.metalness - not available
   * @param {null} params.diffuse - not available
   */
  constructor (structure: Structure, viewer: Viewer, params: Partial<LineRepresentationParameters>) {
    super(structure, viewer, params)

    this.type = 'line'

    this.parameters = Object.assign({

      multipleBond: {
        type: 'select',
        rebuild: true,
        options: {
          'off': 'off',
          'symmetric': 'symmetric',
          'offset': 'offset'
        }
      },
      bondSpacing: {
        type: 'number', precision: 2, max: 2.0, min: 0.5
      },
      linewidth: {
        type: 'integer', max: 50, min: 1, buffer: true
      },
      lines: {
        type: 'boolean', rebuild: true
      },
      crosses: {
        type: 'select',
        rebuild: true,
        options: {
          'off': 'off',
          'lone': 'lone',
          'all': 'all'
        }
      },
      crossSize: {
        type: 'number', precision: 2, max: 2.0, min: 0.1
      }

    }, this.parameters, {

      flatShaded: null,
      side: null,
      wireframe: null,

      roughness: null,
      metalness: null

    })

    this.init(params)
  }

  init (params: Partial<LineRepresentationParameters>) {
    var p = params || {}

    this.multipleBond = defaults(p.multipleBond, 'off')
    this.bondSpacing = defaults(p.bondSpacing, 1.0)
    this.linewidth = defaults(p.linewidth, 2)
    this.lines = defaults(p.lines, true)
    this.crosses = defaults(p.crosses, 'lone')
    this.crossSize = defaults(p.crossSize, 0.4)

    super.init(p)
  }

  getAtomRadius (atom:AtomProxy) {
    return 0.1
  }

  getBondParams (what: any, params?: Partial<LineRepresentationParameters>) {
    params = Object.assign({
      multipleBond: this.multipleBond,
      bondSpacing: this.bondSpacing,
      radiusParams: { 'type': 'size', 'size': 0.1, 'scale': 1 }
    }, params)

    return super.getBondParams(what, params)
  }

  _crossData (what: any, sview: StructureView) {
    if (what) {
      if (!what.position && !what.color) return
    }

    const p = {}
    if (this.crosses === 'lone') {
      Object.assign(p, {atomSet : getLoneAtomSet(sview)})
    }

    const atomData = sview.getAtomData(this.getAtomParams(what, p))
    const crossData: CrossData = {}
    const position = atomData.position
    const color = atomData.color
    const picking = atomData.picking

    const size = (position! || color).length
    const attrSize = size * 3

    let cPosition1 = new Float32Array(0)
    let cPosition2 = new Float32Array(0)
    let cColor = new Float32Array(0)
    let cColor2 = new Float32Array(0)
    let cOffset: number = 0

    let pickingArray = new Float32Array(0)

    if (!what || what.position) {
      cPosition1 = crossData.position1 = new Float32Array(attrSize)
      cPosition2 = crossData.position2 = new Float32Array(attrSize)
      cOffset = this.crossSize / 2
    }
    if (!what || what.color) {
      cColor = crossData.color = new Float32Array(attrSize)
      cColor2 = crossData.color2 = new Float32Array(attrSize)
    }
    if (!what || what.picking) {
      pickingArray = new Float32Array(atomData.picking!.array!.length * 3) // Needs padding??
    }

    for (let v = 0; v < size; v++) {
      const j = v * 3
      const i = j * 3

      if (!what || what.position) {
        const x = position![ j ]
        const y = position![ j + 1 ]
        const z = position![ j + 2 ]

        cPosition1[ i ] = x - cOffset!
        cPosition1[ i + 1 ] = y
        cPosition1[ i + 2 ] = z
        cPosition2[ i ] = x + cOffset
        cPosition2[ i + 1 ] = y
        cPosition2[ i + 2 ] = z

        cPosition1[ i + 3 ] = x
        cPosition1[ i + 4 ] = y - cOffset
        cPosition1[ i + 5 ] = z
        cPosition2[ i + 3 ] = x
        cPosition2[ i + 4 ] = y + cOffset
        cPosition2[ i + 5 ] = z

        cPosition1[ i + 6 ] = x
        cPosition1[ i + 7 ] = y
        cPosition1[ i + 8 ] = z - cOffset
        cPosition2[ i + 6 ] = x
        cPosition2[ i + 7 ] = y
        cPosition2[ i + 8 ] = z + cOffset
      }

      if (!what || what.color) {
        const cimax = i + 9
        for (let ci = i; ci < cimax; ci += 3) {
          cColor[ ci ] = cColor2[ ci ] = color![ j ]
          cColor[ ci + 1 ] = cColor2[ ci + 1 ] = color![ j + 1 ]
          cColor[ ci + 2 ] = cColor2[ ci + 2 ] = color![ j + 2 ]
        }
      }

      if (!what || what.picking) {
        pickingArray[ j ] =
        pickingArray[ j + 1 ] =
        pickingArray[ j + 2 ] = picking!.array![ v ]
      }
    }

    if (!what || what.picking) {
      crossData.picking = new AtomPicker(
        pickingArray, picking!.structure
      )
    }

    return crossData
  }

  createData (sview: StructureView) {
    const what = { position: true, color: true, picking: true }

    const bufferList = []

    if (this.lines) {
      const bondData = sview.getBondData(this.getBondParams(what))

      const lineBuffer = new WideLineBuffer(
        bondData, this.getBufferParams({ linewidth: this.linewidth })
      )

      bufferList.push(lineBuffer)
    }

    if (this.crosses !== 'off') {
      const crossBuffer = new WideLineBuffer(
        (this._crossData(what, sview) as CrossData),
        this.getBufferParams({linewidth: this.linewidth})
      )
      bufferList.push(crossBuffer)
    }

    return {
      bufferList: bufferList
    }
  }

  updateData (what: any, data: StructureRepresentationData) {
    let bufferIdx = 0

    if (this.lines) {
      const bondData = data.sview!.getBondData(this.getBondParams(what))
      const lineAttributes = {}

      if (!what || what.position) {
        Object.assign(lineAttributes, {
          position1: bondData.position1,
          position2: bondData.position2
        })
      }

      if (!what || what.color) {
        Object.assign(lineAttributes, {
          color: bondData.color,
          color2: bondData.color2
        })
      }

      data.bufferList[ bufferIdx++ ].setAttributes(lineAttributes)
    }

    if (this.crosses !== 'off') {
      const crossData = this._crossData(what, (data.sview as StructureView))
      const crossAttributes = {}

      if (!what || what.position) {
        Object.assign(crossAttributes, {
          position1: crossData!.position1,
          position2: crossData!.position2
        })
      }
      if (!what || what.color) {
        Object.assign(crossAttributes, {
          color: crossData!.color,
          color2: crossData!.color2
        })
      }

      data.bufferList[ bufferIdx++ ].setAttributes(crossAttributes)
    }
  }

  setParameters (params: Partial<LineRepresentationParameters>) {
    var rebuild = false
    var what = {}

    if (params && (params.bondSpacing || params.crossSize)) {
      Object.assign(what, { position: true })
    }

    super.setParameters(params, what, rebuild)

    return this
  }
}

RepresentationRegistry.add('line', LineRepresentation)

export default LineRepresentation
