/**
 * @file Unitcell Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { RepresentationRegistry } from '../globals'
import { defaults } from '../utils'
import StructureRepresentation, { StructureRepresentationParameters, StructureRepresentationData } from './structure-representation'
import SphereBuffer, { SphereBufferData, SphereBufferParameters } from '../buffer/sphere-buffer'
import CylinderBuffer, { CylinderBufferData } from '../buffer/cylinder-buffer'
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import { AtomDataFields } from '../structure/structure-data';
import StructureView from '../structure/structure-view';
import SphereGeometryBuffer from '../buffer/spheregeometry-buffer';
import CylinderGeometryBuffer from '../buffer/cylindergeometry-buffer';
// @ts-ignore: unused import UnitcellPicker required for declaration only
import { UnitcellPicker } from '../utils/picker';

export interface UnitcellRepresentationParameters extends StructureRepresentationParameters {
  radiusSize: number
  sphereDetail: number
  radialSegments: number
  disableImpostor: boolean
}

/**
 * Unitcell Representation
 */
class UnitcellRepresentation extends StructureRepresentation {
  sphereBuffer: SphereBuffer
  cylinderBuffer: CylinderBuffer

  constructor (structure: Structure, viewer: Viewer, params: Partial<UnitcellRepresentationParameters>) {
    super(structure, viewer, params)

    this.type = 'unitcell'

    this.parameters = Object.assign({

      radiusSize: {
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

  init (params: Partial<UnitcellRepresentationParameters>) {
    const p = params || {}

    let defaultRadius = 0.5
    if (this.structure.unitcell) {
      defaultRadius = Math.cbrt(this.structure.unitcell.volume) / 200
    }

    p.radiusSize = defaults(p.radiusSize, defaultRadius)
    p.colorValue = defaults(p.colorValue, 'orange')
    p.useInteriorColor = defaults(p.useInteriorColor, true)

    super.init(p)
  }

  getUnitcellData (structure: Structure) {
    return structure.unitcell!.getData(structure)
  }

  create () {
    const structure = this.structureView.getStructure()
    if (!structure.unitcell) return
    const unitcellData = this.getUnitcellData(structure)

    this.sphereBuffer = new SphereBuffer(
      unitcellData.vertex as SphereBufferData,
      this.getBufferParams({
        sphereDetail: this.sphereDetail,
        disableImpostor: this.disableImpostor,
        dullInterior: true
      }) as SphereBufferParameters
    )

    this.cylinderBuffer = new CylinderBuffer(
      unitcellData.edge as CylinderBufferData,
      this.getBufferParams({
        openEnded: true,
        radialSegments: this.radialSegments,
        disableImpostor: this.disableImpostor,
        dullInterior: true
      })
    )

    this.dataList.push({
      sview: this.structureView,
      bufferList: [ this.sphereBuffer as SphereGeometryBuffer, this.cylinderBuffer as CylinderGeometryBuffer ]
    })
  }

  createData (sview: StructureView): undefined {
    return
  }

  updateData (what: AtomDataFields, data: StructureRepresentationData) {
    const structure = data.sview!.getStructure()
    if (!structure.unitcell) return
    const unitcellData = this.getUnitcellData(structure)
    const sphereData: Partial<SphereBufferData> = {}
    const cylinderData: Partial<CylinderBufferData> = {}

    if (!what || what.position) {
      Object.assign(sphereData, {position: unitcellData.vertex.position})
      Object.assign(cylinderData, {
        position1: unitcellData.edge.position1,
        position2: unitcellData.edge.position2
      })
    }

    if (!what || what.color) {
      Object.assign(sphereData, {color: unitcellData.vertex.color})
      Object.assign(cylinderData, {
        color: unitcellData.edge.color,
        color2: unitcellData.edge.color2
      })
    }

    if (!what || what.radius) {
      Object.assign(sphereData, {radius: unitcellData.vertex.radius})
      Object.assign(cylinderData, {radius: unitcellData.edge.radius})
    }

    (this.sphereBuffer as SphereGeometryBuffer).setAttributes(sphereData);
    (this.cylinderBuffer as CylinderGeometryBuffer).setAttributes(cylinderData)
  }
}

RepresentationRegistry.add('unitcell', UnitcellRepresentation)

export default UnitcellRepresentation
