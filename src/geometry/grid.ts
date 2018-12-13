import { NumberArray, TypedArray } from "../types";

/**
 * @file Grid
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
export interface iGrid {
  data: TypedArray
  index: (x: number, y: number, z: number) => number
  set: (x: number, y: number, z: number, ...arg: number[]) => void
  toArray: (x: number, y: number, z: number, array?: NumberArray, offset?: number) => void
  fromArray: (x: number, y: number, z: number, array: NumberArray, offset?: number) => void
  copy: (grid: iGrid) => void
  // clone: () => iGrid
}

function makeGrid (length: number, width: number, height: number, DataCtor: any, elemSize: number) : iGrid {
  DataCtor = DataCtor || Int32Array
  elemSize = elemSize || 1

  const data = new DataCtor(length * width * height * elemSize)

  function index (x: number, y: number, z: number) {
    return ((((x * width) + y) * height) + z) * elemSize
  }

  function set (x: number, y: number, z: number, ...args: number[]) {
    const i = index(x, y, z)

    for (let j = 0; j < elemSize; ++j) {
      data[ i + j ] = args[ j ]
    }
  }

  function toArray (x: number, y: number, z: number, array: NumberArray = [], offset: number = 0) {
    const i = index(x, y, z)

    for (let j = 0; j < elemSize; ++j) {
      array[ offset + j ] = data[ i + j ]
    }
  }

  function fromArray(x: number, y: number, z: number, array: NumberArray, offset: number = 0) {
    const i = index(x, y, z)

    for (let j = 0; j < elemSize; ++j) {
      data[ i + j ] = array[ offset + j ]
    }
  }

  function copy(grid: iGrid) {
    data.set(grid.data)
  }

  // function clone() {
  //   return makeGrid(
  //     length, width, height, DataCtor, elemSize
  //   ).copy(this)
  // }
  return { data, index, set, toArray, fromArray, copy }
}

export { makeGrid }