/**
 * @file Mapped Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { getUintArray } from '../utils'
import { calculateCenterArray, serialArray } from '../math/array-utils'
import Buffer, { BufferParameters, BufferData } from './buffer'

export type MappingType = 'v2'|'v3'

/**
 * Mapped buffer. Sends mapping attribute to the GPU and repeats data in
 * others attributes. Used to render imposters.
 * @interface
 */
abstract class MappedBuffer extends Buffer {
  index: Uint32Array|Uint16Array

  constructor (mappingType: MappingType, data: BufferData, params: Partial<BufferParameters> = {}) {
    super(data, params)

    this.index = getUintArray(this.indexSize, this.attributeSize)
    this.makeIndex()
    this.initIndex(this.index)

    this.addAttributes({
      'mapping': { type: mappingType, value: null }
    })

    this.setAttributes({ primitiveId: serialArray(this.size) })
  }

  abstract get mapping (): Float32Array
  abstract get mappingIndices (): Uint32Array|Uint16Array
  abstract get mappingIndicesSize (): number
  abstract get mappingSize (): number
  abstract get mappingItemSize (): number

  get attributeSize () {
    return this.size * this.mappingSize
  }

  get indexSize () {
    return this.size * this.mappingIndicesSize
  }

  addAttributes (attributes: any) {
    const nullValueAttributes: any = {}
    for (const name in attributes) {
      const a = attributes[ name ]
      nullValueAttributes[ name ] = {
        type: a.type,
        value: null
      }
    }

    super.addAttributes(nullValueAttributes)
  }

  getAttributeIndex (dataIndex: number) {
    return dataIndex * 3 * this.mappingSize
  }

  setAttributes (data: any) {  // TODO
    if (data && !data.position && data.position1 && data.position2) {
      data.position = calculateCenterArray(data.position1, data.position2)
    }

    const size = this.size
    const mappingSize = this.mappingSize
    const attributes = this.geometry.attributes as any  // TODO

    let a, d, itemSize, array, n, i, j

    for (const name in data) {
      if (name === 'index' || name === 'picking') continue

      d = data[ name ]
      a = attributes[ name ]
      itemSize = a.itemSize
      array = a.array

      for (let k = 0; k < size; ++k) {
        n = k * itemSize
        i = n * mappingSize

        for (let l = 0; l < mappingSize; ++l) {
          j = i + (itemSize * l)

          for (let m = 0; m < itemSize; ++m) {
            array[ j + m ] = d[ n + m ]
          }
        }
      }

      a.needsUpdate = true
    }
  }

  makeMapping () {
    const size = this.size
    const mapping = this.mapping
    const mappingSize = this.mappingSize
    const mappingItemSize = this.mappingItemSize

    const attributes = this.geometry.attributes as any  // TODO
    const aMapping = attributes.mapping.array

    for (let v = 0; v < size; v++) {
      aMapping.set(mapping, v * mappingItemSize * mappingSize)
    }
  }

  makeIndex () {
    const size = this.size
    const mappingSize = this.mappingSize
    const mappingIndices = this.mappingIndices
    const mappingIndicesSize = this.mappingIndicesSize

    const index = this.index

    for (let v = 0; v < size; v++) {
      const ix = v * mappingIndicesSize
      const it = v * mappingSize

      index.set(mappingIndices, ix)

      for (let s = 0; s < mappingIndicesSize; ++s) {
        index[ ix + s ] += it
      }
    }
  }
}

export default MappedBuffer
