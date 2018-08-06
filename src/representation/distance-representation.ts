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
import MeasurementRepresentation, { MeasurementRepresentationParameters } from './measurement-representation'
import Selection from '../selection/selection'
import BondStore from '../store/bond-store'
import TextBuffer, { TextBufferData, TextBufferParameters } from '../buffer/text-buffer'
import WideLineBuffer from '../buffer/wideline-buffer'
import CylinderBuffer, { CylinderBufferData } from '../buffer/cylinder-buffer'
import { getFixedLengthDashData } from '../geometry/dash'
import Viewer from '../viewer/viewer';
import { Structure } from '../ngl';
import StructureView from '../structure/structure-view';
import { BondDataFields, BondDataParams, BondData } from '../structure/structure-data';
import { StructureRepresentationData } from './structure-representation';
import CylinderGeometryBuffer from '../buffer/cylindergeometry-buffer';

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
 *                                efficient when the representation is updated often, e.g. by
 *                                changing the selection or the atom positions, as there
 *                                are no selection strings to be evaluated.
 */
export interface DistanceRepresentationParameters extends MeasurementRepresentationParameters {
  labelUnit: string
  atomPair: AtomPair
  useCylinder: boolean
}
export type AtomPair = (number|string)[][]
/**
 * Distance representation
 */
class DistanceRepresentation extends MeasurementRepresentation {
  protected labelUnit: string
  protected atomPair: AtomPair
  protected useCylinder: boolean
  protected distanceBuffer: WideLineBuffer|CylinderGeometryBuffer
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
  constructor (structure: Structure, viewer: Viewer, params: Partial<DistanceRepresentationParameters>) {
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

  init (params: Partial<DistanceRepresentationParameters>) {
    const p = params || {}
    p.linewidth = defaults(p.linewidth, 5.0)
    p.radiusType = defaults(p.radiusType, 'size')
    p.radiusSize = defaults(p.radiusSize, 0.2)

    this.labelUnit = defaults(p.labelUnit, '')
    this.useCylinder = defaults(p.useCylinder, false)
    this.atomPair = defaults(p.atomPair, [])

    super.init(p)
  }

  getDistanceData (sview: StructureView, atomPair: AtomPair) {
    let n = atomPair.length
    const text = new Array(n)
    let position = new Float32Array(n * 3)
    const sele1 = new Selection()
    const sele2 = new Selection()

    const bondStore = new BondStore()

    const ap1 = sview.getAtomProxy()
    const ap2 = sview.getAtomProxy()

    let j = 0 // Skipped pairs
    const selected = sview.getAtomSet()

    atomPair.forEach((pair, i) => {
      let v1 = pair[ 0 ]
      let v2 = pair[ 1 ]

      if (typeof(v1) === 'number' && Number.isInteger(v1) && typeof(v2) === 'number' && Number.isInteger(v2)) {
        if (selected.get(v1) && selected.get(v2)) {
          ap1.index = v1
          ap2.index = v2
        } else {
          j += 1
          return
        }
      } else {
        sele1.setString(v1 as string)
        sele2.setString(v2 as string)

        var atomIndices1 = sview.getAtomIndices(sele1)
        var atomIndices2 = sview.getAtomIndices(sele2)

        if (atomIndices1!.length && atomIndices2!.length) {
          ap1.index = atomIndices1![ 0 ]
          ap2.index = atomIndices2![ 0 ]
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
    })

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

  getBondData (sview: StructureView, what: BondDataFields, params: BondDataParams): BondData {
    const bondData = sview.getBondData(this.getBondParams(what, params))
    if (bondData.picking) {
      bondData.picking = new DistancePicker(
        bondData.picking.array,
        bondData.picking.structure,
        params.bondStore!
      ) as any
    }
    return bondData
  }

  createData (sview: StructureView) {
    if (!sview.atomCount || !this.atomPair.length) return

    const n = this.atomPair.length
    const c = new Color(this.labelColor)
    const distanceData = this.getDistanceData(sview, this.atomPair)

    this.textBuffer = new TextBuffer({
      position: distanceData.position,
      size: uniformArray(n, this.labelSize),
      color: uniformArray3(n, c.r, c.g, c.b),
      text: distanceData.text
    } as TextBufferData, this.getLabelBufferParams() as TextBufferParameters)

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
        bondData as CylinderBufferData,
        this.getBufferParams({
          openEnded: this.openEnded,
          radialSegments: this.radialSegments,
          disableImpostor: this.disableImpostor,
          dullInterior: true
        }) 
      ) as CylinderGeometryBuffer
    } else {
      this.distanceBuffer = new WideLineBuffer(
        getFixedLengthDashData(bondData as CylinderBufferData),
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

  updateData (what: BondDataFields, data: StructureRepresentationData) {
    super.updateData(what, data)

    const bondParams = {
      bondSet: data.bondSet,
      bondStore: data.bondStore
    }

    const bondData = this.getBondData(data.sview as StructureView, what, bondParams)
    const distanceData = {}

    if (!what || what.color) {
      Object.assign( distanceData, {
        color: bondData.color,
        color2: bondData.color2
      })
    }

    if (!what || what.radius) {
      Object.assign( distanceData, {radius: bondData.radius})
    }

    (this.distanceBuffer as CylinderGeometryBuffer).setAttributes(distanceData)
  }

  setParameters (params: Partial<DistanceRepresentationParameters>) {
    let rebuild = false
    const what = {}

    super.setParameters(params, what, rebuild)

    if (!this.useCylinder) {
      if (params && params.lineOpacity) {
        (this.distanceBuffer as WideLineBuffer).setParameters({ opacity: params.lineOpacity })
      }
      if (params && params.opacity !== undefined) {
        (this.distanceBuffer as WideLineBuffer).setParameters({ opacity: this.lineOpacity })
      }
      if (params && params.linewidth) {
        (this.distanceBuffer as WideLineBuffer).setParameters({ linewidth: params.linewidth })
      }
    }

    return this
  }
}

RepresentationRegistry.add('distance', DistanceRepresentation)

export default DistanceRepresentation
