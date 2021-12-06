/**
 * @file Helixorient Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log, RepresentationRegistry } from '../globals'
import { defaults } from '../utils'
import Helixorient from '../geometry/helixorient'
import StructureRepresentation, { StructureRepresentationParameters, StructureRepresentationData } from './structure-representation'
import SphereBuffer, { SphereBufferParameters } from '../buffer/sphere-buffer'
import VectorBuffer from '../buffer/vector-buffer'
import Viewer from '../viewer/viewer';
import { Structure } from '../ngl';
import StructureView from '../structure/structure-view';
import Polymer from '../proxy/polymer';
import { AtomDataFields } from '../structure/structure-data';
import SphereGeometryBuffer from '../buffer/spheregeometry-buffer';
import SphereImpostorBuffer from '../buffer/sphereimpostor-buffer';
import { BufferData } from '../buffer/buffer';

/**
 * Helixorient Representation
 */
class HelixorientRepresentation extends StructureRepresentation {
  constructor (structure: Structure, viewer: Viewer, params: Partial<StructureRepresentationParameters>) {
    super(structure, viewer, params)

    this.type = 'helixorient'

    this.parameters = Object.assign({
      sphereDetail: true,
      disableImpostor: true
    }, this.parameters)

    this.init(params)
  }

  init (params: Partial<StructureRepresentationParameters>) {
    const p = params || {}
    p.colorScheme = defaults(p.colorScheme, 'sstruc')
    p.radiusType = defaults(p.radiusType, 'size')
    p.radiusSize = defaults(p.radiusSize, 0.15)
    p.radiusScale = defaults(p.radiusScale, 1.0)
    p.useInteriorColor = defaults(p.useInteriorColor, true)

    super.init(p)
  }

  createData (sview: StructureView) {
    const bufferList: (SphereBuffer|VectorBuffer)[] = []
    const polymerList: Polymer[] = []

    this.structure.eachPolymer(polymer => {
      if (polymer.residueCount < 4) return
      polymerList.push(polymer)

      const helixorient = new Helixorient(polymer)
      const position = helixorient.getPosition()
      const color = helixorient.getColor(this.getColorParams())
      const size = helixorient.getSize(this.getRadiusParams())
      const picking = helixorient.getPicking()

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
          }) as SphereBufferParameters
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
      bufferList: bufferList as (SphereGeometryBuffer|SphereImpostorBuffer|VectorBuffer)[],
      polymerList: polymerList
    }
  }

  updateData (what: AtomDataFields, data: StructureRepresentationData) {
    if (Debug) Log.time(this.type + ' repr update')

    what = what || {}

    for (let i = 0, il = data.polymerList!.length; i < il; ++i) {
      const j = i * 3

      const bufferData: Partial<BufferData> = {}
      const polymer = data.polymerList![ i ]
      const helixorient = new Helixorient(polymer)

      if (what.position) {
        const position = helixorient.getPosition()

        Object.assign(bufferData, {position: position.center})

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
