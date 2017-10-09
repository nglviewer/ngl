/**
 * @file Dash
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3 } from 'three'

import { defaults } from '../utils'
import { CylinderBufferData } from '../buffer/cylinder-buffer'
import {
  calculateDirectionArray, calculateCenterArray,
  replicateArrayEntries, replicateArray3Entries
} from '../math/array-utils'

interface DashParams {
  segmentCount?: number
}

export function getDashData (data: CylinderBufferData, params: DashParams = {}) {
  console.log(data)
  const segmentCount = defaults(params.segmentCount, 9)

  const s = Math.floor(segmentCount / 2)
  const n = data.position1.length / 3
  const sn = s * n
  const sn3 = sn * 3
  const step = 1 / segmentCount

  const direction = calculateDirectionArray(data.position1, data.position2)
  const position1 = new Float32Array(sn3)
  const position2 = new Float32Array(sn3)

  const v = new Vector3()

  for (let i = 0; i < n; ++i) {
    const i3 = i * 3
    v.set(direction[ i3 ], direction[ i3 + 1 ], direction[ i3 + 2 ])

    const x = data.position1[ i3 ]
    const y = data.position1[ i3 + 1 ]
    const z = data.position1[ i3 + 2 ]

    for (let j = 0; j < s; ++j) {
      const j3 = s * i3 + j * 3

      const f1 = step * (j * 2 + 1)
      const f2 = step * (j * 2 + 2)

      position1[ j3 ] = x + v.x * f1
      position1[ j3 + 1 ] = y + v.y * f1
      position1[ j3 + 2 ] = z + v.z * f1

      position2[ j3 ] = x + v.x * f2
      position2[ j3 + 1 ] = y + v.y * f2
      position2[ j3 + 2 ] = z + v.z * f2
    }
  }

  const position = calculateCenterArray(position1, position2) as Float32Array
  const color = replicateArray3Entries(data.color!, s)  // TODO
  const color2 = data.color2 ? replicateArray3Entries(data.color2, s) : color
  const radius = replicateArrayEntries(data.radius, s)

  const d: CylinderBufferData = { position, position1, position2, color, color2, radius }
  if (data.picking) {
    data.picking.array = replicateArrayEntries(data.picking.array, s)
    d.picking = data.picking
  }
  if (data.primitiveId) {
    d.primitiveId = replicateArrayEntries(data.primitiveId, s)
  }

  return d
}
