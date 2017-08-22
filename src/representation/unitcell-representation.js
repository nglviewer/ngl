/**
 * @file Unitcell Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { RepresentationRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import StructureRepresentation from './structure-representation.js'
import SphereBuffer from '../buffer/sphere-buffer.js'
import CylinderBuffer from '../buffer/cylinder-buffer.js'

/**
 * Unitcell Representation
 */
class UnitcellRepresentation extends StructureRepresentation {
  constructor (structure, viewer, params) {
    super(structure, viewer, params)

    this.type = 'unitcell'

    this.parameters = Object.assign({

      radius: {
        type: 'number', precision: 3, max: 10.0, min: 0.001
      },
      sphereDetail: true,
      radialSegments: true,
      disableImpostor: true

    }, this.parameters, {
      assembly: null
    })

    this.init(params)
  }

  init (params) {
    const p = params || {}

    let defaultRadius = 0.5
    if (this.structure.unitcell) {
      defaultRadius = Math.cbrt(this.structure.unitcell.volume) / 200
    }

    p.radius = defaults(p.radius, defaultRadius)
    p.colorValue = defaults(p.colorValue, 'orange')

    super.init(p)
  }

  getUnitcellData (structure) {
    return structure.unitcell.getData(structure)
  }

  create () {
    const structure = this.structureView.getStructure()
    if (!structure.unitcell) return
    const unitcellData = this.getUnitcellData(structure)

    this.sphereBuffer = new SphereBuffer(
      unitcellData.vertex,
      this.getBufferParams({
        sphereDetail: this.sphereDetail,
        disableImpostor: this.disableImpostor,
        dullInterior: true
      })
    )

    this.cylinderBuffer = new CylinderBuffer(
      unitcellData.edge,
      this.getBufferParams({
        openEnded: true,
        radialSegments: this.radialSegments,
        disableImpostor: this.disableImpostor,
        dullInterior: true
      })
    )

    this.dataList.push({
      sview: this.structureView,
      bufferList: [ this.sphereBuffer, this.cylinderBuffer ]
    })
  }

  updateData (what, data) {
    const structure = data.sview.getStructure()
    const unitcellData = this.getUnitcellData(structure)
    const sphereData = {}
    const cylinderData = {}

    if (!what || what.position) {
      sphereData.position = unitcellData.vertexPosition
      cylinderData.position1 = unitcellData.edgePosition1
      cylinderData.position2 = unitcellData.edgePosition2
    }

    if (!what || what.color) {
      sphereData.color = unitcellData.vertexColor
      cylinderData.color = unitcellData.edgeColor
      cylinderData.color2 = unitcellData.edgeColor
    }

    if (!what || what.radius) {
      sphereData.radius = unitcellData.vertexRadius
      cylinderData.radius = unitcellData.edgeRadius
    }

    this.sphereBuffer.setAttributes(sphereData)
    this.cylinderBuffer.setAttributes(cylinderData)
  }
}

RepresentationRegistry.add('unitcell', UnitcellRepresentation)

export default UnitcellRepresentation
