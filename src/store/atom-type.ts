/**
 * @file Atom Type
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { guessElement } from '../structure/structure-utils'
import {
  AtomicNumbers, DefaultAtomicNumber,
  VdwRadii, DefaultVdwRadius,
  CovalentRadii, DefaultCovalentRadius,
  Valences, DefaultValence,
  OuterShellElectronCounts, DefaultOuterShellElectronCount
} from '../structure/structure-constants'
import Structure from '../structure/structure'

// Li, Na, K, Rb, Cs Fr
const AlkaliMetals = [ 3, 11, 19, 37, 55, 87 ]

// Be, Mg, Ca, Sr, Ba, Ra
const AlkalineEarthMetals = [ 4, 12, 20, 38, 56, 88 ]

// C, P, S, Se
const PolyatomicNonmetals = [ 6, 15, 16, 34, ]

// H, N, O, F, Cl, Br, I
const DiatomicNonmetals = [ 1, 7, 8, 9, 17, 35, 53 ]

// He, Ne, Ar, Kr, Xe, Rn
const NobleGases = [ 2, 10, 18, 36, 54, 86 ]

// Zn, Ga, Cd, In, Sn, Hg, Ti, Pb, Bi, Po, Cn
const PostTransitionMetals = [ 13, 30, 31, 48, 49, 50, 80, 81, 82, 83, 84, 85, 112 ]

// B, Si, Ge, As, Sb, Te, At
const Metalloids = [ 5, 14, 32, 33, 51, 52, 85 ]

// F, Cl, Br, I, At
const Halogens = [ 9, 17, 35, 53, 85 ]

/**
 * Atom type
 */
class AtomType {
  element: string
  number: number
  vdw: number
  covalent: number

  /**
   * @param {Structure} structure - the structure object
   * @param {String} atomname - the name of the atom
   * @param {String} element - the chemical element
   */
  constructor (readonly structure: Structure, readonly atomname: string, element?: string) {
    element = element || guessElement(atomname)

    this.element = element
    this.number = AtomicNumbers[ element ] || DefaultAtomicNumber
    this.vdw = VdwRadii[ this.number ] || DefaultVdwRadius
    this.covalent = CovalentRadii[ this.number ] || DefaultCovalentRadius
  }

  getDefaultValence() {
    const vl = Valences[ this.number ]
    return vl ? vl[ 0 ] : DefaultValence
  }

  getValenceList () {
    return Valences[ this.number ] || []
  }

  getOuterShellElectronCount () {
    return OuterShellElectronCounts[ this.number ] || DefaultOuterShellElectronCount
  }

  isMetal () {
    return (
      this.isAlkaliMetal() ||
      this.isAlkalineEarthMetal() ||
      this.isLanthanide() ||
      this.isActinide() ||
      this.isTransitionMetal() ||
      this.isPostTransitionMetal()
    )
  }

  isNonmetal () {
    return (
      this.isDiatomicNonmetal() ||
      this.isPolyatomicNonmetal() ||
      this.isNobleGas()
    )
  }

  isMetalloid () {
    return Metalloids.includes(this.number)
  }

  isHalogen () {
    return Halogens.includes(this.number)
  }

  isDiatomicNonmetal () {
    return DiatomicNonmetals.includes(this.number)
  }

  isPolyatomicNonmetal () {
    return PolyatomicNonmetals.includes(this.number)
  }

  isAlkaliMetal () {
    return AlkaliMetals.includes(this.number)
  }

  isAlkalineEarthMetal () {
    return AlkalineEarthMetals.includes(this.number)
  }

  isNobleGas () {
    return NobleGases.includes(this.number)
  }

  isTransitionMetal () {
    const no = this.number
    return (
      (no >= 21 && no <= 29) ||
      (no >= 39 && no <= 47) ||
      (no >= 72 && no <= 79) ||
      (no >= 104 && no <= 108)
    )
  }

  isPostTransitionMetal () {
    return PostTransitionMetals.includes(this.number)
  }

  isLanthanide () {
    return this.number >= 57 && this.number <= 71
  }

  isActinide () {
    return this.number >= 89 && this.number <= 103
  }

}

export default AtomType