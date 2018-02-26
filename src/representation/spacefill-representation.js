/**
 * @file Spacefill Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { RepresentationRegistry } from '../globals.js'
import StructureRepresentation from './structure-representation.js'
import SphereBuffer from '../buffer/sphere-buffer.js'

/**
 * Spacefill Representation
 */
class SpacefillRepresentation extends StructureRepresentation {
  constructor (structure, viewer, params) {
    super(structure, viewer, params)

    this.type = 'spacefill'

    this.parameters = Object.assign({
      sphereDetail: true,
      disableImpostor: true
    }, this.parameters)

    this.init(params)
  }

  init (params) {
    var p = params || {}

    super.init(p)
  }

  createData (sview) {
    var sphereBuffer = new SphereBuffer(
      sview.getAtomData(this.getAtomParams()),
      this.getBufferParams({
        sphereDetail: this.sphereDetail,
        dullInterior: true,
        disableImpostor: this.disableImpostor
      })
    )

    return {
      bufferList: [ sphereBuffer ]
    }
  }

  updateData (what, data) {
    var atomData = data.sview.getAtomData(this.getAtomParams(what))
    var sphereData = {}

    if (!what || what.position) {
      sphereData.position = atomData.position
    }

    if (!what || what.color) {
      sphereData.color = atomData.color
    }

    if (!what || what.radius) {
      sphereData.radius = atomData.radius
    }

    data.bufferList[ 0 ].setAttributes(sphereData)
  }
}

RepresentationRegistry.add('spacefill', SpacefillRepresentation)

export default SpacefillRepresentation
