/**
 * @file Ribbon Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { RepresentationRegistry } from '../globals'
import { defaults } from '../utils'
import Spline, { SplineParameters } from '../geometry/spline'
import StructureRepresentation, { StructureRepresentationParameters } from './structure-representation'
import RibbonBuffer from '../buffer/ribbon-buffer'
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import AtomProxy from '../proxy/atom-proxy';
import StructureView from '../structure/structure-view';
import Polymer from '../proxy/polymer';

export interface RibbonRepresentationParameters extends StructureRepresentationParameters {
  subdiv: number
  tension: number
  smoothSheet: boolean
}

/**
 * Ribbon Representation
 */
class RibbonRepresentation extends StructureRepresentation {
  protected subdiv: number
  protected tension: number
  protected smoothSheet: boolean
  
  constructor (structure: Structure, viewer: Viewer, params: Partial<RibbonRepresentationParameters>) {
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

  init (params: Partial<RibbonRepresentationParameters>) {
    var p = params || {}
    p.colorScheme = defaults(p.colorScheme, 'chainname')
    p.colorScale = defaults(p.colorScale, 'RdYlBu')
    p.radiusType = defaults(p.radiusType, 'sstruc')
    p.radiusScale = defaults(p.radiusScale, 4.0)

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

  getSplineParams (params?: Partial<SplineParameters>) {
    return Object.assign({
      subdiv: this.subdiv,
      tension: this.tension,
      directional: true,
      smoothSheet: this.smoothSheet
    }, params)
  }

  getAtomRadius (atom: AtomProxy) {
    return atom.isTrace() ? super.getAtomRadius(atom) : 0
  }

  createData (sview: StructureView) {
    var bufferList: RibbonBuffer[] = []
    var polymerList: Polymer[] = []

    this.structure.eachPolymer(polymer => {
      if (polymer.residueCount < 4) return
      polymerList.push(polymer)

      var spline = new Spline(polymer, this.getSplineParams())
      var subPos = spline.getSubdividedPosition()
      var subOri = spline.getSubdividedOrientation()
      var subCol = spline.getSubdividedColor(this.getColorParams())
      var subPick = spline.getSubdividedPicking()
      var subSize = spline.getSubdividedSize(this.getRadiusParams())

      bufferList.push(
        new RibbonBuffer(
          ({
            position: subPos.position,
            normal: subOri.binormal,
            dir: subOri.normal,
            color: subCol.color,
            size: subSize.size,
            picking: subPick.picking
          }),
          this.getBufferParams()
        )
      )
    }, sview.getSelection())

    return {
      bufferList: bufferList,
      polymerList: polymerList
    }
  }

  updateData (what: {position?: boolean, radius?: boolean, scale?: boolean, color?: boolean}, data: {polymerList: Polymer[], bufferList: RibbonBuffer[]}) {
    what = what || {}

    var i = 0
    var n = data.polymerList.length

    for (i = 0; i < n; ++i) {
      var bufferData = {}
      var spline = new Spline(data.polymerList[ i ], this.getSplineParams())

      if (what.position) {
        var subPos = spline.getSubdividedPosition()
        var subOri = spline.getSubdividedOrientation()
        Object.assign(bufferData, {
          position: subPos.position,
          normal: subOri.binormal,
          dir: subOri.normal
        })
      }

      if (what.radius || what.scale) {
        var subSize = spline.getSubdividedSize(this.getRadiusParams())
        Object.assign(bufferData, {size: subSize.size})
      }

      if (what.color) {
        var subCol = spline.getSubdividedColor(this.getColorParams())
        Object.assign(bufferData, {color: subCol.color})
      }

      data.bufferList[ i ].setAttributes(bufferData)
    }
  }

  setParameters (params: Partial<RibbonRepresentationParameters>) {
    var rebuild = false
    var what = {}

    if (params && params.tension) {
      Object.assign(what, {position: true})
    }

    super.setParameters(params, what, rebuild)

    return this
  }
}

RepresentationRegistry.add('ribbon', RibbonRepresentation)

export default RibbonRepresentation
