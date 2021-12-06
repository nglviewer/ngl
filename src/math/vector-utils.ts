/**
 * @file Vector Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3 } from 'three'

import { NumberArray } from '../types'
import { EPS } from './math-constants'

/**
 * Calculate the two intersection points
 * Converted to JavaScript from
 * {@link http://paulbourke.net/geometry/pointlineplane/lineline.c}
 */
export function lineLineIntersect (p1: Vector3, p2: Vector3, p3: Vector3, p4: Vector3) {
  const p13 = new Vector3()
  const p43 = new Vector3()
  const p21 = new Vector3()
  let d1343, d4321, d1321, d4343, d2121
  let denom, numer

  p13.x = p1.x - p3.x
  p13.y = p1.y - p3.y
  p13.z = p1.z - p3.z
  p43.x = p4.x - p3.x
  p43.y = p4.y - p3.y
  p43.z = p4.z - p3.z
  if (Math.abs(p43.x) < EPS && Math.abs(p43.y) < EPS && Math.abs(p43.z) < EPS) { return null }

  p21.x = p2.x - p1.x
  p21.y = p2.y - p1.y
  p21.z = p2.z - p1.z
  if (Math.abs(p21.x) < EPS && Math.abs(p21.y) < EPS && Math.abs(p21.z) < EPS) { return null }

  d1343 = p13.x * p43.x + p13.y * p43.y + p13.z * p43.z
  d4321 = p43.x * p21.x + p43.y * p21.y + p43.z * p21.z
  d1321 = p13.x * p21.x + p13.y * p21.y + p13.z * p21.z
  d4343 = p43.x * p43.x + p43.y * p43.y + p43.z * p43.z
  d2121 = p21.x * p21.x + p21.y * p21.y + p21.z * p21.z

  denom = d2121 * d4343 - d4321 * d4321
  if (Math.abs(denom) < EPS) { return null }
  numer = d1343 * d4321 - d1321 * d4343

  const mua = numer / denom
  const mub = (d1343 + d4321 * mua) / d4343

  const pa = new Vector3(
    p1.x + mua * p21.x,
    p1.y + mua * p21.y,
    p1.z + mua * p21.z
  )
  const pb = new Vector3(
    p3.x + mub * p43.x,
    p3.y + mub * p43.y,
    p3.z + mub * p43.z
  )

  return [ pa, pb ]
}

export function calculateMeanVector3 (array: NumberArray) {
  const n = array.length
  const m = n / 3

  let x = 0
  let y = 0
  let z = 0

  for (let i = 0; i < n; i += 3) {
    x += array[ i + 0 ]
    y += array[ i + 1 ]
    z += array[ i + 2 ]
  }

  return new Vector3(x / m, y / m, z / m)
}

export function isPointOnSegment (p: Vector3, l1: Vector3, l2: Vector3) {
  const len = l1.distanceTo(l2)

  return p.distanceTo(l1) <= len && p.distanceTo(l2) <= len
}

export function projectPointOnVector (point: Vector3, vector: Vector3, origin?: Vector3) {
  if (origin) {
    point.sub(origin).projectOnVector(vector).add(origin)
  } else {
    point.projectOnVector(vector)
  }

  return point
}

export function computeBoundingBox (array: NumberArray) {
  let minX = +Infinity
  let minY = +Infinity
  let minZ = +Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let maxZ = -Infinity
  for (let i = 0, l = array.length; i < l; i += 3) {
    const x = array[ i ]
    const y = array[ i + 1 ]
    const z = array[ i + 2 ]
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (z < minZ) minZ = z
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
    if (z > maxZ) maxZ = z
  }
  return [
    v3new([ minX, minY, minZ ]),
    v3new([ maxX, maxY, maxZ ])
  ]
}
(computeBoundingBox as any).__deps = [ v3new ]

export function applyMatrix4toVector3array (m: Float32Array, a: Float32Array) {
  for (let i = 0, il = a.length; i < il; i += 3) {
    const x = a[ i ]
    const y = a[ i + 1 ]
    const z = a[ i + 2 ]
    a[ i ] = m[ 0 ] * x + m[ 4 ] * y + m[ 8 ] * z + m[ 12 ]
    a[ i + 1 ] = m[ 1 ] * x + m[ 5 ] * y + m[ 9 ] * z + m[ 13 ]
    a[ i + 2 ] = m[ 2 ] * x + m[ 6 ] * y + m[ 10 ] * z + m[ 14 ]
  }
}

export function applyMatrix3toVector3array (m: Float32Array, a: Float32Array) {
  for (let i = 0, il = a.length; i < il; i += 3) {
    const x = a[ i ]
    const y = a[ i + 1 ]
    const z = a[ i + 2 ]
    a[ i ] = m[ 0 ] * x + m[ 3 ] * y + m[ 6 ] * z
    a[ i + 1 ] = m[ 1 ] * x + m[ 4 ] * y + m[ 7 ] * z
    a[ i + 2 ] = m[ 2 ] * x + m[ 5 ] * y + m[ 8 ] * z
  }
}

export function normalizeVector3array (a: Float32Array) {
  for (let i = 0, il = a.length; i < il; i += 3) {
    const x = a[ i ]
    const y = a[ i + 1 ]
    const z = a[ i + 2 ]
    const len2 = x * x + y * y + z * z
    if (len2 > 0) {             // avoid divide by zero
      const s = 1 / Math.sqrt(len2)
      a[ i ] = x * s
      a[ i + 1 ] = y * s
      a[ i + 2 ] = z * s
    }
    // else leave as all zeros
  }
}

export function v3new (array?: NumberArray) {
  return new Float32Array(array as any || 3)  // TODO
}

export function v3cross (out: Float32Array, a: Float32Array, b: Float32Array) {
  const ax = a[0]
  const ay = a[1]
  const az = a[2]
  const bx = b[0]
  const by = b[1]
  const bz = b[2]
  out[0] = ay * bz - az * by
  out[1] = az * bx - ax * bz
  out[2] = ax * by - ay * bx
}

export function v3dot (a: Float32Array, b: Float32Array) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

export function v3sub (out: Float32Array, a: Float32Array, b: Float32Array) {
  out[0] = a[0] - b[0]
  out[1] = a[1] - b[1]
  out[2] = a[2] - b[2]
}

export function v3add (out: Float32Array, a: Float32Array, b: Float32Array) {
  out[0] = a[0] + b[0]
  out[1] = a[1] + b[1]
  out[2] = a[2] + b[2]
}

export function v3fromArray (out: Float32Array, array: Float32Array, offset = 0) {
  out[0] = array[offset]
  out[1] = array[offset + 1]
  out[2] = array[offset + 2]
}

export function v3toArray (input: Float32Array, array: Float32Array, offset = 0) {
  array[offset] = input[0]
  array[offset + 1] = input[1]
  array[offset + 2] = input[2]
}

export function v3forEach (array: Float32Array, fn: (i: Float32Array, j: Float32Array, k: Float32Array) => void, b: Float32Array) {
  const a = v3new()
  for (let i = 0, n = array.length; i < n; i += 3) {
    v3fromArray(a, array, i)
    fn(a, a, b)
    v3toArray(a, array, i)
  }
}
(v3forEach as any).__deps = [ v3new, v3fromArray, v3toArray ]

export function v3length2 (a: Float32Array) {
  return a[0] * a[0] + a[1] * a[1] + a[2] * a[2]
}

export function v3length (a: Float32Array) {
  return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2])
}

export function v3divide (out: Float32Array, a: Float32Array, b: Float32Array) {
  out[0] = a[0] / b[0]
  out[1] = a[1] / b[1]
  out[2] = a[2] / b[2]
}

export function v3multiply (out: Float32Array, a: Float32Array, b: Float32Array) {
  out[0] = a[0] * b[0]
  out[1] = a[1] * b[1]
  out[2] = a[2] * b[2]
}

export function v3divideScalar (out: Float32Array, a: Float32Array, s: number) {
  v3multiplyScalar(out, a, 1 / s)
}
(v3divideScalar as any).__deps = [ v3multiplyScalar ]

export function v3multiplyScalar (out: Float32Array, a: Float32Array, s: number) {
  out[0] = a[0] * s
  out[1] = a[1] * s
  out[2] = a[2] * s
}

export function v3normalize (out: Float32Array, a: Float32Array) {
  const length2 = v3length2(a)
  if (length2 == 0) {
    out[0] = a[0]
    out[1] = a[1]
    out[2] = a[2]
  } else {
    v3multiplyScalar(out, a, 1 / Math.sqrt(length2))
  }
}
(v3normalize as any).__deps = [ v3multiplyScalar, v3length2 ]

export function v3subScalar (out: Float32Array, a: Float32Array, s: number) {
  out[0] = a[0] - s
  out[1] = a[1] - s
  out[2] = a[2] - s
}

export function v3addScalar (out: Float32Array, a: Float32Array, s: number) {
  out[0] = a[0] + s
  out[1] = a[1] + s
  out[2] = a[2] + s
}

export function v3floor (out: Float32Array, a: Float32Array) {
  out[0] = Math.floor(a[0])
  out[1] = Math.floor(a[1])
  out[2] = Math.floor(a[2])
}

export function v3ceil (out: Float32Array, a: Float32Array) {
  out[0] = Math.ceil(a[0])
  out[1] = Math.ceil(a[1])
  out[2] = Math.ceil(a[2])
}

export function v3round (out: Float32Array, a: Float32Array) {
  out[0] = Math.round(a[0])
  out[1] = Math.round(a[1])
  out[2] = Math.round(a[2])
}

export function v3negate (out: Float32Array, a: Float32Array) {
  out[0] = -a[0]
  out[1] = -a[1]
  out[2] = -a[2]
}

export function v3angle (a: Float32Array, b: Float32Array) {
  const ax = a[0]
  const ay = a[1]
  const az = a[2]
  const bx = b[0]
  const by = b[1]
  const bz = b[2]
  const cx = ay * bz - az * by
  const cy = az * bx - ax * bz
  const cz = ax * by - ay * bx
  const s = Math.sqrt(cx * cx + cy * cy + cz * cz)
  const c = ax * bx + ay * by + az * bz
  return Math.atan2(s, c)
}
