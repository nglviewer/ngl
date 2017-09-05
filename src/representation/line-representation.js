/**
 * @file Line Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { defaults } from '../utils.js'
import { RepresentationRegistry } from '../globals.js'
import StructureRepresentation from './structure-representation.js'
import WideLineBuffer from '../buffer/wideline-buffer.js'
import { AtomPicker } from '../utils/picker.js'

function getIsolatedAtomSet (structure) {
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

/**
 * Line representation
 */
class LineRepresentation extends StructureRepresentation {
  /**
   * Create Line representation object
   * @param {Structure} structure - the structure to be represented
   * @param {Viewer} viewer - a viewer object
   * @param {RepresentationParameters} params - representation parameters, plus the properties listed below
   * @property {String} multipleBond - one off "off", "symmetric", "offset"
   * @param {Float} params.bondSpacing - spacing for multiple bond rendering
   * @param {Integer} params.linewidth - width of lines
   * @param {null} params.flatShaded - not available
   * @param {null} params.side - not available
   * @param {null} params.wireframe - not available
   * @param {null} params.roughness - not available
   * @param {null} params.metalness - not available
   * @param {null} params.diffuse - not available
   */
  constructor (structure, viewer, params) {
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
          'isolated': 'isolated',
          'all': 'all'
        }
      },
      crossSize: {
        type: 'number', precision: 2, max: 1.0, min: 0.05, rebuild: true
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

  init (params) {
    var p = params || {}

    this.multipleBond = defaults(p.multipleBond, 'off')
    this.bondSpacing = defaults(p.bondSpacing, 1.0)
    this.linewidth = defaults(p.linewidth, 2)
    this.lines = defaults(p.lines, true)
    this.crosses = defaults(p.crosses, 'isolated')
    this.crossSize = defaults(p.crossSize, 0.2)

    super.init(p)
  }

  getBondParams (what, params) {
    params = Object.assign({
      multipleBond: this.multipleBond,
      bondSpacing: this.bondSpacing,
      radiusParams: { 'radius': 0.1, 'scale': 1 }
    }, params)

    return super.getBondParams(what, params)
  }

  _crossData (what, sview) {
    if (what) {
      if (!what.position && !what.color) return
    }

    const p = {}
    if (this.crosses === 'isolated') {
      p.atomSet = getIsolatedAtomSet(sview)
    }

    const atomData = sview.getAtomData(this.getAtomParams(what, p))
    const crossData = {}
    const position = atomData.position
    const color = atomData.color
    const picking = atomData.picking

    const size = (position || color).length
    const attrSize = size * 3

    let cPosition1
    let cPosition2
    let cColor
    let cColor2
    let cSize

    let pickingArray

    if (!what || what.position) {
      cPosition1 = crossData.position1 = new Float32Array(attrSize)
      cPosition2 = crossData.position2 = new Float32Array(attrSize)
      cSize = this.crossSize
    }
    if (!what || what.color) {
      cColor = crossData.color = new Float32Array(attrSize)
      cColor2 = crossData.color2 = new Float32Array(attrSize)
    }
    if (!what || what.picking) {
      pickingArray = new Float32Array(atomData.picking.array.length * 3) // Needs padding??
    }

    for (let v = 0; v < size; v++) {
      const j = v * 3
      const i = j * 3

      if (!what || what.position) {
        const x = position[ j ]
        const y = position[ j + 1 ]
        const z = position[ j + 2 ]

        cPosition1[ i ] = x - cSize
        cPosition1[ i + 1 ] = y
        cPosition1[ i + 2 ] = z
        cPosition2[ i ] = x + cSize
        cPosition2[ i + 1 ] = y
        cPosition2[ i + 2 ] = z

        cPosition1[ i + 3 ] = x
        cPosition1[ i + 4 ] = y - cSize
        cPosition1[ i + 5 ] = z
        cPosition2[ i + 3 ] = x
        cPosition2[ i + 4 ] = y + cSize
        cPosition2[ i + 5 ] = z

        cPosition1[ i + 6 ] = x
        cPosition1[ i + 7 ] = y
        cPosition1[ i + 8 ] = z - cSize
        cPosition2[ i + 6 ] = x
        cPosition2[ i + 7 ] = y
        cPosition2[ i + 8 ] = z + cSize
      }

      if (!what || what.color) {
        const cimax = i + 9
        for (let ci = i; ci < cimax; ci += 3) {
          cColor[ ci ] = cColor2[ ci ] = color[ j ]
          cColor[ ci + 1 ] = cColor2[ ci + 1 ] = color[ j + 1 ]
          cColor[ ci + 2 ] = cColor2[ ci + 2 ] = color[ j + 2 ]
        }
      }

      if (!what || what.picking) {
        pickingArray[ j ] =
        pickingArray[ j + 1 ] =
        pickingArray[ j + 2 ] = picking.array[ v ]
      }
    }

    if (!what || what.picking) {
      crossData.picking = new AtomPicker(
        pickingArray, atomData.picking.structure
      )
    }

    return crossData
  }

  createData (sview) {
    var what = { position: true, color: true, picking: true }

    var bufferList = []

    if (this.lines) {
      var bondData = sview.getBondData(this.getBondParams(what))

      var lineBuffer = new WideLineBuffer(
        bondData, this.getBufferParams({ linewidth: this.linewidth })
      )

      bufferList.push(lineBuffer)
    }

    if (this.crosses !== 'off') {
      var crossBuffer = new WideLineBuffer(
        this._crossData(what, sview),
        this.getBufferParams({linewidth: this.linewidth})
      )
      bufferList.push(crossBuffer)
    }

    return {
      bufferList: bufferList
    }
  }

  updateData (what, data) {
    var bufferIdx = 0

    if (this.lines) {
      var bondData = data.sview.getBondData(this.getBondParams(what))
      var lineData = {}

      if (!what || what.position) {
        lineData.position1 = bondData.position1
        lineData.position2 = bondData.position2
      }

      if (!what || what.color) {
        lineData.color = bondData.color
        lineData.color2 = bondData.color2
      }

      data.bufferList[ bufferIdx++ ].setAttributes(lineData)
    }

    if (this.crosses !== 'off') {
      var crossAtomData = this._crossData(what, data.sview)
      var crossData = {}

      if (!what || what.position) {
        crossData.position1 = crossAtomData.position1
        crossData.position2 = crossAtomData.position2
      }
      if (!what || what.color) {
        crossData.color = crossAtomData.color
        crossData.color2 = crossAtomData.color2
      }

      data.bufferList[ bufferIdx++ ].setAttributes(crossData)
    }
  }

  setParameters (params) {
    var rebuild = false
    var what = {}

    if (params && params.bondSpacing) {
      what.position = true
    }

    super.setParameters(params, what, rebuild)

    return this
  }
}

RepresentationRegistry.add('line', LineRepresentation)

export default LineRepresentation
