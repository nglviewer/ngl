/**
 * @file Dash
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3 } from 'three'

import { CylinderBufferData } from '../buffer/cylinder-buffer'
import { WideLineBufferData } from '../buffer/wideline-buffer'
import {
  calculateDirectionArray, calculateCenterArray,
  replicateArrayEntries, replicateArray3Entries
} from '../math/array-utils'

export function getFixedCountDashData<T extends CylinderBufferData|WideLineBufferData> (data: T, segmentCount: number = 9) {

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
  const color2 = color

  const d: any = { position, position1, position2, color, color2 }

  if ((data as any).radius) {  // TODO
    d.radius = replicateArrayEntries((data as any).radius, s)  // TODO
  }

  if (data.picking && data.picking.array) {
    data.picking.array = replicateArrayEntries(data.picking.array, s)
    d.picking = data.picking
  }
  if (data.primitiveId) {
    d.primitiveId = replicateArrayEntries(data.primitiveId, s)
  }

  return d as T
}

export function getFixedLengthDashData<T extends CylinderBufferData|WideLineBufferData> (data: T, segmentLength: number = 0.1) {

  const direction = calculateDirectionArray(data.position1, data.position2)
  const pos1: number[] = []
  const pos2: number[] = []
  const col: number[] = []
  const rad: number[]|undefined = (data as any).radius ? [] : undefined
  const pick: number[]|undefined = (data as any).picking ? [] : undefined
  const id: number[]|undefined = (data as any).primitiveId ? [] : undefined

  const v = new Vector3()
  const n = data.position1.length / 3

  let k = 0

  for (let i = 0; i < n; ++i) {
    const i3 = i * 3
    v.set(direction[ i3 ], direction[ i3 + 1 ], direction[ i3 + 2 ])

    const vl = v.length()
    const segmentCount = vl / segmentLength
    const s = Math.floor(segmentCount / 2)
    const step = 1 / segmentCount

    const x = data.position1[ i3 ]
    const y = data.position1[ i3 + 1 ]
    const z = data.position1[ i3 + 2 ]

    for (let j = 0; j < s; ++j) {
      const j3 = k * 3 + j * 3

      const f1 = step * (j * 2 + 1)
      const f2 = step * (j * 2 + 2)

      pos1[ j3 ] = x + v.x * f1
      pos1[ j3 + 1 ] = y + v.y * f1
      pos1[ j3 + 2 ] = z + v.z * f1

      pos2[ j3 ] = x + v.x * f2
      pos2[ j3 + 1 ] = y + v.y * f2
      pos2[ j3 + 2 ] = z + v.z * f2

      if (data.color) {
        col[ j3 ] = data.color[ i3 ]
        col[ j3 + 1 ] = data.color[ i3 + 1 ]
        col[ j3 + 2 ] = data.color[ i3 + 2 ]
      }

      if (rad) rad[ k + j ] = (data as any).radius[ i ]
      if (pick) {
        if ((data as any).picking.array) {
          pick[ k + j ] = (data as any).picking.array[ i ]
        } else {
          pick[ k + j ] = i
        }
      }
      if (id) id[ k + j ] = (data as any).primitiveId[ i ]
    }

    k += s
  }

  const position1 = new Float32Array(pos1)
  const position2 = new Float32Array(pos2)
  const position = calculateCenterArray(position1, position2) as Float32Array
  const color = new Float32Array(col)
  const color2 = color

  const d: any = { position, position1, position2, color, color2 }

  if (rad) d.radius = new Float32Array(rad)
  if (pick && data.picking) {
    data.picking.array = new Float32Array(pick)
    d.picking = data.picking
  }
  if (id) d.primitiveId = new Float32Array(id)

  return d as T
}

export function getFixedLengthWrappedDashData<T extends CylinderBufferData|WideLineBufferData> (data: T, segmentLength: number = 0.1) {

  const direction = calculateDirectionArray(data.position1, data.position2)
  const pos1: number[] = []
  const pos2: number[] = []
  const col: number[] = []
  const rad: number[]|undefined = (data as any).radius ? [] : undefined
  const pick: number[]|undefined = (data as any).picking ? [] : undefined
  const id: number[]|undefined = (data as any).primitiveId ? [] : undefined

  const v = new Vector3()
  const n = data.position1.length / 3

  let remaining = segmentLength
  let drawing = true

  let k = 0
  let k3 = 0
  let kprev = 0

  for (let i = 0; i < n; ++i) {
    const i3 = i * 3
    const x = data.position1[ i3 ]
    const y = data.position1[ i3 + 1 ]
    const z = data.position1[ i3 + 2 ]

    v.set(direction[ i3 ], direction[ i3 + 1 ], direction[ i3 + 2 ])
    const vl = v.length()

    if (drawing) {
      pos1[ k3 ] = x
      pos1[ k3 + 1 ] = y
      pos1[ k3 + 2 ] = z
    }

    let dist = remaining
    const inv = 1 / vl
    while (dist < vl) {
      const a = drawing ? pos2 : pos1
      a[ k3 ] = x + v.x * dist * inv
      a[ k3 + 1 ] = y +         v.y * dist * inv
      a[ k3 + 2 ] = z + v.z * dist * inv
      if (drawing) {
        k++
        k3 = k * 3
      }
      drawing = !drawing
      remaining = segmentLength
      dist += segmentLength
    }

    if (drawing) {
      pos2[ k3 ] = data.position2[ i3 ]
      pos2[ k3 + 1 ] = data.position2[ i3 + 1 ]
      pos2[ k3 + 2 ] = data.position2[ i3 + 2 ]
      k++
      k3 = k * 3
    }

    remaining = dist - vl

    for (let j = kprev; j < k ; j++){
      if (data.color) {
        const j3 = j * 3
        col[ j3 ] = data.color[ i3 ]
        col[ j3 + 1 ] = data.color[ i3 + 1 ]
        col[ j3 + 2 ] = data.color[ i3 + 2 ]
      }

      if (rad) rad[ j ] = (data as any).radius[ i ]
      if (pick) {
        if ((data as any).picking.array) {
          pick[ j ] = (data as any).picking.array[ i ]
        } else {
          pick[ j ] = i
        }
      }
      if (id) id[ j ] = (data as any).primitiveId[ i ]
    }

    kprev = k

  }

  if (!drawing && n > 0) {
    const k3 = k * 3
    pos2[ k3 ] = data.position2[ 3 * n - 3 ]
    pos2[ k3 + 1 ] = data.position2[ 3 * n - 2 ]
    pos2[ k3 + 1 ] = data.position2[ 3 * n - 1 ]
  }

  const position1 = new Float32Array(pos1)
  const position2 = new Float32Array(pos2)
  const position = calculateCenterArray(position1, position2) as Float32Array
  const color = new Float32Array(col)
  const color2 = color

  const d: any = { position, position1, position2, color, color2 }

  if (rad) d.radius = new Float32Array(rad)
  if (pick && data.picking) {
    data.picking.array = new Float32Array(pick)
    d.picking = data.picking
  }
  if (id) d.primitiveId = new Float32Array(id)

  return d as T
}
