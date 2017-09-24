/**
 * @file Trajectory Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Color } from '../../lib/three.es6.js'

import { defaults } from '../utils.js'
import { uniformArray, uniformArray3 } from '../math/array-utils.js'

import StructureRepresentation from './structure-representation.js'

import SphereBuffer from '../buffer/sphere-buffer.js'
import CylinderBuffer from '../buffer/cylinder-buffer.js'
import PointBuffer from '../buffer/point-buffer.js'
import LineBuffer from '../buffer/line-buffer.js'

/**
 * Trajectory representation parameter object.
 * @typedef {Object} TrajectoryRepresentationParameters - parameters
 *
 * @property {Boolean} drawLine - draw lines
 * @property {Boolean} drawCylinder - draw cylinders
 * @property {Boolean} drawPoint - draw points
 * @property {Boolean} drawSphere - draw sphere
 * @property {Integer} linewidth - line width
 * @property {Integer} pointSize - point size
 * @property {Boolean} sizeAttenuation - size attenuation
 * @property {Boolean} sort - sort flag for points
 */

/**
 * Trajectory representation
 */
class TrajectoryRepresentation extends StructureRepresentation {
  /**
   * @param  {Trajectory} trajectory - the trajectory
   * @param  {Viewer} viewer - viewer object
   * @param  {TrajectoryRepresentationParameters} params - parameters
   */
  constructor (trajectory, viewer, params) {
    super(trajectory.structure, viewer, params)

    this.type = 'trajectory'

    this.parameters = Object.assign({
      drawLine: {
        type: 'boolean', rebuild: true
      },
      drawCylinder: {
        type: 'boolean', rebuild: true
      },
      drawPoint: {
        type: 'boolean', rebuild: true
      },
      drawSphere: {
        type: 'boolean', rebuild: true
      },

      linewidth: {
        type: 'integer', max: 20, min: 1, rebuild: true
      },
      pointSize: {
        type: 'integer', max: 20, min: 1, rebuild: true
      },
      sizeAttenuation: {
        type: 'boolean', rebuild: true
      },
      sort: {
        type: 'boolean', rebuild: true
      }
    }, this.parameters)

    this.manualAttach = true
    this.trajectory = trajectory

    this.init(params)
  }

  init (params) {
    var p = params || {}
    p.colorScheme = defaults(p.colorScheme, 'uniform')
    p.colorValue = defaults(p.colorValue, 0xDDDDDD)

    this.drawLine = defaults(p.drawLine, true)
    this.drawCylinder = defaults(p.drawCylinder, false)
    this.drawPoint = defaults(p.drawPoint, false)
    this.drawSphere = defaults(p.drawSphere, false)

    this.pointSize = defaults(p.pointSize, 1)
    this.sizeAttenuation = defaults(p.sizeAttenuation, false)
    this.sort = defaults(p.sort, true)

    super.init(p)
  }

  attach () {
    this.bufferList.forEach(buffer => this.viewer.add(buffer))
    this.setVisibility(this.visible)
    this.tasks.decrement()
  }

  // prepare (callback) {
  //   // TODO
  //   // - move loading of path here
  //   // - get rid of manualAttach
  //   callback()
  // }

  create () {
    console.log('create', this.structureView.atomCount)
    if (this.structureView.atomCount === 0) return

    var index = this.structureView.getAtomIndices()[ 0 ]

    this.trajectory.getPath(index, path => {
      var n = path.length / 3
      var tc = new Color(this.colorValue)

      if (this.drawSphere) {
        var sphereBuffer = new SphereBuffer(
          {
            position: path,
            color: uniformArray3(n, tc.r, tc.g, tc.b),
            radius: uniformArray(n, 0.2)
          },
          this.getBufferParams({
            sphereDetail: this.sphereDetail,
            dullInterior: true,
            disableImpostor: this.disableImpostor
          })
        )

        this.bufferList.push(sphereBuffer)
      }

      if (this.drawCylinder) {
        var cylinderBuffer = new CylinderBuffer(
          {
            position1: path.subarray(0, -3),
            position2: path.subarray(3),
            color: uniformArray3(n - 1, tc.r, tc.g, tc.b),
            color2: uniformArray3(n - 1, tc.r, tc.g, tc.b),
            radius: uniformArray(n, 0.05)
          },
          this.getBufferParams({
            openEnded: false,
            radialSegments: this.radialSegments,
            disableImpostor: this.disableImpostor,
            dullInterior: true
          })
        )

        this.bufferList.push(cylinderBuffer)
      }

      if (this.drawPoint) {
        var pointBuffer = new PointBuffer(
          {
            position: path,
            color: uniformArray3(n, tc.r, tc.g, tc.b)
          },
          this.getBufferParams({
            pointSize: this.pointSize,
            sizeAttenuation: this.sizeAttenuation,
            sort: this.sort
          })
        )

        this.bufferList.push(pointBuffer)
      }

      if (this.drawLine) {
        var lineBuffer = new LineBuffer(
          {
            position1: path.subarray(0, -3),
            position2: path.subarray(3),
            color: uniformArray3(n - 1, tc.r, tc.g, tc.b),
            color2: uniformArray3(n - 1, tc.r, tc.g, tc.b)
          },
          this.getBufferParams()
        )

        this.bufferList.push(lineBuffer)
      }

      this.attach()
    })
  }
}

export default TrajectoryRepresentation
