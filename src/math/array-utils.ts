/**
 * @file Array Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3 } from 'three'

import { NumberArray } from '../types'
import { TwoPI } from './math-constants'

export function circularMean (array: NumberArray, max: number, stride = 1, offset = 0, indices?: NumberArray) {
  // http://en.wikipedia.org/wiki/Center_of_mass#Systems_with_periodic_boundary_conditions

  // Bai, Linge; Breen, David (2008). Calculating Center of Mass in an Unbounded 2D Environment. Journal of Graphics, GPU, and Game Tools 13 (4): 53–60.

  // http://stackoverflow.com/questions/18166507/using-fft-to-find-the-center-of-mass-under-periodic-boundary-conditions

  const n = indices ? indices.length : array.length / stride

  let cosMean = 0
  let sinMean = 0

  if (indices) {
    for (let i = 0; i < n; ++i) {
      const c = (array[ indices[ i ] * stride + offset ] + max) % max
      const angle = (c / max) * TwoPI - Math.PI

      cosMean += Math.cos(angle)
      sinMean += Math.sin(angle)
    }
  } else {
    for (let i = offset; i < n; i += stride) {
      const c = (array[ i ] + max) % max
      const angle = (c / max) * TwoPI - Math.PI

      cosMean += Math.cos(angle)
      sinMean += Math.sin(angle)
    }
  }

  cosMean /= n
  sinMean /= n

  const meanAngle = Math.atan2(sinMean, cosMean)
  const mean = (meanAngle + Math.PI) / TwoPI * max

  return mean
}

export function calculateCenterArray <T extends NumberArray = Float32Array>(array1: NumberArray, array2: NumberArray, center?: T, offset = 0): T {
  const n = array1.length
  const c = center || new Float32Array(n)

  for (let i = 0; i < n; i += 3) {
    c[ offset + i + 0 ] = (array1[ i + 0 ] + array2[ i + 0 ]) / 2.0
    c[ offset + i + 1 ] = (array1[ i + 1 ] + array2[ i + 1 ]) / 2.0
    c[ offset + i + 2 ] = (array1[ i + 2 ] + array2[ i + 2 ]) / 2.0
  }

  return c as T
}

export function calculateDirectionArray (array1: NumberArray, array2: NumberArray) {
  const n = array1.length
  const direction = new Float32Array(n)

  for (let i = 0; i < n; i += 3) {
    direction[ i + 0 ] = array2[ i + 0 ] - array1[ i + 0 ]
    direction[ i + 1 ] = array2[ i + 1 ] - array1[ i + 1 ]
    direction[ i + 2 ] = array2[ i + 2 ] - array1[ i + 2 ]
  }

  return direction
}

export function uniformArray <T extends NumberArray = Float32Array>(n: number, a: number, optionalTarget?: T): T {
  const array = optionalTarget || new Float32Array(n)

  for (let i = 0; i < n; ++i) {
    array[ i ] = a
  }

  return array as T
}

export function uniformArray3 (n: number, a: number, b: number, c: number, optionalTarget?: NumberArray) {
  const array = optionalTarget || new Float32Array(n * 3)

  for (let i = 0; i < n; ++i) {
    const j = i * 3

    array[ j + 0 ] = a
    array[ j + 1 ] = b
    array[ j + 2 ] = c
  }

  return array
}

export function centerArray3 (array: NumberArray, center = new Vector3()) {
  const n = array.length

  for (let i = 0; i < n; i += 3) {
    center.x += array[ i ]
    center.y += array[ i + 1 ]
    center.z += array[ i + 2 ]
  }

  center.divideScalar(n / 3)

  return center
}

export function serialArray (n: number) {
  const array = new Float32Array(n)

  for (let i = 0; i < n; ++i) {
    array[ i ] = i
  }

  return array
}

export function serialBlockArray (n: number, b: number, offset = 0, optionalTarget?: NumberArray) {
  const array = optionalTarget || new Float32Array(n * b)

  for (let i = 0; i < n; ++i) {
    const k = offset + i * b

    for (let j = 0; j < b; ++j) {
      array[ k + j ] = i
    }
  }

  return array
}

export function randomColorArray (n: number) {
  const array = new Float32Array(n * 3)

  for (let i = 0; i < n; ++i) {
    const j = i * 3

    array[ j + 0 ] = Math.random()
    array[ j + 1 ] = Math.random()
    array[ j + 2 ] = Math.random()
  }

  return array
}

export function replicateArrayEntries (array: NumberArray, m: number) {
  const n = array.length
  const repArr = new Float32Array(n * m)

  for (let i = 0; i < n; ++i) {
    const k = i * m
    const a = array[ i ]

    for (let j = 0; j < m; ++j) {
      repArr[ k + j ] = a
    }
  }

  return repArr
}

export function replicateArray3Entries (array: NumberArray, m: number) {
  const n = array.length / 3
  const repArr = new Float32Array(n * m * 3)

  for (let i = 0; i < n; ++i) {
    const v = i * 3
    const k = i * m * 3

    const a = array[ v + 0 ]
    const b = array[ v + 1 ]
    const c = array[ v + 2 ]

    for (let j = 0; j < m; ++j) {
      const l = k + j * 3

      repArr[ l + 0 ] = a
      repArr[ l + 1 ] = b
      repArr[ l + 2 ] = c
    }
  }

  return repArr
}

export function calculateMeanArray (array1: NumberArray, array2: NumberArray) {
  const n = array1.length
  const mean = new Float32Array(n)

  for (let i = 0; i < n; i++) {
    mean[ i ] = (array1[ i ] + array2[ i ]) / 2.0
  }

  return mean
}

export function calculateMinArray (array1: NumberArray, array2: NumberArray) {
  const n = array1.length
  const min = new Float32Array(n)

  for (let i = 0; i < n; i++) {
    min[ i ] = Math.min(array1[ i ], array2[ i ])
  }

  return min
}

export function copyArray<T extends any[]|NumberArray> (src: T, dst: T, srcOffset: number, dstOffset: number, length: number) {
  for (let i = 0; i < length; ++i) {
    dst[ dstOffset + i ] = src[ srcOffset + i ]
  }
}

export function copyWithin (array: NumberArray|any[], srcOffset: number, dstOffset: number, length: number) {
  copyArray(array, array, srcOffset, dstOffset, length)
}

const swap = new Float32Array(4)
const temp = new Float32Array(4)
/**
 * quicksortIP
 * @function
 * @author Roman Bolzern <roman.bolzern@fhnw.ch>, 2013
 * @author I4DS http://www.fhnw.ch/i4ds, 2013
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 * @description
 * In-place quicksort for typed arrays (e.g. for Float32Array)
 * provides fast sorting
 * useful e.g. for a custom shader and/or BufferGeometry
 * Complexity: http://bigocheatsheet.com/ see Quicksort
 *
 * @example
 * points: [x, y, z, x, y, z, x, y, z, ...]
 * eleSize: 3 //because of (x, y, z)
 * orderElement: 0 //order according to x
 *
 * @param {TypedArray} arr - array to be sorted
 * @param {Integer} eleSize - element size
 * @param {Integer} orderElement - index of element used for sorting, < eleSize
 * @param {Integer} [begin] - start index for range to be sorted
 * @param {Integer} [end] - end index for range to be sorted
 * @return {TypedArray} the input array
 */
export function quicksortIP (arr: NumberArray, eleSize: number, orderElement: number, begin = 0, end?: number) {
  end = (end || (arr.length / eleSize)) - 1

  const stack = []
  let sp = -1
  let left = begin
  let right = end
  let tmp = 0.0
  let x = 0
  let y = 0

  const swapF = function (a: number, b: number) {
    a *= eleSize; b *= eleSize
    for (y = 0; y < eleSize; y++) {
      tmp = arr[ a + y ]
      arr[ a + y ] = arr[ b + y ]
      arr[ b + y ] = tmp
    }
  }

  let i, j

  while (true) {
    if (right - left <= 25) {
      for (j = left + 1; j <= right; j++) {
        for (x = 0; x < eleSize; x++) {
          swap[ x ] = arr[ j * eleSize + x ]
        }

        i = j - 1

        while (i >= left && arr[ i * eleSize + orderElement ] > swap[ orderElement ]) {
          for (x = 0; x < eleSize; x++) {
            arr[ (i + 1) * eleSize + x ] = arr[ i * eleSize + x ]
          }
          i--
        }

        for (x = 0; x < eleSize; x++) {
          arr[ (i + 1) * eleSize + x ] = swap[ x ]
        }
      }

      if (sp === -1) break

      right = stack[ sp-- ] // ?
      left = stack[ sp-- ]
    } else {
      const median = (left + right) >> 1

      i = left + 1
      j = right

      swapF(median, i)

      if (arr[ left * eleSize + orderElement ] > arr[ right * eleSize + orderElement ]) {
        swapF(left, right)
      }

      if (arr[ i * eleSize + orderElement ] > arr[ right * eleSize + orderElement ]) {
        swapF(i, right)
      }

      if (arr[ left * eleSize + orderElement ] > arr[ i * eleSize + orderElement ]) {
        swapF(left, i)
      }

      for (x = 0; x < eleSize; x++) {
        temp[ x ] = arr[ i * eleSize + x ]
      }

      while (true) {
        do i++; while (arr[ i * eleSize + orderElement ] < temp[ orderElement ])
        do j--; while (arr[ j * eleSize + orderElement ] > temp[ orderElement ])
        if (j < i) break
        swapF(i, j)
      }

      for (x = 0; x < eleSize; x++) {
        arr[ (left + 1) * eleSize + x ] = arr[ j * eleSize + x ]
        arr[ j * eleSize + x ] = temp[ x ]
      }

      if (right - i + 1 >= j - left) {
        stack[ ++sp ] = i
        stack[ ++sp ] = right
        right = j - 1
      } else {
        stack[ ++sp ] = left
        stack[ ++sp ] = j - 1
        left = i
      }
    }
  }

  return arr
}

export function quicksortCmp<T> (arr: NumberArray|T[], cmp?: (a: number|T, b: number|T) => number, begin = 0, end?: number) {
  cmp = cmp || function cmp (a, b) {
    if (a > b) return 1
    if (a < b) return -1
    return 0
  }
  end = (end || arr.length) - 1

  const stack = []
  let sp = -1
  let left = begin
  let right = end
  let tmp: number|T

  function swap (a: number, b: number) {
    const tmp2 = arr[ a ]
    arr[ a ] = arr[ b ]
    arr[ b ] = tmp2
  }

  let i, j

  while (true) {
    if (right - left <= 25) {
      for (let k = left + 1; k <= right; ++k) {
        tmp = arr[ k ]
        i = k - 1

        while (i >= left && cmp(arr[ i ], tmp) > 0) {
          arr[ i + 1 ] = arr[ i ]
          --i
        }

        arr[ i + 1 ] = tmp
      }

      if (sp === -1) break

      right = stack[ sp-- ] // ?
      left = stack[ sp-- ]
    } else {
      const median = (left + right) >> 1

      i = left + 1
      j = right

      swap(median, i)

      if (cmp(arr[ left ], arr[ right ]) > 0) {
        swap(left, right)
      }

      if (cmp(arr[ i ], arr[ right ]) > 0) {
        swap(i, right)
      }

      if (cmp(arr[ left ], arr[ i ]) > 0) {
        swap(left, i)
      }

      tmp = arr[ i ]

      while (true) {
        do i++; while (cmp(arr[ i ], tmp) < 0)
        do j--; while (cmp(arr[ j ], tmp) > 0)
        if (j < i) break
        swap(i, j)
      }

      arr[ left + 1 ] = arr[ j ]
      arr[ j ] = tmp

      if (right - i + 1 >= j - left) {
        stack[ ++sp ] = i
        stack[ ++sp ] = right
        right = j - 1
      } else {
        stack[ ++sp ] = left
        stack[ ++sp ] = j - 1
        left = i
      }
    }
  }

  return arr
}

export function quickselectCmp<T> (arr: NumberArray|T[], n: number, cmp?: (a: number|T, b: number|T) => number, left = 0, right?: number) {
  cmp = cmp || function cmp (a, b) {
    if (a > b) return 1
    if (a < b) return -1
    return 0
  }
  right = (right || arr.length) - 1

  let pivotIndex, pivotValue, storeIndex

  function swap (a: number, b: number) {
    const tmp = arr[ a ]
    arr[ a ] = arr[ b ]
    arr[ b ] = tmp
  }

  while (true) {
    if (left === right) {
      return arr[ left ]
    }
    pivotIndex = (left + right) >> 1
    pivotValue = arr[ pivotIndex ]
    swap(pivotIndex, right)
    storeIndex = left
    for (let i = left; i < right; ++i) {
      if (cmp(arr[ i ], pivotValue) < 0) {
        swap(storeIndex, i)
        ++storeIndex
      }
    }
    swap(right, storeIndex)
    pivotIndex = storeIndex
    if (n === pivotIndex) {
      return arr[ n ]
    } else if (n < pivotIndex) {
      right = pivotIndex - 1
    } else {
      left = pivotIndex + 1
    }
  }
}

export function arrayMax (array: NumberArray) {
  let max = -Infinity
  for (let i = 0, il = array.length; i < il; ++i) {
    if (array[ i ] > max) max = array[ i ]
  }
  return max
}

export function arrayMin (array: NumberArray) {
  let min = Infinity
  for (let i = 0, il = array.length; i < il; ++i) {
    if (array[ i ] < min) min = array[ i ]
  }
  return min
}

export function arraySum (array: NumberArray, stride = 1, offset = 0) {
  const n = array.length
  let sum = 0
  for (let i = offset; i < n; i += stride) {
    sum += array[ i ]
  }
  return sum
}

export function arrayMean (array: NumberArray, stride = 1, offset = 0) {
  return arraySum(array, stride, offset) / (array.length / stride)
}

export function arrayRms (array: NumberArray) {
  const n = array.length
  let sumSq = 0
  for (let i = 0; i < n; ++i) {
    const di = array[ i ]
    sumSq += di * di
  }
  return Math.sqrt(sumSq / n)
}

export function arraySorted (array: NumberArray) {
  for (let i = 1, il = array.length; i < il; ++i) {
    if (array[ i - 1 ] > array[ i ]) return false
  }
  return true
}

export function arraySortedCmp<T> (array: NumberArray|T[], cmp: (a: number|T, b: number|T) => number) {
  for (let i = 1, il = array.length; i < il; ++i) {
    if (cmp(array[ i - 1 ], array[ i ]) > 0) return false
  }
  return true
}
