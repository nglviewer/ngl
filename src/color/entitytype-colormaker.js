/**
 * @file Entitytype Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals.js'
import Colormaker from './colormaker.js'

import {
    PolymerEntity, NonPolymerEntity, MacrolideEntity, WaterEntity
} from '../structure/structure-constants.js'

/**
 * Color by entity type
 */
class EntitytypeColormaker extends Colormaker {
  atomColor (a) {
    var e = a.entity
    var et = e ? e.entityType : undefined
    switch (et) {
      case PolymerEntity:
        return 0x7fc97f
      case NonPolymerEntity:
        return 0xfdc086
      case MacrolideEntity:
        return 0xbeaed4
      case WaterEntity:
        return 0x386cb0
      default:
        return 0xffff99
    }
  }
}

ColormakerRegistry.add('entitytype', EntitytypeColormaker)

export default EntitytypeColormaker
