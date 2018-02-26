/**
 * @file Atom Type
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { guessElement } from '../structure/structure-utils.js'
import { VdwRadii, CovalentRadii } from '../structure/structure-constants.js'

/**
 * Atom type
 */
class AtomType {
    /**
     * @param {Structure} structure - the structure object
     * @param {String} atomname - the name of the atom
     * @param {String} element - the chemical element
     */
  constructor (structure, atomname, element) {
    this.structure = structure

    element = element || guessElement(atomname)

    this.atomname = atomname
    this.element = element
    this.vdw = VdwRadii[ element ]
    this.covalent = CovalentRadii[ element ]
  }
}

export default AtomType
