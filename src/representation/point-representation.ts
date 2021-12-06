/**
 * @file Point Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { RepresentationRegistry } from '../globals'
import { defaults } from '../utils'
import StructureRepresentation, { StructureRepresentationParameters, StructureRepresentationData } from './structure-representation'
import PointBuffer from '../buffer/point-buffer'
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import StructureView from '../structure/structure-view';
import { AtomDataFields } from '../structure/structure-data';

export interface PointRepresentationParameters extends StructureRepresentationParameters {
  pointSize: number
  sizeAttenuation: boolean
  sortParticles: boolean
  useTexture: boolean
  alphaTest: number
  forceTransparent: boolean
  edgeBleach: number
}

/**
 * Point Representation
 */
class PointRepresentation extends StructureRepresentation {
  protected pointSize: number
  protected sizeAttenuation: boolean
  protected sortParticles: boolean
  protected useTexture: boolean
  protected alphaTest: number
  protected forceTransparent: boolean
  protected edgeBleach: number

  constructor (structure: Structure, viewer: Viewer, params: Partial<PointRepresentationParameters>) {
    super(structure, viewer, params)

    this.type = 'point'

    this.parameters = Object.assign({

      pointSize: {
        type: 'number', precision: 1, max: 100, min: 0, buffer: true
      },
      sizeAttenuation: {
        type: 'boolean', buffer: true
      },
      sortParticles: {
        type: 'boolean', rebuild: true
      },
      useTexture: {
        type: 'boolean', buffer: true
      },
      alphaTest: {
        type: 'range', step: 0.001, max: 1, min: 0, buffer: true
      },
      forceTransparent: {
        type: 'boolean', buffer: true
      },
      edgeBleach: {
        type: 'range', step: 0.001, max: 1, min: 0, buffer: true
      }

    }, this.parameters, {

      flatShaded: null,
      wireframe: null,
      linewidth: null,
      side: null,

      roughness: null,
      metalness: null

    })

    this.init(params)
  }

  init (params: Partial<PointRepresentationParameters>) {
    var p = params || {}

    this.pointSize = defaults(p.pointSize, 1)
    this.sizeAttenuation = defaults(p.sizeAttenuation, true)
    this.sortParticles = defaults(p.sortParticles, false)
    this.useTexture = defaults(p.useTexture, false)
    this.alphaTest = defaults(p.alphaTest, 0.5)
    this.forceTransparent = defaults(p.forceTransparent, false)
    this.edgeBleach = defaults(p.edgeBleach, 0.0)

    super.init(p)
  }

  createData (sview: StructureView) {
    var what = { position: true, color: true, picking: true }
    var atomData = sview.getAtomData(this.getAtomParams(what))

    var pointBuffer = new PointBuffer(
      atomData,
      this.getBufferParams({
        pointSize: this.pointSize,
        sizeAttenuation: this.sizeAttenuation,
        sortParticles: this.sortParticles,
        useTexture: this.useTexture,
        alphaTest: this.alphaTest,
        forceTransparent: this.forceTransparent,
        edgeBleach: this.edgeBleach
      })
    )

    return {
      bufferList: [ pointBuffer ]
    }
  }

  updateData (what: AtomDataFields, data: StructureRepresentationData) {
    var atomData = data.sview!.getAtomData(this.getAtomParams(what))
    var pointData = {}

    if (!what || what.position) {
      Object.assign(pointData, {position: atomData.position})
    }

    if (!what || what.color) {
      Object.assign(pointData, {color: atomData.color})
    }

    data.bufferList[ 0 ].setAttributes(pointData)
  }

  getAtomRadius () {
    return 0.1
  }
}

RepresentationRegistry.add('point', PointRepresentation)

export default PointRepresentation
