/**
 * @file Selection Test
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { binarySearchIndexOf, rangeInSortedArray } from '../utils.js'
import { kwd, AtomOnlyKeywords, ChainKeywords } from './selection-constants.js'

function atomTestFn (a, s) {
  // returning -1 means the rule is not applicable
  if (s.atomname === undefined && s.element === undefined &&
    s.altloc === undefined && s.atomindex === undefined &&
    s.keyword === undefined && s.inscode === undefined &&
    s.resname === undefined && s.sstruc === undefined &&
    s.resno === undefined && s.chainname === undefined &&
    s.model === undefined
  ) return -1

  if (s.keyword !== undefined) {
    if (s.keyword === kwd.BACKBONE && !a.isBackbone()) return false
    if (s.keyword === kwd.SIDECHAIN && !a.isSidechain()) return false
    if (s.keyword === kwd.BONDED && !a.isBonded()) return false
    if (s.keyword === kwd.RING && !a.isRing()) return false

    if (s.keyword === kwd.HETERO && !a.isHetero()) return false
    if (s.keyword === kwd.PROTEIN && !a.isProtein()) return false
    if (s.keyword === kwd.NUCLEIC && !a.isNucleic()) return false
    if (s.keyword === kwd.RNA && !a.isRna()) return false
    if (s.keyword === kwd.DNA && !a.isDna()) return false
    if (s.keyword === kwd.POLYMER && !a.isPolymer()) return false
    if (s.keyword === kwd.WATER && !a.isWater()) return false
    if (s.keyword === kwd.HELIX && !a.isHelix()) return false
    if (s.keyword === kwd.SHEET && !a.isSheet()) return false
    if (s.keyword === kwd.TURN && !a.isTurn()) return false
    if (s.keyword === kwd.ION && !a.isIon()) return false
    if (s.keyword === kwd.SACCHARIDE && !a.isSaccharide()) return false
  }

  if (s.atomname !== undefined && s.atomname !== a.atomname) return false
  if (s.element !== undefined && s.element !== a.element) return false
  if (s.altloc !== undefined && s.altloc !== a.altloc) return false

  if (s.atomindex !== undefined &&
      binarySearchIndexOf(s.atomindex, a.index) < 0
  ) return false

  if (s.resname !== undefined) {
    if (Array.isArray(s.resname)) {
      if (!s.resname.includes(a.resname)) return false
    } else {
      if (s.resname !== a.resname) return false
    }
  }
  if (s.sstruc !== undefined && s.sstruc !== a.sstruc) return false
  if (s.resno !== undefined) {
    if (Array.isArray(s.resno) && s.resno.length === 2) {
      if (s.resno[0] > a.resno || s.resno[1] < a.resno) return false
    } else {
      if (s.resno !== a.resno) return false
    }
  }
  if (s.inscode !== undefined && s.inscode !== a.inscode) return false

  if (s.chainname !== undefined && s.chainname !== a.chainname) return false
  if (s.model !== undefined && s.model !== a.modelIndex) return false

  return true
}

function residueTestFn (r, s) {
  // returning -1 means the rule is not applicable
  if (s.resname === undefined && s.resno === undefined && s.inscode === undefined &&
      s.sstruc === undefined && s.model === undefined && s.chainname === undefined &&
      s.atomindex === undefined &&
      (s.keyword === undefined || AtomOnlyKeywords.includes(s.keyword))
  ) return -1

  if (s.keyword !== undefined) {
    if (s.keyword === kwd.HETERO && !r.isHetero()) return false
    if (s.keyword === kwd.PROTEIN && !r.isProtein()) return false
    if (s.keyword === kwd.NUCLEIC && !r.isNucleic()) return false
    if (s.keyword === kwd.RNA && !r.isRna()) return false
    if (s.keyword === kwd.DNA && !r.isDna()) return false
    if (s.keyword === kwd.POLYMER && !r.isPolymer()) return false
    if (s.keyword === kwd.WATER && !r.isWater()) return false
    if (s.keyword === kwd.HELIX && !r.isHelix()) return false
    if (s.keyword === kwd.SHEET && !r.isSheet()) return false
    if (s.keyword === kwd.TURN && !r.isTurn()) return false
    if (s.keyword === kwd.ION && !r.isIon()) return false
    if (s.keyword === kwd.SACCHARIDE && !r.isSaccharide()) return false
  }

  if (s.atomindex !== undefined &&
      rangeInSortedArray(s.atomindex, r.atomOffset, r.atomEnd) === 0
  ) return false

  if (s.resname !== undefined) {
    if (Array.isArray(s.resname)) {
      if (!s.resname.includes(r.resname)) return false
    } else {
      if (s.resname !== r.resname) return false
    }
  }
  if (s.sstruc !== undefined && s.sstruc !== r.sstruc) return false
  if (s.resno !== undefined) {
    if (Array.isArray(s.resno) && s.resno.length === 2) {
      if (s.resno[0] > r.resno || s.resno[1] < r.resno) return false
    } else {
      if (s.resno !== r.resno) return false
    }
  }
  if (s.inscode !== undefined && s.inscode !== r.inscode) return false

  if (s.chainname !== undefined && s.chainname !== r.chainname) return false
  if (s.model !== undefined && s.model !== r.modelIndex) return false

  return true
}

function chainTestFn (c, s) {
  // returning -1 means the rule is not applicable
  if (s.chainname === undefined && s.model === undefined && s.atomindex === undefined &&
      (s.keyword === undefined || !ChainKeywords.includes(s.keyword) || !c.entity)
  ) return -1

  if (s.keyword !== undefined) {
    if (s.keyword === kwd.POLYMER && !c.entity.isPolymer()) return false
    if (s.keyword === kwd.WATER && !c.entity.isWater()) return false
  }

  if (s.atomindex !== undefined &&
      rangeInSortedArray(s.atomindex, c.atomOffset, c.atomEnd) === 0
  ) return false

  if (s.chainname !== undefined && s.chainname !== c.chainname) return false

  if (s.model !== undefined && s.model !== c.modelIndex) return false

  return true
}

function modelTestFn (m, s) {
  // returning -1 means the rule is not applicable
  if (s.model === undefined && s.atomindex === undefined) return -1

  if (s.atomindex !== undefined &&
      rangeInSortedArray(s.atomindex, m.atomOffset, m.atomEnd) === 0
  ) return false

  if (s.model !== undefined && s.model !== m.index) return false

  return true
}

function makeTest (selection, fn) {
  if (selection === null) return false
  if (selection.error) return false

  const n = selection.rules.length
  if (n === 0) return false

  const t = !selection.negate
  const f = !!selection.negate

  const subTests = []
  for (let i = 0; i < n; ++i) {
    const s = selection.rules[ i ]
    if (s.hasOwnProperty('operator')) {
      subTests[ i ] = makeTest(s, fn)
    }
  }

  // ( x and y ) can short circuit on false
  // ( x or y ) can short circuit on true
  // not ( x and y )

  return function test (entity) {
    const and = selection.operator === 'AND'
    let na = false

    for (let i = 0; i < n; ++i) {
      const s = selection.rules[ i ]
      let ret

      if (s.hasOwnProperty('operator')) {
        if (subTests[ i ]) {
          ret = subTests[ i ](entity)
        } else {
          ret = -1
        }

        if (ret === -1) {
          na = true
          continue
        } else if (ret === true) {
          if (and) { continue } else { return t }
        } else {
          if (and) { return f } else { continue }
        }
      } else {
        if (s.keyword === kwd.ALL) {
          if (and) { continue } else { return t }
        }

        ret = fn(entity, s)

        // console.log( entity.qualifiedName(), ret, s, selection.negate, "t", t, "f", f )

        if (ret === -1) {
          na = true
          continue
        } else if (ret === true) {
          if (and) { continue } else { return t }
        } else {
          if (and) { return f } else { continue }
        }
      }
    }

    if (na) {
      return -1
    } else {
      if (and) { return t } else { return f }
    }
  }
}

function filter (selection, fn) {
  if (selection.error) return selection

  const n = selection.rules.length
  if (n === 0) return selection

  const filtered = {
    operator: selection.operator,
    rules: []
  }
  if (selection.hasOwnProperty('negate')) {
    filtered.negate = selection.negate
  }

  for (let i = 0; i < n; ++i) {
    const s = selection.rules[ i ]
    if (s.hasOwnProperty('operator')) {
      const fs = filter(s, fn)
      if (fs !== null) filtered.rules.push(fs)
    } else if (!fn(s)) {
      filtered.rules.push(s)
    }
  }

  if (filtered.rules.length > 0) {
    // TODO maybe the filtered rules could be returned
    // in some case, but the way how tests are applied
    // e.g. when traversing a structure would also need
    // to change
    return selection
    // return filtered;
  } else {
    return null
  }
}

function makeAtomTest (selection, atomOnly) {
  if (atomOnly) {
    selection = filter(selection, function (s) {
      if (s.keyword !== undefined && !AtomOnlyKeywords.includes(s.keyword)) return true
      if (s.model !== undefined) return true
      if (s.chainname !== undefined) return true
      if (s.resname !== undefined) return true
      if (s.resno !== undefined) return true
      if (s.sstruc !== undefined) return true
      return false
    })
  }
  return makeTest(selection, atomTestFn)
}

function makeResidueTest (selection, residueOnly) {
  if (residueOnly) {
    selection = filter(selection, function (s) {
      if (s.keyword !== undefined && AtomOnlyKeywords.includes(s.keyword)) return true
      if (s.model !== undefined) return true
      if (s.chainname !== undefined) return true
      if (s.atomname !== undefined) return true
      if (s.element !== undefined) return true
      if (s.altloc !== undefined) return true
      return false
    })
  }
  return makeTest(selection, residueTestFn)
}

function makeChainTest (selection, chainOnly) {
  if (chainOnly) {
    selection = filter(selection, function (s) {
      if (s.keyword !== undefined && !ChainKeywords.includes(s.keyword)) return true
      // if( s.model!==undefined ) return true;
      if (s.resname !== undefined) return true
      if (s.resno !== undefined) return true
      if (s.atomname !== undefined) return true
      if (s.element !== undefined) return true
      if (s.altloc !== undefined) return true
      if (s.sstruc !== undefined) return true
      if (s.inscode !== undefined) return true
      return false
    })
  }
  return makeTest(selection, chainTestFn)
}

function makeModelTest (selection, modelOnly) {
  if (modelOnly) {
    selection = filter(selection, function (s) {
      if (s.keyword !== undefined) return true
      if (s.chainname !== undefined) return true
      if (s.resname !== undefined) return true
      if (s.resno !== undefined) return true
      if (s.atomname !== undefined) return true
      if (s.element !== undefined) return true
      if (s.altloc !== undefined) return true
      if (s.sstruc !== undefined) return true
      if (s.inscode !== undefined) return true
      return false
    })
  }
  return makeTest(selection, modelTestFn)
}

export {
  makeAtomTest,
  makeResidueTest,
  makeChainTest,
  makeModelTest
}
