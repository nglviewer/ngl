/**
 * @file Cartoon Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { defaults } from '../utils'
import { Debug, Log, RepresentationRegistry } from '../globals'
import Spline from '../geometry/spline'
import StructureRepresentation, { StructureRepresentationParameters, StructureRepresentationData } from './structure-representation'
import TubeMeshBuffer from '../buffer/tubemesh-buffer'
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import Polymer from '../proxy/polymer';
import AtomProxy from '../proxy/atom-proxy';
import StructureView from '../structure/structure-view';
import Buffer from '../buffer/buffer';

export interface CartoonRepresentationParameters extends StructureRepresentationParameters {
  aspectRatio: number
  subdiv: number
  radialSegments: number
  tension: number
  capped: boolean
  smoothSheet: boolean
}

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
  protected aspectRatio: number
  protected tension: number
  protected capped: boolean
  protected smoothSheet: boolean
  protected subdiv: number
  
  /**
   * Create Cartoon representation object
   * @param {Structure} structure - the structure to be represented
   * @param {Viewer} viewer - a viewer object
   * @param {StructureRepresentationParameters} params - representation parameters
   */
  constructor (structure: Structure, viewer: Viewer, params: Partial<CartoonRepresentationParameters>) {
    super(structure, viewer, params)

    this.type = 'cartoon'

    this.parameters = Object.assign({

      aspectRatio: {
        type: 'number', precision: 1, max: 10.0, min: 1.0, rebuild: true
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

  init (params: Partial<CartoonRepresentationParameters>) {
    var p = params || {}
    p.colorScheme = defaults(p.colorScheme, 'chainname')
    p.colorScale = defaults(p.colorScale, 'RdYlBu')
    p.radiusType = defaults(p.radiusType, 'sstruc')
    p.radiusScale = defaults(p.radiusScale, 0.7)
    p.useInteriorColor = defaults(p.useInteriorColor, true)

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

  getSplineParams (params?: Partial<CartoonRepresentationParameters>) {
    return Object.assign({
      subdiv: this.subdiv,
      tension: this.tension,
      directional: this.aspectRatio !== 1.0,
      smoothSheet: this.smoothSheet
    }, params)
  }

  getSpline (polymer: Polymer): Spline {
    return new Spline(polymer, this.getSplineParams())
  }

  getAspectRatio (polymer: Polymer): number {
    return polymer.isCg() ? 1.0 : this.aspectRatio
  }

  getAtomRadius (atom: AtomProxy): number {
    return atom.isTrace() ? super.getAtomRadius(atom) : 0
  }

  createData (sview: StructureView) {
    let bufferList: Buffer[] = []
    let polymerList: Polymer[] = []

    this.structure.eachPolymer(polymer => {
      if (polymer.residueCount < 4) return
      polymerList.push(polymer)

      const spline = this.getSpline(polymer)
      const aspectRatio = this.getAspectRatio(polymer)

      const subPos = spline.getSubdividedPosition()
      const subOri = spline.getSubdividedOrientation()
      const subCol = spline.getSubdividedColor(this.getColorParams())
      const subPick = spline.getSubdividedPicking()
      const subSize = spline.getSubdividedSize(this.getRadiusParams())

      bufferList.push(
        new TubeMeshBuffer(
          Object.assign({}, subPos, subOri, subCol, subPick, subSize),
          this.getBufferParams({
            radialSegments: this.radialSegments,
            aspectRatio: aspectRatio,
            capped: this.capped
          })
        )
      )
    }, sview.getSelection())

    return {
      bufferList: bufferList,
      polymerList: polymerList
    }
  }

  updateData (what: any, data: StructureRepresentationData) {
    if (Debug) Log.time(this.type + ' repr update')

    what = what || {}

    for (var i = 0, il = data.polymerList!.length; i < il; ++i) {
      var bufferData: {[key: string]: any} = {}
      var polymer = data.polymerList![ i ]
      var spline = this.getSpline(polymer)
      var aspectRatio = this.getAspectRatio(polymer)

      Object.assign(data.bufferList[ i ], {aspectRatio: aspectRatio})

      if (what.position || what.radius) {
        var subPos = spline.getSubdividedPosition()
        var subOri = spline.getSubdividedOrientation()
        var subSize = spline.getSubdividedSize(this.getRadiusParams(aspectRatio))

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

  setParameters (params: Partial<CartoonRepresentationParameters>) {
    const rebuild = false
    var what: {[k: string]: any} = {}

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
