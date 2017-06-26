/**
 * @file Helixorient Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log, RepresentationRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import Helixorient from '../geometry/helixorient.js'
import StructureRepresentation from './structure-representation.js'
import SphereBuffer from '../buffer/sphere-buffer.js'
import VectorBuffer from '../buffer/vector-buffer.js'

/**
 * Helixorient Representation
 */
class HelixorientRepresentation extends StructureRepresentation {
  constructor (structure, viewer, params) {
    super(structure, viewer, params)

    this.type = 'helixorient'

    this.parameters = Object.assign({
      sphereDetail: true,
      disableImpostor: true
    }, this.parameters)

    this.init(params)
  }

  init (params) {
    var p = params || {}
    p.colorScheme = defaults(p.colorScheme, 'sstruc')
    p.radius = defaults(p.radius, 0.15)
    p.scale = defaults(p.scale, 1.0)

    super.init(p)
  }

  createData (sview) {
    var bufferList = []
    var polymerList = []

    this.structure.eachPolymer(polymer => {
      if (polymer.residueCount < 4) return
      polymerList.push(polymer)

      var helixorient = new Helixorient(polymer)
      var position = helixorient.getPosition()
      var color = helixorient.getColor(this.getColorParams())
      var size = helixorient.getSize(this.radius, this.scale)
      var picking = helixorient.getPicking()

      bufferList.push(
        new SphereBuffer(
          {
            position: position.center,
            color: color.color,
            radius: size.size,
            picking: picking.picking
          },
            this.getBufferParams({
              sphereDetail: this.sphereDetail,
              disableImpostor: this.disableImpostor,
              dullInterior: true
            })
        ),
        new VectorBuffer(
          {
            position: position.center,
            vector: position.axis
          },
            this.getBufferParams({
              color: 'skyblue',
              scale: 1
            })
        ),
        new VectorBuffer(
          {
            position: position.center,
            vector: position.resdir
          },
            this.getBufferParams({
              color: 'lightgreen',
              scale: 1
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
      var j = i * 3

      var bufferData = {}
      var polymer = data.polymerList[ i ]
      var helixorient = new Helixorient(polymer)

      if (what.position) {
        var position = helixorient.getPosition()

        bufferData.position = position.center

        data.bufferList[ j + 1 ].setAttributes({
          'position': position.center,
          'vector': position.axis
        })
        data.bufferList[ j + 2 ].setAttributes({
          'position': position.center,
          'vector': position.resdir
        })
      }

      data.bufferList[ j ].setAttributes(bufferData)
    }

    if (Debug) Log.timeEnd(this.type + ' repr update')
  }
}

RepresentationRegistry.add('helixorient', HelixorientRepresentation)

export default HelixorientRepresentation
