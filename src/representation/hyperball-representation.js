/**
 * @file Hyperball Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { RepresentationRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import { calculateCenterArray } from '../math/array-utils.js'
import LicoriceRepresentation from './licorice-representation.js'
import SphereBuffer from '../buffer/sphere-buffer.js'
import HyperballStickBuffer from '../buffer/hyperballstick-buffer.js'

/**
 * Hyperball Representation
 */
class HyperballRepresentation extends LicoriceRepresentation {
  constructor (structure, viewer, params) {
    super(structure, viewer, params)

    this.type = 'hyperball'

    this.parameters = Object.assign({

      shrink: {
        type: 'number', precision: 3, max: 1.0, min: 0.001, buffer: true
      }

    }, this.parameters, {

      multipleBond: null,
      bondSpacing: null

    })
  }

  init (params) {
    var p = params || {}
    p.scale = defaults(p.scale, 0.2)
    p.radius = defaults(p.radius, 'vdw')

    this.shrink = defaults(p.shrink, 0.12)

    super.init(p)
  }

  getBondParams (what, params) {
    if (!what || what.radius) {
      params = Object.assign({ radius2: true }, params)
    }

    return super.getBondParams(what, params)
  }

  createData (sview) {
    var sphereBuffer = new SphereBuffer(
      sview.getAtomData(this.getAtomParams()),
      this.getBufferParams({
        sphereDetail: this.sphereDetail,
        disableImpostor: this.disableImpostor,
        dullInterior: true
      })
    )

    this.__center = new Float32Array(sview.bondCount * 3)

    var stickBuffer = new HyperballStickBuffer(
      sview.getBondData(this.getBondParams()),
      this.getBufferParams({
        shrink: this.shrink,
        radialSegments: this.radialSegments,
        disableImpostor: this.disableImpostor,
        dullInterior: true
      })
    )

    return {
      bufferList: [ sphereBuffer, stickBuffer ]
    }
  }

  updateData (what, data) {
    var atomData = data.sview.getAtomData(this.getAtomParams())
    var bondData = data.sview.getBondData(this.getBondParams())
    var sphereData = {}
    var stickData = {}

    if (!what || what.position) {
      sphereData.position = atomData.position
      var from = bondData.position1
      var to = bondData.position2
      stickData.position = calculateCenterArray(from, to, this.__center)
      stickData.position1 = from
      stickData.position2 = to
    }

    if (!what || what.color) {
      sphereData.color = atomData.color
      stickData.color = bondData.color
      stickData.color2 = bondData.color2
    }

    if (!what || what.radius) {
      sphereData.radius = atomData.radius
      stickData.radius = bondData.radius
      stickData.radius2 = bondData.radius2
    }

    data.bufferList[ 0 ].setAttributes(sphereData)
    data.bufferList[ 1 ].setAttributes(stickData)
  }
}

RepresentationRegistry.add('hyperball', HyperballRepresentation)

export default HyperballRepresentation
