/**
 * @file Alignment
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log } from '../globals'

// const nucleotides = 'ACTG';
const aminoacidsX = 'ACDEFGHIKLMNPQRSTVWY'
const aminoacids = 'ARNDCQEGHILKMFPSTWYVBZ?'

const blosum62x = [
  [4, 0, -2, -1, -2, 0, -2, -1, -1, -1, -1, -2, -1, -1, -1, 1, 0, 0, -3, -2],        // A
  [0, 9, -3, -4, -2, -3, -3, -1, -3, -1, -1, -3, -3, -3, -3, -1, -1, -1, -2, -2],    // C
  [-2, -3, 6, 2, -3, -1, -1, -3, -1, -4, -3, 1, -1, 0, -2, 0, -1, -3, -4, -3],       // D
  [-1, -4, 2, 5, -3, -2, 0, -3, 1, -3, -2, 0, -1, 2, 0, 0, -1, -2, -3, -2],          // E
  [-2, -2, -3, -3, 6, -3, -1, 0, -3, 0, 0, -3, -4, -3, -3, -2, -2, -1, 1, 3],        // F
  [0, -3, -1, -2, -3, 6, -2, -4, -2, -4, -3, 0, -2, -2, -2, 0, -2, -3, -2, -3],      // G
  [-2, -3, -1, 0, -1, -2, 8, -3, -1, -3, -2, 1, -2, 0, 0, -1, -2, -3, -2, 2],        // H
  [-1, -1, -3, -3, 0, -4, -3, 4, -3, 2, 1, -3, -3, -3, -3, -2, -1, 3, -3, -1],       // I
  [-1, -3, -1, 1, -3, -2, -1, -3, 5, -2, -1, 0, -1, 1, 2, 0, -1, -2, -3, -2],        // K
  [-1, -1, -4, -3, 0, -4, -3, 2, -2, 4, 2, -3, -3, -2, -2, -2, -1, 1, -2, -1],       // L
  [-1, -1, -3, -2, 0, -3, -2, 1, -1, 2, 5, -2, -2, 0, -1, -1, -1, 1, -1, -1],        // M
  [-2, -3, 1, 0, -3, 0, 1, -3, 0, -3, -2, 6, -2, 0, 0, 1, 0, -3, -4, -2],            // N
  [-1, -3, -1, -1, -4, -2, -2, -3, -1, -3, -2, -2, 7, -1, -2, -1, -1, -2, -4, -3],   // P
  [-1, -3, 0, 2, -3, -2, 0, -3, 1, -2, 0, 0, -1, 5, 1, 0, -1, -2, -2, -1],           // Q
  [-1, -3, -2, 0, -3, -2, 0, -3, 2, -2, -1, 0, -2, 1, 5, -1, -1, -3, -3, -2],        // R
  [1, -1, 0, 0, -2, 0, -1, -2, 0, -2, -1, 1, -1, 0, -1, 4, 1, -2, -3, -2],           // S
  [0, -1, -1, -1, -2, -2, -2, -1, -1, -1, -1, 0, -1, -1, -1, 1, 5, 0, -2, -2],       // T
  [0, -1, -3, -2, -1, -3, -3, 3, -2, 1, 1, -3, -2, -2, -3, -2, 0, 4, -3, -1],        // V
  [-3, -2, -4, -3, 1, -2, -2, -3, -3, -2, -1, -4, -4, -2, -3, -3, -2, -3, 11, 2],    // W
  [-2, -2, -3, -2, 3, -3, 2, -1, -2, -1, -1, -2, -3, -1, -2, -2, -2, -1, 2, 7]       // Y
]

const blosum62 = [
  // A  R  N  D  C  Q  E  G  H  I  L  K  M  F  P  S  T  W  Y  V  B  Z  X
  [4, -1, -2, -2, 0, -1, -1, 0, -2, -1, -1, -1, -1, -2, -1, 1, 0, -3, -2, 0, -2, -1, 0], // A
  [-1, 5, 0, -2, -3, 1, 0, -2, 0, -3, -2, 2, -1, -3, -2, -1, -1, -3, -2, -3, -1, 0, -1], // R
  [-2, 0, 6, 1, -3, 0, 0, 0, 1, -3, -3, 0, -2, -3, -2, 1, 0, -4, -2, -3, 3, 0, -1], // N
  [-2, -2, 1, 6, -3, 0, 2, -1, -1, -3, -4, -1, -3, -3, -1, 0, -1, -4, -3, -3, 4, 1, -1], // D
  [0, -3, -3, -3, 9, -3, -4, -3, -3, -1, -1, -3, -1, -2, -3, -1, -1, -2, -2, -1, -3, -3, -2], // C
  [-1, 1, 0, 0, -3, 5, 2, -2, 0, -3, -2, 1, 0, -3, -1, 0, -1, -2, -1, -2, 0, 3, -1], // Q
  [-1, 0, 0, 2, -4, 2, 5, -2, 0, -3, -3, 1, -2, -3, -1, 0, -1, -3, -2, -2, 1, 4, -1], // E
  [0, -2, 0, -1, -3, -2, -2, 6, -2, -4, -4, -2, -3, -3, -2, 0, -2, -2, -3, -3, -1, -2, -1], // G
  [-2, 0, 1, -1, -3, 0, 0, -2, 8, -3, -3, -1, -2, -1, -2, -1, -2, -2, 2, -3, 0, 0, -1], // H
  [-1, -3, -3, -3, -1, -3, -3, -4, -3, 4, 2, -3, 1, 0, -3, -2, -1, -3, -1, 3, -3, -3, -1], // I
  [-1, -2, -3, -4, -1, -2, -3, -4, -3, 2, 4, -2, 2, 0, -3, -2, -1, -2, -1, 1, -4, -3, -1], // L
  [-1, 2, 0, -1, -3, 1, 1, -2, -1, -3, -2, 5, -1, -3, -1, 0, -1, -3, -2, -2, 0, 1, -1], // K
  [-1, -1, -2, -3, -1, 0, -2, -3, -2, 1, 2, -1, 5, 0, -2, -1, -1, -1, -1, 1, -3, -1, -1], // M
  [-2, -3, -3, -3, -2, -3, -3, -3, -1, 0, 0, -3, 0, 6, -4, -2, -2, 1, 3, -1, -3, -3, -1], // F
  [-1, -2, -2, -1, -3, -1, -1, -2, -2, -3, -3, -1, -2, -4, 7, -1, -1, -4, -3, -2, -2, -1, -2], // P
  [1, -1, 1, 0, -1, 0, 0, 0, -1, -2, -2, 0, -1, -2, -1, 4, 1, -3, -2, -2, 0, 0, 0], // S
  [0, -1, 0, -1, -1, -1, -1, -2, -2, -1, -1, -1, -1, -2, -1, 1, 5, -2, -2, 0, -1, -1, 0], // T
  [-3, -3, -4, -4, -2, -2, -3, -2, -2, -3, -2, -3, -1, 1, -4, -3, -2, 11, 2, -3, -4, -3, -2], // W
  [-2, -2, -2, -3, -2, -1, -2, -3, 2, -1, -1, -2, -1, 3, -3, -2, -2, 2, 7, -1, -3, -2, -1], // Y
  [0, -3, -3, -3, -1, -2, -2, -3, -3, 3, 1, -2, 1, -1, -2, -2, 0, -3, -1, 4, -3, -2, -1], // V
  [-2, -1, 3, 4, -3, 0, 1, -1, 0, -3, -4, 0, -3, -3, -2, 0, -1, -4, -3, -3, 4, 1, -1], // B
  [-1, 0, 0, 1, -3, 3, 4, -2, 0, -3, -3, 1, -1, -3, -1, 0, -1, -3, -2, -2, 1, 4, -1], // Z
  [0, -1, -1, -1, -2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -2, 0, 0, -2, -1, -1, -1, -1, -1]  // X
]

function prepareMatrix (cellNames: string, mat: number[][]) {
  let j: number
  let i = 0
  const matDict: { [k: string]: { [k: string]: number } } = {}
  mat.forEach(function (row) {
    j = 0
    const rowDict: { [k: string]: number } = {}
    row.forEach(function (elm) {
      rowDict[ cellNames[ j++ ] ] = elm
    })
    matDict[ cellNames[ i++ ] ] = rowDict
  })
  return matDict
}

const SubstitutionMatrices = (function () {
  return {
    blosum62: prepareMatrix(aminoacids, blosum62),
    blosum62x: prepareMatrix(aminoacidsX, blosum62x)
  }
}())
export type SubstitutionMatrix = ''|'blosum62'|'blosum62x'

class Alignment {
  substMatrix: { [k: string]: { [k: string]: number } }

  n: number
  m: number
  score?: number
  ali: string

  S: number[][]
  V: number[][]
  H: number[][]

  ali1: string
  ali2: string

  constructor (readonly seq1: string, readonly seq2: string, readonly gapPenalty = -10, readonly gapExtensionPenalty = -1, substMatrix: SubstitutionMatrix = 'blosum62') {
    // TODO try encoding seqs as integers and use array subst matrix, maybe faster

    if (substMatrix) {
      this.substMatrix = SubstitutionMatrices[ substMatrix ]
    }
  }

  initMatrices () {
    this.n = this.seq1.length
    this.m = this.seq2.length

    // Log.log(this.n, this.m);

    this.score = undefined
    this.ali = ''

    this.S = []
    this.V = []
    this.H = []

    for (let i = 0; i <= this.n; ++i) {
      this.S[ i ] = []
      this.V[ i ] = []
      this.H[ i ] = []

      for (let j = 0; j <= this.m; ++j) {
        this.S[ i ][ j ] = 0
        this.V[ i ][ j ] = 0
        this.H[ i ][ j ] = 0
      }
    }

    for (let i = 0; i <= this.n; ++i) {
      this.S[ i ][ 0 ] = this.gap(0)
      this.H[ i ][ 0 ] = -Infinity
    }

    for (let j = 0; j <= this.m; ++j) {
      this.S[ 0 ][ j ] = this.gap(0)
      this.V[ 0 ][ j ] = -Infinity
    }

    this.S[ 0 ][ 0 ] = 0

    // Log.log(this.S, this.V, this.H);
  }

  gap (len: number) {
    return this.gapPenalty + len * this.gapExtensionPenalty
  }

  makeScoreFn () {
    const seq1 = this.seq1
    const seq2 = this.seq2

    const substMatrix = this.substMatrix

    if (substMatrix) {
      return function score (i: number, j: number) {
        const c1 = seq1[ i ]
        const c2 = seq2[ j ]

        try {
          return substMatrix[ c1 ][ c2 ]
        } catch (e) {
          return -4
        }
      }
    } else {
      Log.warn('Alignment: no subst matrix')

      return function scoreNoSubstMat (i: number, j: number) {
        const c1 = seq1[ i ]
        const c2 = seq2[ j ]

        return c1 === c2 ? 5 : -3
      }
    }
  }

  calc () {
    if (Debug) Log.time('Alignment.calc')

    this.initMatrices()

    const gap0 = this.gap(0)
    const scoreFn = this.makeScoreFn()
    const gapExtensionPenalty = this.gapExtensionPenalty

    const V = this.V
    const H = this.H
    const S = this.S

    const n = this.n
    const m = this.m

    let Vi1, Si1, Vi, Hi, Si

    for (let i = 1; i <= n; ++i) {
      Si1 = S[ i - 1 ]
      Vi1 = V[ i - 1 ]

      Vi = V[ i ]
      Hi = H[ i ]
      Si = S[ i ]

      for (let j = 1; j <= m; ++j) {
        Vi[j] = Math.max(
          Si1[ j ] + gap0,
          Vi1[ j ] + gapExtensionPenalty
        )

        Hi[j] = Math.max(
          Si[ j - 1 ] + gap0,
          Hi[ j - 1 ] + gapExtensionPenalty
        )

        Si[j] = Math.max(
          Si1[ j - 1 ] + scoreFn(i - 1, j - 1), // match
          Vi[ j ], // del
          Hi[ j ]  // ins
        )
      }
    }

    if (Debug) Log.timeEnd('Alignment.calc')

    if (Debug) Log.log(this.S, this.V, this.H)
  }

  trace () {
    if (Debug) Log.time('Alignment.trace')

    this.ali1 = ''
    this.ali2 = ''

    const scoreFn = this.makeScoreFn()

    let i = this.n
    let j = this.m
    let mat

    if (this.S[i][j] >= this.V[i][j]) {
      mat = 'S'
      this.score = this.S[i][j]
    } else if (this.V[i][j] >= this.H[i][j]) {
      mat = 'V'
      this.score = this.V[i][j]
    } else {
      mat = 'H'
      this.score = this.H[i][j]
    }

    if (Debug) Log.log('Alignment: SCORE', this.score)
    if (Debug) Log.log('Alignment: S, V, H', this.S[i][j], this.V[i][j], this.H[i][j])

    while (i > 0 && j > 0) {
      if (mat === 'S') {
        if (this.S[i][j] === this.S[i - 1][j - 1] + scoreFn(i - 1, j - 1)) {
          this.ali1 = this.seq1[i - 1] + this.ali1
          this.ali2 = this.seq2[j - 1] + this.ali2
          --i
          --j
          mat = 'S'
        } else if (this.S[i][j] === this.V[i][j]) {
          mat = 'V'
        } else if (this.S[i][j] === this.H[i][j]) {
          mat = 'H'
        } else {
          // Log.debug('Alignment: S');
          --i
          --j
        }
      } else if (mat === 'V') {
        if (this.V[i][j] === this.V[i - 1][j] + this.gapExtensionPenalty) {
          this.ali1 = this.seq1[i - 1] + this.ali1
          this.ali2 = '-' + this.ali2
          --i
          mat = 'V'
        } else if (this.V[i][j] === this.S[i - 1][j] + this.gap(0)) {
          this.ali1 = this.seq1[i - 1] + this.ali1
          this.ali2 = '-' + this.ali2
          --i
          mat = 'S'
        } else {
          // Log.debug('Alignment: V');
          --i
        }
      } else if (mat === 'H') {
        if (this.H[i][j] === this.H[i][j - 1] + this.gapExtensionPenalty) {
          this.ali1 = '-' + this.ali1
          this.ali2 = this.seq2[j - 1] + this.ali2
          --j
          mat = 'H'
        } else if (this.H[i][j] === this.S[i][j - 1] + this.gap(0)) {
          this.ali1 = '-' + this.ali1
          this.ali2 = this.seq2[j - 1] + this.ali2
          --j
          mat = 'S'
        } else {
          // Log.debug('Alignment: H');
          --j
        }
      } else {
        Log.error('Alignment: no matrix')
      }
    }

    while (i > 0) {
      this.ali1 = this.seq1[ i - 1 ] + this.ali1
      this.ali2 = '-' + this.ali2
      --i
    }

    while (j > 0) {
      this.ali1 = '-' + this.ali1
      this.ali2 = this.seq2[ j - 1 ] + this.ali2
      --j
    }

    if (Debug) Log.timeEnd('Alignment.trace')

    if (Debug) Log.log([this.ali1, this.ali2])
  }
}

export default Alignment
