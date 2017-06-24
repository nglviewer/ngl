/**
 * @file Matrix Utils
 * @private
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * svd methods from Eugene Zatepyakin / http://inspirit.github.io/jsfeat/
 */

import { v3new, v3cross } from './vector-utils.js'

function Matrix (columns, rows) {
  this.cols = columns
  this.rows = rows
  this.size = this.cols * this.rows

  this.data = new Float32Array(this.size)
}

Matrix.prototype = {

  copyTo: function (matrix) {
    matrix.data.set(this.data)
  }

}

function transpose (At, A) {
  var i = 0
  var j = 0
  var nrows = A.rows
  var ncols = A.cols
  var Ai = 0
  var Ati = 0
  var pAt = 0
  var ad = A.data
  var atd = At.data

  for (; i < nrows; Ati += 1, Ai += ncols, i++) {
    pAt = Ati
    for (j = 0; j < ncols; pAt += nrows, j++) atd[pAt] = ad[Ai + j]
  }
}

// C = A * B
function multiply (C, A, B) {
  var i = 0
  var j = 0
  var k = 0
  var Ap = 0
  var pA = 0
  var pB = 0
  var _pB = 0
  var Cp = 0
  var ncols = A.cols
  var nrows = A.rows
  var mcols = B.cols
  var ad = A.data
  var bd = B.data
  var cd = C.data
  var sum = 0.0

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
function multiplyABt (C, A, B) {
  var i = 0
  var j = 0
  var k = 0
  var Ap = 0
  var pA = 0
  var pB = 0
  var Cp = 0
  var ncols = A.cols
  var nrows = A.rows
  var mrows = B.rows
  var ad = A.data
  var bd = B.data
  var cd = C.data
  var sum = 0.0

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
function multiplyAtB (C, A, B) {
  var i = 0
  var j = 0
  var k = 0
  var Ap = 0
  var pA = 0
  var pB = 0
  var _pB = 0
  var Cp = 0
  var ncols = A.cols
  var nrows = A.rows
  var mcols = B.cols
  var ad = A.data
  var bd = B.data
  var cd = C.data
  var sum = 0.0

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

function invert3x3 (from, to) {
  var A = from.data
  var invA = to.data
  var t1 = A[4]
  var t2 = A[8]
  var t4 = A[5]
  var t5 = A[7]
  var t8 = A[0]

  var t9 = t8 * t1
  var t11 = t8 * t4
  var t13 = A[3]
  var t14 = A[1]
  var t15 = t13 * t14
  var t17 = A[2]
  var t18 = t13 * t17
  var t20 = A[6]
  var t21 = t20 * t14
  var t23 = t20 * t17
  var t26 = 1.0 / (t9 * t2 - t11 * t5 - t15 * t2 + t18 * t5 + t21 * t4 - t23 * t1)
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

function mat3x3determinant (M) {
  var md = M.data
  return md[0] * md[4] * md[8] -
    md[0] * md[5] * md[7] -
    md[3] * md[1] * md[8] +
    md[3] * md[2] * md[7] +
    md[6] * md[1] * md[5] -
    md[6] * md[2] * md[4]
}

// C = A * B
function multiply3x3 (C, A, B) {
  var Cd = C.data
  var Ad = A.data
  var Bd = B.data
  var m10 = Ad[0]
  var m11 = Ad[1]
  var m12 = Ad[2]
  var m13 = Ad[3]
  var m14 = Ad[4]
  var m15 = Ad[5]
  var m16 = Ad[6]
  var m17 = Ad[7]
  var m18 = Ad[8]

  var m20 = Bd[0]
  var m21 = Bd[1]
  var m22 = Bd[2]
  var m23 = Bd[3]
  var m24 = Bd[4]
  var m25 = Bd[5]
  var m26 = Bd[6]
  var m27 = Bd[7]
  var m28 = Bd[8]

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

function meanRows (A) {
  var i, j
  var p = 0
  var nrows = A.rows
  var ncols = A.cols
  var Ad = A.data
  var mean = new Array(ncols)

  for (j = 0; j < ncols; ++j) {
    mean[ j ] = 0.0
  }

  for (i = 0; i < nrows; ++i) {
    for (j = 0; j < ncols; ++j, ++p) {
      mean[ j ] += Ad[ p ]
    }
  }

  for (j = 0; j < ncols; ++j) {
    mean[ j ] /= nrows
  }

  return mean
}

function meanCols (A) {
  var i, j
  var p = 0
  var nrows = A.rows
  var ncols = A.cols
  var Ad = A.data
  var mean = new Array(nrows)

  for (j = 0; j < nrows; ++j) {
    mean[ j ] = 0.0
  }

  for (i = 0; i < ncols; ++i) {
    for (j = 0; j < nrows; ++j, ++p) {
      mean[ j ] += Ad[ p ]
    }
  }

  for (j = 0; j < nrows; ++j) {
    mean[ j ] /= ncols
  }

  return mean
}

function subRows (A, row) {
  var i, j
  var p = 0
  var nrows = A.rows
  var ncols = A.cols
  var Ad = A.data

  for (i = 0; i < nrows; ++i) {
    for (j = 0; j < ncols; ++j, ++p) {
      Ad[ p ] -= row[ j ]
    }
  }
}

function subCols (A, col) {
  var i, j
  var p = 0
  var nrows = A.rows
  var ncols = A.cols
  var Ad = A.data

  for (i = 0; i < ncols; ++i) {
    for (j = 0; j < nrows; ++j, ++p) {
      Ad[ p ] -= col[ j ]
    }
  }
}

function addRows (A, row) {
  var i, j
  var p = 0
  var nrows = A.rows
  var ncols = A.cols
  var Ad = A.data

  for (i = 0; i < nrows; ++i) {
    for (j = 0; j < ncols; ++j, ++p) {
      Ad[ p ] += row[ j ]
    }
  }
}

function addCols (A, col) {
  var i, j
  var p = 0
  var nrows = A.rows
  var ncols = A.cols
  var Ad = A.data

  for (i = 0; i < ncols; ++i) {
    for (j = 0; j < nrows; ++j, ++p) {
      Ad[ p ] += col[ j ]
    }
  }
}

function swap (A, i0, i1, t) {
  t = A[i0]
  A[i0] = A[i1]
  A[i1] = t
}

function hypot (a, b) {
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

var EPSILON = 0.0000001192092896
var FLT_MIN = 1E-37

function JacobiSVDImpl (At, astep, _W, Vt, vstep, m, n, n1) {
  var eps = EPSILON * 2.0
  var minval = FLT_MIN
  var i = 0
  var j = 0
  var k = 0
  var iter = 0
  var maxIter = Math.max(m, 30)
  var Ai = 0
  var Aj = 0
  var Vi = 0
  var Vj = 0
  var changed = 0
  var c = 0.0
  var s = 0.0
  var t = 0.0
  var t0 = 0.0
  var t1 = 0.0
  var sd = 0.0
  var beta = 0.0
  var gamma = 0.0
  var delta = 0.0
  var a = 0.0
  var p = 0.0
  var b = 0.0
  var seed = 0x1234
  var val = 0.0
  var val0 = 0.0
  var asum = 0.0

  var W = new Float64Array(n << 3)

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

function svd (A, W, U, V) {
  var at = 0
  var i = 0
  var _m = A.rows
  var _n = A.cols
  var m = _m
  var n = _n

  if (m < n) {
    at = 1
    i = m
    m = n
    n = i
  }

  var amt = new Matrix(m, m)
  var wmt = new Matrix(1, n)
  var vmt = new Matrix(n, n)

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

function m4new () {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ])
}

function m4set (out, n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
  out[ 0 ] = n11; out[ 4 ] = n12; out[ 8 ] = n13; out[ 12 ] = n14
  out[ 1 ] = n21; out[ 5 ] = n22; out[ 9 ] = n23; out[ 13 ] = n24
  out[ 2 ] = n31; out[ 6 ] = n32; out[ 10 ] = n33; out[ 14 ] = n34
  out[ 3 ] = n41; out[ 7 ] = n42; out[ 11 ] = n43; out[ 15 ] = n44
}

function m4identity (out) {
  m4set(out,
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    )
}
m4identity.__deps = [ m4set ]

function m4multiply (out, a, b) {
  var a11 = a[ 0 ]
  var a12 = a[ 4 ]
  var a13 = a[ 8 ]
  var a14 = a[ 12 ]
  var a21 = a[ 1 ]
  var a22 = a[ 5 ]
  var a23 = a[ 9 ]
  var a24 = a[ 13 ]
  var a31 = a[ 2 ]
  var a32 = a[ 6 ]
  var a33 = a[ 10 ]
  var a34 = a[ 14 ]
  var a41 = a[ 3 ]
  var a42 = a[ 7 ]
  var a43 = a[ 11 ]
  var a44 = a[ 15 ]

  var b11 = b[ 0 ]
  var b12 = b[ 4 ]
  var b13 = b[ 8 ]
  var b14 = b[ 12 ]
  var b21 = b[ 1 ]
  var b22 = b[ 5 ]
  var b23 = b[ 9 ]
  var b24 = b[ 13 ]
  var b31 = b[ 2 ]
  var b32 = b[ 6 ]
  var b33 = b[ 10 ]
  var b34 = b[ 14 ]
  var b41 = b[ 3 ]
  var b42 = b[ 7 ]
  var b43 = b[ 11 ]
  var b44 = b[ 15 ]

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

function m4makeScale (out, x, y, z) {
  m4set(out,
    x, 0, 0, 0,
    0, y, 0, 0,
    0, 0, z, 0,
    0, 0, 0, 1
  )
}
m4makeScale.__deps = [ m4set ]

function m4makeTranslation (out, x, y, z) {
  m4set(out,
    1, 0, 0, x,
    0, 1, 0, y,
    0, 0, 1, z,
    0, 0, 0, 1
  )
}
m4makeTranslation.__deps = [ m4set ]

function m4makeRotationY (out, theta) {
  var c = Math.cos(theta)
  var s = Math.sin(theta)
  m4set(out,
    c, 0, s, 0,
    0, 1, 0, 0,
    -s, 0, c, 0,
    0, 0, 0, 1
  )
}
m4makeRotationY.__deps = [ m4set ]

//

function m3new () {
  return new Float32Array([
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ])
}

function m3makeNormal (out, m4) {
  var r0 = v3new([ m4[0], m4[1], m4[2] ])
  var r1 = v3new([ m4[4], m4[5], m4[6] ])
  var r2 = v3new([ m4[8], m4[9], m4[10] ])
  var cp = v3new()
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
m3makeNormal.__deps = [ v3new, v3cross ]

export {
  Matrix,
  svd,
  meanRows,
  meanCols,
  subRows,
  subCols,
  addRows,
  addCols,
  transpose,
  multiply,
  multiplyABt,
  multiplyAtB,
  invert3x3,
  multiply3x3,
  mat3x3determinant,

  m4new,
  m4identity,
  m4multiply,
  m4makeScale,
  m4makeTranslation,
  m4makeRotationY,

  m3new,
  m3makeNormal
}
