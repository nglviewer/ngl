/**
 * @file Spacefill Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { defaults } from '../utils'
import { RepresentationRegistry } from '../globals'
import StructureRepresentation, { StructureRepresentationParameters, StructureRepresentationData } from './structure-representation'
import SphereBuffer, { SphereBufferData, SphereBufferParameters } from '../buffer/sphere-buffer'
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import StructureView from '../structure/structure-view';
import SphereGeometryBuffer from '../buffer/spheregeometry-buffer';
import { AtomDataFields } from '../structure/structure-data';
import SphereImpostorBuffer from '../buffer/sphereimpostor-buffer';

/**
 * Spacefill Representation
 */
class SpacefillRepresentation extends StructureRepresentation {
  constructor (structure: Structure, viewer: Viewer, params: Partial<StructureRepresentationParameters>) {
    super(structure, viewer, params)

    this.type = 'spacefill'

    this.parameters = Object.assign({
      sphereDetail: true,
      disableImpostor: true
    }, this.parameters)

    this.init(params)
  }

  init (params: Partial<StructureRepresentationParameters>) {
    var p = params || {}
    p.useInteriorColor = defaults(p.useInteriorColor, true)

    super.init(p)
  }

  createData (sview: StructureView) {
    var sphereBuffer = new SphereBuffer(
      (sview.getAtomData(this.getAtomParams()) as SphereBufferData),
      (this.getBufferParams({
        sphereDetail: this.sphereDetail,
        dullInterior: true,
        disableImpostor: this.disableImpostor
      }) as SphereBufferParameters)
    )

    return {
      bufferList: [ sphereBuffer as SphereGeometryBuffer|SphereImpostorBuffer ]
    }
  }

  updateData (what: AtomDataFields, data: StructureRepresentationData) {
    var atomData = data.sview!.getAtomData(this.getAtomParams(what))
    var sphereData: Partial<SphereBufferData> = {}

    if (!what || what.position) {
      Object.assign(sphereData, {position: atomData.position})
    }

    if (!what || what.color) {
      Object.assign(sphereData, {color: atomData.color})
    }

    if (!what || what.radius) {
      Object.assign(sphereData, {radius: atomData.radius})
    }

    data.bufferList[ 0 ].setAttributes(sphereData)
  }
}

RepresentationRegistry.add('spacefill', SpacefillRepresentation)

export default SpacefillRepresentation
