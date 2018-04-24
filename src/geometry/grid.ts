import { NumberArray } from "../types";

/**
 * @file Grid
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

class Grid {
  DataCtor: Int32ArrayConstructor
  elemSize: number
  data: Int32Array
  width: number
  height: number
  length: number
  
  constructor (length: number, width: number, height: number, DataCtor: any = Int32Array, elemSize: number = 1) {
    this.DataCtor = DataCtor
    this.elemSize = elemSize
    this.length = length
    this.width = width
    this.height = height

    this.data = new DataCtor(length * width * height * elemSize)
  }

  public index (x: number, y: number, z: number) {
      return ((((x * this.width) + y) * this.height) + z) * this.elemSize
    }

  public set (x: number, y: number, z: number) {
    const i = this.index(x, y, z)

    for (let j = 0; j < this.elemSize; ++j) {
      this.data[ i + j ] = arguments[ 3 + j ]
    }
  }

  public toArray (x: number, y: number, z: number, array: NumberArray, offset: number) {
    const i = this.index(x, y, z)

    if (array === undefined) array = []
    if (offset === undefined) offset = 0

    for (let j = 0; j < this.elemSize; ++j) {
      array[ offset + j ] = this.data[ i + j ]
    }
  }

  public fromArray (x: number, y: number, z: number, array: NumberArray, offset: number) {
    const i = this.index(x, y, z)

    if (offset === undefined) offset = 0

    for (let j = 0; j < this.elemSize; ++j) {
      this.data[ i + j ] = array[ offset + j ]
    }
  }

  public copy (grid: Grid) {
    this.data.set(grid.data)
  }

  public clone () {
    return new Grid(
      this.length, this.width, this.height, this.DataCtor, this.elemSize
    ).copy(this)
  }
}

export default Grid
