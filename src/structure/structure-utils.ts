/**
 * @file Structure Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3, Matrix4 } from 'three'

import { Debug, Log } from '../globals'
import { binarySearchIndexOf } from '../utils'
import Helixbundle from '../geometry/helixbundle'
import Kdtree from '../geometry/kdtree'
import { getSymmetryOperations } from '../symmetry/symmetry-utils'
import Assembly from '../symmetry/assembly'
import Structure from '../structure/structure'
import StructureBuilder from '../structure/structure-builder'
import Polymer from '../proxy/polymer'
import ResidueProxy from '../proxy/residue-proxy'

import { UnknownBackboneType, AA3, Bases } from './structure-constants'

export function reorderAtoms (structure: Structure) {
  if (Debug) Log.time('reorderAtoms')

  var ap1 = structure.getAtomProxy()
  var ap2 = structure.getAtomProxy()

  function compareModelChainResno (index1: number, index2: number) {
    ap1.index = index1
    ap2.index = index2
    if (ap1.modelIndex < ap2.modelIndex) {
      return -1
    } else if (ap1.modelIndex > ap2.modelIndex) {
      return 1
    } else {
      if (ap1.chainname < ap2.chainname) {
        return -1
      } else if (ap1.chainname > ap2.chainname) {
        return 1
      } else {
        if (ap1.resno < ap2.resno) {
          return -1
        } else if (ap1.resno > ap2.resno) {
          return 1
        } else {
          return 0
        }
      }
    }
  }

  structure.atomStore.sort(compareModelChainResno)

  if (Debug) Log.timeEnd('reorderAtoms')
}

export interface SecStruct {
  helices: [string, number, string, string, number, string, number][]
  sheets: [string, number, string, string, number, string][]
}

export function assignSecondaryStructure (structure: Structure, secStruct: SecStruct) {
  if (!secStruct) return

  if (Debug) Log.time('assignSecondaryStructure')

  const chainnames: string[] = []
  structure.eachModel(function (mp) {
    mp.eachChain(function (cp) {
      chainnames.push(cp.chainname)
    })
  })

  const chainnamesSorted = chainnames.slice().sort()
  const chainnamesIndex: number[] = []
  chainnamesSorted.forEach(function (c) {
    chainnamesIndex.push(chainnames.indexOf(c))
  })

    // helix assignment

  const helices = secStruct.helices.filter(function (h) {
    return binarySearchIndexOf(chainnamesSorted, h[ 0 ]) >= 0
  })

  helices.sort(function (h1, h2) {
    const c1 = h1[ 0 ]
    const c2 = h2[ 0 ]
    const r1 = h1[ 1 ]
    const r2 = h2[ 1 ]

    if (c1 === c2) {
      if (r1 === r2) {
        return 0
      } else {
        return r1 < r2 ? -1 : 1
      }
    } else {
      const idx1 = binarySearchIndexOf(chainnamesSorted, c1)
      const idx2 = binarySearchIndexOf(chainnamesSorted, c2)
      return chainnamesIndex[ idx1 ] < chainnamesIndex[ idx2 ] ? -1 : 1
    }
  })

  const residueStore = structure.residueStore

  structure.eachModel(function (mp) {
    let i = 0
    const n = helices.length
    if (n === 0) return
    let helix = helices[ i ]
    let helixRun = false
    let done = false

    mp.eachChain(function (cp) {
      let chainChange = false

      if (cp.chainname === helix[ 0 ]) {
        const count = cp.residueCount
        const offset = cp.residueOffset
        const end = offset + count

        for (let j = offset; j < end; ++j) {
          if (residueStore.resno[ j ] === helix[ 1 ] &&  // resnoBeg
              residueStore.getInscode(j) === helix[ 2 ]   // inscodeBeg
          ) {
            helixRun = true
          }

          if (helixRun) {
            residueStore.sstruc[ j ] = helix[ 6 ]

            if (residueStore.resno[ j ] === helix[ 4 ] &&  // resnoEnd
                residueStore.getInscode(j) === helix[ 5 ]   // inscodeEnd
            ) {
              helixRun = false
              i += 1

              if (i < n) {
                // must look at previous residues as
                // residues may not be ordered by resno
                j = offset - 1
                helix = helices[ i ]
                chainChange = cp.chainname !== helix[ 0 ]
              } else {
                done = true
              }
            }
          }

          if (chainChange || done) return
        }
      }
    })
  })

    // sheet assignment

  const sheets = secStruct.sheets.filter(function (s) {
    return binarySearchIndexOf(chainnamesSorted, s[ 0 ]) >= 0
  })

  sheets.sort(function (s1, s2) {
    const c1 = s1[ 0 ]
    const c2 = s2[ 0 ]

    if (c1 === c2) return 0
    const idx1 = binarySearchIndexOf(chainnamesSorted, c1)
    const idx2 = binarySearchIndexOf(chainnamesSorted, c2)
    return chainnamesIndex[ idx1 ] < chainnamesIndex[ idx2 ] ? -1 : 1
  })

  const strandCharCode = 'e'.charCodeAt(0)
  structure.eachModel(function (mp) {
    let i = 0
    const n = sheets.length
    if (n === 0) return
    let sheet = sheets[ i ]
    let sheetRun = false
    let done = false

    mp.eachChain(function (cp) {
      let chainChange = false

      if (cp.chainname === sheet[ 0 ]) {
        const count = cp.residueCount
        const offset = cp.residueOffset
        const end = offset + count

        for (let j = offset; j < end; ++j) {
          if (residueStore.resno[ j ] === sheet[ 1 ] &&  // resnoBeg
              residueStore.getInscode(j) === sheet[ 2 ]   // inscodeBeg
          ) {
            sheetRun = true
          }

          if (sheetRun) {
            residueStore.sstruc[ j ] = strandCharCode

            if (residueStore.resno[ j ] === sheet[ 4 ] &&  // resnoEnd
                residueStore.getInscode(j) === sheet[ 5 ]   // inscodeEnd
            ) {
              sheetRun = false
              i += 1

              if (i < n) {
                // must look at previous residues as
                // residues may not be ordered by resno
                j = offset - 1
                sheet = sheets[ i ]
                chainChange = cp.chainname !== sheet[ 0 ]
              } else {
                done = true
              }
            }
          }

          if (chainChange || done) return
        }
      }
    })
  })

  if (Debug) Log.timeEnd('assignSecondaryStructure')
}

export const calculateSecondaryStructure = (function () {
  // Implementation for proteins based on "pv"
  //
  // assigns secondary structure information based on a simple and very fast
  // algorithm published by Zhang and Skolnick in their TM-align paper.
  // Reference:
  //
  // TM-align: a protein structure alignment algorithm based on the Tm-score
  // (2005) NAR, 33(7) 2302-2309

  const zhangSkolnickSS = function (polymer: Polymer, i: number, distances: number[], delta: number) {
    const structure = polymer.structure
    const offset = polymer.residueIndexStart
    const rp1 = structure.getResidueProxy()
    const rp2 = structure.getResidueProxy()
    const ap1 = structure.getAtomProxy()
    const ap2 = structure.getAtomProxy()

    for (let j = Math.max(0, i - 2); j <= i; ++j) {
      for (let k = 2; k < 5; ++k) {
        if (j + k >= polymer.residueCount) {
          continue
        }

        rp1.index = offset + j
        rp2.index = offset + j + k
        ap1.index = rp1.traceAtomIndex
        ap2.index = rp2.traceAtomIndex

        const d = ap1.distanceTo(ap2)

        if (Math.abs(d - distances[ k - 2 ]) > delta) {
          return false
        }
      }
    }

    return true
  }

  const isHelical = function (polymer: Polymer, i: number) {
    const helixDistances = [ 5.45, 5.18, 6.37 ]
    const helixDelta = 2.1
    return zhangSkolnickSS(polymer, i, helixDistances, helixDelta)
  }

  const isSheet = function (polymer: Polymer, i: number) {
    const sheetDistances = [ 6.1, 10.4, 13.0 ]
    const sheetDelta = 1.42
    return zhangSkolnickSS(polymer, i, sheetDistances, sheetDelta)
  }

  const proteinPolymer = function (p: Polymer) {
    const residueStore = p.residueStore
    const offset = p.residueIndexStart
    for (let i = 0, il = p.residueCount; i < il; ++i) {
      let sstruc = 'c'
      if (isHelical(p, i)) {
        sstruc = 'h'
      } else if (isSheet(p, i)) {
        sstruc = 'e'
      }
      residueStore.sstruc[ offset + i ] = sstruc.charCodeAt(0)
    }
  }

  const cgPolymer = function (p: Polymer) {
    const localAngle = 20
    const centerDist = 2.0

    const residueStore = p.residueStore
    const offset = p.residueIndexStart

    const helixbundle = new Helixbundle(p)
    const pos = helixbundle.position

    const c1 = new Vector3()
    const c2 = new Vector3()

    for (let i = 0, il = p.residueCount; i < il; ++i) {
      c1.fromArray(pos.center as any, i * 3)  // TODO
      c2.fromArray(pos.center as any, i * 3 + 3)  // TODO
      const d = c1.distanceTo(c2)

      if (d < centerDist && d > 1.0 && pos.bending[ i ] < localAngle) {
        residueStore.sstruc[ offset + i ] = 'h'.charCodeAt(0)
        residueStore.sstruc[ offset + i + 1 ] = 'h'.charCodeAt(0)
      }
    }
  }

  return function calculateSecondaryStructure (structure: Structure) {
    if (Debug) Log.time('calculateSecondaryStructure')

    structure.eachPolymer(function (p) {
      // assign secondary structure
      if (p.residueCount < 4) return
      if (p.isCg()) {
        cgPolymer(p)
      } else if (p.isProtein()) {
        proteinPolymer(p)
      } else {
        return
      }

      // set lone secondary structure assignments to "c"
      let prevSstruc: string
      let sstrucCount = 0
      p.eachResidue(function (r: ResidueProxy) {
        if (r.sstruc === prevSstruc) {
          sstrucCount += 1
        } else {
          if (sstrucCount === 1) {
            r.index -= 1
            r.sstruc = 'c'
          }
          sstrucCount = 1
          prevSstruc = r.sstruc
        }
      })
    })

    if (Debug) Log.timeEnd('calculateSecondaryStructure')
  }
}())

// const ChainnameAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
//                           "abcdefghijklmnopqrstuvwxyz" +
//                           "0123456789";
const ChainnameAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function getChainname (index: number) {
  const n = ChainnameAlphabet.length
  let j = index
  let k = 0
  let chainname = ChainnameAlphabet[j % n]
  while (j >= n) {
    j = Math.floor(j / n)
    chainname += ChainnameAlphabet[j % n]
    k += 1
  }
  if (k >= 5) {
    Log.warn('chainname overflow')
  }
  return chainname
}

interface ChainData {
  mIndex: number
  chainname: string
  rStart: number
  rCount: number
}

export function calculateChainnames (structure: Structure, useExistingBonds = false) {
  if (Debug) Log.time('calculateChainnames')

  let doAutoChainName = true
  structure.eachChain(function (c) {
    if (c.chainname) doAutoChainName = false
  })

  if (doAutoChainName) {
    const modelStore = structure.modelStore
    const chainStore = structure.chainStore
    const residueStore = structure.residueStore

    const addChain = function (mIndex: number, chainname: string, rOffset: number, rCount: number) {
      const ci = chainStore.count
      for (let i = 0; i < rCount; ++i) {
        residueStore.chainIndex[ rOffset + i ] = ci
      }
      chainStore.growIfFull()
      chainStore.modelIndex[ ci ] = mIndex
      chainStore.setChainname(ci, chainname)
      chainStore.setChainid(ci, chainname)
      chainStore.residueOffset[ ci ] = rOffset
      chainStore.residueCount[ ci ] = rCount
      chainStore.count += 1
      modelStore.chainCount[ mIndex ] += 1
    }

    const ap1 = structure.getAtomProxy()
    const ap2 = structure.getAtomProxy()

    let i = 0
    let mi = 0
    let rStart = 0
    let rEnd = 0
    const chainData: ChainData[] = []

    if (residueStore.count === 1) {
      chainData.push({
        mIndex: 0,
        chainname: 'A',
        rStart: 0,
        rCount: 1
      })
    } else {
      structure.eachResidueN(2, function (rp1: ResidueProxy, rp2: ResidueProxy) {
        let newChain = false

        const bbType1 = rp1.backboneType
        const bbType2 = rp2.backboneType
        const bbTypeUnk = UnknownBackboneType

        rEnd = rp1.index

        if (rp1.modelIndex !== rp2.modelIndex) {
          newChain = true
        } else if (rp1.moleculeType !== rp2.moleculeType) {
          newChain = true
        } else if (bbType1 !== bbTypeUnk && bbType1 === bbType2) {
          ap1.index = rp1.backboneEndAtomIndex
          ap2.index = rp2.backboneStartAtomIndex
          if (useExistingBonds) {
            newChain = !ap1.hasBondTo(ap2)
          } else {
            newChain = !ap1.connectedTo(ap2)
          }
        }

        // current chain goes to end of the structure
        if (!newChain && rp2.index === residueStore.count - 1) {
          newChain = true
          rEnd = rp2.index
        }

        if (newChain) {
          chainData.push({
            mIndex: mi,
            chainname: getChainname(i),
            rStart: rStart,
            rCount: rEnd - rStart + 1
          })

          i += 1

          if (rp1.modelIndex !== rp2.modelIndex) {
            i = 0
            mi += 1
          }

          // new chain for the last residue of the structure
          if (rp2.index === residueStore.count - 1 && rEnd !== rp2.index) {
            chainData.push({
              mIndex: mi,
              chainname: getChainname(i),
              rStart: residueStore.count - 1,
              rCount: 1
            })
          }

          rStart = rp2.index
          rEnd = rp2.index
        }
      })
    }

    //

    chainStore.count = 0
    chainData.forEach(function (d) {
      addChain(d.mIndex, d.chainname, d.rStart, d.rCount)
    })

    let chainOffset = 0
    structure.eachModel(function (mp) {
      modelStore.chainOffset[ mp.index ] = chainOffset
      modelStore.chainCount[ mp.index ] -= 1
      chainOffset += modelStore.chainCount[ mp.index ]
    })
  }

  if (Debug) Log.timeEnd('calculateChainnames')
}

export function calculateBonds (structure: Structure) {
  if (Debug) Log.time('calculateBonds')

  calculateBondsWithin(structure)
  calculateBondsBetween(structure)

  if (Debug) Log.timeEnd('calculateBonds')
}

export interface ResidueBonds {
  atomIndices1: number[]
  atomIndices2: number[]
  bondOrders: number[]
}


const BondOrderTable: { [k: string]: number } = {
  'HIS|CD2|CG': 2,
  'HIS|CE1|ND1': 2,
  'ARG|CZ|NH2': 2,
  'PHE|CE1|CZ': 2,
  'PHE|CD2|CE2': 2,
  'PHE|CD1|CG': 2,
  'TRP|CD1|CG': 2,
  'TRP|CD2|CE2': 2,
  'TRP|CE3|CZ3': 2,
  'TRP|CH2|CZ2': 2,
  'ASN|CG|OD1': 2,
  'GLN|CD|OE1': 2,
  'TYR|CD1|CG': 2,
  'TYR|CD2|CE2': 2,
  'TYR|CE1|CZ': 2,
  'ASP|CG|OD1': 2,
  'GLU|CD|OE1': 2,

  'G|C8|N7': 2,
  'G|C4|C5': 2,
  'G|C2|N3': 2,
  'G|C6|O6': 2,
  'C|C4|N3': 2,
  'C|C5|C6': 2,
  'C|C2|O2': 2,
  'A|C2|N3': 2,
  'A|C6|N1': 2,
  'A|C4|C5': 2,
  'A|C8|N7': 2,
  'U|C5|C6': 2,
  'U|C2|O2': 2,
  'U|C4|O4': 2,

  'DG|C8|N7': 2,
  'DG|C4|C5': 2,
  'DG|C2|N3': 2,
  'DG|C6|O6': 2,
  'DC|C4|N3': 2,
  'DC|C5|C6': 2,
  'DC|C2|O2': 2,
  'DA|C2|N3': 2,
  'DA|C6|N1': 2,
  'DA|C4|C5': 2,
  'DA|C8|N7': 2,
  'DT|C5|C6': 2,
  'DT|C2|O2': 2,
  'DT|C4|O4': 2
}
function getBondOrderFromTable (resname: string, atomname1: string, atomname2: string) {
  [ atomname1, atomname2 ] = atomname1 < atomname2 ? [ atomname1, atomname2 ] : [ atomname2, atomname1 ]
  if (AA3.includes(resname) && atomname1 === 'C' && atomname2 === 'O') return 2
  if (Bases.includes(resname) && atomname1 === 'OP1' && atomname2 === 'P') return 2
  return BondOrderTable[ `${resname}|${atomname1}|${atomname2}` ] || 1
}

export function calculateResidueBonds (r: ResidueProxy) {
  const structure = r.structure
  const a1 = structure.getAtomProxy()
  const a2 = structure.getAtomProxy()

  const count = r.atomCount
  const offset = r.atomOffset
  const end = offset + count
  const end1 = end - 1

  const atomIndices1 = []
  const atomIndices2 = []
  const bondOrders = []

  if (count > 500) {
    if (Debug) Log.warn('more than 500 atoms, skip residue for auto-bonding', r.qualifiedName())
  } else {
    if (count > 50) {
      const kdtree = new Kdtree(r, true)
      const radius = r.isCg() ? 1.2 : 2.3

      for (let i = offset; i < end1; ++i) {
        a1.index = i
        const maxd = a1.covalent + radius + 0.3
        const nearestAtoms = kdtree.nearest(a1 as any, Infinity, maxd * maxd)  // TODO
        const m = nearestAtoms.length
        for (let j = 0; j < m; ++j) {
          a2.index = nearestAtoms[ j ].index
          if (a1.index < a2.index) {
            if (a1.connectedTo(a2)) {
              atomIndices1.push(a1.index - offset)
              atomIndices2.push(a2.index - offset)
              bondOrders.push(getBondOrderFromTable(a1.resname, a1.atomname, a2.atomname))
            }
          }
        }
      }
    } else {
      for (let i = offset; i < end1; ++i) {
        a1.index = i
        for (let j = i + 1; j <= end1; ++j) {
          a2.index = j
          if (a1.connectedTo(a2)) {
            atomIndices1.push(i - offset)
            atomIndices2.push(j - offset)
            bondOrders.push(getBondOrderFromTable(a1.resname, a1.atomname, a2.atomname))
          }
        }
      }
    }
  }

  return {
    atomIndices1: atomIndices1,
    atomIndices2: atomIndices2,
    bondOrders: bondOrders
  }
}

export function calculateAtomBondMap (structure: Structure) {
  if (Debug) Log.time('calculateAtomBondMap')

  var atomBondMap: number[][] = []

  structure.eachBond(function (bp) {
    var ai1 = bp.atomIndex1
    var ai2 = bp.atomIndex2
    if (atomBondMap[ ai1 ] === undefined) atomBondMap[ ai1 ] = []
    atomBondMap[ ai1 ][ ai2 ] = bp.index
  })

  if (Debug) Log.timeEnd('calculateAtomBondMap')

  return atomBondMap
}

export function calculateBondsWithin (structure: Structure, onlyAddRung = false) {
  if (Debug) Log.time('calculateBondsWithin')

  const bondStore = structure.bondStore
  const rungBondStore = structure.rungBondStore
  const rungAtomSet = structure.getAtomSet(false)
  const a1 = structure.getAtomProxy()
  const a2 = structure.getAtomProxy()
  const bp = structure.getBondProxy()
  const atomBondMap = onlyAddRung ? null : calculateAtomBondMap(structure)

  structure.eachResidue(function (r) {
    if (!onlyAddRung && atomBondMap) {
      const count = r.atomCount
      const offset = r.atomOffset

      if (count > 500) {
        Log.warn('more than 500 atoms, skip residue for auto-bonding', r.qualifiedName())
        return
      }

      const bonds = r.getBonds()
      const atomIndices1 = bonds.atomIndices1
      const atomIndices2 = bonds.atomIndices2
      const bondOrders = bonds.bondOrders
      const nn = atomIndices1.length

      for (let i = 0; i < nn; ++i) {
        const rai1 = atomIndices1[ i ]
        const rai2 = atomIndices2[ i ]
        const ai1 = rai1 + offset
        const ai2 = rai2 + offset
        const tmp = atomBondMap[ ai1 ]
        if (tmp !== undefined && tmp[ ai2 ] !== undefined) {
          bp.index = tmp[ ai2 ]
          const residueTypeBondIndex = r.residueType.getBondIndex(rai1, rai2)!  // TODO
          // overwrite residueType bondOrder with value from existing bond
          bondOrders[ residueTypeBondIndex ] = bp.bondOrder
        } else {
          a1.index = ai1
          a2.index = ai2
          // only add bond if not already in bondStore
          bondStore.addBond(a1, a2, bondOrders[ i ])
        }
      }
    }

    // get RNA/DNA rung pseudo bonds
    const traceAtomIndex = r.residueType.traceAtomIndex
    const rungEndAtomIndex = r.residueType.rungEndAtomIndex
    if (traceAtomIndex !== -1 && rungEndAtomIndex !== -1) {
      a1.index = r.traceAtomIndex
      a2.index = r.rungEndAtomIndex
      rungBondStore.addBond(a1, a2)
      rungAtomSet.set(a1.index)
      rungAtomSet.set(a2.index)
    }
  })

  structure.atomSetDict.rung = rungAtomSet

  if (Debug) Log.timeEnd('calculateBondsWithin')
}

export function calculateBondsBetween (structure: Structure, onlyAddBackbone = false, useExistingBonds = false) {
  if (Debug) Log.time('calculateBondsBetween')

  const bondStore = structure.bondStore
  const backboneBondStore = structure.backboneBondStore
  const backboneAtomSet = structure.getAtomSet(false)
  const ap1 = structure.getAtomProxy()
  const ap2 = structure.getAtomProxy()

  if (backboneBondStore.count === 0) {
    backboneBondStore.resize(structure.residueStore.count)
  }

  function addBondIfConnected (rp1: ResidueProxy, rp2: ResidueProxy) {
    const bbType1 = rp1.backboneType
    const bbType2 = rp2.backboneType
    if (bbType1 !== UnknownBackboneType && bbType1 === bbType2) {
      ap1.index = rp1.backboneEndAtomIndex
      ap2.index = rp2.backboneStartAtomIndex
      if ((useExistingBonds && ap1.hasBondTo(ap2)) || ap1.connectedTo(ap2)) {
        if (!onlyAddBackbone) {
          bondStore.addBond(ap1, ap2, 1)  // assume single bond
        }
        ap1.index = rp1.traceAtomIndex
        ap2.index = rp2.traceAtomIndex
        backboneBondStore.addBond(ap1, ap2)
        backboneAtomSet.set(ap1.index)
        backboneAtomSet.set(ap2.index)
      }
    }
  }

  structure.eachResidueN(2, addBondIfConnected)

  const rp1 = structure.getResidueProxy()
  const rp2 = structure.getResidueProxy()

  // check for cyclic chains
  structure.eachChain(function (cp) {
    if (cp.residueCount === 0) return
    rp1.index = cp.residueOffset
    rp2.index = cp.residueOffset + cp.residueCount - 1
    addBondIfConnected(rp2, rp1)
  })

  structure.atomSetDict.backbone = backboneAtomSet

  if (!onlyAddBackbone) {
    if (Debug) Log.time('calculateBondsBetween inter')
    const spatialHash = structure.spatialHash
    structure.eachResidue(function (rp) {
      if (rp.backboneType === UnknownBackboneType && !rp.isWater()) {
        rp.eachAtom(function (ap) {
          if (ap.isMetal()) return
          spatialHash!.eachWithin(ap.x, ap.y, ap.z, 4, function (idx) {  // TODO
            ap2.index = idx
            if (ap.modelIndex === ap2.modelIndex &&
                ap.residueIndex !== ap2.residueIndex &&
                !ap2.isMetal()
            ) {
              bondStore.addBondIfConnected(ap, ap2, 1)  // assume single bond
            }
          })
        })
      }
    })
    if (Debug) Log.timeEnd('calculateBondsBetween inter')
  }

  if (Debug) Log.timeEnd('calculateBondsBetween')
}

export function buildUnitcellAssembly (structure: Structure) {
  if (!structure.unitcell) return

  if (Debug) Log.time('buildUnitcellAssembly')

  const uc = structure.unitcell

  const structureCenterFrac = structure.center.clone().applyMatrix4(uc.cartToFrac)
  const centerFrac = structureCenterFrac.clone().floor()
  const symopDict: { [K: string]: Matrix4 } = getSymmetryOperations(uc.spacegroup)

  const centerFracSymop = new Vector3()
  const positionFracSymop = new Vector3()

  function getMatrixList (shift?: Vector3) {
    const matrixList: Matrix4[] = []

    Object.keys(symopDict).forEach(function (name) {
      const m = symopDict[ name ].clone()

      centerFracSymop.copy(structureCenterFrac).applyMatrix4(m).floor()
      positionFracSymop.setFromMatrixPosition(m)
      positionFracSymop.sub(centerFracSymop)
      positionFracSymop.add(centerFrac)

      if (shift) positionFracSymop.add(shift)

      m.setPosition(positionFracSymop)
      m.multiplyMatrices(uc.fracToCart, m)
      m.multiply(uc.cartToFrac)

      matrixList.push(m)
    })

    return matrixList
  }

  const unitcellAssembly = new Assembly('UNITCELL')
  const unitcellMatrixList = getMatrixList()
  const ncsMatrixList: Matrix4[] = []
  if (structure.biomolDict.NCS) {
    ncsMatrixList.push(
      new Matrix4(), ...structure.biomolDict.NCS.partList[ 0 ].matrixList
    )
    const ncsUnitcellMatrixList: Matrix4[] = []
    unitcellMatrixList.forEach(sm => {
      ncsMatrixList.forEach(nm => {
        ncsUnitcellMatrixList.push(sm.clone().multiply(nm))
      })
    })
    unitcellAssembly.addPart(ncsUnitcellMatrixList)
  } else {
    unitcellAssembly.addPart(unitcellMatrixList)
  }

  const vec = new Vector3()
  const supercellAssembly = new Assembly('SUPERCELL')
  const supercellMatrixList = Array.prototype.concat.call(
    getMatrixList(vec.set(1, 0, 0)),  // 655
    getMatrixList(vec.set(0, 1, 0)),  // 565
    getMatrixList(vec.set(0, 0, 1)),  // 556

    getMatrixList(vec.set(-1, 0, 0)),  // 455
    getMatrixList(vec.set(0, -1, 0)),  // 545
    getMatrixList(vec.set(0, 0, -1)),  // 554

    getMatrixList(vec.set(1, 1, 0)),  // 665
    getMatrixList(vec.set(1, 0, 1)),  // 656
    getMatrixList(vec.set(0, 1, 1)),  // 566

    getMatrixList(vec.set(-1, -1, 0)),  // 445
    getMatrixList(vec.set(-1, 0, -1)),  // 454
    getMatrixList(vec.set(0, -1, -1)),  // 544

    getMatrixList(vec.set(1, -1, -1)),  // 644
    getMatrixList(vec.set(1, 1, -1)),  // 664
    getMatrixList(vec.set(1, -1, 1)),  // 646
    getMatrixList(vec.set(-1, 1, 1)),  // 466
    getMatrixList(vec.set(-1, -1, 1)),  // 446
    getMatrixList(vec.set(-1, 1, -1)),  // 464

    getMatrixList(vec.set(0, 1, -1)),  // 564
    getMatrixList(vec.set(0, -1, 1)),  // 546
    getMatrixList(vec.set(1, 0, -1)),  // 654
    getMatrixList(vec.set(-1, 0, 1)),  // 456
    getMatrixList(vec.set(1, -1, 0)),  // 645
    getMatrixList(vec.set(-1, 1, 0)),  // 465

    getMatrixList(),  // 555
    getMatrixList(vec.set(1, 1, 1)),  // 666
    getMatrixList(vec.set(-1, -1, -1))   // 444
  )
  if (structure.biomolDict.NCS) {
    const ncsSupercellMatrixList: Matrix4[] = []
    supercellMatrixList.forEach(function (sm: Matrix4) {
      ncsMatrixList.forEach(function (nm) {
        ncsSupercellMatrixList.push(sm.clone().multiply(nm))
      })
    })
    supercellAssembly.addPart(ncsSupercellMatrixList)
  } else {
    supercellAssembly.addPart(supercellMatrixList)
  }

  structure.biomolDict.UNITCELL = unitcellAssembly
  structure.biomolDict.SUPERCELL = supercellAssembly

  if (Debug) Log.timeEnd('buildUnitcellAssembly')
}

const elm1 = [ 'H', 'C', 'O', 'N', 'S', 'P' ]
const elm2 = [ 'NA', 'CL', 'FE' ]

export function guessElement (atomName: string) {
  let at = atomName.trim().toUpperCase()
  // parseInt('C') -> NaN; (NaN > -1) -> false
  if (parseInt(at.charAt(0)) > -1) at = at.substr(1)
    // parse again to check for a second integer
  if (parseInt(at.charAt(0)) > -1) at = at.substr(1)
  const n = at.length

  if (n === 0) return ''
  if (n === 1) return at
  if (n === 2) {
    if (elm2.indexOf(at) !== -1) return at
    if (elm1.indexOf(at[0]) !== -1) return at[0]
  }
  if (n >= 3) {
    if (elm1.indexOf(at[0]) !== -1) return at[0]
  }
  return ''
}

/**
 * Assigns ResidueType bonds.
 * @param {Structure} structure - the structure object
 * @return {undefined}
 */
export function assignResidueTypeBonds (structure: Structure) {
  // if( Debug ) Log.time( "assignResidueTypeBonds" )

  const bondHash = structure.bondHash!  // TODO
  const countArray = bondHash.countArray
  const offsetArray = bondHash.offsetArray
  const indexArray = bondHash.indexArray
  const bp = structure.getBondProxy()

  structure.eachResidue(function (rp) {
    const residueType = rp.residueType
    if (residueType.bonds !== undefined) return

    var atomOffset = rp.atomOffset
    var atomIndices1: number[] = []
    var atomIndices2: number[] = []
    var bondOrders: number[] = []
    var bondDict: { [k: string]: boolean } = {}

    const nextAtomOffset = atomOffset + rp.atomCount

    rp.eachAtom(function (ap) {
      const index = ap.index
      const offset = offsetArray[ index ]
      const count = countArray[ index ]
      for (let i = 0, il = count; i < il; ++i) {
        bp.index = indexArray[ offset + i ]
        let idx1 = bp.atomIndex1
        if (idx1 < atomOffset || idx1 >= nextAtomOffset) {
          // Don't add bonds outside of this resiude
          continue
        }
        let idx2 = bp.atomIndex2
        if (idx2 < atomOffset || idx2 >= nextAtomOffset) {
          continue
        }

        if (idx1 > idx2) {
          const tmp = idx2
          idx2 = idx1
          idx1 = tmp
        }
        const hash = idx1 + '|' + idx2
        if (bondDict[ hash ] === undefined) {
          bondDict[ hash ] = true
          atomIndices1.push(idx1 - atomOffset)
          atomIndices2.push(idx2 - atomOffset)
          bondOrders.push(bp.bondOrder)
        }
      }
    })

    residueType.bonds = {
      atomIndices1: atomIndices1,
      atomIndices2: atomIndices2,
      bondOrders: bondOrders
    }
  })

  // if( Debug ) Log.timeEnd( "assignResidueTypeBonds" )
}

export function concatStructures (name: string, ...structures: Structure[]) {
  if( Debug ) Log.time( "concatStructures" )

  const s = new Structure(name, '')
  const sb = new StructureBuilder(s)

  const atomStore = s.atomStore as any
  const atomMap = s.atomMap
  atomStore.addField('formalCharge', 1, 'int8')
  atomStore.addField('partialCharge', 1, 'float32')

  const atomIndexDict: { [k: number]: number } = {}

  let idx = 0
  let atomCount = 0
  let modelCount = 0
  structures.forEach(structure => {
    structure.eachAtom(a => {
      atomStore.growIfFull()
      atomStore.atomTypeId[ idx ] = atomMap.add(a.atomname, a.element)

      atomStore.x[ idx ] = a.x
      atomStore.y[ idx ] = a.y
      atomStore.z[ idx ] = a.z
      atomStore.serial[ idx ] = a.serial
      atomStore.formalCharge[ idx ] = a.formalCharge
      atomStore.partialCharge[ idx ] = a.partialCharge
      atomStore.altloc[ idx ] = a.altloc
      atomStore.occupancy[ idx ] = a.occupancy
      atomStore.bfactor[ idx ] = a.bfactor

      sb.addAtom(
        a.modelIndex + modelCount,
        a.chainname,
        a.chainid,
        a.resname,
        a.resno,
        a.hetero === 1,
        a.sstruc,
        a.inscode
      )

      atomIndexDict[a.index + atomCount] = idx
      idx += 1
    })
    atomCount += structure.atomStore.count
    modelCount += structure.modelStore.count
  })

  const bondStore = s.bondStore
  const a1 = s.getAtomProxy()
  const a2 = s.getAtomProxy()

  atomCount = 0
  structures.forEach(structure => {
    structure.eachBond(b => {
      a1.index = atomIndexDict[ b.atomIndex1 + atomCount ]
      a2.index = atomIndexDict[ b.atomIndex2 + atomCount ]
      bondStore.addBond(a1, a2, b.bondOrder)
    })
    atomCount += structure.atomStore.count
  })

  sb.finalize()

  calculateBondsBetween(s, true)  // calculate backbone bonds
  calculateBondsWithin(s, true)  // calculate rung bonds

  s.finalizeAtoms()
  s.finalizeBonds()
  assignResidueTypeBonds(s)

  if( Debug ) Log.timeEnd( "concatStructures" )

  return s
}
