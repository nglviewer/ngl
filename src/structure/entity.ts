/**
 * @file Entity
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Structure from './structure'
import {
    UnknownEntity, PolymerEntity, NonPolymerEntity, MacrolideEntity, WaterEntity
} from './structure-constants'
import ChainProxy from '../proxy/chain-proxy'

function entityTypeFromString (string: string) {
  string = string.toLowerCase()
  switch (string) {
    case 'polymer':
      return PolymerEntity
    case 'non-polymer':
      return NonPolymerEntity
    case 'macrolide':
      return MacrolideEntity
    case 'water':
      return WaterEntity
    default:
      return UnknownEntity
  }
}

function entityFromType (type: number) {
  switch (type) {
    case PolymerEntity:
      return 'polymer'
    case NonPolymerEntity:
      return 'non-polymer'
    case MacrolideEntity:
      return 'macrolide'
    case WaterEntity:
      return 'water'
    default:
      return undefined
  }
}

export const EntityTypeString = {
  'polymer': PolymerEntity,
  'non-polymer': NonPolymerEntity,
  'macrolide': MacrolideEntity,
  'water': WaterEntity,
}
export type EntityTypeString = keyof typeof EntityTypeString

/**
 * Entity of a {@link Structure}
 */
export default class Entity {
  structure: Structure
  index: number
  description: string
  entityType: number
  chainIndexList: number[]

  /**
   * @param {Structure} structure - structure the entity belongs to
   * @param {Integer} index - index within structure.entityList
   * @param {String} description - entity description
   * @param {String} type - entity type
   * @param {Array} chainIndexList - entity chainIndexList
   */
  constructor (structure: Structure, index: number, description = '', type?: EntityTypeString, chainIndexList: number[] = []) {
    this.structure = structure
    this.index = index
    this.description = description
    this.entityType = entityTypeFromString(type || '')
    this.chainIndexList = chainIndexList

    chainIndexList.forEach(function (ci: number) {
      structure.chainStore.entityIndex[ ci ] = index
    })
  }

  get type () { return entityFromType(this.entityType) }

  getEntityType () {
    return this.entityType
  }

  isPolymer () {
    return this.entityType === PolymerEntity
  }

  isNonPolymer () {
    return this.entityType === NonPolymerEntity
  }

  isMacrolide () {
    return this.entityType === MacrolideEntity
  }

  isWater () {
    return this.entityType === WaterEntity
  }

  eachChain (callback: (cp: ChainProxy) => any) {
    const cp = this.structure.getChainProxy()

    this.chainIndexList.forEach(function (index) {
      cp.index = index
      callback(cp)
    })
  }
}