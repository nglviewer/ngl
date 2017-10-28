/**
 * @file Contact Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { defaults } from '../utils'
import { RepresentationRegistry } from '../globals'
import StructureRepresentation from './structure-representation.js'
import { calculateContacts, getContactData } from '../chemistry/interactions/contact'
import CylinderBuffer from '../buffer/cylinder-buffer.js'
import { getFixedCountDashData } from '../geometry/dash'

/**
 * Contact representation.
 */
class ContactRepresentation extends StructureRepresentation {
  constructor (structure, viewer, params) {
    super(structure, viewer, params)

    this.type = 'contact'

    this.parameters = Object.assign({
      hydrogenBond: {
        type: 'boolean', rebuild: true
      },
      hydrophobic: {
        type: 'boolean', rebuild: true
      },
      halogenBond: {
        type: 'boolean', rebuild: true
      },
      saltBridge: {
        type: 'boolean', rebuild: true
      },
      metalComplex: {
        type: 'boolean', rebuild: true
      },
      cationPi: {
        type: 'boolean', rebuild: true
      },
      piStacking: {
        type: 'boolean', rebuild: true
      },

      maxHydrophobicDistance: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxHydrogenBondDistance: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxHydrogenBondAngle: {
        type: 'integer', max: 180, min: 0, rebuild: true
      },
      backboneHydrogenBond: {
        type: 'boolean', rebuild: true
      },
      waterHydrogenBond: {
        type: 'boolean', rebuild: true
      },
      maxPiStackingDistance: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxPiStackingOffset: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxPiStackingAngle: {
        type: 'integer', max: 180, min: 0, rebuild: true
      },
      maxCationPiDistance: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxCationPiOffset: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxSaltbridgeDistance: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxHalogenBondDistance: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxHalogenBondAngle: {
        type: 'integer', max: 180, min: 0, rebuild: true
      },
      maxMetalDistance: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },

      radialSegments: true,
      disableImpostor: true
    }, this.parameters)

    this.init(params)
  }

  init (params) {
    var p = params || {}
    p.radiusSize = defaults(p.radiusSize, 0.05)

    this.hydrogenBond = defaults(p.hydrogenBond, true)
    this.hydrophobic = defaults(p.hydrophobic, false)
    this.halogenBond = defaults(p.halogenBond, true)
    this.saltBridge = defaults(p.saltBridge, true)
    this.metalComplex = defaults(p.metalComplex, true)
    this.cationPi = defaults(p.cationPi, true)
    this.piStacking = defaults(p.piStacking, true)

    this.maxHydrophobicDistance = defaults(p.maxHydrophobicDistance, 4.0)
    this.maxHydrogenBondDistance = defaults(p.maxHydrogenBondDistance, 3.5)
    this.maxHydrogenBondAngle = defaults(p.maxHydrogenBondAngle, 40)
    this.backboneHydrogenBond = defaults(p.backboneHydrogenBond, false)
    this.waterHydrogenBond = defaults(p.waterHydrogenBond, false)
    this.maxPiStackingDistance = defaults(p.maxPiStackingDistance, 5.5)
    this.maxPiStackingOffset = defaults(p.maxPiStackingOffset, 2.0)
    this.maxPiStackingAngle = defaults(p.maxPiStackingAngle, 30)
    this.maxCationPiDistance = defaults(p.maxCationPiDistance, 6.0)
    this.maxCationPiOffset = defaults(p.maxCationPiOffset, 1.5)
    this.maxSaltbridgeDistance = defaults(p.maxSaltbridgeDistance, 4.0)
    this.maxHalogenBondDistance = defaults(p.maxHalogenBondDistance, 3.5)
    this.maxHalogenBondAngle = defaults(p.maxHalogenBondAngle, 30)
    this.maxMetalDistance = defaults(p.maxMetalDistance, 3.0)

    super.init(p)
  }

  getContactData (sview) {
    const params = {
      maxHydrophobicDistance: this.maxHydrophobicDistance,
      maxHydrogenBondDistance: this.maxHydrogenBondDistance,
      maxHydrogenBondAngle: this.maxHydrogenBondAngle,
      backboneHydrogenBond: this.backboneHydrogenBond,
      waterHydrogenBond: this.waterHydrogenBond,
      maxPiStackingDistance: this.maxPiStackingDistance,
      maxPiStackingOffset: this.maxPiStackingOffset,
      maxPiStackingAngle: this.maxPiStackingAngle,
      maxCationPiDistance: this.maxCationPiDistance,
      maxCationPiOffset: this.maxCationPiOffset,
      maxSaltbridgeDistance: this.maxSaltbridgeDistance,
      maxHalogenBondDistance: this.maxHalogenBondDistance,
      maxHalogenBondAngle: this.maxHalogenBondAngle,
      maxMetalDistance: this.maxMetalDistance
    }

    const dataParams = {
      hydrogenBond: this.hydrogenBond,
      hydrophobic: this.hydrophobic,
      halogenBond: this.halogenBond,
      saltBridge: this.saltBridge,
      metalComplex: this.metalComplex,
      cationPi: this.cationPi,
      piStacking: this.piStacking,
      radius: this.radiusSize * this.radiusScale
    }

    const contacts = calculateContacts(sview, params)
    const contactData = getContactData(contacts, sview, dataParams)

    return getFixedCountDashData(contactData)
  }

  createData (sview) {
    const bufferList = [
      new CylinderBuffer(
        this.getContactData(sview),
        this.getBufferParams({
          sphereDetail: 1,
          dullInterior: true,
          disableImpostor: this.disableImpostor
        })
      )
    ]

    return { bufferList }
  }
}

RepresentationRegistry.add('contact', ContactRepresentation)

export default ContactRepresentation
