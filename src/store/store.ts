/**
 * @file Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Log } from '../globals'
import { getTypedArray, TypedArrayString } from '../utils'

export type StoreField = [string, number, TypedArrayString]

/**
 * Store base class
 * @interface
 */
export default class Store {
  [k: string]: any

  length: number
  count: number

  _fields: StoreField[]
  _defaultFields: StoreField[]

  /**
   * @param {Integer} [size] - initial size
   */
  constructor (size = 0) {
    this._fields = this._defaultFields
    this._init(0)
  }

  /**
   * Initialize the store
   * @param  {Integer} size - size to initialize
   * @return {undefined}
   */
  _init (size: number) {
    this.length = size
    this.count = 0

    for (let i = 0, il = this._fields.length; i < il; ++i) {
      const [name, size, type]: StoreField = this._fields[ i ]
      this._initField(name, size, type)
    }
  }

  /**
   * Initialize a field
   * @param  {String} name - field name
   * @param  {Integer} size - element size
   * @param  {String} type - data type, one of int8, int16, int32,
   *                         uint8, uint16, uint32, float32
   * @return {undefined}
   */
  _initField (name: string, size: number, type: TypedArrayString) {
    this[ name ] = getTypedArray(type, this.length * size)
  }

  /**
   * Add a field
   * @param  {String} name - field name
   * @param  {Integer} size - element size
   * @param  {String} type - data type, one of int8, int16, int32,
   *                         uint8, uint16, uint32, float32
   * @return {undefined}
   */
  addField (name: string, size: number, type: TypedArrayString) {
    this._fields.push([name, size, type])
    this._initField(name, size, type)
  }

  /**
   * Resize the store to the new size
   * @param  {Integer} size - new size
   * @return {undefined}
   */
  resize (size?: number) {
    // Log.time( "Store.resize" );

    this.length = Math.round(size || 0)
    this.count = Math.min(this.count, this.length)

    for (let i = 0, il = this._fields.length; i < il; ++i) {
      const name = this._fields[ i ][ 0 ]
      const itemSize = this._fields[ i ][ 1 ]
      const arraySize = this.length * itemSize
      const tmpArray = new this[ name ].constructor(arraySize)

      if (this[ name ].length > arraySize) {
        tmpArray.set(this[ name ].subarray(0, arraySize))
      } else {
        tmpArray.set(this[ name ])
      }
      this[ name ] = tmpArray
    }

    // Log.timeEnd( "Store.resize" );
  }

  /**
   * Resize the store to 1.5 times its current size if full
   * @return {undefined}
   */
  growIfFull () {
    if (this.count >= this.length) {
      const size = Math.round(this.length * 1.5)
      this.resize(Math.max(256, size))
    }
  }

  /**
   * Copy data from one store to another
   * @param  {Store} other - store to copy from
   * @param  {Integer} thisOffset - offset to start copying to
   * @param  {Integer} otherOffset - offset to start copying from
   * @param  {Integer} length - number of entries to copy
   * @return {undefined}
   */
  copyFrom (other: Store, thisOffset: number, otherOffset: number, length: number) {
    for (let i = 0, il = this._fields.length; i < il; ++i) {
      const name = this._fields[ i ][ 0 ]
      const itemSize = this._fields[ i ][ 1 ]
      const thisField = this[ name ]
      const otherField = other[ name ]

      for (let j = 0; j < length; ++j) {
        const thisIndex = itemSize * (thisOffset + j)
        const otherIndex = itemSize * (otherOffset + j)
        for (let k = 0; k < itemSize; ++k) {
          thisField[ thisIndex + k ] = otherField[ otherIndex + k ]
        }
      }
    }
  }

  /**
   * Copy data within this store
   * @param  {Integer} thisOffset - offset to start copying to
   * @param  {Integer} otherOffset - offset to start copying from
   * @param  {Integer} length - number of entries to copy
   * @return {undefined}
   */
  copyWithin (offsetTarget: number, offsetSource: number, length: number) {
    for (let i = 0, il = this._fields.length; i < il; ++i) {
      const name = this._fields[ i ][ 0 ]
      const itemSize = this._fields[ i ][ 1 ]
      const thisField = this[ name ]

      for (let j = 0; j < length; ++j) {
        const targetIndex = itemSize * (offsetTarget + j)
        const sourceIndex = itemSize * (offsetSource + j)
        for (let k = 0; k < itemSize; ++k) {
          thisField[ targetIndex + k ] = thisField[ sourceIndex + k ]
        }
      }
    }
  }

  /**
   * Sort entries in the store given the compare function
   * @param  {[type]} compareFunction - function to sort by
   * @return {undefined}
   */
  sort (compareFunction: (a: any, b: any) => number) {
    Log.time('Store.sort')

    const thisStore = this
    const tmpStore = new (this.constructor as any)(1)

    function swap (index1: number, index2: number) {
      if (index1 === index2) return
      tmpStore.copyFrom(thisStore, 0, index1, 1)
      thisStore.copyWithin(index1, index2, 1)
      thisStore.copyFrom(tmpStore, index2, 0, 1)
    }

    function quicksort (left: number, right: number) {
      if (left < right) {
        let pivot = Math.floor((left + right) / 2)
        let leftNew = left
        let rightNew = right
        do {
          while (compareFunction(leftNew, pivot) < 0) {
            leftNew += 1
          }
          while (compareFunction(rightNew, pivot) > 0) {
            rightNew -= 1
          }
          if (leftNew <= rightNew) {
            if (leftNew === pivot) {
              pivot = rightNew
            } else if (rightNew === pivot) {
              pivot = leftNew
            }
            swap(leftNew, rightNew)
            leftNew += 1
            rightNew -= 1
          }
        } while (leftNew <= rightNew)
        quicksort(left, rightNew)
        quicksort(leftNew, right)
      }
    }

    quicksort(0, this.count - 1)

    Log.timeEnd('Store.sort')
  }

  /**
   * Empty the store
   * @return {undefined}
   */
  clear () {
    this.count = 0
  }

  /**
   * Dispose of the store entries and fields
   * @return {undefined}
   */
  dispose () {
    delete this.length
    delete this.count

    for (let i = 0, il = this._fields.length; i < il; ++i) {
      const name = this._fields[ i ][ 0 ]
      delete this[ name ]
    }
  }
}