/**
 * @file Distance Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Fred Ludlow <fred.ludlow@gmail.com>
 * @private
 */

import { Color } from 'three'

import { RepresentationRegistry } from '../globals'
import { defaults } from '../utils'
import { DistancePicker } from '../utils/picker'
import { uniformArray, uniformArray3 } from '../math/array-utils'
import BitArray from '../utils/bitarray'
import MeasurementRepresentation from './measurement-representation'
import Selection from '../selection/selection'
import BondStore from '../store/bond-store'
import TextBuffer from '../buffer/text-buffer'
import WideLineBuffer from '../buffer/wideline-buffer'
import CylinderBuffer from '../buffer/cylinder-buffer'
import { getFixedLengthDashData } from '../geometry/dash'

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
      radialSegments: true,
      openEnded: true,
      disableImpostor: true,
      labelUnit: {
        type: 'select',
        rebuild: true,
        options: { '': '', angstrom: 'angstrom', nm: 'nm' }
      },
      useCylinder: {
        type: 'boolean', rebuild: true
      },
      atomPair: {
        type: 'hidden', rebuild: true
      }
    }, this.parameters)

    this.init(params)
  }

  init (params) {
    const p = params || {}
    p.linewidth = defaults(p.linewidth, 5.0)
    p.radiusType = defaults(p.radiusType, 'size')
    p.radiusSize = defaults(p.radiusSize, 0.2)

    this.labelUnit = defaults(p.labelUnit, '')
    this.useCylinder = defaults(p.useCylinder, false)
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

    var j = 0 // Skipped pairs
    const selected = sview.getAtomSet()

    atomPair.forEach(function (pair, i) {
      var v1 = pair[ 0 ]
      var v2 = pair[ 1 ]

      if (Number.isInteger(v1) && Number.isInteger(v2)) {
        if (selected.get(v1) && selected.get(v2)) {
          ap1.index = v1
          ap2.index = v2
        } else {
          j += 1
          return
        }
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
    const bondData = sview.getBondData(this.getBondParams(what, params))
    if (bondData.picking) {
      bondData.picking = new DistancePicker(
        bondData.picking.array,
        bondData.picking.structure,
        params.bondStore
      )
    }
    return bondData
  }

  createData (sview) {
    if (!sview.atomCount || !this.atomPair.length) return

    const n = this.atomPair.length
    const c = new Color(this.labelColor)
    const distanceData = this.getDistanceData(sview, this.atomPair)

    this.textBuffer = new TextBuffer({
      position: distanceData.position,
      size: uniformArray(n, this.labelSize),
      color: uniformArray3(n, c.r, c.g, c.b),
      text: distanceData.text
    }, this.getLabelBufferParams())

    const bondParams = {
      bondSet: distanceData.bondSet,
      bondStore: distanceData.bondStore
    }

    const bondData = this.getBondData(
      sview,
      { position: true, color: true, picking: true, radius: this.useCylinder },
      bondParams
    )

    if (this.useCylinder) {
      this.distanceBuffer = new CylinderBuffer(
        bondData,
        this.getBufferParams({
          openEnded: this.openEnded,
          radialSegments: this.radialSegments,
          disableImpostor: this.disableImpostor,
          dullInterior: true
        })
      )
    } else {
      this.distanceBuffer = new WideLineBuffer(
        getFixedLengthDashData(bondData),
        this.getBufferParams({
          linewidth: this.linewidth,
          visible: this.lineVisible,
          opacity: this.lineOpacity
        })
      )
    }

    return {
      bondSet: distanceData.bondSet,
      bondStore: distanceData.bondStore,
      position: distanceData.position,
      bufferList: [ this.textBuffer, this.distanceBuffer ]
    }
  }

  updateData (what, data) {
    super.updateData(what, data)

    const bondParams = {
      bondSet: data.bondSet,
      bondStore: data.bondStore
    }

    const bondData = this.getBondData(data.sview, what, bondParams)
    const distanceData = {}

    if (!what || what.color) {
      distanceData.color = bondData.color
      distanceData.color2 = bondData.color2
    }

    if (!what || what.radius) {
      distanceData.radius = bondData.radius
    }

    this.distanceBuffer.setAttributes(distanceData)
  }

  setParameters (params) {
    let rebuild = false
    const what = {}

    super.setParameters(params, what, rebuild)

    if (!this.useCylinder) {
      if (params && params.lineOpacity) {
        this.distanceBuffer.setParameters({ opacity: params.lineOpacity })
      }
      if (params && params.opacity !== undefined) {
        this.distanceBuffer.setParameters({ opacity: this.lineOpacity })
      }
      if (params && params.linewidth) {
        this.distanceBuffer.setParameters({ linewidth: params.linewidth })
      }
    }

    return this
  }
}

RepresentationRegistry.add('distance', DistanceRepresentation)

export default DistanceRepresentation
