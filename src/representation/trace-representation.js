/**
 * @file Trace Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { RepresentationRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import Spline from '../geometry/spline.js'
import StructureRepresentation from './structure-representation.js'
import TraceBuffer from '../buffer/trace-buffer.js'

/**
 * Trace Representation
 */
class TraceRepresentation extends StructureRepresentation {
  constructor (structure, viewer, params) {
    super(structure, viewer, params)

    this.type = 'trace'

    this.parameters = Object.assign({

      subdiv: {
        type: 'integer', max: 50, min: 1, rebuild: true
      },
      tension: {
        type: 'number', precision: 1, max: 1.0, min: 0.1
      },
      smoothSheet: {
        type: 'boolean', rebuild: true
      }

    }, this.parameters, {

      flatShaded: null,
      side: null,
      wireframe: null

    })

    this.init(params)
  }

  init (params) {
    var p = params || {}
    p.colorScheme = defaults(p.colorScheme, 'chainname')
    p.colorScale = defaults(p.colorScale, 'RdYlBu')

    if (p.quality === 'low') {
      this.subdiv = 3
    } else if (p.quality === 'medium') {
      this.subdiv = 6
    } else if (p.quality === 'high') {
      this.subdiv = 12
    } else {
      this.subdiv = defaults(p.subdiv, 6)
    }

    this.tension = defaults(p.tension, NaN)
    this.smoothSheet = defaults(p.smoothSheet, false)

    super.init(p)
  }

  getSplineParams (params) {
    return Object.assign({
      subdiv: this.subdiv,
      tension: this.tension,
      directional: false,
      smoothSheet: this.smoothSheet
    }, params)
  }

  createData (sview) {
    var bufferList = []
    var polymerList = []

    this.structure.eachPolymer(polymer => {
      if (polymer.residueCount < 4) return
      polymerList.push(polymer)

      var spline = new Spline(polymer, this.getSplineParams())
      var subPos = spline.getSubdividedPosition()
      var subCol = spline.getSubdividedColor(this.getColorParams())

      bufferList.push(
        new TraceBuffer(
          Object.assign({}, subPos, subCol),
          this.getBufferParams()
        )
      )
    }, sview.getSelection())

    return {
      bufferList: bufferList,
      polymerList: polymerList
    }
  }

  updateData (what, data) {
    what = what || {}

    var i = 0
    var n = data.polymerList.length

    for (i = 0; i < n; ++i) {
      var bufferData = {}
      var spline = new Spline(data.polymerList[ i ], this.getSplineParams())

      if (what.position) {
        var subPos = spline.getSubdividedPosition()
        bufferData.position = subPos.position
      }

      if (what.color) {
        var subCol = spline.getSubdividedColor(this.getColorParams())
        bufferData.color = subCol.color
      }

      data.bufferList[ i ].setAttributes(bufferData)
    }
  }

  setParameters (params) {
    var rebuild = false
    var what = {}

    if (params && params.tension) {
      what.position = true
    }

    super.setParameters(params, what, rebuild)

    return this
  }
}

RepresentationRegistry.add('trace', TraceRepresentation)

export default TraceRepresentation
