/**
 * @file Trace Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { RepresentationRegistry } from '../globals'
import { defaults } from '../utils'
import Spline from '../geometry/spline'
import StructureRepresentation, { StructureRepresentationParameters, StructureRepresentationData } from './structure-representation'
import TraceBuffer from '../buffer/trace-buffer'
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import AtomProxy from '../proxy/atom-proxy';
import StructureView from '../structure/structure-view';
import Polymer from '../proxy/polymer';

export interface TraceRepresentationParameters extends StructureRepresentationParameters {
  subdiv: number
  tension: number
  smoothSheet: boolean
}
/**
 * Trace Representation
 */
class TraceRepresentation extends StructureRepresentation {
  protected subdiv: number
  protected tension: number
  protected smoothSheet: boolean
  
  constructor (structure: Structure, viewer: Viewer, params: Partial<TraceRepresentationParameters>) {
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

  init (params: Partial<TraceRepresentationParameters>) {
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

  getSplineParams (params?: {[k:string]: any}) {
    return Object.assign({
      subdiv: this.subdiv,
      tension: this.tension,
      directional: false,
      smoothSheet: this.smoothSheet
    }, params)
  }

  getAtomRadius (atom: AtomProxy) {
    return atom.isTrace() ? 0.1 : 0
  }

  createData (sview: StructureView) {
    var bufferList: TraceBuffer[] = []
    var polymerList: Polymer[] = []

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

  updateData (what: any, data: StructureRepresentationData) {
    what = what || {}

    var i = 0
    var n = data.polymerList!.length

    for (i = 0; i < n; ++i) {
      var bufferData = {}
      var spline = new Spline(data.polymerList![ i ], this.getSplineParams())

      if (what.position) {
        var subPos = spline.getSubdividedPosition()
        Object.assign(bufferData, { position: subPos.position })
      }

      if (what.color) {
        var subCol = spline.getSubdividedColor(this.getColorParams())
        Object.assign(bufferData, { color: subCol.color })
      }

      data.bufferList[ i ].setAttributes(bufferData)
    }
  }

  setParameters (params: Partial<TraceRepresentationParameters>) {
    var rebuild = false
    var what = {}

    if (params && params.tension) {
      Object.assign(what, {position: true})
    }

    super.setParameters(params, what, rebuild)

    return this
  }
}

RepresentationRegistry.add('trace', TraceRepresentation)

export default TraceRepresentation
