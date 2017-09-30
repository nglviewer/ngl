/**
 * @file Functional Groups
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import AtomProxy from '../proxy/atom-proxy'

/**
 * Nitrogen in a quaternary amine
 */
export function isQuaternaryAmine (a: AtomProxy) {
  return (
    a.number === 7 &&
    a.bondCount === 4 &&
    a.bondToElementCount('H') === 0
  )
}

/**
 * Nitrogen in a tertiary amine
 */
export function isTertiaryAmine (a: AtomProxy, idealValence: number) {
  return (
    a.number === 7 &&
    a.bondCount >= 3 &&
    idealValence === 3
  )
}

/**
 * Sulfur in a sulfonium group
 */
export function isSulfonium (a: AtomProxy) {
  return (
    a.number === 16 &&
    a.bondCount === 3 &&
    a.bondToElementCount('H') === 0
  )
}

/**
 * Sulfur in a sulfonic acid or sulfonate group
 */
export function isSulfonicAcid (a: AtomProxy) {
  return (
    a.number === 16 &&
    a.bondToElementCount('O') === 3
  )
}

/**
 * Sulfur in a sulfate group
 */
export function isSulfate (a: AtomProxy) {
  return (
    a.number === 16 &&
    a.bondToElementCount('O') === 4
  )
}

/**
 * Phosphor in a phosphate group
 */
export function isPhosphate (a: AtomProxy) {
  return (
    a.number === 15 &&
    a.bondToElementCount('O') === a.bondCount
  )
}

/**
 * Halogen with one bond to a carbon
 */
export function isHalocarbon (a: AtomProxy) {
  return (
    a.isHalogen() &&
    a.bondCount === 1 &&
    a.bondToElementCount('C') === 1
  )
}

/**
 * Carbon in a carboxylate group
 */
export function isCarboxylate (a: AtomProxy) {
  return (
    a.number === 6 &&
    a.bondToElementCount('O') === 2 &&
    a.bondToElementCount('C') === 1
  )
}

/**
 * Carbon in a guanidine group
 */
export function isGuanidine (a: AtomProxy) {
  let flag = false
  if (
    a.number === 6 &&
    a.bondCount === 3 &&
    a.bondToElementCount('N') === 3
  ) {
    a.eachBondedAtom(ba => {
      const bc = ba.bondCount
      if (bc === 1 || (bc === 2 && ba.bondToElementCount('H') === 1)) {
        flag = true
      }
    })
  }
  return flag
}

const PolarElements = [ 'N', 'O', 'S', 'F', 'CL', 'Br', 'I' ]

export function isPolar (a: AtomProxy) {
  return PolarElements.includes(a.element)
}

export function hasPolarNeighbour (a: AtomProxy) {
  let flag = false
  a.eachBondedAtom(ba => {
    if (isPolar(ba)) flag = true
  })
  return flag
}

export function hasAromaticNeighbour (a: AtomProxy) {
  let flag = false
  a.eachBondedAtom(function (bap) {
    if (bap.aromatic) flag = true
  })
  return flag
}
