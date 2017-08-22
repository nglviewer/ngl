/**
 * @file Contact Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { defaults } from '../utils.js'
import { RepresentationRegistry } from '../globals.js'
import { ContactPicker } from '../utils/picker.js'
import { calculateCenterArray } from '../math/array-utils.js'
import StructureRepresentation from './structure-representation.js'
import { polarContacts, polarBackboneContacts } from '../geometry/contact-utils.js'
import CylinderBuffer from '../buffer/cylinder-buffer.js'

/**
 * Contact representation.
 */
class ContactRepresentation extends StructureRepresentation {
  constructor (structure, viewer, params) {
    super(structure, viewer, params)

    this.type = 'contact'

    this.parameters = Object.assign({

      contactType: {
        type: 'select',
        rebuild: true,
        options: {
          'polar': 'polar',
          'polarBackbone': 'polar backbone'
        }
      },
      maxDistance: {
        type: 'number', precision: 1, max: 10, min: 0.1, rebuild: true
      },
      maxAngle: {
        type: 'integer', max: 180, min: 0, rebuild: true
      },
      radialSegments: true,
      disableImpostor: true

    }, this.parameters)

    this.init(params)
  }

  init (params) {
    var p = params || {}
    p.radius = defaults(p.radius, 0.25)

    this.contactType = defaults(p.contactType, 'polarBackbone')
    this.maxDistance = defaults(p.maxDistance, 3.5)
    this.maxAngle = defaults(p.maxAngle, 40)

    super.init(p)
  }

  getContactData (sview) {
    var contactsFnDict = {
      'polar': polarContacts,
      'polarBackbone': polarBackboneContacts
    }

    var contactData = contactsFnDict[ this.contactType ](
      sview, this.maxDistance, this.maxAngle
    )

    return contactData
  }

  getBondData (sview, what, params) {
    var bondData = sview.getBondData(this.getBondParams(what, params))
    if (bondData.picking) {
      bondData.picking = new ContactPicker(
        bondData.picking.array,
        bondData.picking.structure,
        params.bondStore
      )
    }
    return bondData
  }

  createData (sview) {
    var contactData = this.getContactData(sview)

    var cylinderBuffer = new CylinderBuffer(
      this.getBondData(sview, undefined, {
        bondSet: contactData.bondSet,
        bondStore: contactData.bondStore
      }),
      this.getBufferParams({
        openEnded: false,
        radialSegments: this.radialSegments,
        disableImpostor: this.disableImpostor,
        dullInterior: true
      })
    )

    return {
      bufferList: [ cylinderBuffer ],
      bondSet: contactData.bondSet,
      bondStore: contactData.bondStore
    }
  }

  updateData (what, data) {
    if (!what || what.position) {
      var contactData = this.getContactData(data.sview)
      data.bondSet = contactData.bondSet
      data.bondStore = contactData.bondStore
    }

    var bondParams = {
      bondSet: data.bondSet,
      bondStore: data.bondStore
    }

    var bondData = this.getBondData(data.sview, what, bondParams)
    var cylinderData = {}

    if (!what || what.position) {
      cylinderData.position = calculateCenterArray(
        bondData.position1, bondData.position2
      )
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
  }
}

RepresentationRegistry.add('contact', ContactRepresentation)

export default ContactRepresentation
