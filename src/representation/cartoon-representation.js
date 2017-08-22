/**
 * @file Cartoon Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { defaults } from '../utils.js'
import { Debug, Log, RepresentationRegistry } from '../globals.js'
import Spline from '../geometry/spline.js'
import StructureRepresentation from './structure-representation.js'
import TubeMeshBuffer from '../buffer/tubemesh-buffer.js'

/**
 * Cartoon representation. Show a thick ribbon that
 * smoothly connecting backbone atoms in polymers.
 *
 * __Name:__ _cartoon_
 *
 * @example
 * stage.loadFile( "rcsb://1crn" ).then( function( o ){
 *     o.addRepresentation( "cartoon" );
 *     o.autoView();
 * } );
 */
class CartoonRepresentation extends StructureRepresentation {
  /**
   * Create Cartoon representation object
   * @param {Structure} structure - the structure to be represented
   * @param {Viewer} viewer - a viewer object
   * @param {StructureRepresentationParameters} params - representation parameters
   */
  constructor (structure, viewer, params) {
    super(structure, viewer, params)

    this.type = 'cartoon'

    this.parameters = Object.assign({

      aspectRatio: {
        type: 'number', precision: 1, max: 10.0, min: 1.0
      },
      subdiv: {
        type: 'integer', max: 50, min: 1, rebuild: true
      },
      radialSegments: {
        type: 'integer', max: 50, min: 1, rebuild: true
      },
      tension: {
        type: 'number', precision: 1, max: 1.0, min: 0.1
      },
      capped: {
        type: 'boolean', rebuild: true
      },
      smoothSheet: {
        type: 'boolean', rebuild: true
      }

    }, this.parameters)

    this.init(params)
  }

  init (params) {
    var p = params || {}
    p.colorScheme = defaults(p.colorScheme, 'chainname')
    p.colorScale = defaults(p.colorScale, 'RdYlBu')
    p.radius = defaults(p.radius, 'sstruc')
    p.scale = defaults(p.scale, 0.7)

    this.aspectRatio = defaults(p.aspectRatio, 5.0)
    this.tension = defaults(p.tension, NaN)
    this.capped = defaults(p.capped, true)
    this.smoothSheet = defaults(p.smoothSheet, false)

    if (p.quality === 'low') {
      this.subdiv = 3
      this.radialSegments = 6
    } else if (p.quality === 'medium') {
      this.subdiv = 6
    } else if (p.quality === 'high') {
      this.subdiv = 12
    } else {
      this.subdiv = defaults(p.subdiv, 6)
    }

    super.init(p)
  }

  getSplineParams (params) {
    return Object.assign({
      subdiv: this.subdiv,
      tension: this.tension,
      directional: this.aspectRatio !== 1.0,
      smoothSheet: this.smoothSheet
    }, params)
  }

  getSpline (polymer) {
    return new Spline(polymer, this.getSplineParams())
  }

  getScale (polymer) {
    return polymer.isCg() ? this.scale * this.aspectRatio : this.scale
  }

  getAspectRatio (polymer) {
    return polymer.isCg() ? 1.0 : this.aspectRatio
  }

  createData (sview) {
    var bufferList = []
    var polymerList = []

    this.structure.eachPolymer(polymer => {
      if (polymer.residueCount < 4) return
      polymerList.push(polymer)

      var spline = this.getSpline(polymer)

      var subPos = spline.getSubdividedPosition()
      var subOri = spline.getSubdividedOrientation()
      var subCol = spline.getSubdividedColor(this.getColorParams())
      var subPick = spline.getSubdividedPicking()
      var subSize = spline.getSubdividedSize(this.radius, this.getScale(polymer))

      bufferList.push(
        new TubeMeshBuffer(
          Object.assign({}, subPos, subOri, subCol, subPick, subSize),
          this.getBufferParams({
            radialSegments: this.radialSegments,
            aspectRatio: this.getAspectRatio(polymer),
            capped: this.capped,
            dullInterior: true
          })
        )
      )
    }, sview.getSelection())

    return {
      bufferList: bufferList,
      polymerList: polymerList
    }
  }

  updateData (what, data) {
    if (Debug) Log.time(this.type + ' repr update')

    what = what || {}

    for (var i = 0, il = data.polymerList.length; i < il; ++i) {
      var bufferData = {}
      var polymer = data.polymerList[ i ]
      var spline = this.getSpline(polymer)

      data.bufferList[ i ].aspectRatio = this.getAspectRatio(polymer)

      if (what.position || what.radius) {
        var subPos = spline.getSubdividedPosition()
        var subOri = spline.getSubdividedOrientation()
        var subSize = spline.getSubdividedSize(this.radius, this.getScale(polymer))

        bufferData.position = subPos.position
        bufferData.normal = subOri.normal
        bufferData.binormal = subOri.binormal
        bufferData.tangent = subOri.tangent
        bufferData.size = subSize.size
      }

      if (what.color) {
        var subCol = spline.getSubdividedColor(this.getColorParams())
        bufferData.color = subCol.color
      }

      if (what.picking) {
        var subPick = spline.getSubdividedPicking()
        bufferData.picking = subPick.picking
      }

      data.bufferList[ i ].setAttributes(bufferData)
    }

    if (Debug) Log.timeEnd(this.type + ' repr update')
  }

  setParameters (params) {
    var rebuild = false
    var what = {}

    if (params && params.aspectRatio) {
      what.radius = true
    }

    if (params && params.tension) {
      what.position = true
    }

    super.setParameters(params, what, rebuild)

    return this
  }
}

RepresentationRegistry.add('cartoon', CartoonRepresentation)

export default CartoonRepresentation
