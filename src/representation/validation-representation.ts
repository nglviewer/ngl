/**
 * @file Validation Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { RepresentationRegistry } from '../globals'
import { defaults } from '../utils'
import StructureRepresentation, { StructureRepresentationParameters } from './structure-representation'
import CylinderBuffer from '../buffer/cylinder-buffer'
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import StructureView from '../structure/structure-view';
import CylinderGeometryBuffer from '../buffer/cylindergeometry-buffer';
import CylinderImpostorBuffer from '../buffer/cylinderimpostor-buffer';

/**
 * Validation representation
 */
class ValidationRepresentation extends StructureRepresentation {
  constructor (structure: Structure, viewer: Viewer, params: Partial<StructureRepresentationParameters>) {
    super(structure, viewer, params)

    this.type = 'validation'

    this.parameters = Object.assign({

    }, this.parameters, {
      radiusType: null,
      radiusSize: null,
      radiusScale: null
    })

    this.init(params)
  }

  init (params: Partial<StructureRepresentationParameters>) {
    const p = params || {}
    p.colorValue = defaults(p.colorValue, '#f0027f')
    p.useInteriorColor = defaults(p.useInteriorColor, true)

    super.init(p)
  }

  createData (sview: StructureView) {
    if (!sview.validation) return

    const clashData = sview.validation.getClashData({
      structure: sview,
      color: this.colorValue
    })

    const cylinderBuffer = new CylinderBuffer(
      clashData, this.getBufferParams({ openEnded: false })
    )

    return {
      bufferList: [ cylinderBuffer as CylinderGeometryBuffer|CylinderImpostorBuffer ]
    }
  }
}

RepresentationRegistry.add('validation', ValidationRepresentation)

export default ValidationRepresentation
