/**
 * @file Rocket Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { RepresentationRegistry } from '../globals'
import { defaults } from '../utils'
import { AtomPicker } from '../utils/picker'
import StructureRepresentation, { StructureRepresentationParameters } from './structure-representation'
import Helixbundle, { Axis } from '../geometry/helixbundle'
import CylinderBuffer from '../buffer/cylinder-buffer'
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import StructureView from '../structure/structure-view';
import CylinderGeometryBuffer from '../buffer/cylindergeometry-buffer';
import CylinderImpostorBuffer from '../buffer/cylinderimpostor-buffer';

export interface RocketRepresentationParameters extends StructureRepresentationParameters {
  localAngle: number
  centerDist: number
  ssBorder: boolean
  radialSegments: number
  openEnded: boolean
  disableImpostor: boolean
}

export interface AxisData {
  begin: Float32Array
  end: Float32Array
  size: Float32Array
  color: Float32Array
  picking: AtomPicker
}

/**
 * Rocket Representation
 */
class RocketRepresentation extends StructureRepresentation {

  protected localAngle: number
  protected centerDist: number
  protected ssBorder: boolean
  protected radialSegments: number
  protected openEnded: boolean
  protected disableImpostor: boolean
  // protected helixbundleList: Helixbundle[]

  constructor (structure: Structure, viewer: Viewer, params: Partial<RocketRepresentationParameters>) {
    super(structure, viewer, params)

    this.type = 'rocket'

    this.parameters = Object.assign({

      localAngle: {
        type: 'integer', max: 180, min: 0, rebuild: true
      },
      centerDist: {
        type: 'number', precision: 1, max: 10, min: 0, rebuild: true
      },
      ssBorder: {
        type: 'boolean', rebuild: true
      },
      radialSegments: true,
      openEnded: true,
      disableImpostor: true

    }, this.parameters)

    // this.helixbundleList = []

    this.init(params)
  }

  init (params: Partial<RocketRepresentationParameters>) {
    let p = params || {}
    p.colorScheme = defaults(p.colorScheme, 'sstruc')
    p.radiusSize = defaults(p.radiusSize, 1.5)
    p.radiusScale = defaults(p.radiusScale, 1.0)
    p.openEnded = defaults(p.openEnded, false)
    p.useInteriorColor = defaults(p.useInteriorColor, true)

    this.localAngle = defaults(p.localAngle, 30)
    this.centerDist = defaults(p.centerDist, 2.5)
    this.ssBorder = defaults(p.ssBorder, false)

    super.init(p)
  }

  createData (sview: StructureView) {
    let length = 0
    const axisList:Axis[] = []
    const helixbundleList:Helixbundle[] = []

    this.structure.eachPolymer(polymer => {
      if (polymer.residueCount < 4 || polymer.isNucleic()) return

      const helixbundle = new Helixbundle(polymer)
      const axis = helixbundle.getAxis(
        this.localAngle, this.centerDist, this.ssBorder,
        this.getColorParams(), this.getRadiusParams()
      )

      length += axis.size.length
      axisList.push(axis)
      helixbundleList.push(helixbundle)
    }, sview.getSelection())

    const axisData = {
      begin: new Float32Array(length * 3),
      end: new Float32Array(length * 3),
      size: new Float32Array(length),
      color: new Float32Array(length * 3),
      picking: <AtomPicker>{}
    }

    let picking = new Float32Array(length)

    let offset = 0

    axisList.forEach(function (axis) {
      axisData.begin.set(axis.begin, offset * 3)
      axisData.end.set(axis.end, offset * 3)
      axisData.size.set(axis.size, offset)
      axisData.color.set(axis.color, offset * 3)
      picking.set(axis.picking.array!, offset)
      offset += axis.size.length
    })

    if (length) {
      axisData.picking = new AtomPicker(
        picking, sview.getStructure()
      )
    }

    const cylinderBuffer = new CylinderBuffer(
      {
        position1: axisData.begin,
        position2: axisData.end,
        color: axisData.color,
        color2: axisData.color,
        radius: axisData.size,
        picking: axisData.picking
      },
      this.getBufferParams({
        openEnded: this.openEnded,
        radialSegments: this.radialSegments,
        disableImpostor: this.disableImpostor,
        dullInterior: true
      })
    )

    return {
      bufferList: [ cylinderBuffer as CylinderGeometryBuffer|CylinderImpostorBuffer ],
      axisList: axisList,
      helixbundleList: helixbundleList,
      axisData: axisData
    }
  }

  
  updateData (what: any, data: {bufferList: CylinderBuffer[], helixbundleList: Helixbundle[], axisList: Axis[], axisData: AxisData}) {
    what = what || {}

    if (what.position) {
      this.build()
      return
    }

    var cylinderData = {}

    if (what.color || what.radius) {
      var offset = 0

      data.helixbundleList.forEach((helixbundle) => {
        var axis = helixbundle.getAxis(
          this.localAngle, this.centerDist, this.ssBorder,
          this.getColorParams(), this.getRadiusParams()
        )
        if (what.color) {
          data.axisData.color.set(axis.color, offset * 3)
        }
        if (what.radius || what.scale) {
          data.axisData.size.set(axis.size, offset)
        }
        offset += axis.size.length
      })

      if (what.color) {
        Object.assign(cylinderData, {
          color: data.axisData.color,
          color2: data.axisData.color
        })
      }

      if (what.radius || what.scale) {
        Object.assign(cylinderData, {
          radius: data.axisData.size
        })
      }
    }

    (data.bufferList[ 0 ] as CylinderGeometryBuffer).setAttributes(cylinderData)
  }
}

RepresentationRegistry.add('rocket', RocketRepresentation)

export default RocketRepresentation
