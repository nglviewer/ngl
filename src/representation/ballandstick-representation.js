/**
 * @file Ball And Stick Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { defaults } from '../utils.js'
import { ExtensionFragDepth, RepresentationRegistry } from '../globals.js'
import StructureRepresentation from './structure-representation.js'
import SphereBuffer from '../buffer/sphere-buffer.js'
import CylinderBuffer from '../buffer/cylinder-buffer.js'
import WideLineBuffer from '../buffer/wideline-buffer.js'

/**
 * Ball And Stick representation parameter object. Extends {@link RepresentationParameters} and
 * {@link StructureRepresentationParameters}.
 *
 * @typedef {Object} BallAndStickRepresentationParameters - ball and stick representation parameters
 *
 * @property {Integer} sphereDetail - sphere quality (icosahedron subdivisions)
 * @property {Integer} radialSegments - cylinder quality (number of segments)
 * @property {Boolean} openEnded - capped or not
 * @property {Boolean} disableImpostor - disable use of raycasted impostors for rendering
 * @property {Float} aspectRatio - size difference between atom and bond radii
 * @property {Boolean} lineOnly - render only bonds, and only as lines
 * @property {Integer} linewidth - width of lines
 * @property {Boolean} cylinderOnly - render only bonds (no atoms)
 * @property {String} multipleBond - one off "off", "symmetric", "offset"
 * @property {Float} bondSpacing - spacing for multiple bond rendering
 * @property {Float} bondScale - scale/radius for multiple bond rendering
 */

/**
 * Ball And Stick representation. Show atoms as spheres and bonds as cylinders.
 *
 * __Name:__ _ball+stick_
 *
 * @example
 * stage.loadFile( "rcsb://1crn" ).then( function( o ){
 *     o.addRepresentation( "ball+stick" );
 *     o.autoView();
 * } );
 */
class BallAndStickRepresentation extends StructureRepresentation {
  /**
   * Create Ball And Stick representation object
   * @param {Structure} structure - the structure to be represented
   * @param {Viewer} viewer - a viewer object
   * @param {BallAndStickRepresentationParameters} params - ball and stick representation parameters
   */
  constructor (structure, viewer, params) {
    super(structure, viewer, params)

    this.type = 'ball+stick'

    this.parameters = Object.assign({

      sphereDetail: true,
      radialSegments: true,
      openEnded: true,
      disableImpostor: true,
      aspectRatio: {
        type: 'number', precision: 1, max: 10.0, min: 1.0
      },
      lineOnly: {
        type: 'boolean', rebuild: true
      },
      cylinderOnly: {
        type: 'boolean', rebuild: true
      },
      multipleBond: {
        type: 'select',
        rebuild: true,
        options: {
          'off': 'off',
          'symmetric': 'symmetric',
          'offset': 'offset'
        }
      },
      bondScale: {
        type: 'number', precision: 2, max: 1.0, min: 0.01
      },
      bondSpacing: {
        type: 'number', precision: 2, max: 2.0, min: 0.5
      },
      linewidth: {
        type: 'integer', max: 50, min: 1, buffer: true
      }

    }, this.parameters)

    this.init(params)
  }

  init (params) {
    var p = params || {}
    p.radius = defaults(p.radius, 0.15)

    this.aspectRatio = defaults(p.aspectRatio, 2.0)
    this.lineOnly = defaults(p.lineOnly, false)
    this.cylinderOnly = defaults(p.cylinderOnly, false)
    this.multipleBond = defaults(p.multipleBond, 'off')
    this.bondSpacing = defaults(p.bondSpacing, 1.0)
    this.bondScale = defaults(p.bondScale, 0.4)
    this.linewidth = defaults(p.linewidth, 2)

    super.init(p)
  }

  getAtomParams (what, params) {
    params = Object.assign({
      radiusParams: { 'radius': this.radius, 'scale': this.scale * this.aspectRatio }
    }, params)

    return super.getAtomParams(what, params)
  }

  getAtomData (sview, what, params) {
    return sview.getAtomData(this.getAtomParams(what, params))
  }

  getBondParams (what, params) {
    params = Object.assign({
      multipleBond: this.multipleBond,
      bondSpacing: this.bondSpacing,
      bondScale: this.bondScale
    }, params)

    return super.getBondParams(what, params)
  }

  getBondData (sview, what, params) {
    return sview.getBondData(this.getBondParams(what, params))
  }

  createData (sview) {
    var bufferList = []

    if (this.lineOnly) {
      this.lineBuffer = new WideLineBuffer(
        this.getBondData(sview, { position: true, color: true, picking: true }),
        this.getBufferParams({ linewidth: this.linewidth })
      )

      bufferList.push(this.lineBuffer)
    } else {
      var cylinderBuffer = new CylinderBuffer(
        this.getBondData(sview),
        this.getBufferParams({
          openEnded: this.openEnded,
          radialSegments: this.radialSegments,
          disableImpostor: this.disableImpostor,
          dullInterior: true
        })
      )

      bufferList.push(cylinderBuffer)

      if (!this.cylinderOnly) {
        var sphereBuffer = new SphereBuffer(
          this.getAtomData(sview),
          this.getBufferParams({
            sphereDetail: this.sphereDetail,
            disableImpostor: this.disableImpostor,
            dullInterior: true
          })
        )

        bufferList.push(sphereBuffer)
      }
    }

    return {
      bufferList: bufferList
    }
  }

  updateData (what, data) {
    if (this.multipleBond !== 'off' && what && what.radius) {
      what.position = true
    }

    var bondData = this.getBondData(data.sview, what)

    if (this.lineOnly) {
      var lineData = {}

      if (!what || what.position) {
        lineData.position1 = bondData.position1
        lineData.position2 = bondData.position2
      }

      if (!what || what.color) {
        lineData.color = bondData.color
        lineData.color2 = bondData.color2
      }

      data.bufferList[ 0 ].setAttributes(lineData)
    } else {
      var cylinderData = {}

      if (!what || what.position) {
        cylinderData.position1 = bondData.position1
        cylinderData.position2 = bondData.position2
      }

      if (!what || what.color) {
        cylinderData.color = bondData.color
        cylinderData.color2 = bondData.color2
      }

      if (!what || what.radius) {
        cylinderData.radius = bondData.radius
      }

      data.bufferList[ 0 ].setAttributes(cylinderData)

      if (!this.cylinderOnly) {
        var atomData = this.getAtomData(data.sview, what)

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

        data.bufferList[ 1 ].setAttributes(sphereData)
      }
    }
  }

  setParameters (params) {
    var rebuild = false
    var what = {}

    if (params && (params.aspectRatio || params.bondSpacing || params.bondScale)) {
      what.radius = true
      if (!ExtensionFragDepth || this.disableImpostor) {
        rebuild = true
      }
    }

    super.setParameters(params, what, rebuild)

    return this
  }
}

RepresentationRegistry.add('ball+stick', BallAndStickRepresentation)

export default BallAndStickRepresentation
