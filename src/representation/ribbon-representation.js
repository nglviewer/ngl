/**
 * @file Ribbon Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { RepresentationRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import Spline from '../geometry/spline.js'
import StructureRepresentation from './structure-representation.js'
import RibbonBuffer from '../buffer/ribbon-buffer.js'

/**
 * Ribbon Representation
 */
class RibbonRepresentation extends StructureRepresentation {
  constructor (structure, viewer, params) {
    super(structure, viewer, params)

    this.type = 'ribbon'

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

      side: null,
      wireframe: null,
      linewidth: null

    })

    this.init(params)
  }

  init (params) {
    var p = params || {}
    p.colorScheme = defaults(p.colorScheme, 'chainname')
    p.colorScale = defaults(p.colorScale, 'RdYlBu')
    p.radius = defaults(p.radius, 'sstruc')
    p.scale = defaults(p.scale, 4.0)

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
      directional: true,
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
      var subOri = spline.getSubdividedOrientation()
      var subCol = spline.getSubdividedColor(this.getColorParams())
      var subPick = spline.getSubdividedPicking()
      var subSize = spline.getSubdividedSize(this.radius, this.scale)

      bufferList.push(
        new RibbonBuffer(
          {
            position: subPos.position,
            normal: subOri.binormal,
            dir: subOri.normal,
            color: subCol.color,
            size: subSize.size,
            picking: subPick.picking
          },
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
        var subOri = spline.getSubdividedOrientation()
        bufferData.position = subPos.position
        bufferData.normal = subOri.binormal
        bufferData.dir = subOri.normal
      }

      if (what.radius || what.scale) {
        var subSize = spline.getSubdividedSize(this.radius, this.scale)
        bufferData.size = subSize.size
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

RepresentationRegistry.add('ribbon', RibbonRepresentation)

export default RibbonRepresentation
