/**
 * @file Matrix Utils
 * @private
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * svd methods from Eugene Zatepyakin / http://inspirit.github.io/jsfeat/
 */

import { NumberArray } from '../types'
import { v3new, v3cross } from './vector-utils'

export class Matrix {
  size: number
  data: Float32Array

  constructor (readonly cols: number, readonly rows: number) {
    this.size = this.cols * this.rows
    this.data = new Float32Array(this.size)
  }

  copyTo (matrix: Matrix) {
    matrix.data.set(this.data)
  }
}

export function transpose (At: Matrix, A: Matrix) {
  let i = 0
  let j = 0
  const nrows = A.rows
  const ncols = A.cols
  let Ai = 0
  let Ati = 0
  let pAt = 0
  const ad = A.data
  const atd = At.data

  for (; i < nrows; Ati += 1, Ai += ncols, i++) {
    pAt = Ati
    for (j = 0; j < ncols; pAt += nrows, j++) atd[pAt] = ad[Ai + j]
  }
}

// C = A * B
export function multiply (C: Matrix, A: Matrix, B: Matrix) {
  let i = 0
  let j = 0
  let k = 0
  let Ap = 0
  let pA = 0
  let pB = 0
  let _pB = 0
  let Cp = 0
  const ncols = A.cols
  const nrows = A.rows
  const mcols = B.cols
  const ad = A.data
  const bd = B.data
  const cd = C.data
  let sum = 0.0

  for (; i < nrows; Ap += ncols, i++) {
    for (_pB = 0, j = 0; j < mcols; Cp++, _pB++, j++) {
      pB = _pB
      pA = Ap
      sum = 0.0
      for (k = 0; k < ncols; pA++, pB += mcols, k++) {
        sum += ad[pA] * bd[pB]
      }
      cd[Cp] = sum
    }
  }
}

// C = A * B'
export function multiplyABt (C: Matrix, A: Matrix, B: Matrix) {
  let i = 0
  let j = 0
  let k = 0
  let Ap = 0
  let pA = 0
  let pB = 0
  let Cp = 0
  const ncols = A.cols
  const nrows = A.rows
  const mrows = B.rows
  const ad = A.data
  const bd = B.data
  const cd = C.data
  let sum = 0.0

  for (; i < nrows; Ap += ncols, i++) {
    for (pB = 0, j = 0; j < mrows; Cp++, j++) {
      pA = Ap
      sum = 0.0
      for (k = 0; k < ncols; pA++, pB++, k++) {
        sum += ad[pA] * bd[pB]
      }
      cd[Cp] = sum
    }
  }
}

// C = A' * B
export function multiplyAtB (C: Matrix, A: Matrix, B: Matrix) {
  let i = 0
  let j = 0
  let k = 0
  let Ap = 0
  let pA = 0
  let pB = 0
  let _pB = 0
  let Cp = 0
  const ncols = A.cols
  const nrows = A.rows
  const mcols = B.cols
  const ad = A.data
  const bd = B.data
  const cd = C.data
  let sum = 0.0

  for (; i < ncols; Ap++, i++) {
    for (_pB = 0, j = 0; j < mcols; Cp++, _pB++, j++) {
      pB = _pB
      pA = Ap
      sum = 0.0
      for (k = 0; k < nrows; pA += ncols, pB += mcols, k++) {
        sum += ad[pA] * bd[pB]
      }
      cd[Cp] = sum
    }
  }
}

export function invert3x3 (from: Matrix, to: Matrix) {
  const A = from.data
  const invA = to.data
  const t1 = A[4]
  const t2 = A[8]
  const t4 = A[5]
  const t5 = A[7]
  const t8 = A[0]

  const t9 = t8 * t1
  const t11 = t8 * t4
  const t13 = A[3]
  const t14 = A[1]
  const t15 = t13 * t14
  const t17 = A[2]
  const t18 = t13 * t17
  const t20 = A[6]
  const t21 = t20 * t14
  const t23 = t20 * t17
  const t26 = 1.0 / (t9 * t2 - t11 * t5 - t15 * t2 + t18 * t5 + t21 * t4 - t23 * t1)
  invA[0] = (t1 * t2 - t4 * t5) * t26
  invA[1] = -(t14 * t2 - t17 * t5) * t26
  invA[2] = -(-t14 * t4 + t17 * t1) * t26
  invA[3] = -(t13 * t2 - t4 * t20) * t26
  invA[4] = (t8 * t2 - t23) * t26
  invA[5] = -(t11 - t18) * t26
  invA[6] = -(-t13 * t5 + t1 * t20) * t26
  invA[7] = -(t8 * t5 - t21) * t26
  invA[8] = (t9 - t15) * t26
}

export function mat3x3determinant (M: Matrix) {
  const md = M.data
  return md[0] * md[4] * md[8] -
    md[0] * md[5] * md[7] -
    md[3] * md[1] * md[8] +
    md[3] * md[2] * md[7] +
    md[6] * md[1] * md[5] -
    md[6] * md[2] * md[4]
}

// C = A * B
export function multiply3x3 (C: Matrix, A: Matrix, B: Matrix) {
  const Cd = C.data
  const Ad = A.data
  const Bd = B.data
  const m10 = Ad[0]
  const m11 = Ad[1]
  const m12 = Ad[2]
  const m13 = Ad[3]
  const m14 = Ad[4]
  const m15 = Ad[5]
  const m16 = Ad[6]
  const m17 = Ad[7]
  const m18 = Ad[8]

  const m20 = Bd[0]
  const m21 = Bd[1]
  const m22 = Bd[2]
  const m23 = Bd[3]
  const m24 = Bd[4]
  const m25 = Bd[5]
  const m26 = Bd[6]
  const m27 = Bd[7]
  const m28 = Bd[8]

  Cd[0] = m10 * m20 + m11 * m23 + m12 * m26
  Cd[1] = m10 * m21 + m11 * m24 + m12 * m27
  Cd[2] = m10 * m22 + m11 * m25 + m12 * m28
  Cd[3] = m13 * m20 + m14 * m23 + m15 * m26
  Cd[4] = m13 * m21 + m14 * m24 + m15 * m27
  Cd[5] = m13 * m22 + m14 * m25 + m15 * m28
  Cd[6] = m16 * m20 + m17 * m23 + m18 * m26
  Cd[7] = m16 * m21 + m17 * m24 + m18 * m27
  Cd[8] = m16 * m22 + m17 * m25 + m18 * m28
}

export function meanRows (A: Matrix) {
  const nrows = A.rows
  const ncols = A.cols
  const Ad = A.data
  const mean = new Array(ncols)

  for (let j = 0; j < ncols; ++j) {
    mean[ j ] = 0.0
  }

  for (let i = 0, p = 0; i < nrows; ++i) {
    for (let j = 0; j < ncols; ++j, ++p) {
      mean[ j ] += Ad[ p ]
    }
  }

  for (let j = 0; j < ncols; ++j) {
    mean[ j ] /= nrows
  }

  return mean
}

export function meanCols (A: Matrix) {
  const nrows = A.rows
  const ncols = A.cols
  const Ad = A.data
  const mean = new Array(nrows)

  for (let j = 0; j < nrows; ++j) {
    mean[ j ] = 0.0
  }

  for (let i = 0, p = 0; i < ncols; ++i) {
    for (let j = 0; j < nrows; ++j, ++p) {
      mean[ j ] += Ad[ p ]
    }
  }

  for (let j = 0; j < nrows; ++j) {
    mean[ j ] /= ncols
  }

  return mean
}

export function subRows (A: Matrix, row: number[]) {
  const nrows = A.rows
  const ncols = A.cols
  const Ad = A.data

  for (let i = 0, p = 0; i < nrows; ++i) {
    for (let j = 0; j < ncols; ++j, ++p) {
      Ad[ p ] -= row[ j ]
    }
  }
}

export function subCols (A: Matrix, col: number[]) {
  const nrows = A.rows
  const ncols = A.cols
  const Ad = A.data

  for (let i = 0, p = 0; i < ncols; ++i) {
    for (let j = 0; j < nrows; ++j, ++p) {
      Ad[ p ] -= col[ j ]
    }
  }
}

export function addRows (A: Matrix, row: number[]) {
  const nrows = A.rows
  const ncols = A.cols
  const Ad = A.data

  for (let i = 0, p = 0; i < nrows; ++i) {
    for (let j = 0; j < ncols; ++j, ++p) {
      Ad[ p ] += row[ j ]
    }
  }
}

export function addCols (A: Matrix, col: number[]) {
  const nrows = A.rows
  const ncols = A.cols
  const Ad = A.data

  for (let i = 0, p = 0; i < ncols; ++i) {
    for (let j = 0; j < nrows; ++j, ++p) {
      Ad[ p ] += col[ j ]
    }
  }
}

export function swap (A: NumberArray, i0: number, i1: number, t: number) {
  t = A[i0]
  A[i0] = A[i1]
  A[i1] = t
}

export function hypot (a: number, b: number) {
  a = Math.abs(a)
  b = Math.abs(b)
  if (a > b) {
    b /= a
    return a * Math.sqrt(1.0 + b * b)
  }
  if (b > 0) {
    a /= b
    return b * Math.sqrt(1.0 + a * a)
  }
  return 0.0
}

const EPSILON = 0.0000001192092896
const FLT_MIN = 1E-37

export function JacobiSVDImpl (At: NumberArray, astep: number, _W: NumberArray, Vt: NumberArray, vstep: number, m: number, n: number, n1: number) {
  const eps = EPSILON * 2.0
  const minval = FLT_MIN
  let i = 0
  let j = 0
  let k = 0
  let iter = 0
  const maxIter = Math.max(m, 30)
  let Ai = 0
  let Aj = 0
  let Vi = 0
  let Vj = 0
  let changed = 0
  let c = 0.0
  let s = 0.0
  let t = 0.0
  let t0 = 0.0
  let t1 = 0.0
  let sd = 0.0
  let beta = 0.0
  let gamma = 0.0
  let delta = 0.0
  let a = 0.0
  let p = 0.0
  let b = 0.0
  let seed = 0x1234
  let val = 0.0
  let val0 = 0.0
  let asum = 0.0

  const W = new Float64Array(n << 3)

  for (; i < n; i++) {
    for (k = 0, sd = 0; k < m; k++) {
      t = At[i * astep + k]
      sd += t * t
    }
    W[i] = sd

    if (Vt) {
      for (k = 0; k < n; k++) {
        Vt[i * vstep + k] = 0
      }
      Vt[i * vstep + i] = 1
    }
  }

  for (; iter < maxIter; iter++) {
    changed = 0

    for (i = 0; i < n - 1; i++) {
      for (j = i + 1; j < n; j++) {
        Ai = (i * astep) | 0
        Aj = (j * astep) | 0
        a = W[i]
        p = 0
        b = W[j]

        k = 2
        p += At[Ai] * At[Aj]
        p += At[Ai + 1] * At[Aj + 1]

        for (; k < m; k++) { p += At[Ai + k] * At[Aj + k] }

        if (Math.abs(p) <= eps * Math.sqrt(a * b)) continue

        p *= 2.0
        beta = a - b
        gamma = hypot(p, beta)
        if (beta < 0) {
          delta = (gamma - beta) * 0.5
          s = Math.sqrt(delta / gamma)
          c = (p / (gamma * s * 2.0))
        } else {
          c = Math.sqrt((gamma + beta) / (gamma * 2.0))
          s = (p / (gamma * c * 2.0))
        }

        a = 0.0
        b = 0.0

        k = 2 // unroll
        t0 = c * At[Ai] + s * At[Aj]
        t1 = -s * At[Ai] + c * At[Aj]
        At[Ai] = t0; At[Aj] = t1
        a += t0 * t0; b += t1 * t1

        t0 = c * At[Ai + 1] + s * At[Aj + 1]
        t1 = -s * At[Ai + 1] + c * At[Aj + 1]
        At[Ai + 1] = t0; At[Aj + 1] = t1
        a += t0 * t0; b += t1 * t1

        for (; k < m; k++) {
          t0 = c * At[Ai + k] + s * At[Aj + k]
          t1 = -s * At[Ai + k] + c * At[Aj + k]
          At[Ai + k] = t0; At[Aj + k] = t1

          a += t0 * t0; b += t1 * t1
        }

        W[i] = a
        W[j] = b

        changed = 1

        if (Vt) {
          Vi = (i * vstep) | 0
          Vj = (j * vstep) | 0

          k = 2
          t0 = c * Vt[Vi] + s * Vt[Vj]
          t1 = -s * Vt[Vi] + c * Vt[Vj]
          Vt[Vi] = t0; Vt[Vj] = t1

          t0 = c * Vt[Vi + 1] + s * Vt[Vj + 1]
          t1 = -s * Vt[Vi + 1] + c * Vt[Vj + 1]
          Vt[Vi + 1] = t0; Vt[Vj + 1] = t1

          for (; k < n; k++) {
            t0 = c * Vt[Vi + k] + s * Vt[Vj + k]
            t1 = -s * Vt[Vi + k] + c * Vt[Vj + k]
            Vt[Vi + k] = t0; Vt[Vj + k] = t1
          }
        }
      }
    }
    if (changed === 0) break
  }

  for (i = 0; i < n; i++) {
    for (k = 0, sd = 0; k < m; k++) {
      t = At[i * astep + k]
      sd += t * t
    }
    W[i] = Math.sqrt(sd)
  }

  for (i = 0; i < n - 1; i++) {
    j = i
    for (k = i + 1; k < n; k++) {
      if (W[j] < W[k]) { j = k }
    }
    if (i !== j) {
      swap(W, i, j, sd)
      if (Vt) {
        for (k = 0; k < m; k++) {
          swap(At, i * astep + k, j * astep + k, t)
        }

        for (k = 0; k < n; k++) {
          swap(Vt, i * vstep + k, j * vstep + k, t)
        }
      }
    }
  }

  for (i = 0; i < n; i++) {
    _W[i] = W[i]
  }

  if (!Vt) {
    return
  }

  for (i = 0; i < n1; i++) {
    sd = i < n ? W[i] : 0

    while (sd <= minval) {
      // if we got a zero singular value, then in order to get the corresponding left singular vector
      // we generate a random vector, project it to the previously computed left singular vectors,
      // subtract the projection and normalize the difference.
      val0 = (1.0 / m)
      for (k = 0; k < m; k++) {
        seed = (seed * 214013 + 2531011)
        val = (((seed >> 16) & 0x7fff) & 256) !== 0 ? val0 : -val0
        At[i * astep + k] = val
      }
      for (iter = 0; iter < 2; iter++) {
        for (j = 0; j < i; j++) {
          sd = 0
          for (k = 0; k < m; k++) {
            sd += At[i * astep + k] * At[j * astep + k]
          }
          asum = 0.0
          for (k = 0; k < m; k++) {
            t = (At[i * astep + k] - sd * At[j * astep + k])
            At[i * astep + k] = t
            asum += Math.abs(t)
          }
          asum = asum ? 1.0 / asum : 0
          for (k = 0; k < m; k++) {
            At[i * astep + k] *= asum
          }
        }
      }
      sd = 0
      for (k = 0; k < m; k++) {
        t = At[i * astep + k]
        sd += t * t
      }
      sd = Math.sqrt(sd)
    }

    s = (1.0 / sd)
    for (k = 0; k < m; k++) {
      At[i * astep + k] *= s
    }
  }
}

export function svd (A: Matrix, W: Matrix, U: Matrix, V: Matrix) {
  let at = 0
  let i = 0
  const _m = A.rows
  const _n = A.cols
  let m = _m
  let n = _n

  if (m < n) {
    at = 1
    i = m
    m = n
    n = i
  }

  const amt = new Matrix(m, m)
  const wmt = new Matrix(1, n)
  const vmt = new Matrix(n, n)

  if (at === 0) {
    transpose(amt, A)
  } else {
    for (i = 0; i < _n * _m; i++) {
      amt.data[i] = A.data[i]
    }
    for (; i < n * m; i++) {
      amt.data[i] = 0
    }
  }

  JacobiSVDImpl(amt.data, m, wmt.data, vmt.data, n, m, n, m)

  if (W) {
    for (i = 0; i < n; i++) {
      W.data[i] = wmt.data[i]
    }
    for (; i < _n; i++) {
      W.data[i] = 0
    }
  }

  if (at === 0) {
    if (U) transpose(U, amt)
    if (V) transpose(V, vmt)
  } else {
    if (U) transpose(U, vmt)
    if (V) transpose(V, amt)
  }
}

//

export function m4new () {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ])
}

export function m4set (out: Float32Array, n11: number, n12: number, n13: number, n14: number, n21: number, n22: number, n23: number, n24: number, n31: number, n32: number, n33: number, n34: number, n41: number, n42: number, n43: number, n44: number) {
  out[ 0 ] = n11; out[ 4 ] = n12; out[ 8 ] = n13; out[ 12 ] = n14
  out[ 1 ] = n21; out[ 5 ] = n22; out[ 9 ] = n23; out[ 13 ] = n24
  out[ 2 ] = n31; out[ 6 ] = n32; out[ 10 ] = n33; out[ 14 ] = n34
  out[ 3 ] = n41; out[ 7 ] = n42; out[ 11 ] = n43; out[ 15 ] = n44
}

export function m4identity (out: Float32Array) {
  m4set(out,
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  )
}
(m4identity as any).__deps = [ m4set ]

export function m4multiply (out: Float32Array, a: Float32Array, b: Float32Array) {
  const a11 = a[ 0 ]
  const a12 = a[ 4 ]
  const a13 = a[ 8 ]
  const a14 = a[ 12 ]
  const a21 = a[ 1 ]
  const a22 = a[ 5 ]
  const a23 = a[ 9 ]
  const a24 = a[ 13 ]
  const a31 = a[ 2 ]
  const a32 = a[ 6 ]
  const a33 = a[ 10 ]
  const a34 = a[ 14 ]
  const a41 = a[ 3 ]
  const a42 = a[ 7 ]
  const a43 = a[ 11 ]
  const a44 = a[ 15 ]

  const b11 = b[ 0 ]
  const b12 = b[ 4 ]
  const b13 = b[ 8 ]
  const b14 = b[ 12 ]
  const b21 = b[ 1 ]
  const b22 = b[ 5 ]
  const b23 = b[ 9 ]
  const b24 = b[ 13 ]
  const b31 = b[ 2 ]
  const b32 = b[ 6 ]
  const b33 = b[ 10 ]
  const b34 = b[ 14 ]
  const b41 = b[ 3 ]
  const b42 = b[ 7 ]
  const b43 = b[ 11 ]
  const b44 = b[ 15 ]

  out[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41
  out[ 4 ] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42
  out[ 8 ] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43
  out[ 12 ] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44

  out[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41
  out[ 5 ] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42
  out[ 9 ] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43
  out[ 13 ] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44

  out[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41
  out[ 6 ] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42
  out[ 10 ] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43
  out[ 14 ] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44

  out[ 3 ] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41
  out[ 7 ] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42
  out[ 11 ] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43
  out[ 15 ] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44
}

export function m4makeScale (out: Float32Array, x: number, y: number, z: number) {
  m4set(out,
    x, 0, 0, 0,
    0, y, 0, 0,
    0, 0, z, 0,
    0, 0, 0, 1
  )
}
(m4makeScale as any).__deps = [ m4set ]

export function m4makeTranslation (out: Float32Array, x: number, y: number, z: number) {
  m4set(out,
    1, 0, 0, x,
    0, 1, 0, y,
    0, 0, 1, z,
    0, 0, 0, 1
  )
}
(m4makeTranslation as any).__deps = [ m4set ]

export function m4makeRotationY (out: Float32Array, theta: number) {
  const c = Math.cos(theta)
  const s = Math.sin(theta)
  m4set(out,
    c, 0, s, 0,
    0, 1, 0, 0,
    -s, 0, c, 0,
    0, 0, 0, 1
  )
}
(m4makeRotationY as any).__deps = [ m4set ]

//

export function m3new () {
  return new Float32Array([
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ])
}

export function m3makeNormal (out: Float32Array, m4: Float32Array) {
  const r0 = v3new([ m4[0], m4[1], m4[2] ])
  const r1 = v3new([ m4[4], m4[5], m4[6] ])
  const r2 = v3new([ m4[8], m4[9], m4[10] ])
  const cp = v3new()
  //        [ r0 ]       [ r1 x r2 ]
  // M3x3 = [ r1 ]   N = [ r2 x r0 ]
  //        [ r2 ]       [ r0 x r1 ]
  v3cross(cp, r1, r2)
  out[ 0 ] = cp[ 0 ]
  out[ 1 ] = cp[ 1 ]
  out[ 2 ] = cp[ 2 ]
  v3cross(cp, r2, r0)
  out[ 3 ] = cp[ 0 ]
  out[ 4 ] = cp[ 1 ]
  out[ 5 ] = cp[ 2 ]
  v3cross(cp, r0, r1)
  out[ 6 ] = cp[ 0 ]
  out[ 7 ] = cp[ 1 ]
  out[ 8 ] = cp[ 2 ]
}
(m3makeNormal as any).__deps = [ v3new, v3cross ]
