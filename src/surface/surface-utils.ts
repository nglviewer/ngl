/**
 * @file Surface Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { degToRad } from '../math/math-utils'
import {
  m4new, m4multiply, m4makeTranslation, m4makeScale, m4makeRotationY
} from '../math/matrix-utils'
import {
  v3addScalar, v3subScalar, v3divideScalar, v3multiplyScalar,
  v3floor, v3ceil, v3sub, v3negate,
  v3cross, v3fromArray, normalizeVector3array
} from '../math/vector-utils'
import { NumberArray } from '../types'

function laplacianSmooth (verts: Float32Array, faces: Float32Array, numiter: number, inflate: boolean) {
  // based on D. Xu, Y. Zhang (2009) Generating Triangulated Macromolecular
  // Surfaces by Euclidean Distance Transform. PLoS ONE 4(12): e8140.
  //
  // Permission to use, copy, modify, and distribute this program for
  // any purpose, with or without fee, is hereby granted, provided that
  // the notices on the head, the reference information, and this
  // copyright notice appear in all copies or substantial portions of
  // the Software. It is provided "as is" without express or implied
  // warranty.
  //
  // ported to JavaScript and adapted to NGL by Alexander Rose

  numiter = numiter || 1
  inflate = inflate || true

  const nv = verts.length / 3
  const nf = faces.length / 3
  let norms: Float32Array | undefined = undefined

  if (inflate) {
    norms = new Float32Array(nv * 3)
  }

  const tps = new Float32Array(nv * 3)

  let i
  const ndeg = 20
  const vertdeg = new Array(ndeg)

  for (i = 0; i < ndeg; ++i) {
    vertdeg[ i ] = new Uint32Array(nv)
  }

  for (i = 0; i < nv; ++i) {
    vertdeg[ 0 ][ i ] = 0
  }

  let j, jl
  let flagvert: boolean

  // for each face

  for (i = 0; i < nf; ++i) {
    var ao = i * 3
    var bo = i * 3 + 1
    var co = i * 3 + 2

    // vertex a

    flagvert = true
    for (j = 0, jl = vertdeg[ 0 ][ faces[ao] ]; j < jl; ++j) {
      if (faces[ bo ] === vertdeg[ j + 1 ][ faces[ ao ] ]) {
        flagvert = false
        break
      }
    }
    if (flagvert) {
      vertdeg[ 0 ][ faces[ ao ] ]++
      vertdeg[ vertdeg[ 0 ][ faces[ ao ] ] ][ faces[ ao ] ] = faces[ bo ]
    }

    flagvert = true
    for (j = 0, jl = vertdeg[ 0 ][ faces[ ao ] ]; j < jl; ++j) {
      if (faces[ co ] === vertdeg[ j + 1 ][ faces[ ao ] ]) {
        flagvert = false
        break
      }
    }
    if (flagvert) {
      vertdeg[ 0 ][ faces[ ao ] ]++
      vertdeg[ vertdeg[ 0 ][ faces[ ao ] ] ][ faces[ ao ] ] = faces[ co ]
    }

    // vertex b

    flagvert = true
    for (j = 0, jl = vertdeg[ 0 ][ faces[ bo ] ]; j < jl; ++j) {
      if (faces[ ao ] === vertdeg[ j + 1 ][ faces[ bo ] ]) {
        flagvert = false
        break
      }
    }
    if (flagvert) {
      vertdeg[ 0 ][ faces[ bo ] ]++
      vertdeg[ vertdeg[ 0 ][ faces[ bo ] ] ][ faces[ bo ] ] = faces[ ao ]
    }

    flagvert = true
    for (j = 0, jl = vertdeg[ 0 ][ faces[ bo ] ]; j < jl; ++j) {
      if (faces[ co ] === vertdeg[ j + 1 ][ faces[ bo ] ]) {
        flagvert = false
        break
      }
    }
    if (flagvert) {
      vertdeg[ 0 ][ faces[ bo ] ]++
      vertdeg[ vertdeg[ 0 ][ faces[ bo ] ] ][ faces[ bo ] ] = faces[ co ]
    }

    // vertex c

    flagvert = true
    for (j = 0; j < vertdeg[ 0 ][ faces[ co ] ]; ++j) {
      if (faces[ ao ] === vertdeg[ j + 1 ][ faces[ co ] ]) {
        flagvert = false
        break
      }
    }
    if (flagvert) {
      vertdeg[ 0 ][ faces[ co ] ]++
      vertdeg[ vertdeg[ 0 ][ faces[ co ] ] ][ faces[ co ] ] = faces[ ao ]
    }

    flagvert = true
    for (j = 0, jl = vertdeg[ 0 ][ faces[ co ] ]; j < jl; ++j) {
      if (faces[ bo ] === vertdeg[ j + 1 ][ faces[ co ] ]) {
        flagvert = false
        break
      }
    }
    if (flagvert) {
      vertdeg[ 0 ][ faces[ co ] ]++
      vertdeg[ vertdeg[ 0 ][ faces[ co ] ] ][ faces[ co ] ] = faces[ bo ]
    }
  }

  var wt = 1.0
  var wt2 = 0.5
  var i3, vi3, vdi, wtvi, wt2vi
  var ssign = -1
  var scaleFactor = 1
  var outwt = 0.75 / (scaleFactor + 3.5) // area-preserving

  // smoothing iterations

  for (var k = 0; k < numiter; ++k) {
    // for each vertex

    for (i = 0; i < nv; ++i) {
      i3 = i * 3
      vdi = vertdeg[ 0 ][ i ]

      if (vdi < 3) {
        tps[ i3 ] = verts[ i3 ]
        tps[ i3 + 1 ] = verts[ i3 + 1 ]
        tps[ i3 + 2 ] = verts[ i3 + 2 ]
      } else if (vdi === 3 || vdi === 4) {
        tps[ i3 ] = 0
        tps[ i3 + 1 ] = 0
        tps[ i3 + 2 ] = 0

        for (j = 0; j < vdi; ++j) {
          vi3 = vertdeg[ j + 1 ][ i ] * 3
          tps[ i3 ] += verts[ vi3 ]
          tps[ i3 + 1 ] += verts[ vi3 + 1 ]
          tps[ i3 + 2 ] += verts[ vi3 + 2 ]
        }

        tps[ i3 ] += wt2 * verts[ i3 ]
        tps[ i3 + 1 ] += wt2 * verts[ i3 + 1 ]
        tps[ i3 + 2 ] += wt2 * verts[ i3 + 2 ]

        wt2vi = wt2 + vdi
        tps[ i3 ] /= wt2vi
        tps[ i3 + 1 ] /= wt2vi
        tps[ i3 + 2 ] /= wt2vi
      } else {
        tps[ i3 ] = 0
        tps[ i3 + 1 ] = 0
        tps[ i3 + 2 ] = 0

        for (j = 0; j < vdi; ++j) {
          vi3 = vertdeg[ j + 1 ][ i ] * 3
          tps[ i3 ] += verts[ vi3 ]
          tps[ i3 + 1 ] += verts[ vi3 + 1 ]
          tps[ i3 + 2 ] += verts[ vi3 + 2 ]
        }

        tps[ i3 ] += wt * verts[ i3 ]
        tps[ i3 + 1 ] += wt * verts[ i3 + 1 ]
        tps[ i3 + 2 ] += wt * verts[ i3 + 2 ]

        wtvi = wt + vdi
        tps[ i3 ] /= wtvi
        tps[ i3 + 1 ] /= wtvi
        tps[ i3 + 2 ] /= wtvi
      }
    }

    verts.set(tps) // copy smoothed positions

    if (inflate) {
      computeVertexNormals(verts, faces, norms)
      var nv3 = nv * 3

      for (i3 = 0; i3 < nv3; i3 += 3) {
        // if(verts[i].inout) ssign=1;
        // else ssign=-1;

        verts[ i3 ] += ssign * outwt * norms![ i3 ]
        verts[ i3 + 1 ] += ssign * outwt * norms![ i3 + 1 ]
        verts[ i3 + 2 ] += ssign * outwt * norms![ i3 + 2 ]
      }
    }
  }
}
Object.assign(laplacianSmooth, {__deps: [ computeVertexNormals ]})

function computeVertexNormals (position: Float32Array, index?: NumberArray, normal?: Float32Array) {
  var i, il

  if (normal === undefined) {
    normal = new Float32Array(position.length)
  } else {
    // reset existing normals to zero
    for (i = 0, il = normal.length; i < il; i++) {
      normal[ i ] = 0
    }
  }

  var a = new Float32Array(3)
  var b = new Float32Array(3)
  var c = new Float32Array(3)
  var cb = new Float32Array(3)
  var ab = new Float32Array(3)

  if (index) {
    // indexed elements
    for (i = 0, il = index.length; i < il; i += 3) {
      var ai = index[ i ] * 3
      var bi = index[ i + 1 ] * 3
      var ci = index[ i + 2 ] * 3

      v3fromArray(a, position, ai)
      v3fromArray(b, position, bi)
      v3fromArray(c, position, ci)

      v3sub(cb, c, b)
      v3sub(ab, a, b)
      v3cross(cb, cb, ab)

      normal[ ai ] += cb[ 0 ]
      normal[ ai + 1 ] += cb[ 1 ]
      normal[ ai + 2 ] += cb[ 2 ]

      normal[ bi ] += cb[ 0 ]
      normal[ bi + 1 ] += cb[ 1 ]
      normal[ bi + 2 ] += cb[ 2 ]

      normal[ ci ] += cb[ 0 ]
      normal[ ci + 1 ] += cb[ 1 ]
      normal[ ci + 2 ] += cb[ 2 ]
    }
  } else {
    // non-indexed elements (unconnected triangle soup)
    for (i = 0, il = position.length; i < il; i += 9) {
      v3fromArray(a, position, i)
      v3fromArray(b, position, i + 3)
      v3fromArray(c, position, i + 6)

      v3sub(cb, c, b)
      v3sub(ab, a, b)
      v3cross(cb, cb, ab)

      normal[ i ] = cb[ 0 ]
      normal[ i + 1 ] = cb[ 1 ]
      normal[ i + 2 ] = cb[ 2 ]

      normal[ i + 3 ] = cb[ 0 ]
      normal[ i + 4 ] = cb[ 1 ]
      normal[ i + 5 ] = cb[ 2 ]

      normal[ i + 6 ] = cb[ 0 ]
      normal[ i + 7 ] = cb[ 1 ]
      normal[ i + 8 ] = cb[ 2 ]
    }
  }

  normalizeVector3array(normal)

  return normal
}
Object.assign(computeVertexNormals, {__deps: [
  v3sub, v3cross, v3fromArray, normalizeVector3array
]})

function getRadiusDict (radiusList: number[]) {
  var radiusDict: {[k: number]: boolean} = {}
  for (var i = 0, il = radiusList.length; i < il; ++i) {
    radiusDict[ radiusList[ i ] ] = true
  }
  return radiusDict
}

function getSurfaceGrid (min: Float32Array, max: Float32Array, maxRadius: number, scaleFactor: number, extraMargin: number) {
  // need margin to avoid boundary/round off effects
  var margin = (1 / scaleFactor) * 3
  margin += maxRadius

  v3subScalar(min, min, extraMargin + margin)
  v3addScalar(max, max, extraMargin + margin)

  v3multiplyScalar(min, min, scaleFactor)
  v3floor(min, min)
  v3divideScalar(min, min, scaleFactor)

  v3multiplyScalar(max, max, scaleFactor)
  v3ceil(max, max)
  v3divideScalar(max, max, scaleFactor)

  var dim = new Float32Array(3)
  v3sub(dim, max, min)
  v3multiplyScalar(dim, dim, scaleFactor)
  v3ceil(dim, dim)
  v3addScalar(dim, dim, 1)

  var maxSize = Math.pow(10, 6) * 256
  var tmpSize = dim[ 0 ] * dim[ 1 ] * dim[ 2 ] * 3

  if (maxSize <= tmpSize) {
    scaleFactor *= Math.pow(maxSize / tmpSize, 1 / 3)

    v3multiplyScalar(min, min, scaleFactor)
    v3floor(min, min)
    v3divideScalar(min, min, scaleFactor)

    v3multiplyScalar(max, max, scaleFactor)
    v3ceil(max, max)
    v3divideScalar(max, max, scaleFactor)

    v3sub(dim, max, min)
    v3multiplyScalar(dim, dim, scaleFactor)
    v3ceil(dim, dim)
    v3addScalar(dim, dim, 1)
  }

  var tran = new Float32Array(min)
  v3negate(tran, tran)

  // coordinate transformation matrix
  var matrix = m4new()
  var mroty = m4new()
  m4makeRotationY(mroty, degToRad(90))
  m4multiply(matrix, matrix, mroty)

  var mscale = m4new()
  m4makeScale(
    mscale,
    -1 / scaleFactor,
    1 / scaleFactor,
    1 / scaleFactor
  )
  m4multiply(matrix, matrix, mscale)

  var mtrans = m4new()
  m4makeTranslation(
    mtrans,
    -scaleFactor * tran[2],
    -scaleFactor * tran[1],
    -scaleFactor * tran[0]
  )
  m4multiply(matrix, matrix, mtrans)

  return {
    dim: dim,
    tran: tran,
    matrix: matrix,
    scaleFactor: scaleFactor
  }
}
Object.assign(getSurfaceGrid, {'__deps': [
  degToRad,
  v3subScalar, v3addScalar, v3divideScalar, v3multiplyScalar,
  v3floor, v3ceil, v3sub, v3negate,
  m4new, m4multiply, m4makeTranslation, m4makeScale, m4makeRotationY
]})

export {
  laplacianSmooth,
  computeVertexNormals,
  getRadiusDict,
  getSurfaceGrid
}
