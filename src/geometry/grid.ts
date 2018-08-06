import { NumberArray, TypedArray } from "../types";

/**
 * @file Grid
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
interface Grid {
  data: TypedArray
  index: (x: number, y: number, z: number) => number
  set: (x: number, y: number, z: number, ...arg: number[]) => void
  toArray: (x: number, y: number, z: number, array?: NumberArray, offset?: number) => void
  fromArray: (x: number, y: number, z: number, array: NumberArray, offset?: number) => void
  copy: (grid: Grid) => void
  clone: () => void
}
export interface GridConstructor {
 (this: Grid, length: number, width: number, height: number, DataCtor: any, elemSize: number): void
 new (length: number, width: number, height: number, DataCtor: any, elemSize: number): Grid
}

const Grid = (function Grid (this: Grid, length: number, width: number, height: number, DataCtor: any, elemSize: number) {
  DataCtor = DataCtor || Int32Array
  elemSize = elemSize || 1

  const data = new DataCtor(length * width * height * elemSize)

  function index (x: number, y: number, z: number) {
    return ((((x * width) + y) * height) + z) * elemSize
  }

  this.data = data

  this.index = index

  this.set = function (x: number, y: number, z: number, ...args: number[]) {
    const i = index(x, y, z)

    for (let j = 0; j < elemSize; ++j) {
      data[ i + j ] = args[ j ]
    }
  }

  this.toArray = function (x: number, y, z: number, array: NumberArray = [], offset: number = 0) {
    const i = index(x, y, z)

    for (let j = 0; j < elemSize; ++j) {
      array[ offset + j ] = data[ i + j ]
    }
  }

  this.fromArray = function (x: number, y: number, z: number, array: NumberArray, offset: number = 0) {
    const i = index(x, y, z)

    for (let j = 0; j < elemSize; ++j) {
      data[ i + j ] = array[ offset + j ]
    }
  }

  this.copy = function (grid: Grid) {
    this.data.set(grid.data)
  }

  this.clone = function () {
    return new (Grid as GridConstructor)(
      length, width, height, DataCtor, elemSize
    ).copy(this)
  }
}) as GridConstructor

export default Grid
