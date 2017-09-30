/**
 * @file Valence Model
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import { Data } from '../structure/data'
import AtomProxy from '../proxy/atom-proxy'
import { hasPolarNeighbour } from './functional-groups'

export const enum AtomGeometry {
  Unknown = 0,
  Spherical = 1,
  Terminal = 2,
  Linear = 3,
  Trigonal = 4,
  Tetrahedral = 5,
  SquarePlanar = 6
}

/**
 * Probably over-simplisitic VSEPR style geometry, limited to tetrahedral or lower
 */
function octetGeometry (degree: number, valence: number, ideal: number, lonepairs: number) {
  const degreePlusLP = degree + Math.max(ideal - valence, 0) + lonepairs;

  switch (degreePlusLP) {
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
 * double bond or a hetero next to a double bond
 *
 * This will return true for some non-conjugated systems (N of sulfonamide)
 * so a TODO is to work out some special cases, or rules for detecting these
 * oddities
 */
function isConjugated(a: AtomProxy) {
  const atomicNumber = a.number
  const hetero = atomicNumber === 7 || atomicNumber === 8  // O, N

  let flag = false

  a.eachBond(b => {
    if (b.bondOrder > 1) {
      return true
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
      })
    }
  })

  return flag
}

/**
 * Based on the OpenEye Charge model, with some modifications Default charge
 * is 0, unless our rules match some other situation. This doesn't require
 * full protonation to have taken place
 *
 * https://docs.eyesopen.com/toolkits/python/oechemtk/valence.html
 * */
export function calculateImplicitCharge (a: AtomProxy) {
  const degree = a.bondCount
  const valence = explicitValence(a)

  let charge = 0

  switch (a.number) {
    case 1:  // H
      if (valence == 0) {
        charge = 1
      }
      break

    case 5:  // B
      if (valence == 4) {
        charge = -1;
      }
      break;

    case 6:  // C
      if (valence === 3) {
        if (degree === 1) {
          if (a.bondToElementCount('N') === 1) {
            charge = -1
          }
        } else if (hasPolarNeighbour(a)) {
          charge = 1
        } else {
          charge = -1
        }
      }
      break;
    case 7:  // N
      if (valence === 2) {
        charge = -1
      } else if (valence === 4) {
        charge = 1
      }
      break

    case 8:  // O
      if (valence === 1) {
        charge = -1
        break
      } else if (valence === 3) {
        charge = 1
      }
      break

    case 15:  // P
      if (valence === 4) {
        charge = 1
        break
      }

    case 16:  // S
      // Thiol
      if (valence === 1) {
        charge = -1
        break
      } else if (valence === 3) {
        charge = 1
        break
      } else if (valence === 5) {
        charge = -1
      } else if (valence === 4 && degree === 4) {
        // Special case for sulphonyls/ sulphates drawn as [S+2][O-][O-]
        charge = 2
      }
      break

    // F, Cl, Br, I, At
    case 9:
    case 17:
    case 35:
    case 53:
    case 85:
      if (valence === 0) {
        charge = -1
      }
      break

    // Mg, Ca, Zn
    case 12:
    case 20:
    case 30:
      if (valence == 0) {
        charge = 2
      }
      break

    // Li, Na, K
    case 3:
    case 11:
    case 19:
      if (valence == 0) {
        charge = 1
      }
      break

  }

  return charge
}

export function explicitValence (a: AtomProxy) {
  let v = 0
  a.eachBond(b => v += b.bondOrder)
  return v
}

/**
 * Determine the "ideal" (according to this model) valence for an atom.
 *
 * We assume that: - Where atomic charge is non-zero, it's been
 * intentionally set as such that way, and we should respect that with our
 * number of hydrogens
 *
 * Where atomic charge is not set, for CNOS we use some simple rules to
 * deduce ideal number of hydrogens and geometry assuming addition of those
 * hydrogens
 */
export function calculateIdealValenceAndGeometry (a: AtomProxy) {
  const hydrogenCount = a.bondToElementCount('H')
  const degree = a.bondCount
  const valence = explicitValence(a)
  const heavyDegree = degree - hydrogenCount
  const heavyValence = valence - hydrogenCount
  const explicitCharge = a.formalCharge || 0

  // Initial assumption is that we already have the ideal valence
  let ideal = valence
  let geom = 0

  switch (a.number) {
    // H
    case 1:
      if (degree === 0) {
        geom = AtomGeometry.Spherical
        ideal = 0;

      } else if (degree === 1) {
        geom = AtomGeometry.Terminal
        ideal = 1
      }
      break

    // C
    case 6:
      // Special cases, I think really only isocyanide:
      if (heavyValence === 3 && heavyDegree === 1 && explicitCharge === 0) {
        a.eachBond(b => {
          if (b.bondOrder === 3 && b.getOtherAtom(a).element === 'N') {
            ideal = 3
            geom = AtomGeometry.Linear
          }
        })
      }
      // ideal valence tops out at 4, reduces for every absolute charge
      ideal = 4 - Math.abs(explicitCharge)
      // Fairly simple - basically if explicit charge is positive, we have
      // no lone pairs otherwise we have 1, 2, 3 lone pairs for -1, -2, -3
      geom = octetGeometry(degree, valence, ideal, Math.max(0, -explicitCharge))
      break

    // N
    case 7:
      if (explicitCharge !== 0) {
        // We've got charge specified
        ideal = Math.min(3 + explicitCharge, 4)
        // Cap valence at 4
        geom = octetGeometry(degree, valence, ideal, Math.max(0, 1 - explicitCharge))
      } else {
        // We've not got a specified charge, assume 4 valent (ammonium)
        // unless conjugated (pyridine, amide etc)
        // if (isConjugated(a)) {
        //   ideal = 3
        // } else {
        //   ideal = 4
        // }
        ideal = 3

        if (isConjugated(a)) {
          geom = AtomGeometry.Trigonal;
        } else {
          geom = AtomGeometry.Tetrahedral;
        }

      }
      break

    // O
    case 8:
      if (explicitCharge !== 0) {
        ideal = 2 + explicitCharge
        geom = octetGeometry(degree, valence, ideal, 2 - explicitCharge)
      } else {
        // Probably 2, but check we're not a carboxylate Oxygen
        ideal = 2
        if (valence === 1 && degree === 1) {
          a.eachBondedAtom(ba => {
            if (ba.element === 'C' && ba.bondToElementCount('O') === 2) {
              ideal = 1
            }
          })
        }
        geom = octetGeometry(degree, valence, ideal, 4 - ideal)
      }
      break

    // P
    case 15:
      if (valence - explicitCharge <= 3) {
        ideal = 3 + explicitCharge
        geom = octetGeometry(degree, valence, ideal, 1 - explicitCharge)
      } else {
        ideal = 5 + explicitCharge
        geom = octetGeometry(degree, valence, ideal, explicitCharge)
      }
      break

    // S
    case 16:
      // Find the lowest state compatible with our current valence
      // Might need to add a polar atom check..?
      if (valence - explicitCharge <= 2) {
        ideal = 2 + explicitCharge
        geom = octetGeometry(degree, valence, ideal, 2 - explicitCharge)
      } else if (valence - explicitCharge <= 4) {
        ideal = 4 + explicitCharge
        geom = octetGeometry(degree, valence, ideal, 1 - explicitCharge)
      } else if (valence - explicitCharge <= 6) {
        ideal = 6 + explicitCharge
        geom = octetGeometry(degree, valence, ideal, explicitCharge)
      }
      // Specical case for [S++][O-][O-]-like
      if (degree === 4 && valence === 4) {
        ideal = 4
        geom = AtomGeometry.Tetrahedral
      }
      break

    // F, Cl, Br, I, At
    case 9:
    case 17:
    case 35:
    case 53:
    case 85:
      ideal = 1 + explicitCharge
      geom = octetGeometry(degree, valence, ideal, 3 - explicitCharge)
      break

    // rules below are following OpenBabel
    // https://github.com/openbabel/openbabel/blob/master/data/atomtyp.txt

    // Li, Na, K, Rb, Cs Fr
    case 3:
    case 11:
    case 19:
    case 37:
    case 55:
    case 87:
      // Alkali metals
      ideal = 1
      // geom = ??? TODO

    // Be, Mg, Ca, Sr, Ba, Ra
    case 4:
    case 12:
    case 20:
    case 38:
    case 56:
    case 88:
      // Alkaline earth, like sp hybrids
      geom = AtomGeometry.Linear
      ideal = 2

    // Cu, Pd, Ag, Pt, Au
    case 29:
    case 46:
    case 47:
    case 78:
    case 79:
    case 88:
      // normally square planar
      geom = AtomGeometry.SquarePlanar
      // ideal = ??? TODO

    default:
      // Need a sensible default, which requires knowing the number of
      // valence shell electrons for the element
      console.warn('Requested valence geometry for an unhandled element!', a.element)
  }

  return [ ideal, geom ]
}


export interface ValenceModel {
  implicitCharge: Int8Array
  idealValence: Int8Array
  idealGeometry: Int8Array
}

export function ValenceModel (data: Data) {
  const structure = data.structure
  const n = structure.atomCount

  const implicitCharge = new Int8Array(n)
  const idealValence = new Int8Array(n)
  const idealGeometry = new Int8Array(n)

  let i = 0
  structure.eachAtom(a => {
    implicitCharge[ i ] = calculateImplicitCharge(a)
    const [ idealVal, idealGeo ] = calculateIdealValenceAndGeometry(a)
    idealValence[ i ] = idealVal
    idealGeometry[ i ] = idealGeo
    ++i
  })

  return { implicitCharge, idealValence, idealGeometry }
}
