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
}

export default AtomType