/**
 * @file Distance Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Color } from '../../lib/three.es6.js'

import { RepresentationRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import { DistancePicker } from '../utils/picker.js'
import { uniformArray, uniformArray3 } from '../math/array-utils.js'
import BitArray from '../utils/bitarray.js'
import MeasurementRepresentation from './measurement-representation.js'
import Selection from '../selection/selection.js'
import BondStore from '../store/bond-store.js'
import TextBuffer from '../buffer/text-buffer.js'
import CylinderBuffer from '../buffer/cylinder-buffer.js'

/**
 * Distance representation parameter object.
 * @typedef {Object} DistanceRepresentationParameters - distance representation parameters
 * @mixes RepresentationParameters
 * @mixes StructureRepresentationParameters
 * @mixes MeasurementRepresentationParameters
 *
 * @property {String} labelUnit - distance unit (e.g. "angstrom" or "nm"). If set, a distance
 *                                symbol is appended to the label (i.e. 'nm' or '\u00C5'). In case of 'nm', the
 *                                distance value is computed in nanometers instead of Angstroms.
 * @property {Array[]} atomPair - list of pairs of selection strings (see {@link Selection})
 *                                or pairs of atom indices. Using atom indices is much more
 *                                when the representation is updated often, e.g. by
 *                                changing the selection or the atom positions, as their
 *                                are no selection strings to be evaluated.
 * @property {Integer} radialSegments - cylinder quality (number of segments)
 * @property {Boolean} disableImpostor - disable use of raycasted impostors for rendering
 */

/**
 * Distance representation
 */
class DistanceRepresentation extends MeasurementRepresentation {
  /**
   * Create Distance representation object
   * @example
   * stage.loadFile( "rcsb://1crn" ).then( function( o ){
   *     o.addRepresentation( "cartoon" );
   *     // either give selections (uses first selected atom) ...
   *     var atomPair = [ [ "1.CA", "4.CA" ], [ "7.CA", "13.CA" ] ];
   *     // or atom indices
   *     var atomPair = [ [ 8, 28 ], [ 173, 121 ] ];
   *     o.addRepresentation( "distance", { atomPair: atomPair } );
   *     stage.autoView();
   * } );
   * @param {Structure} structure - the structure to be represented
   * @param {Viewer} viewer - a viewer object
   * @param {DistanceRepresentationParameters} params - distance representation parameters
   */
  constructor (structure, viewer, params) {
    super(structure, viewer, params)

    this.type = 'distance'

    this.parameters = Object.assign({

      labelUnit: {
        type: 'select',
        rebuild: true,
        options: { '': '', angstrom: 'angstrom', nm: 'nm' }
      },
      atomPair: {
        type: 'hidden', rebuild: true
      },
      radialSegments: true,
      disableImpostor: true

    }, this.parameters)

    this.init(params)
  }

  init (params) {
    var p = params || {}
    p.radius = defaults(p.radius, 0.15)

    this.labelUnit = defaults(p.labelUnit, '')
    this.atomPair = defaults(p.atomPair, [])

    super.init(p)
  }

  getDistanceData (sview, atomPair) {
    var n = atomPair.length
    var text = new Array(n)
    var position = new Float32Array(n * 3)
    var sele1 = new Selection()
    var sele2 = new Selection()

    var bondStore = new BondStore()

    var ap1 = sview.getAtomProxy()
    var ap2 = sview.getAtomProxy()

    var j = 0

    atomPair.forEach(function (pair, i) {
      var v1 = pair[ 0 ]
      var v2 = pair[ 1 ]

      if (Number.isInteger(v1) && Number.isInteger(v2)) {
        ap1.index = v1
        ap2.index = v2
      } else {
        sele1.setString(v1)
        sele2.setString(v2)

        var atomIndices1 = sview.getAtomIndices(sele1)
        var atomIndices2 = sview.getAtomIndices(sele2)

        if (atomIndices1.length && atomIndices2.length) {
          ap1.index = atomIndices1[ 0 ]
          ap2.index = atomIndices2[ 0 ]
        } else {
          j += 1
          return
        }
      }

      bondStore.addBond(ap1, ap2, 1)

      i -= j
      var d = ap1.distanceTo(ap2)
      switch (this.labelUnit) {
        case 'angstrom':
          text[ i ] = d.toFixed(2) + ' ' + String.fromCharCode(0x212B)
          break
        case 'nm':
          text[ i ] = (d / 10).toFixed(2) + ' nm'
          break
        default:
          text[ i ] = d.toFixed(2)
          break
      }

      var i3 = i * 3
      position[ i3 + 0 ] = (ap1.x + ap2.x) / 2
      position[ i3 + 1 ] = (ap1.y + ap2.y) / 2
      position[ i3 + 2 ] = (ap1.z + ap2.z) / 2
    }, this)

    if (j > 0) {
      n -= j
      position = position.subarray(0, n * 3)
    }

    var bondSet = new BitArray(bondStore.count, true)

    return {
      text: text,
      position: position,
      bondSet: bondSet,
      bondStore: bondStore
    }
  }

  getBondData (sview, what, params) {
    var bondData = sview.getBondData(this.getBondParams(what, params))
    if (bondData.picking) {
      bondData.picking = new DistancePicker(
        bondData.picking.array,
        bondData.picking.structure,
        params.bondStore
      )
    }
    return bondData
  }

  create () {
    if (this.structureView.atomCount === 0) return

    var n = this.atomPair.length
    if (n === 0) return

    var distanceData = this.getDistanceData(this.structureView, this.atomPair)

    var c = new Color(this.labelColor)

    this.textBuffer = new TextBuffer(
      {
        position: distanceData.position,
        size: uniformArray(n, this.labelSize),
        color: uniformArray3(n, c.r, c.g, c.b),
        text: distanceData.text
      },
      this.getLabelBufferParams()
    )

    var bondParams = {
      bondSet: distanceData.bondSet,
      bondStore: distanceData.bondStore
    }

    var bondData = this.getBondData(this.structureView, undefined, bondParams)

    this.cylinderBuffer = new CylinderBuffer(
      bondData,
      this.getBufferParams({
        openEnded: false,
        radialSegments: this.radialSegments,
        disableImpostor: this.disableImpostor,
        dullInterior: true
      })
    )

    this.dataList.push({
      sview: this.structureView,
      bondSet: distanceData.bondSet,
      bondStore: distanceData.bondStore,
      position: distanceData.position,
      bufferList: [ this.textBuffer, this.cylinderBuffer ]
    })
  }

  updateData (what, data) {
    var bondParams = {
      bondSet: data.bondSet,
      bondStore: data.bondStore
    }

    var bondData = this.getBondData(data.sview, what, bondParams)
    var cylinderData = {}
    var textData = {}
    var n = this.atomPair.length

    if (what.labelSize) {
      textData.size = uniformArray(n, this.labelSize)
    }

    if (what.labelColor) {
      var c = new Color(this.labelColor)
      textData.color = uniformArray3(n, c.r, c.g, c.b)
    }

    if (what.color) {
      cylinderData.color = bondData.color
      cylinderData.color2 = bondData.color2
    }

    if (what.radius || what.scale) {
      cylinderData.radius = bondData.radius
    }

    this.textBuffer.setAttributes(textData)
    this.cylinderBuffer.setAttributes(cylinderData)
  }
}

RepresentationRegistry.add('distance', DistanceRepresentation)

export default DistanceRepresentation
