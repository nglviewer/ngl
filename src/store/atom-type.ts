/**
 * @file Atom Type
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { guessElement } from '../structure/structure-utils'
import { VdwRadii, CovalentRadii } from '../structure/structure-constants'
import Structure from '../structure/structure'

/**
 * Atom type
 */
class AtomType {
  element: string
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
    this.vdw = VdwRadii[ element ]
    this.covalent = CovalentRadii[ element ]
  }
}

export default AtomType
