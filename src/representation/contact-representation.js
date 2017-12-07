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
      weakHydrogenBond: {
        type: 'boolean', rebuild: true
      },
      waterHydrogenBond: {
        type: 'boolean', rebuild: true
      },
      backboneHydrogenBond: {
        type: 'boolean', rebuild: true
      },
      hydrophobic: {
        type: 'boolean', rebuild: true
      },
      halogenBond: {
        type: 'boolean', rebuild: true
      },
      ionicInteraction: {
        type: 'boolean', rebuild: true
      },
      metalCoordination: {
        type: 'boolean', rebuild: true
      },
      cationPi: {
        type: 'boolean', rebuild: true
      },
      piStacking: {
        type: 'boolean', rebuild: true
      },

      maxHydrophobicDist: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxHbondDist: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxHbondSulfurDist: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxHbondAccAngle: {
        type: 'integer', max: 180, min: 0, rebuild: true
      },
      maxHbondDonAngle: {
        type: 'integer', max: 180, min: 0, rebuild: true
      },
      maxHbondAccPlaneAngle: {
        type: 'integer', max: 90, min: 0, rebuild: true
      },
      maxHbondDonPlaneAngle: {
        type: 'integer', max: 90, min: 0, rebuild: true
      },
      maxPiStackingDist: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxPiStackingOffset: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxPiStackingAngle: {
        type: 'integer', max: 180, min: 0, rebuild: true
      },
      maxCationPiDist: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxCationPiOffset: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxIonicDist: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxHalogenBondDist: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxHalogenBondAngle: {
        type: 'integer', max: 180, min: 0, rebuild: true
      },
      maxMetalDist: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      refineSaltBridges: {
        type: 'boolean', rebuild: true
      },
      masterModelIndex: {
        type: 'integer', max: 1000, min: -1, rebuild: true
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
    this.weakHydrogenBond = defaults(p.weakHydrogenBond, false)
    this.waterHydrogenBond = defaults(p.waterHydrogenBond, false)
    this.backboneHydrogenBond = defaults(p.backboneHydrogenBond, false)
    this.hydrophobic = defaults(p.hydrophobic, false)
    this.halogenBond = defaults(p.halogenBond, true)
    this.ionicInteraction = defaults(p.ionicInteraction, true)
    this.metalCoordination = defaults(p.metalCoordination, true)
    this.cationPi = defaults(p.cationPi, true)
    this.piStacking = defaults(p.piStacking, true)

    this.maxHydrophobicDist = defaults(p.maxHydrophobicDist, 4.0)
    this.maxHbondDist = defaults(p.maxHbondDist, 3.5)
    this.maxHbondSulfurDist = defaults(p.maxHbondSulfurDist, 4.1)
    this.maxHbondAccAngle = defaults(p.maxHbondAccAngle, 45)
    this.maxHbondDonAngle = defaults(p.maxHbondDonAngle, 45)
    this.maxHbondAccPlaneAngle = defaults(p.maxHbondAccPlaneAngle, 90)
    this.maxHbondDonPlaneAngle = defaults(p.maxHbondDonPlaneAngle, 30)
    this.maxPiStackingDist = defaults(p.maxPiStackingDist, 5.5)
    this.maxPiStackingOffset = defaults(p.maxPiStackingOffset, 2.0)
    this.maxPiStackingAngle = defaults(p.maxPiStackingAngle, 30)
    this.maxCationPiDist = defaults(p.maxCationPiDist, 6.0)
    this.maxCationPiOffset = defaults(p.maxCationPiOffset, 2.0)
    this.maxIonicDist = defaults(p.maxIonicDist, 5.0)
    this.maxHalogenBondDist = defaults(p.maxHalogenBondDist, 3.5)
    this.maxHalogenBondAngle = defaults(p.maxHalogenBondAngle, 30)
    this.maxMetalDist = defaults(p.maxMetalDist, 3.0)
    this.refineSaltBridges = defaults(p.refineSaltBridges, true)
    this.masterModelIndex = defaults(p.masterModelIndex, -1)

    super.init(p)
  }

  getAtomRadius () {
    return 0
  }

  getContactData (sview) {
    const params = {
      maxHydrophobicDist: this.maxHydrophobicDist,
      maxHbondDist: this.maxHbondDist,
      maxHbondSulfurDist: this.maxHbondSulfurDist,
      maxHbondAccAngle: this.maxHbondAccAngle,
      maxHbondDonAngle: this.maxHbondDonAngle,
      maxHbondAccPlaneAngle: this.maxHbondAccPlaneAngle,
      maxHbondDonPlaneAngle: this.maxHbondDonPlaneAngle,
      maxPiStackingDist: this.maxPiStackingDist,
      maxPiStackingOffset: this.maxPiStackingOffset,
      maxPiStackingAngle: this.maxPiStackingAngle,
      maxCationPiDist: this.maxCationPiDist,
      maxCationPiOffset: this.maxCationPiOffset,
      maxIonicDist: this.maxIonicDist,
      maxHalogenBondDist: this.maxHalogenBondDist,
      maxHalogenBondAngle: this.maxHalogenBondAngle,
      maxMetalDist: this.maxMetalDist,
      refineSaltBridges: this.refineSaltBridges,
      masterModelIndex: this.masterModelIndex
    }

    const dataParams = {
      hydrogenBond: this.hydrogenBond,
      weakHydrogenBond: this.weakHydrogenBond,
      waterHydrogenBond: this.waterHydrogenBond,
      backboneHydrogenBond: this.backboneHydrogenBond,
      hydrophobic: this.hydrophobic,
      halogenBond: this.halogenBond,
      ionicInteraction: this.ionicInteraction,
      metalCoordination: this.metalCoordination,
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
