/**
 * @file Superposition
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Matrix4 } from 'three'
import { Debug, Log } from '../globals'
import {
    Matrix, svd, meanRows, subRows, transpose,
    multiplyABt, invert3x3, multiply3x3, mat3x3determinant, multiply
} from '../math/matrix-utils'
import Structure from '../structure/structure'

class Superposition {
  coords1t: Matrix
  coords2t: Matrix

  transformationMatrix: Matrix4

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

    this.transformationMatrix = new Matrix4()

    this.c.data.set([ 1, 0, 0, 0, 1, 0, 0, 0, -1 ])

    // prep coords

    this.prepCoords(atoms1, coords1, n, false)
    this.prepCoords(atoms2, coords2, n, false)

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

    //get the transformation matrix

    const transformMat_ = new Matrix(4,4)
    const tmp_1 = new Matrix(4,4)
    const tmp_2 = new Matrix(4,4)

    const sub = new Matrix(4,4)
    const mult = new Matrix(4,4)
    const add = new Matrix(4,4)

    const R = this.R.data
    const M1 = this.mean1
    const M2 = this.mean2

    sub.data.set([ 1, 0, 0, -M1[0],
                   0, 1, 0, -M1[1],
                   0, 0, 1, -M1[2],
                   0, 0, 0, 1 ])

    mult.data.set([ R[0], R[1], R[2], 0,
                    R[3], R[4], R[5], 0,
                    R[6], R[7], R[8], 0,
                    0, 0, 0, 1 ])

    add.data.set([ 1, 0, 0, M2[0],
                   0, 1, 0, M2[1],
                   0, 0, 1, M2[2],
                   0, 0, 0, 1 ])

    transpose(tmp_1,sub)
    multiplyABt(transformMat_,mult,tmp_1)
    transpose(tmp_2,transformMat_)
    multiplyABt(tmp_1,add,tmp_2)

    transpose(transformMat_,tmp_1)
    this.transformationMatrix.elements = transformMat_.data as unknown as number[]

  }

  prepCoords (atoms: Structure|Float32Array, coords: Matrix, n: number, is4X4: boolean) {
    let i = 0
    const cd = coords.data

    let c = 3
    let d = n * 3

    if (is4X4) {
      d = n * 4
      c = 4
    }
    if (atoms instanceof Structure) {
      atoms.eachAtom(function (a) {
        if (i < d) {
          cd[ i + 0 ] = a.x
          cd[ i + 1 ] = a.y
          cd[ i + 2 ] = a.z
          if (is4X4) cd[ i + 3 ] = 1

          i += c
        }
      })
    } else if (atoms instanceof Float32Array) {
      for (; i < d; i += c){
        if (i < d) {
          cd[ i ] = atoms[ i ]
          cd[ i + 1 ] = atoms[ i + 1 ]
          cd[ i + 2 ] = atoms[ i + 2 ]
          if (is4X4) cd[ i + 3 ] = 1
        }
      }
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

    const coords = new Matrix(4, n)
    const tCoords = new Matrix(n,4)

    // prep coords

    this.prepCoords(atoms, coords, n, true)

    // check for transformation matrix correctness

    const transform = this.transformationMatrix
    const det = transform.determinant()
    if (!det){
      return det
    }

    // do transform

    const mult = new Matrix(4,4)
    mult.data = transform.elements as unknown as Float32Array
    multiply(tCoords,coords,mult)

    let i = 0
    const cd = tCoords.data
    if (atoms instanceof Structure) {
        atoms.eachAtom(function (a) {
          a.x = cd[ i ]
          a.y = cd[ i + 1 ]
          a.z = cd[ i + 2 ]
          i += 4
        })

        //update transformation matrices for each assembly

        const invertTrasform = new Matrix4()
        invertTrasform.getInverse(transform)

        const biomolDict = atoms.biomolDict

        for (let key in biomolDict) {

          if (biomolDict.hasOwnProperty(key)) {
            let assembly = biomolDict[key]

            assembly.partList.forEach(function(part){

              part.matrixList.forEach(function(mat){

                mat.premultiply(transform)
                mat.multiply(invertTrasform)

              })
            })
          }
        }
    } else if (atoms instanceof Float32Array) {

      const n4 = n * 4
      for (; i < n4; i += 4){

        atoms[ i ] = cd[ i ]
        atoms[ i + 1 ] = cd[ i + 1 ]
        atoms[ i + 2 ] = cd[ i + 2 ]

      }
    } else {
      Log.warn('transform: input type unknown')
    }

    return this.transformationMatrix
  }
}
export default Superposition
