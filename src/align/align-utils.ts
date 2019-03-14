/**
 * @file Align Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Structure from '../structure/structure'
import Selection from '../selection/selection'
import Alignment from './alignment'
import Superposition from './superposition'

/**
 * Perform structural superposition of two structures,
 * optionally guided by a sequence alignment
 * @param  {Structure|StructureView} s1 - structure 1 which is superposed onto structure 2
 * @param  {Structure|StructureView} s2 - structure 2 onto which structure 1 is superposed
 * @param  {Boolean} [align] - guide the superposition by a sequence alignment
 * @param  {String} [sele1] - selection string for structure 1
 * @param  {String} [sele2] - selection string for structure 2
 * @return {undefined}
 */
function superpose (s1: Structure, s2: Structure, align = false, sele1 = '', sele2 = '') {
  let i: number
  let j: number
  let n: number
  let atoms1
  let atoms2

  if (align) {
    let _s1 = s1
    let _s2 = s2

    if (sele1 && sele2) {
      _s1 = s1.getView(new Selection(sele1))
      _s2 = s2.getView(new Selection(sele2))
    }

    const seq1 = _s1.getSequence()
    const seq2 = _s2.getSequence()

    // Log.log( seq1.join("") );
    // Log.log( seq2.join("") );

    const ali = new Alignment(seq1.join(''), seq2.join(''))

    ali.calc()
    ali.trace()

    // Log.log( "superpose alignment score", ali.score );

    // Log.log( ali.ali1 );
    // Log.log( ali.ali2 );

    let _i, _j
    i = 0
    j = 0
    n = ali.ali1.length
    const aliIdx1: boolean[] = []
    const aliIdx2: boolean[] = []

    for (let l = 0; l < n; ++l) {
      const x = ali.ali1[ l ]
      const y = ali.ali2[ l ]

      _i = 0
      _j = 0

      if (x === '-') {
        aliIdx2[ j ] = false
      } else {
        aliIdx2[ j ] = true
        _i = 1
      }

      if (y === '-') {
        aliIdx1[ i ] = false
      } else {
        aliIdx1[ i ] = true
        _j = 1
      }

      i += _i
      j += _j
    }

    // Log.log( i, j );

    // Log.log( aliIdx1 );
    // Log.log( aliIdx2 );

    const _atoms1: number[] = []
    const _atoms2: number[] = []
    const ap1 = _s1.getAtomProxy()
    const ap2 = _s2.getAtomProxy()

    i = 0
    _s1.eachResidue(function (r) {
      if (r.traceAtomIndex === undefined ||
            r.traceAtomIndex !== r.getAtomIndexByName('CA')) return

      if (aliIdx1[ i ]) {
        ap1.index = r.getAtomIndexByName('CA')!  // TODO
        _atoms1.push(ap1.x, ap1.y, ap1.z)
      }
      i += 1
    })

    i = 0
    _s2.eachResidue(function (r) {
      if (r.traceAtomIndex === undefined ||
            r.traceAtomIndex !== r.getAtomIndexByName('CA')) return

      if (aliIdx2[ i ]) {
        ap2.index = r.getAtomIndexByName('CA')!  // TODO
        _atoms2.push(ap2.x, ap2.y, ap2.z)
      }
      i += 1
    })

    atoms1 = new Float32Array(_atoms1)
    atoms2 = new Float32Array(_atoms2)
  } else {
    const sviewCa1 = s1.getView(new Selection(`${sele1} and .CA`))
    const sviewCa2 = s2.getView(new Selection(`${sele2} and .CA`))

    atoms1 = sviewCa1
    atoms2 = sviewCa2
  }

  const superpose = new Superposition(atoms1, atoms2)
  const result = superpose.transform(s1)
  s1.refreshPosition()
  return result
}

export {
  superpose
}
