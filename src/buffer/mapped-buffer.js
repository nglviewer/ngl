/**
 * @file Mapped Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Buffer from './buffer.js'

import { getUintArray } from '../utils.js'
import { calculateCenterArray, serialArray } from '../math/array-utils.js'

/**
 * Mapped buffer. Sends mapping attribute to the GPU and repeats data in
 * others attributes. Used to render imposters.
 * @interface
 */
class MappedBuffer extends Buffer {
  constructor (data, params) {
    super(data, params)

    this.index = getUintArray(this.indexSize, this.attributeSize)
    this.makeIndex()
    this.initIndex(this.index, 1)

    this.addAttributes({
      'mapping': { type: this.mappingType, value: null }
    })

    this.setAttributes({ primitiveId: serialArray(this.size) })
  }

  get attributeSize () {
    return this.size * this.mappingSize
  }

  get indexSize () {
    return this.size * this.mappingIndicesSize
  }

    /**
     * @abstract
     */
  get mapping () {}

    /**
     * @abstract
     */
  get mappingIndices () {}

    /**
     * @abstract
     */
  get mappingIndicesSize () {}

    /**
     * @abstract
     */
  get mappingType () {}

    /**
     * @abstract
     */
  get mappingSize () {}

    /**
     * @abstract
     */
  get mappingItemSize () {}

  addAttributes (attributes) {
    var nullValueAttributes = {}
    for (var name in attributes) {
      var a = attributes[ name ]
      nullValueAttributes[ name ] = {
        type: a.type,
        value: null
      }
    }

    super.addAttributes(nullValueAttributes)
  }

  getAttributeIndex (dataIndex) {
    return dataIndex * 3 * this.mappingSize
  }

  setAttributes (data) {
    if (data && !data.position && data.position1 && data.position2) {
      data.position = calculateCenterArray(data.position1, data.position2)
    }

    var size = this.size
    var mappingSize = this.mappingSize
    var attributes = this.geometry.attributes

    var a, d, itemSize, array, n, i, j

    for (var name in data) {
      if (name === 'index' || name === 'picking') continue

      d = data[ name ]
      a = attributes[ name ]
      itemSize = a.itemSize
      array = a.array

      for (var k = 0; k < size; ++k) {
        n = k * itemSize
        i = n * mappingSize

        for (var l = 0; l < mappingSize; ++l) {
          j = i + (itemSize * l)

          for (var m = 0; m < itemSize; ++m) {
            array[ j + m ] = d[ n + m ]
          }
        }
      }

      a.needsUpdate = true
    }
  }

  makeMapping () {
    var size = this.size
    var mapping = this.mapping
    var mappingSize = this.mappingSize
    var mappingItemSize = this.mappingItemSize

    var aMapping = this.geometry.attributes.mapping.array

    for (var v = 0; v < size; v++) {
      aMapping.set(mapping, v * mappingItemSize * mappingSize)
    }
  }

  makeIndex () {
    var size = this.size
    var mappingSize = this.mappingSize
    var mappingIndices = this.mappingIndices
    var mappingIndicesSize = this.mappingIndicesSize

    var index = this.index

    var ix, it

    for (var v = 0; v < size; v++) {
      ix = v * mappingIndicesSize
      it = v * mappingSize

      index.set(mappingIndices, ix)

      for (var s = 0; s < mappingIndicesSize; ++s) {
        index[ ix + s ] += it
      }
    }
  }
}

export default MappedBuffer
