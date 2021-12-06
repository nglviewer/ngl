/**
 * @file Functional Groups
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import AtomProxy from '../proxy/atom-proxy'
import { Elements } from '../structure/structure-constants'

/**
 * Nitrogen in a quaternary amine
 */
export function isQuaternaryAmine (a: AtomProxy) {
  return (
    a.number === 7 &&
    a.bondCount === 4 &&
    a.bondToElementCount(Elements.H) === 0
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
 * Nitrogen in an imide
 */
export function isImide (a: AtomProxy) {
  let flag = false
  if (a.number === Elements.N && (a.bondCount - a.bondToElementCount(Elements.H)) === 2) {
    let carbonylCount = 0
    a.eachBondedAtom(ba => {
      if (isCarbonyl(ba)) ++carbonylCount
    })
    flag = carbonylCount === 2
  }
  return flag
}

/**
 * Nitrogen in an amide
 */
export function isAmide (a: AtomProxy) {
  let flag = false
  if (a.number === Elements.N && (a.bondCount - a.bondToElementCount(Elements.H)) === 2) {
    let carbonylCount = 0
    a.eachBondedAtom(ba => {
      if (isCarbonyl(ba)) ++carbonylCount
    })
    flag = carbonylCount === 1
  }
  return flag
}

/**
 * Sulfur in a sulfonium group
 */
export function isSulfonium (a: AtomProxy) {
  return (
    a.number === 16 &&
    a.bondCount === 3 &&
    a.bondToElementCount(Elements.H) === 0
  )
}

/**
 * Sulfur in a sulfonic acid or sulfonate group
 */
export function isSulfonicAcid (a: AtomProxy) {
  return (
    a.number === 16 &&
    a.bondToElementCount(Elements.O) === 3
  )
}

/**
 * Sulfur in a sulfate group
 */
export function isSulfate (a: AtomProxy) {
  return (
    a.number === 16 &&
    a.bondToElementCount(Elements.O) === 4
  )
}

/**
 * Phosphor in a phosphate group
 */
export function isPhosphate (a: AtomProxy) {
  return (
    a.number === 15 &&
    a.bondToElementCount(Elements.O) === a.bondCount
  )
}

/**
 * Halogen with one bond to a carbon
 */
export function isHalocarbon (a: AtomProxy) {
  return (
    a.isHalogen() &&
    a.bondCount === 1 &&
    a.bondToElementCount(Elements.C) === 1
  )
}

/**
 * Carbon in a carbonyl/acyl group
 */
export function isCarbonyl (a: AtomProxy) {
  let flag = false
  if (a.number === Elements.C) {
    a.eachBond(b => {
      if (b.bondOrder === 2 && b.getOtherAtom(a).number === Elements.O) {
        flag = true
      }
    })
  }
  return flag
}

/**
 * Carbon in a carboxylate group
 */
export function isCarboxylate (a: AtomProxy) {
  let terminalOxygenCount = 0
  if (
    a.number === 6 &&
    a.bondToElementCount(Elements.O) === 2 &&
    a.bondToElementCount(Elements.C) === 1
  ) {
    a.eachBondedAtom(ba => {
      if (ba.number === 8 && ba.bondCount - ba.bondToElementCount(Elements.H) === 1) {
        ++terminalOxygenCount
      }
    })
  }
  return terminalOxygenCount === 2
}

/**
 * Carbon in a guanidine group
 */
export function isGuanidine (a: AtomProxy) {
  let terminalNitrogenCount = 0
  if (
    a.number === 6 &&
    a.bondCount === 3 &&
    a.bondToElementCount(Elements.N) === 3
  ) {
    a.eachBondedAtom(ba => {
      if (ba.bondCount - ba.bondToElementCount(Elements.H) === 1) {
        ++terminalNitrogenCount
      }
    })
  }
  return terminalNitrogenCount === 2
}

/**
 * Carbon in a acetamidine group
 */
export function isAcetamidine (a: AtomProxy) {
  let terminalNitrogenCount = 0
  if (
    a.number === 6 &&
    a.bondCount === 3 &&
    a.bondToElementCount(Elements.N) === 2 &&
    a.bondToElementCount(Elements.C) === 1
  ) {
    a.eachBondedAtom(ba => {
      if (ba.bondCount - ba.bondToElementCount(Elements.H) === 1) {
        ++terminalNitrogenCount
      }
    })
  }
  return terminalNitrogenCount === 2
}

const PolarElements = [
  Elements.N, Elements.O, Elements.S,
  Elements.F, Elements.CL, Elements.BR, Elements.I
]

export function isPolar (a: AtomProxy) {
  return PolarElements.includes(a.number)
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
