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

// Changed numbering so they're mostly inline with coordination number
// from VSEPR
export const enum AtomGeometry {
  Spherical = 0,
  Terminal = 1,
  Linear = 2,
  Trigonal = 3,
  Tetrahedral = 4,
  TrigonalBiPyramidal = 5,
  Octahedral = 6,
  SquarePlanar = 7, // Okay, it breaks down somewhere!
  Unknown = 8
}


function assignGeometry(totalCoordination: number): AtomGeometry {
  switch(totalCoordination){
    case 0:
      return AtomGeometry.Spherical
    case 1:
      return AtomGeometry.Terminal
    case 2:
      return AtomGeometry.Linear
    case 3:
      return AtomGeometry.Trigonal
    case 4:
      return AtomGeometry.Tetrahedral
    default:
      return AtomGeometry.Unknown
  }
}

/**
 * Are we involved in some kind of pi system. Either explicitly forming
 * double bond or N, O next to a double bond, except:
 *
 *   N,O with degree 4 cannot be conjugated.
 *   N,O adjacent to P=O or S=O do not qualify
 */
function isConjugated(a: AtomProxy) {
  const _bp = a.structure.getBondProxy()
  const atomicNumber = a.number
  const hetero = atomicNumber === 7 || atomicNumber === 8  // O, N

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
            (atomicNumber2 === 15 || atomicNumber2 === 16) && // P, S
            b2.getOtherAtom(a2).number === 8  // O
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
    if (a.number === 1) flag = true
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
export function calculateHydrogensCharge(a: AtomProxy,
  params: ValenceModelParams) {
  const _ap = a.structure.getAtomProxy() // Avoid reuse of structure._ap
  // const { assignCharge, assignH } = params

  const hydrogenCount = a.bondToElementCount('H', _ap)
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
    // H
    case 1:
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
    // C
    case 6:
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

    // N
    case 7:
      if (assignCharge) {
        if (!assignH) { // Trust input H explicitly:
          charge = valence - 3
        } else if (conjugated && valence < 4) {
           charge = 0
        }
        else {
          charge = 1
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


    // O
    case 8:
      if (assignCharge) {
        if (!assignH) {
          charge = valence - 2 //
        }
        if (valence === 1) {
          a.eachBondedAtom(ba => {
            ba.eachBond(b => {
              const oa = b.getOtherAtom(ba)
              if (oa.index !== a.index && oa.number === 8 && b.bondOrder === 2){
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
    case 16:
      if (assignCharge) {
        if (!assignH) {
          if (valence <= 3 && !a.bondToElementCount('O', _ap)) {
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

    // F, Cl, Br, I, At
    case 9:
    case 17:
    case 35:
    case 53:
    case 85:
      // Never implicitly protonate halides
      if (assignCharge) {
        charge = valence - 1
      }
      break

    // Li, Na, K, Rb, Cs Fr
    case 3:
    case 11:
    case 19:
    case 37:
    case 55:
    case 87:
      if (assignCharge) {
        charge = 1 - valence
      }
      break

    // Be, Mg, Ca, Sr, Ba, Ra
    case 4:
    case 12:
    case 20:
    case 38:
    case 56:
    case 88:
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