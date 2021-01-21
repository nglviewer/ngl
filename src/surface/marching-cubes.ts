/**
 * @file Marching Cubes
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { getUintArray } from '../utils'

function getEdgeTable () {
  return new Uint32Array([
    0x0, 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c,
    0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
    0x190, 0x99, 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c,
    0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
    0x230, 0x339, 0x33, 0x13a, 0x636, 0x73f, 0x435, 0x53c,
    0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
    0x3a0, 0x2a9, 0x1a3, 0xaa, 0x7a6, 0x6af, 0x5a5, 0x4ac,
    0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0,
    0x460, 0x569, 0x663, 0x76a, 0x66, 0x16f, 0x265, 0x36c,
    0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
    0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff, 0x3f5, 0x2fc,
    0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
    0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55, 0x15c,
    0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
    0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc,
    0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
    0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc,
    0xcc, 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
    0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c,
    0x15c, 0x55, 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
    0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc,
    0x2fc, 0x3f5, 0xff, 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
    0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c,
    0x36c, 0x265, 0x16f, 0x66, 0x76a, 0x663, 0x569, 0x460,
    0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac,
    0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa, 0x1a3, 0x2a9, 0x3a0,
    0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c,
    0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33, 0x339, 0x230,
    0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c,
    0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99, 0x190,
    0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c,
    0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0
  ])
}

function getTriTable (): Int32Array {
  return new Int32Array([
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 1, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    1, 8, 3, 9, 8, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 8, 3, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    9, 2, 10, 0, 2, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    2, 8, 3, 2, 10, 8, 10, 9, 8, -1, -1, -1, -1, -1, -1, -1,
    3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 11, 2, 8, 11, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    1, 9, 0, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    1, 11, 2, 1, 9, 11, 9, 8, 11, -1, -1, -1, -1, -1, -1, -1,
    3, 10, 1, 11, 10, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 10, 1, 0, 8, 10, 8, 11, 10, -1, -1, -1, -1, -1, -1, -1,
    3, 9, 0, 3, 11, 9, 11, 10, 9, -1, -1, -1, -1, -1, -1, -1,
    9, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    4, 3, 0, 7, 3, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 1, 9, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    4, 1, 9, 4, 7, 1, 7, 3, 1, -1, -1, -1, -1, -1, -1, -1,
    1, 2, 10, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    3, 4, 7, 3, 0, 4, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1,
    9, 2, 10, 9, 0, 2, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1,
    2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, -1, -1, -1, -1,
    8, 4, 7, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    11, 4, 7, 11, 2, 4, 2, 0, 4, -1, -1, -1, -1, -1, -1, -1,
    9, 0, 1, 8, 4, 7, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1,
    4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, -1, -1, -1, -1,
    3, 10, 1, 3, 11, 10, 7, 8, 4, -1, -1, -1, -1, -1, -1, -1,
    1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, -1, -1, -1, -1,
    4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, -1, -1, -1, -1,
    4, 7, 11, 4, 11, 9, 9, 11, 10, -1, -1, -1, -1, -1, -1, -1,
    9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    9, 5, 4, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 5, 4, 1, 5, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    8, 5, 4, 8, 3, 5, 3, 1, 5, -1, -1, -1, -1, -1, -1, -1,
    1, 2, 10, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    3, 0, 8, 1, 2, 10, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1,
    5, 2, 10, 5, 4, 2, 4, 0, 2, -1, -1, -1, -1, -1, -1, -1,
    2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, -1, -1, -1, -1,
    9, 5, 4, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 11, 2, 0, 8, 11, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1,
    0, 5, 4, 0, 1, 5, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1,
    2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, -1, -1, -1, -1,
    10, 3, 11, 10, 1, 3, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1,
    4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, -1, -1, -1, -1,
    5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, -1, -1, -1, -1,
    5, 4, 8, 5, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1,
    9, 7, 8, 5, 7, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    9, 3, 0, 9, 5, 3, 5, 7, 3, -1, -1, -1, -1, -1, -1, -1,
    0, 7, 8, 0, 1, 7, 1, 5, 7, -1, -1, -1, -1, -1, -1, -1,
    1, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    9, 7, 8, 9, 5, 7, 10, 1, 2, -1, -1, -1, -1, -1, -1, -1,
    10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, -1, -1, -1, -1,
    8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, -1, -1, -1, -1,
    2, 10, 5, 2, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1,
    7, 9, 5, 7, 8, 9, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1,
    9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, -1, -1, -1, -1,
    2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, -1, -1, -1, -1,
    11, 2, 1, 11, 1, 7, 7, 1, 5, -1, -1, -1, -1, -1, -1, -1,
    9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, -1, -1, -1, -1,
    5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, -1,
    11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, -1,
    11, 10, 5, 7, 11, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 8, 3, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    9, 0, 1, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    1, 8, 3, 1, 9, 8, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1,
    1, 6, 5, 2, 6, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    1, 6, 5, 1, 2, 6, 3, 0, 8, -1, -1, -1, -1, -1, -1, -1,
    9, 6, 5, 9, 0, 6, 0, 2, 6, -1, -1, -1, -1, -1, -1, -1,
    5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, -1, -1, -1, -1,
    2, 3, 11, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    11, 0, 8, 11, 2, 0, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1,
    0, 1, 9, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1,
    5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, -1, -1, -1, -1,
    6, 3, 11, 6, 5, 3, 5, 1, 3, -1, -1, -1, -1, -1, -1, -1,
    0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, -1, -1, -1, -1,
    3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, -1, -1, -1, -1,
    6, 5, 9, 6, 9, 11, 11, 9, 8, -1, -1, -1, -1, -1, -1, -1,
    5, 10, 6, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    4, 3, 0, 4, 7, 3, 6, 5, 10, -1, -1, -1, -1, -1, -1, -1,
    1, 9, 0, 5, 10, 6, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1,
    10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, -1, -1, -1, -1,
    6, 1, 2, 6, 5, 1, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1,
    1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, -1, -1, -1, -1,
    8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, -1, -1, -1, -1,
    7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9, -1,
    3, 11, 2, 7, 8, 4, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1,
    5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, -1, -1, -1, -1,
    0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1,
    9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, -1,
    8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, -1, -1, -1, -1,
    5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, -1,
    0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, -1,
    6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, -1, -1, -1, -1,
    10, 4, 9, 6, 4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    4, 10, 6, 4, 9, 10, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1,
    10, 0, 1, 10, 6, 0, 6, 4, 0, -1, -1, -1, -1, -1, -1, -1,
    8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, -1, -1, -1, -1,
    1, 4, 9, 1, 2, 4, 2, 6, 4, -1, -1, -1, -1, -1, -1, -1,
    3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, -1, -1, -1, -1,
    0, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    8, 3, 2, 8, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1,
    10, 4, 9, 10, 6, 4, 11, 2, 3, -1, -1, -1, -1, -1, -1, -1,
    0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, -1, -1, -1, -1,
    3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, -1, -1, -1, -1,
    6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, -1,
    9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, -1, -1, -1, -1,
    8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, -1,
    3, 11, 6, 3, 6, 0, 0, 6, 4, -1, -1, -1, -1, -1, -1, -1,
    6, 4, 8, 11, 6, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    7, 10, 6, 7, 8, 10, 8, 9, 10, -1, -1, -1, -1, -1, -1, -1,
    0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, -1, -1, -1, -1,
    10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, -1, -1, -1, -1,
    10, 6, 7, 10, 7, 1, 1, 7, 3, -1, -1, -1, -1, -1, -1, -1,
    1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, -1, -1, -1, -1,
    2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, -1,
    7, 8, 0, 7, 0, 6, 6, 0, 2, -1, -1, -1, -1, -1, -1, -1,
    7, 3, 2, 6, 7, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, -1, -1, -1, -1,
    2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, -1,
    1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, -1,
    11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, -1, -1, -1, -1,
    8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6, -1,
    0, 9, 1, 11, 6, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, -1, -1, -1, -1,
    7, 11, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    3, 0, 8, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 1, 9, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    8, 1, 9, 8, 3, 1, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1,
    10, 1, 2, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    1, 2, 10, 3, 0, 8, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1,
    2, 9, 0, 2, 10, 9, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1,
    6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, -1, -1, -1, -1,
    7, 2, 3, 6, 2, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    7, 0, 8, 7, 6, 0, 6, 2, 0, -1, -1, -1, -1, -1, -1, -1,
    2, 7, 6, 2, 3, 7, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1,
    1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, -1, -1, -1, -1,
    10, 7, 6, 10, 1, 7, 1, 3, 7, -1, -1, -1, -1, -1, -1, -1,
    10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, -1, -1, -1, -1,
    0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, -1, -1, -1, -1,
    7, 6, 10, 7, 10, 8, 8, 10, 9, -1, -1, -1, -1, -1, -1, -1,
    6, 8, 4, 11, 8, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    3, 6, 11, 3, 0, 6, 0, 4, 6, -1, -1, -1, -1, -1, -1, -1,
    8, 6, 11, 8, 4, 6, 9, 0, 1, -1, -1, -1, -1, -1, -1, -1,
    9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, -1, -1, -1, -1,
    6, 8, 4, 6, 11, 8, 2, 10, 1, -1, -1, -1, -1, -1, -1, -1,
    1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, -1, -1, -1, -1,
    4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, -1, -1, -1, -1,
    10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3, -1,
    8, 2, 3, 8, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1,
    0, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, -1, -1, -1, -1,
    1, 9, 4, 1, 4, 2, 2, 4, 6, -1, -1, -1, -1, -1, -1, -1,
    8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, -1, -1, -1, -1,
    10, 1, 0, 10, 0, 6, 6, 0, 4, -1, -1, -1, -1, -1, -1, -1,
    4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, -1,
    10, 9, 4, 6, 10, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    4, 9, 5, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 8, 3, 4, 9, 5, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1,
    5, 0, 1, 5, 4, 0, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1,
    11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, -1, -1, -1, -1,
    9, 5, 4, 10, 1, 2, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1,
    6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, -1, -1, -1, -1,
    7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, -1, -1, -1, -1,
    3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, -1,
    7, 2, 3, 7, 6, 2, 5, 4, 9, -1, -1, -1, -1, -1, -1, -1,
    9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, -1, -1, -1, -1,
    3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, -1, -1, -1, -1,
    6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, -1,
    9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, -1, -1, -1, -1,
    1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, -1,
    4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, -1,
    7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, -1, -1, -1, -1,
    6, 9, 5, 6, 11, 9, 11, 8, 9, -1, -1, -1, -1, -1, -1, -1,
    3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, -1, -1, -1, -1,
    0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, -1, -1, -1, -1,
    6, 11, 3, 6, 3, 5, 5, 3, 1, -1, -1, -1, -1, -1, -1, -1,
    1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, -1, -1, -1, -1,
    0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, -1,
    11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, -1,
    6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, -1, -1, -1, -1,
    5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, -1, -1, -1, -1,
    9, 5, 6, 9, 6, 0, 0, 6, 2, -1, -1, -1, -1, -1, -1, -1,
    1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, -1,
    1, 5, 6, 2, 1, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6, -1,
    10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, -1, -1, -1, -1,
    0, 3, 8, 5, 6, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    10, 5, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    11, 5, 10, 7, 5, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    11, 5, 10, 11, 7, 5, 8, 3, 0, -1, -1, -1, -1, -1, -1, -1,
    5, 11, 7, 5, 10, 11, 1, 9, 0, -1, -1, -1, -1, -1, -1, -1,
    10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, -1, -1, -1, -1,
    11, 1, 2, 11, 7, 1, 7, 5, 1, -1, -1, -1, -1, -1, -1, -1,
    0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, -1, -1, -1, -1,
    9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, -1, -1, -1, -1,
    7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, -1,
    2, 5, 10, 2, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1,
    8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, -1, -1, -1, -1,
    9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, -1, -1, -1, -1,
    9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, -1,
    1, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 8, 7, 0, 7, 1, 1, 7, 5, -1, -1, -1, -1, -1, -1, -1,
    9, 0, 3, 9, 3, 5, 5, 3, 7, -1, -1, -1, -1, -1, -1, -1,
    9, 8, 7, 5, 9, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    5, 8, 4, 5, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1,
    5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, -1, -1, -1, -1,
    0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, -1, -1, -1, -1,
    10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4, -1,
    2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, -1, -1, -1, -1,
    0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11, -1,
    0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5, -1,
    9, 4, 5, 2, 11, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, -1, -1, -1, -1,
    5, 10, 2, 5, 2, 4, 4, 2, 0, -1, -1, -1, -1, -1, -1, -1,
    3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9, -1,
    5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, -1, -1, -1, -1,
    8, 4, 5, 8, 5, 3, 3, 5, 1, -1, -1, -1, -1, -1, -1, -1,
    0, 4, 5, 1, 0, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, -1, -1, -1, -1,
    9, 4, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    4, 11, 7, 4, 9, 11, 9, 10, 11, -1, -1, -1, -1, -1, -1, -1,
    0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, -1, -1, -1, -1,
    1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, -1, -1, -1, -1,
    3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4, -1,
    4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, -1, -1, -1, -1,
    9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3, -1,
    11, 7, 4, 11, 4, 2, 2, 4, 0, -1, -1, -1, -1, -1, -1, -1,
    11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, -1, -1, -1, -1,
    2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, -1, -1, -1, -1,
    9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7, -1,
    3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10, -1,
    1, 10, 2, 8, 7, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    4, 9, 1, 4, 1, 7, 7, 1, 3, -1, -1, -1, -1, -1, -1, -1,
    4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, -1, -1, -1, -1,
    4, 0, 3, 7, 4, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    4, 8, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    9, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    3, 0, 9, 3, 9, 11, 11, 9, 10, -1, -1, -1, -1, -1, -1, -1,
    0, 1, 10, 0, 10, 8, 8, 10, 11, -1, -1, -1, -1, -1, -1, -1,
    3, 1, 10, 11, 3, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    1, 2, 11, 1, 11, 9, 9, 11, 8, -1, -1, -1, -1, -1, -1, -1,
    3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, -1, -1, -1, -1,
    0, 2, 11, 8, 0, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    3, 2, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    2, 3, 8, 2, 8, 10, 10, 8, 9, -1, -1, -1, -1, -1, -1, -1,
    9, 10, 2, 0, 9, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, -1, -1, -1, -1,
    1, 10, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    1, 3, 8, 9, 1, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 9, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    0, 3, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1
  ])
}

// Triangles are constructed between points on cube edges.
// allowedContours[edge1][edge1] indicates which lines from a given
// triangle should be shown in line mode.

// Values are bitmasks:
// In loop over cubes we keep another bitmask indicating whether our current
// cell is the first x-value (1),
// first y-value (2) or first z-value (4) of the current loop.
// We draw all lines on leading faces but only draw trailing face lines the first
// time through the loop
// A value of 8 below means the edge is always drawn (leading face)

// E.g. the first row, lines between edge0 and other edges in the bottom
// x-y plane are only drawn for the first value of z, edges in the
// x-z plane are only drawn for the first value of y. No other lines
// are drawn as they're redundant
// The line between edge 1 and 5 is always drawn as it's on the leading edge

function getAllowedContours () {
  return [

    [ 0, 4, 4, 4, 2, 0, 0, 0, 2, 2, 0, 0 ], // 1 2 3 4 8 9
    [ 4, 0, 4, 4, 0, 8, 0, 0, 0, 8, 8, 0 ], // 0 2 3 5 9 10
    [ 4, 4, 0, 4, 0, 0, 8, 0, 0, 0, 8, 8 ], // 0 1 3 6 10 11
    [ 4, 4, 4, 0, 0, 0, 0, 1, 1, 0, 0, 1 ], // 0 1 2 7 8 11
    [ 2, 0, 0, 0, 0, 8, 8, 8, 2, 2, 0, 0 ], // 0 5 6 7 8 9
    [ 0, 8, 0, 0, 8, 0, 8, 8, 0, 8, 8, 0 ], // And rotate it
    [ 0, 0, 8, 0, 8, 8, 0, 8, 0, 0, 8, 8 ],
    [ 0, 0, 0, 1, 8, 8, 8, 0, 1, 0, 0, 1 ],
    [ 2, 0, 0, 1, 2, 0, 0, 1, 0, 2, 0, 1 ], // 0 3 4 7 9 11
    [ 2, 8, 0, 0, 2, 8, 0, 0, 2, 0, 8, 0 ], // And rotate some more
    [ 0, 8, 8, 0, 0, 8, 8, 0, 0, 8, 0, 8 ],
    [ 0, 0, 8, 1, 0, 0, 8, 1, 1, 0, 8, 0 ]

  ]
}
interface MarchingCubes {
  new (field: number[], nx: number, ny: number, nz: number, atomindex: number[]): void
  triangulate: (_isolevel: number, _noNormals: boolean, _box: number[][]|undefined, _contour: boolean, _wrap: boolean) => {
    position: Float32Array
    normal: undefined|Float32Array
    index: Uint32Array|Uint16Array
    atomindex: Int32Array|undefined
    contour: boolean
  }
}
function MarchingCubes (this: MarchingCubes, field: number[], nx: number, ny: number, nz: number, atomindex: number[]) {
  // Based on alteredq / http://alteredqualia.com/
  // port of greggman's ThreeD version of marching cubes to Three.js
  // http://webglsamples.googlecode.com/hg/blob/blob.html
  //
  // Adapted for NGL by Alexander Rose

  var isolevel = 0
  var noNormals = false
  var contour = false
  var wrap = false
  var isNegativeIso = false
  var normalFactor = -1


  var n = nx * ny * nz

  // deltas
  var yd = nx
  var zd = nx * ny

  var normalCache: Float32Array, vertexIndex: Int32Array
  var count: number, icount: number

  var ilist = new Int32Array(12)

  var positionArray: number[] = []
  var normalArray: number[] = []
  var indexArray: number[] = []
  var atomindexArray: number[] = []

  var edgeTable = getEdgeTable()
  var triTable = getTriTable()
  var allowedContours = getAllowedContours()

  var mx: number, my: number, mz: number

  //

  this.triangulate = function (_isolevel: number, _noNormals: boolean, _box: number[][]|undefined, _contour: boolean, _wrap: boolean) {
    isolevel = _isolevel
    isNegativeIso = isolevel < 0.0
    contour = _contour
    wrap = _wrap
    // Normals currently disabled in contour mode for performance (unused)
    noNormals = _noNormals || contour

    if (!noNormals) {
      normalFactor = isolevel > 0 ? -1.0 : 1.0
      if (!normalCache) {
        normalCache = new Float32Array(n * 3)
      }  
    }

    var vIndexLength = n * 3

    if (!vertexIndex || vertexIndex.length !== vIndexLength) {
      vertexIndex = new Int32Array(vIndexLength)
    }

    count = 0
    icount = 0

    if (_box !== undefined) {
      var min = _box[ 0 ].map(Math.round)
      var max = _box[ 1 ].map(Math.round)

      mx = nx * Math.ceil(Math.abs(min[ 0 ]) / nx)
      my = ny * Math.ceil(Math.abs(min[ 1 ]) / ny)
      mz = nz * Math.ceil(Math.abs(min[ 2 ]) / nz)

      triangulate(
        min[ 0 ], min[ 1 ], min[ 2 ],
        max[ 0 ], max[ 1 ], max[ 2 ]
      )
    } else {
      mx = my = mz = 0

      triangulate()
    }

    positionArray.length = count * 3
    if (!noNormals) normalArray.length = count * 3
    indexArray.length = icount
    if (atomindex) atomindexArray.length = count

    return {
      position: new Float32Array(positionArray),
      normal: noNormals ? undefined : new Float32Array(normalArray),
      index: getUintArray(indexArray, positionArray.length / 3),
      atomindex: atomindex ? new Int32Array(atomindexArray) : undefined,
      contour: contour
    }
  }

  // polygonization

  function lerp (a: number, b: number, t: number) { return a + (b - a) * t }

  function index (x: number, y: number, z: number) {
    x = (x + mx) % nx
    y = (y + my) % ny
    z = (z + mz) % nz
    return ((zd * z) + yd * y) + x
  }

  function VIntX (q: number, offset: number, x: number, y: number, z: number, valp1: number, valp2: number) {
    var _q = 3 * q

    if (vertexIndex[ _q ] < 0) {
      var mu = (isolevel - valp1) / (valp2 - valp1)
      var nc = normalCache

      var c = count * 3

      positionArray[ c + 0 ] = x + mu
      positionArray[ c + 1 ] = y
      positionArray[ c + 2 ] = z

      if (!noNormals) {
        var q3 = q * 3

        normalArray[ c ] = normalFactor * lerp(nc[ q3 ], nc[ q3 + 3 ], mu)
        normalArray[ c + 1 ] = normalFactor * lerp(nc[ q3 + 1 ], nc[ q3 + 4 ], mu)
        normalArray[ c + 2 ] = normalFactor * lerp(nc[ q3 + 2 ], nc[ q3 + 5 ], mu)
      }

      if (atomindex) atomindexArray[ count ] = atomindex[ q + Math.round(mu) ]

      vertexIndex[ _q ] = count
      ilist[ offset ] = count

      count += 1
    } else {
      ilist[ offset ] = vertexIndex[ _q ]
    }
  }

  function VIntY (q: number, offset: number, x: number, y: number, z: number, valp1: number, valp2: number) {
    var _q = 3 * q + 1

    if (vertexIndex[ _q ] < 0) {
      var mu = (isolevel - valp1) / (valp2 - valp1)
      var nc = normalCache

      var c = count * 3

      positionArray[ c ] = x
      positionArray[ c + 1 ] = y + mu
      positionArray[ c + 2 ] = z

      if (!noNormals) {
        var q3 = q * 3
        var q6 = q3 + yd * 3

        normalArray[ c ] = normalFactor * lerp(nc[ q3 ], nc[ q6 ], mu)
        normalArray[ c + 1 ] = normalFactor * lerp(nc[ q3 + 1 ], nc[ q6 + 1 ], mu)
        normalArray[ c + 2 ] = normalFactor * lerp(nc[ q3 + 2 ], nc[ q6 + 2 ], mu)
      }

      if (atomindex) atomindexArray[ count ] = atomindex[ q + Math.round(mu) * yd ]

      vertexIndex[ _q ] = count
      ilist[ offset ] = count

      count += 1
    } else {
      ilist[ offset ] = vertexIndex[ _q ]
    }
  }

  function VIntZ (q: number, offset: number, x: number, y: number, z: number, valp1: number, valp2: number) {
    var _q = 3 * q + 2

    if (vertexIndex[ _q ] < 0) {
      var mu = (isolevel - valp1) / (valp2 - valp1)
      var nc = normalCache

      var c = count * 3

      positionArray[ c ] = x
      positionArray[ c + 1 ] = y
      positionArray[ c + 2 ] = z + mu

      if (!noNormals) {
        var q3 = q * 3
        var q6 = q3 + zd * 3

        normalArray[ c ] = normalFactor * lerp(nc[ q3 ], nc[ q6 ], mu)
        normalArray[ c + 1 ] = normalFactor * lerp(nc[ q3 + 1 ], nc[ q6 + 1 ], mu)
        normalArray[ c + 2 ] = normalFactor * lerp(nc[ q3 + 2 ], nc[ q6 + 2 ], mu)
      }

      if (atomindex) atomindexArray[ count ] = atomindex[ q + Math.round(mu) * zd ]

      vertexIndex[ _q ] = count
      ilist[ offset ] = count

      count += 1
    } else {
      ilist[ offset ] = vertexIndex[ _q ]
    }
  }

  function compNorm (q: number) {
    var q3 = q * 3

    if (normalCache[ q3 ] === 0.0) {
      normalCache[ q3 ] = field[ (q - 1 + n) % n ] - field[ (q + 1) % n ]
      normalCache[ q3 + 1 ] = field[ (q - yd + n) % n ] - field[ (q + yd) % n ]
      normalCache[ q3 + 2 ] = field[ (q - zd + n) % n ] - field[ (q + zd) % n ]
    }
  }

  function polygonize (fx: number, fy: number, fz: number, q: number, edgeFilter: number) {
    // cache indices
    var q1
    var qy
    var qz
    var q1y
    var q1z
    var qyz
    var q1yz
    if (wrap) {
      q = index(fx, fy, fz)
      q1 = index(fx + 1, fy, fz)
      qy = index(fx, fy + 1, fz)
      qz = index(fx, fy, fz + 1)
      q1y = index(fx + 1, fy + 1, fz)
      q1z = index(fx + 1, fy, fz + 1)
      qyz = index(fx, fy + 1, fz + 1)
      q1yz = index(fx + 1, fy + 1, fz + 1)
    } else {
      q1 = q + 1
      qy = q + yd
      qz = q + zd
      q1y = qy + 1
      q1z = qz + 1
      qyz = qy + zd
      q1yz = qyz + 1
    }

    var cubeindex = 0
    var field0 = field[ q ]
    var field1 = field[ q1 ]
    var field2 = field[ qy ]
    var field3 = field[ q1y ]
    var field4 = field[ qz ]
    var field5 = field[ q1z ]
    var field6 = field[ qyz ]
    var field7 = field[ q1yz ]

    if (field0 < isolevel) cubeindex |= 1
    if (field1 < isolevel) cubeindex |= 2
    if (field2 < isolevel) cubeindex |= 8
    if (field3 < isolevel) cubeindex |= 4
    if (field4 < isolevel) cubeindex |= 16
    if (field5 < isolevel) cubeindex |= 32
    if (field6 < isolevel) cubeindex |= 128
    if (field7 < isolevel) cubeindex |= 64

    // if cube is entirely in/out of the surface - bail, nothing to draw

    var bits = edgeTable[ cubeindex ]
    if (bits === 0) return 0

    var fx2 = fx + 1
    var fy2 = fy + 1
    var fz2 = fz + 1

    // top of the cube

    if (bits & 1) {
      if (!noNormals) {
        compNorm(q)
        compNorm(q1)
      }
      VIntX(q, 0, fx, fy, fz, field0, field1)
    }

    if (bits & 2) {
      if (!noNormals) {
        compNorm(q1)
        compNorm(q1y)
      }
      VIntY(q1, 1, fx2, fy, fz, field1, field3)
    }

    if (bits & 4) {
      if (!noNormals) {
        compNorm(qy)
        compNorm(q1y)
      }
      VIntX(qy, 2, fx, fy2, fz, field2, field3)
    }

    if (bits & 8) {
      if (!noNormals) {
        compNorm(q)
        compNorm(qy)
      }
      VIntY(q, 3, fx, fy, fz, field0, field2)
    }

    // bottom of the cube

    if (bits & 16) {
      if (!noNormals) {
        compNorm(qz)
        compNorm(q1z)
      }
      VIntX(qz, 4, fx, fy, fz2, field4, field5)
    }

    if (bits & 32) {
      if (!noNormals) {
        compNorm(q1z)
        compNorm(q1yz)
      }
      VIntY(q1z, 5, fx2, fy, fz2, field5, field7)
    }

    if (bits & 64) {
      if (!noNormals) {
        compNorm(qyz)
        compNorm(q1yz)
      }
      VIntX(qyz, 6, fx, fy2, fz2, field6, field7)
    }

    if (bits & 128) {
      if (!noNormals) {
        compNorm(qz)
        compNorm(qyz)
      }
      VIntY(qz, 7, fx, fy, fz2, field4, field6)
    }

    // vertical lines of the cube

    if (bits & 256) {
      if (!noNormals) {
        compNorm(q)
        compNorm(qz)
      }
      VIntZ(q, 8, fx, fy, fz, field0, field4)
    }

    if (bits & 512) {
      if (!noNormals) {
        compNorm(q1)
        compNorm(q1z)
      }
      VIntZ(q1, 9, fx2, fy, fz, field1, field5)
    }

    if (bits & 1024) {
      if (!noNormals) {
        compNorm(q1y)
        compNorm(q1yz)
      }
      VIntZ(q1y, 10, fx2, fy2, fz, field3, field7)
    }

    if (bits & 2048) {
      if (!noNormals) {
        compNorm(qy)
        compNorm(qyz)
      }
      VIntZ(qy, 11, fx, fy2, fz, field2, field6)
    }

    var triIndex = cubeindex << 4 // re-purpose cubeindex into an offset into triTable

    var e1
    var e2
    var e3
    var i = 0

    // here is where triangles are created

    while (triTable[ triIndex + i ] !== -1) {
      e1 = triTable[ triIndex + i ]
      e2 = triTable[ triIndex + i + 1 ]
      e3 = triTable[ triIndex + i + 2 ]

      if (contour) {
        if (allowedContours[ e1 ][ e2 ] & edgeFilter) {
          indexArray[ icount++ ] = ilist[ e1 ]
          indexArray[ icount++ ] = ilist[ e2 ]
        }
        if (allowedContours[ e2 ][ e3 ] & edgeFilter) {
          indexArray[ icount++ ] = ilist[ e2 ]
          indexArray[ icount++ ] = ilist[ e3 ]
        }
        if (allowedContours[ e1 ][ e3 ] & edgeFilter) {
          indexArray[ icount++ ] = ilist[ e1 ]
          indexArray[ icount++ ] = ilist[ e3 ]
        }
      } else {
        indexArray[ icount++ ] = ilist[ isNegativeIso ? e1 : e2 ]
        indexArray[ icount++ ] = ilist[ isNegativeIso ? e2 : e1 ]
        indexArray[ icount++ ] = ilist[ e3 ]
      }

      i += 3
    }
  }

  function triangulate (xBeg?: number, yBeg?: number, zBeg?: number, xEnd?: number, yEnd?: number, zEnd?: number) {
    let q
    let q3
    let x
    let y
    let z
    let yOffset
    let zOffset

    xBeg = xBeg !== undefined ? xBeg : 0
    yBeg = yBeg !== undefined ? yBeg : 0
    zBeg = zBeg !== undefined ? zBeg : 0

    xEnd = xEnd !== undefined ? xEnd : nx - 1
    yEnd = yEnd !== undefined ? yEnd : ny - 1
    zEnd = zEnd !== undefined ? zEnd : nz - 1

    if (!wrap) {
      if (noNormals) {
        xBeg = Math.max(0, xBeg)
        yBeg = Math.max(0, yBeg)
        zBeg = Math.max(0, zBeg)

        xEnd = Math.min(nx - 1, xEnd)
        yEnd = Math.min(ny - 1, yEnd)
        zEnd = Math.min(nz - 1, zEnd)
      } else {
        xBeg = Math.max(1, xBeg)
        yBeg = Math.max(1, yBeg)
        zBeg = Math.max(1, zBeg)

        xEnd = Math.min(nx - 2, xEnd)
        yEnd = Math.min(ny - 2, yEnd)
        zEnd = Math.min(nz - 2, zEnd)
      }
    }

    let xBeg2, yBeg2, zBeg2, xEnd2, yEnd2, zEnd2

    if (!wrap) {
      // init part of the vertexIndex
      // (takes a significant amount of time to do for all)

      xBeg2 = Math.max(0, xBeg - 2)
      yBeg2 = Math.max(0, yBeg - 2)
      zBeg2 = Math.max(0, zBeg - 2)

      xEnd2 = Math.min(nx, xEnd + 2)
      yEnd2 = Math.min(ny, yEnd + 2)
      zEnd2 = Math.min(nz, zEnd + 2)

      for (z = zBeg2; z < zEnd2; ++z) {
        zOffset = zd * z
        for (y = yBeg2; y < yEnd2; ++y) {
          yOffset = zOffset + yd * y
          for (x = xBeg2; x < xEnd2; ++x) {
            q = 3 * (yOffset + x)
            vertexIndex[ q ] = -1
            vertexIndex[ q + 1 ] = -1
            vertexIndex[ q + 2 ] = -1
          }
        }
      }
    } else {
      xBeg2 = xBeg - 2
      yBeg2 = yBeg - 2
      zBeg2 = zBeg - 2

      xEnd2 = xEnd + 2
      yEnd2 = yEnd + 2
      zEnd2 = zEnd + 2

      for (z = zBeg2; z < zEnd2; ++z) {
        for (y = yBeg2; y < yEnd2; ++y) {
          for (x = xBeg2; x < xEnd2; ++x) {
            q3 = index(x, y, z) * 3
            vertexIndex[ q3 ] = -1
            vertexIndex[ q3 + 1 ] = -1
            vertexIndex[ q3 + 2 ] = -1
          }
        }
      }
    }

    if (!wrap) {
      // clip space where the isovalue is too low

      var __break
      var __xBeg = xBeg; var __yBeg = yBeg; var __zBeg = zBeg
      var __xEnd = xEnd; var __yEnd = yEnd; var __zEnd = zEnd

      __break = false
      for (z = zBeg; z < zEnd; ++z) {
        for (y = yBeg; y < yEnd; ++y) {
          for (x = xBeg; x < xEnd; ++x) {
            q = ((nx * ny) * z) + (nx * y) + x
            if (field[ q ] >= isolevel) {
              __zBeg = z
              __break = true
              break
            }
          }
          if (__break) break
        }
        if (__break) break
      }

      __break = false
      for (y = yBeg; y < yEnd; ++y) {
        for (z = __zBeg; z < zEnd; ++z) {
          for (x = xBeg; x < xEnd; ++x) {
            q = ((nx * ny) * z) + (nx * y) + x
            if (field[ q ] >= isolevel) {
              __yBeg = y
              __break = true
              break
            }
          }
          if (__break) break
        }
        if (__break) break
      }

      __break = false
      for (x = xBeg; x < xEnd; ++x) {
        for (y = __yBeg; y < yEnd; ++y) {
          for (z = __zBeg; z < zEnd; ++z) {
            q = ((nx * ny) * z) + (nx * y) + x
            if (field[ q ] >= isolevel) {
              __xBeg = x
              __break = true
              break
            }
          }
          if (__break) break
        }
        if (__break) break
      }

      __break = false
      for (z = zEnd; z >= zBeg; --z) {
        for (y = yEnd; y >= yBeg; --y) {
          for (x = xEnd; x >= xBeg; --x) {
            q = ((nx * ny) * z) + (nx * y) + x
            if (field[ q ] >= isolevel) {
              __zEnd = z
              __break = true
              break
            }
          }
          if (__break) break
        }
        if (__break) break
      }

      __break = false
      for (y = yEnd; y >= yBeg; --y) {
        for (z = __zEnd; z >= zBeg; --z) {
          for (x = xEnd; x >= xBeg; --x) {
            q = ((nx * ny) * z) + (nx * y) + x
            if (field[ q ] >= isolevel) {
              __yEnd = y
              __break = true
              break
            }
          }
          if (__break) break
        }
        if (__break) break
      }

      __break = false
      for (x = xEnd; x >= xBeg; --x) {
        for (y = __yEnd; y >= yBeg; --y) {
          for (z = __zEnd; z >= zBeg; --z) {
            q = ((nx * ny) * z) + (nx * y) + x
            if (field[ q ] >= isolevel) {
              __xEnd = x
              __break = true
              break
            }
          }
          if (__break) break
        }
        if (__break) break
      }

      //

      if (noNormals) {
        xBeg = Math.max(0, __xBeg - 1)
        yBeg = Math.max(0, __yBeg - 1)
        zBeg = Math.max(0, __zBeg - 1)

        xEnd = Math.min(nx - 1, __xEnd + 1)
        yEnd = Math.min(ny - 1, __yEnd + 1)
        zEnd = Math.min(nz - 1, __zEnd + 1)
      } else {
        xBeg = Math.max(1, __xBeg - 1)
        yBeg = Math.max(1, __yBeg - 1)
        zBeg = Math.max(1, __zBeg - 1)

        xEnd = Math.min(nx - 2, __xEnd + 1)
        yEnd = Math.min(ny - 2, __yEnd + 1)
        zEnd = Math.min(nz - 2, __zEnd + 1)
      }
    }

    // polygonize part of the grid
    var edgeFilter = 15
    for (z = zBeg; z < zEnd; ++z, edgeFilter &= ~4) {
      zOffset = zd * z
      edgeFilter |= 2
      for (y = yBeg; y < yEnd; ++y, edgeFilter &= ~2) {
        yOffset = zOffset + yd * y
        edgeFilter |= 1
        for (x = xBeg; x < xEnd; ++x, edgeFilter &= ~1) {
          q = yOffset + x
          polygonize(x, y, z, q, edgeFilter)
        }
      }
    }
  }
}
Object.assign(MarchingCubes, {__deps: [ getEdgeTable, getTriTable, getAllowedContours, getUintArray ]})

export default MarchingCubes
