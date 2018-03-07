/**
 * @file Superposition
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log } from '../globals'
import {
    Matrix, svd, meanRows, subRows, addRows, transpose,
    multiplyABt, invert3x3, multiply3x3, mat3x3determinant
} from '../math/matrix-utils.js'
import Structure from '../structure/structure'

class Superposition {
  coords1t: Matrix
  coords2t: Matrix

  mean1: number[]
  mean2: number[]

  A = new Matrix(3, 3)
  W = new Matrix(1, 3)
  U = new Matrix(3, 3)
  V = new Matrix(3, 3)
  VH = new Matrix(3, 3)
  R = new Matrix(3, 3)

  private tmp = new Matrix(3, 3)
  private c = new Matrix(3, 3)

  constructor (atoms1: Structure|Float32Array, atoms2: Structure|Float32Array) {
    // allocate & init data structures

    let n1
    if (atoms1 instanceof Structure) {
      n1 = atoms1.atomCount
    } else if (atoms1 instanceof Float32Array) {
      n1 = atoms1.length / 3
    } else {
      return
    }

    let n2
    if (atoms2 instanceof Structure) {
      n2 = atoms2.atomCount
    } else if (atoms2 instanceof Float32Array) {
      n2 = atoms2.length / 3
    } else {
      return
    }

    const n = Math.min(n1, n2)

    const coords1 = new Matrix(3, n)
    const coords2 = new Matrix(3, n)

    this.coords1t = new Matrix(n, 3)
    this.coords2t = new Matrix(n, 3)

    this.c.data.set([ 1, 0, 0, 0, 1, 0, 0, 0, -1 ])

    // prep coords

    this.prepCoords(atoms1, coords1, n)
    this.prepCoords(atoms2, coords2, n)

    // superpose

    this._superpose(coords1, coords2)
  }

  _superpose (coords1: Matrix, coords2: Matrix) {
    this.mean1 = meanRows(coords1)
    this.mean2 = meanRows(coords2)

    subRows(coords1, this.mean1)
    subRows(coords2, this.mean2)

    transpose(this.coords1t, coords1)
    transpose(this.coords2t, coords2)

    multiplyABt(this.A, this.coords2t, this.coords1t)

    svd(this.A, this.W, this.U, this.V)

    invert3x3(this.V, this.VH)
    multiply3x3(this.R, this.U, this.VH)

    if (mat3x3determinant(this.R) < 0.0) {
      if (Debug) Log.log('R not a right handed system')

      multiply3x3(this.tmp, this.c, this.VH)
      multiply3x3(this.R, this.U, this.tmp)
    }
  }

  prepCoords (atoms: Structure|Float32Array, coords: Matrix, n: number) {
    let i = 0
    const n3 = n * 3
    const cd = coords.data

    if (atoms instanceof Structure) {
      atoms.eachAtom(function (a) {
        if (i < n3) {
          cd[ i + 0 ] = a.x
          cd[ i + 1 ] = a.y
          cd[ i + 2 ] = a.z

          i += 3
        }
      })
    } else if (atoms instanceof Float32Array) {
      cd.set(atoms.subarray(0, n3))
    } else {
      Log.warn('prepCoords: input type unknown')
    }
  }

  transform (atoms: Structure|Float32Array) {
    // allocate data structures

    let n
    if (atoms instanceof Structure) {
      n = atoms.atomCount
    } else if (atoms instanceof Float32Array) {
      n = atoms.length / 3
    } else {
      return
    }

    const coords = new Matrix(3, n)
    const tmp = new Matrix(n, 3)

    // prep coords

    this.prepCoords(atoms, coords, n)

    // do transform

    subRows(coords, this.mean1)
    multiplyABt(tmp, this.R, coords)
    transpose(coords, tmp)
    addRows(coords, this.mean2)

    let i = 0
    const cd = coords.data

    if (atoms instanceof Structure) {
      atoms.eachAtom(function (a) {
        a.x = cd[ i + 0 ]
        a.y = cd[ i + 1 ]
        a.z = cd[ i + 2 ]

        i += 3
      })
    } else if (atoms instanceof Float32Array) {
      atoms.set(cd.subarray(0, n * 3))
    } else {
      Log.warn('transform: input type unknown')
    }
  }
}

export default Superposition
