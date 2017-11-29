/**
 * @file Superposition
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log } from '../globals.js'
import {
    Matrix, svd, meanRows, subRows, addRows, transpose,
    multiplyABt, invert3x3, multiply3x3, mat3x3determinant
} from '../math/matrix-utils.js'

class Superposition {
  constructor (atoms1, atoms2) {
    // allocate & init data structures

    var n1
    if (typeof atoms1.eachAtom === 'function') {
      n1 = atoms1.atomCount
    } else if (atoms1 instanceof Float32Array) {
      n1 = atoms1.length / 3
    }

    var n2
    if (typeof atoms2.eachAtom === 'function') {
      n2 = atoms2.atomCount
    } else if (atoms1 instanceof Float32Array) {
      n2 = atoms2.length / 3
    }

    var n = Math.min(n1, n2)

    var coords1 = new Matrix(3, n)
    var coords2 = new Matrix(3, n)

    this.coords1t = new Matrix(n, 3)
    this.coords2t = new Matrix(n, 3)

    this.A = new Matrix(3, 3)
    this.W = new Matrix(1, 3)
    this.U = new Matrix(3, 3)
    this.V = new Matrix(3, 3)
    this.VH = new Matrix(3, 3)
    this.R = new Matrix(3, 3)

    this.tmp = new Matrix(3, 3)
    this.c = new Matrix(3, 3)
    this.c.data.set([ 1, 0, 0, 0, 1, 0, 0, 0, -1 ])

    // prep coords

    this.prepCoords(atoms1, coords1, n)
    this.prepCoords(atoms2, coords2, n)

    // superpose

    this._superpose(coords1, coords2)
  }

  _superpose (coords1, coords2) {
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

  prepCoords (atoms, coords, n) {
    var i = 0
    var n3 = n * 3
    var cd = coords.data

    if (typeof atoms.eachAtom === 'function') {
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

  transform (atoms) {
    // allocate data structures

    var n
    if (typeof atoms.eachAtom === 'function') {
      n = atoms.atomCount
    } else if (atoms instanceof Float32Array) {
      n = atoms.length / 3
    }

    var coords = new Matrix(3, n)
    var tmp = new Matrix(n, 3)

    // prep coords

    this.prepCoords(atoms, coords, n)

    // do transform

    subRows(coords, this.mean1)
    multiplyABt(tmp, this.R, coords)
    transpose(coords, tmp)
    addRows(coords, this.mean2)

    var i = 0
    var cd = coords.data

    if (typeof atoms.eachAtom === 'function') {
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
