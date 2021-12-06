/**
 * @file Symmetry Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Matrix4 } from 'three'

import { Log } from '../globals'
import { EncodedSymOp, SymOpCode } from './symmetry-constants'

const reInteger = /^[1-9]$/

export function getSymmetryOperations (spacegroup: string) {
  const encodedSymopList = EncodedSymOp[ spacegroup ]
  const matrixDict: { [k: string]: Matrix4 } = {}

  if (encodedSymopList === undefined) {
    console.warn(`spacegroup '${spacegroup}' not found in symop library`)
    return matrixDict
  }

  const symopList = []
  for (let i = 0, il = encodedSymopList.length; i < il; i += 3) {
    const symop = []
    for (let j = 0; j < 3; ++j) {
      symop.push(SymOpCode[ encodedSymopList[ i + j ] ])
    }
    symopList.push(symop)
  }

  symopList.forEach(function (symop) {
    let row = 0
    const matrix = new Matrix4().set(
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 1
    )
    const me = matrix.elements

    matrixDict[ symop.toString() ] = matrix

    symop.forEach(function (elm) {
      let negate = false
      let denominator = false

      for (let i = 0, n = elm.length; i < n; ++i) {
        const c = elm[ i ]

        if (c === '-') {
          negate = true
        } else if (c === '+') {
          negate = false
        } else if (c === '/') {
          denominator = true
        } else if (c === 'X') {
          me[ 0 + row ] = negate ? -1 : 1
        } else if (c === 'Y') {
          me[ 4 + row ] = negate ? -1 : 1
        } else if (c === 'Z') {
          me[ 8 + row ] = negate ? -1 : 1
        } else if (reInteger.test(c)) {
          const integer = parseInt(c)
          if (denominator) {
            me[ 12 + row ] /= integer
          } else {
            me[ 12 + row ] = integer
          }
        } else {
          Log.warn(`getSymmetryOperations: unknown token '${c}'`)
        }
      }

      row += 1
    })
  })

  return matrixDict
}
