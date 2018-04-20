/**
 * @file Valence Model
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

/**
 * Reworked ValenceModel
 *
 * TODO:
 *   Ensure proper treatment of disorder/models. e.g. V257 N in 5vim
 *   Formal charge of 255 for SO4 anion (e.g. 5ghl)
 *   Have removed a lot of explicit features (as I think they're more
 *   generally captured by better VM).
 *     Could we instead have a "delocalised negative/positive" charge
 *     feature and flag these up?
 *
 */
import { Data } from '../structure/data'
import AtomProxy from '../proxy/atom-proxy'
import { AtomGeometry, assignGeometry } from './geometry'
import { Elements } from '../structure/structure-constants'

/**
 * Are we involved in some kind of pi system. Either explicitly forming
 * double bond or N, O next to a double bond, except:
 *
 *   N,O with degree 4 cannot be conjugated.
 *   N,O adjacent to P=O or S=O do not qualify (keeps sulfonamide N sp3 geom)
 */
function isConjugated (a: AtomProxy) {
  const _bp = a.structure.getBondProxy()
  const atomicNumber = a.number
  const hetero = atomicNumber === Elements.O || atomicNumber === Elements.N

  if (hetero && a.bondCount === 4) {
    return false
  }

  let flag = false

  a.eachBond(b => {
    if (b.bondOrder > 1) {
      flag = true
      return
    }
    if (hetero) {
      const a2 = b.getOtherAtom(a)

      a2.eachBond(b2 => {
        if (b2.bondOrder > 1) {
          const atomicNumber2 = a2.number
          if (
            (atomicNumber2 === Elements.P || atomicNumber2 === Elements.S) &&
            b2.getOtherAtom(a2).number === Elements.O
          ) {
            return
          }
          flag = true
        }
      }, _bp) // Avoid reuse of structure._bp
    }
  })

  return flag
}

/* function hasExplicitCharge(r: ResidueProxy) {
  let flag = false
  r.eachAtom(a => {
    if (a.formalCharge != null && a.formalCharge !== 0) flag = true
  })
  return flag
}

function hasExplicitHydrogen(r: ResidueProxy) {
  let flag = false
  r.eachAtom(a => {
    if (a.number === Elements.H) flag = true
  })
  return flag
} */

export function explicitValence (a: AtomProxy) {
  let v = 0
  a.eachBond(b => v += b.bondOrder)
  return v
}

/**
 * Attempts to produce a consistent charge and implicit
 * H-count for an atom.
 *
 * If both params.assignCharge and params.assignH, this
 * approximately followsthe rules described in
 * https://docs.eyesopen.com/toolkits/python/oechemtk/valence.html#openeye-hydrogen-count-model
 *
 * If only charge or hydrogens are to be assigned it takes
 * a much simpler view and deduces one from the other
 *
 * @param {AtomProxy}           a      Atom to analyze
 * @param {assignChargeHParams} params What to assign
 */
export function calculateHydrogensCharge (a: AtomProxy, params: ValenceModelParams) {
  const hydrogenCount = a.bondToElementCount(Elements.H)
  let charge = a.formalCharge || 0

  const assignCharge = (params.assignCharge === 'always' ||
    (params.assignCharge === 'auto' && charge === 0))
  const assignH = (params.assignH === 'always' ||
    (params.assignH === 'auto' && hydrogenCount === 0))

  const degree = a.bondCount
  const valence = explicitValence(a)

  const conjugated = isConjugated(a)
  const multiBond = (valence - degree > 0)


  let implicitHCount = 0
  let geom = AtomGeometry.Unknown

  switch (a.number) {
    case Elements.H:
      if (assignCharge){
        if (degree === 0){
          charge = 1
          geom = AtomGeometry.Spherical
        } else if (degree === 1) {
          charge = 0
          geom = AtomGeometry.Terminal
        }
      }
      break

    case Elements.C:
      // TODO: Isocyanide?
      if (assignCharge) {
        charge = 0 // Assume carbon always neutral
      }
      if (assignH) {
        // Carbocation/carbanion are 3-valent
        implicitHCount = Math.max(0, 4 - valence - Math.abs(charge))
      }
      // Carbocation is planar, carbanion is tetrahedral
      geom = assignGeometry(degree + implicitHCount + Math.max(0, -charge))
      break

    case Elements.N:
      if (assignCharge) {
        if (!assignH) { // Trust input H explicitly:
          charge = valence - 3
        } else if (conjugated && valence < 4) {
          // Neutral unless amidine/guanidine double-bonded N:
          if (degree - hydrogenCount === 1 && valence - hydrogenCount === 2) {
            charge = 1
          } else {
            charge = 0
          }
        } else {
          // Sulfonamide nitrogen and classed as sp3 in conjugation model but
          // they won't be charged
          // Don't assign charge to nitrogens bound to metals
          let flag = false
          a.eachBondedAtom(ba => {
            if (ba.number === Elements.S || ba.isMetal()) flag = true
          })
          if (flag) charge = 0
          else charge = 1
          // TODO: Planarity sanity check?
        }

      }

      if (assignH) {
        // NH4+ -> 4, 1' amide -> 2, nitro N/N+ depiction -> 0
        implicitHCount = Math.max(0, 3 - valence + charge)
      }

      if (conjugated && !multiBond) {
        // Amide, anilinic N etc. cannot consider lone-pair for geometry purposes
        // Anilinic N geometry is depenent on ring electronics, for our purposes we
        // assume it's trigonal!
        geom = assignGeometry(degree + implicitHCount - charge)
      } else {
        // Everything else, pyridine, amine, nitrile, lp plays normal role:
        geom = assignGeometry(degree + implicitHCount + 1 - charge)
      }
      break

    case Elements.O:
      if (assignCharge) {
        if (!assignH) {
          charge = valence - 2 //
        }
        if (valence === 1) {
          a.eachBondedAtom(ba => {
            ba.eachBond(b => {
              const oa = b.getOtherAtom(ba)
              if (oa.index !== a.index && oa.number === Elements.O && b.bondOrder === 2){
                charge = -1
              }
            })
          })
        }
      }
      if (assignH) {
        // ethanol -> 1, carboxylate -> -1
        implicitHCount = Math.max(0, 2 - valence + charge)
      }
      if (conjugated && !multiBond){
        // carboxylate OH, phenol OH, one lone-pair taken up with conjugation
        geom = assignGeometry(degree + implicitHCount - charge + 1)
      } else {
        // Carbonyl (trigonal)
        geom = assignGeometry(degree + implicitHCount - charge + 2)
      }
      break

    // Only handles thiols/thiolates/thioether/sulfonium. Sulfoxides and higher
    // oxidiation states are assumed neutral S (charge carried on O if required)
    case Elements.S:
      if (assignCharge) {
        if (!assignH) {
          if (valence <= 3 && !a.bondToElementCount(Elements.O)) {
            charge = valence - 2 // e.g. explicitly deprotonated thiol
          } else {
            charge = 0
          }
        }
      }
      if (assignH){
        if (valence < 2){
          implicitHCount = Math.max(0, 2 - valence + charge)
        }
      }
      if (valence <= 3){
        // Thiol, thiolate, tioether -> tetrahedral
        geom = assignGeometry(degree + implicitHCount - charge + 2)
      }

      break

    case Elements.F:
    case Elements.CL:
    case Elements.BR:
    case Elements.I:
    case Elements.AT:
      // Never implicitly protonate halides
      if (assignCharge) {
        charge = valence - 1
      }
      break

    case Elements.LI:
    case Elements.NA:
    case Elements.K:
    case Elements.RB:
    case Elements.CS:
    case Elements.FR:
      if (assignCharge) {
        charge = 1 - valence
      }
      break

    case Elements.BE:
    case Elements.MG:
    case Elements.CA:
    case Elements.SR:
    case Elements.BA:
    case Elements.RA:
      if (assignCharge) {
        charge = 2 - valence
      }
      break

    default:
      console.warn('Requested charge, protonation for an unhandled element', a.element)
  }

  return [ charge, implicitHCount, implicitHCount + hydrogenCount, geom ]
}


export interface ValenceModel {
  charge: Int8Array,
  implicitH: Int8Array,
  totalH: Int8Array,
  idealGeometry: Int8Array
}

export interface ValenceModelParams {
  assignCharge: string,
  assignH: string
}

export function ValenceModel (data: Data, params: ValenceModelParams) {
  const structure = data.structure
  const n = structure.atomCount

  const charge = new Int8Array(n)
  const implicitH = new Int8Array(n)
  const totalH = new Int8Array(n)
  const idealGeometry = new Int8Array(n)

  structure.eachAtom(a => {
    const i = a.index
    const [ chg, implH, totH, geom ] = calculateHydrogensCharge(a, params)
    charge[ i ] = chg
    implicitH[ i ] = implH
    totalH[ i ] = totH
    idealGeometry[ i ] = geom
  })

  return { charge, implicitH, totalH, idealGeometry }
}