/**
 * @file Axes Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Color, Vector3 } from 'three'

import { RepresentationRegistry } from '../globals'
import { defaults } from '../utils'
import { AxesPicker } from '../utils/picker'
import { uniformArray, uniformArray3 } from '../math/array-utils'
import StructureRepresentation, { StructureRepresentationParameters, StructureRepresentationData } from './structure-representation'
import SphereBuffer, { SphereBufferData, SphereBufferParameters } from '../buffer/sphere-buffer'
import CylinderBuffer, { CylinderBufferData } from '../buffer/cylinder-buffer'
import StructureView from '../structure/structure-view';
import Viewer from '../viewer/viewer';
import { Structure } from '../ngl';
import { AtomDataFields } from '../structure/structure-data';
import SphereGeometryBuffer from '../buffer/spheregeometry-buffer';
import CylinderGeometryBuffer from '../buffer/cylindergeometry-buffer';
import PrincipalAxes from '../math/principal-axes';

export interface AxesRepresentationParameters extends StructureRepresentationParameters {
  showAxes: boolean
  showBox: boolean
}

/**
 * Axes representation. Show principal axes and/or a box aligned with them
 * that fits the structure or selection.
 *
 * __Name:__ _axes_
 *
 * @example
 * stage.loadFile( "rcsb://3pqr", {
 *     assembly: "BU1"
 * } ).then( function( o ){
 *     o.addRepresentation( "cartoon" );
 *     o.addRepresentation( "axes", {
 *         sele: "RET", showAxes: false, showBox: true, radius: 0.2
 *     } );
 *     o.addRepresentation( "ball+stick", { sele: "RET" } );
 *     o.addRepresentation( "axes", {
 *         sele: ":B and backbone", showAxes: false, showBox: true, radius: 0.2
 *     } );
 *     stage.autoView();
 *     var pa = o.structure.getPrincipalAxes();
 *     stage.animationControls.rotate( pa.getRotationQuaternion(), 1500 );
 * } );
 */
class AxesRepresentation extends StructureRepresentation {
  
  protected showAxes: boolean
  protected showBox: boolean
  protected sphereBuffer: SphereBuffer
  protected cylinderBuffer: CylinderBuffer
  /**
   * @param  {Structure} structure - the structure object
   * @param  {Viewer} viewer - the viewer object
   * @param  {StructureRepresentationParameters} params - parameters object
   */
  constructor (structure: Structure, viewer: Viewer, params: Partial<AxesRepresentationParameters>) {
    super(structure, viewer, params)

    this.type = 'axes'

    this.parameters = Object.assign({

      radiusSize: {
        type: 'number', precision: 3, max: 10.0, min: 0.001
      },
      sphereDetail: true,
      radialSegments: true,
      disableImpostor: true,
      showAxes: {
        type: 'boolean', rebuild: true
      },
      showBox: {
        type: 'boolean', rebuild: true
      }

    }, this.parameters, {
      assembly: null
    })

    this.init(params)
  }

  init (params: Partial<AxesRepresentationParameters>) {
    const p = params || {}
    p.radiusSize = defaults(p.radiusSize, 0.5)
    p.colorValue = defaults(p.colorValue, 'lightgreen')
    p.useInteriorColor = defaults(p.useInteriorColor, true)

    this.showAxes = defaults(p.showAxes, true)
    this.showBox = defaults(p.showBox, false)

    super.init(p)
  }

  getPrincipalAxes (): PrincipalAxes {
    let selection
    const assembly = this.getAssembly()

    if (assembly) {
      selection = assembly.partList[ 0 ].getSelection()
    }

    return this.structureView.getPrincipalAxes(selection)
  }

  getAxesData (sview: StructureView) {
    const pa = this.getPrincipalAxes()
    const c = new Color(this.colorValue)

    let vn = 0
    let en = 0

    if (this.showAxes) {
      vn += 6
      en += 3
    }

    if (this.showBox) {
      vn += 8
      en += 12
    }

    const vertexPosition = new Float32Array(3 * vn)
    const vertexColor = uniformArray3(vn, c.r, c.g, c.b)
    const vertexRadius = uniformArray(vn, this.radiusSize)

    const edgePosition1 = new Float32Array(3 * en)
    const edgePosition2 = new Float32Array(3 * en)
    const edgeColor = uniformArray3(en, c.r, c.g, c.b)
    const edgeRadius = uniformArray(en, this.radiusSize)

    let offset = 0

    if (this.showAxes) {
      const addAxis = function (v1: Vector3, v2: Vector3) {
        v1.toArray(vertexPosition as any, offset * 2)
        v2.toArray(vertexPosition as any, offset * 2 + 3)
        v1.toArray(edgePosition1 as any, offset)
        v2.toArray(edgePosition2 as any, offset)
        offset += 3
      }

      addAxis(pa.begA, pa.endA)
      addAxis(pa.begB, pa.endB)
      addAxis(pa.begC, pa.endC)
    }

    if (this.showBox) {
      const v = new Vector3()
      const { d1a, d2a, d3a, d1b, d2b, d3b } = pa.getProjectedScaleForAtoms(sview)

      // console.log(d1a, d2a, d3a, d1b, d2b, d3b)

      let offset2 = offset * 2
      const addCorner = function (d1: number, d2: number, d3: number) {
        v.copy(pa.center)
          .addScaledVector(pa.normVecA, d1)
          .addScaledVector(pa.normVecB, d2)
          .addScaledVector(pa.normVecC, d3)
        v.toArray(vertexPosition as any, offset2)
        offset2 += 3
      }
      addCorner(d1a, d2a, d3a)
      addCorner(d1a, d2a, d3b)
      addCorner(d1a, d2b, d3b)
      addCorner(d1a, d2b, d3a)
      addCorner(d1b, d2b, d3b)
      addCorner(d1b, d2b, d3a)
      addCorner(d1b, d2a, d3a)
      addCorner(d1b, d2a, d3b)

      let edgeOffset = offset
      const addEdge = function (a: number, b: number) {
        v.fromArray(vertexPosition as any, offset * 2 + a * 3)
          .toArray(edgePosition1 as any, edgeOffset)
        v.fromArray(vertexPosition as any, offset * 2 + b * 3)
          .toArray(edgePosition2 as any, edgeOffset)
        edgeOffset += 3
      }
      addEdge(0, 1)
      addEdge(0, 3)
      addEdge(0, 6)
      addEdge(1, 2)
      addEdge(1, 7)
      addEdge(2, 3)
      addEdge(2, 4)
      addEdge(3, 5)
      addEdge(4, 5)
      addEdge(4, 7)
      addEdge(5, 6)
      addEdge(6, 7)
    }

    const picker = new AxesPicker(pa)

    return {
      vertex: {
        position: vertexPosition,
        color: vertexColor,
        radius: vertexRadius,
        picking: picker
      },
      edge: {
        position1: edgePosition1,
        position2: edgePosition2,
        color: edgeColor,
        color2: edgeColor,
        radius: edgeRadius,
        picking: picker
      }
    }
  }

  create () {
    const axesData = this.getAxesData(this.structureView)

    this.sphereBuffer = new SphereBuffer(
      axesData.vertex as SphereBufferData,
      this.getBufferParams({
        sphereDetail: this.sphereDetail,
        disableImpostor: this.disableImpostor,
        dullInterior: true
      }) as SphereBufferParameters
    )

    this.cylinderBuffer = new CylinderBuffer(
      axesData.edge as CylinderBufferData,
      this.getBufferParams({
        openEnded: true,
        radialSegments: this.radialSegments,
        disableImpostor: this.disableImpostor,
        dullInterior: true
      })
    )

    this.dataList.push({
      sview: this.structureView,
      bufferList: [ this.sphereBuffer as SphereGeometryBuffer, this.cylinderBuffer as CylinderGeometryBuffer]
    })
  }

  createData (sview: StructureView): undefined {
    return
  }

  updateData (what: AtomDataFields, data: StructureRepresentationData) {
    const axesData = this.getAxesData(data.sview as StructureView)
    const sphereData = {}
    const cylinderData = {}

    if (!what || what.position) {
      Object.assign(sphereData, {
        position: axesData.vertex.position
      })
      Object.assign(cylinderData, {
        position1: axesData.edge.position1,
        position2: axesData.edge.position2
      })
    }

    if (!what || what.color) {
      Object.assign(sphereData, {
        color: axesData.vertex.color as Float32Array
      })
      Object.assign(cylinderData, {
        color: axesData.edge.color as Float32Array,
        color2: axesData.edge.color as Float32Array
      })
    }

    if (!what || what.radius) {
      Object.assign(sphereData, {
        radius: axesData.vertex.radius as Float32Array
      })
      Object.assign(cylinderData, {
        radius: axesData.edge.radius as Float32Array
      })
    }

    (this.sphereBuffer as SphereGeometryBuffer).setAttributes(sphereData);
    (this.cylinderBuffer as CylinderGeometryBuffer).setAttributes(cylinderData)
  }
}

RepresentationRegistry.add('axes', AxesRepresentation)

export default AxesRepresentation
