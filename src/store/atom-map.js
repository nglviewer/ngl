/**
 * @file Atom Map
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import AtomType from './atom-type.js'
import { guessElement } from '../structure/structure-utils.js'

function getHash (atomname, element) {
  return atomname + '|' + element
}

class AtomMap {
  constructor (structure) {
    this.structure = structure

    this.dict = {}
    this.list = []
  }

  add (atomname, element) {
    atomname = atomname.toUpperCase()
    if (!element) {
      element = guessElement(atomname)
    } else {
      element = element.toUpperCase()
    }
    const hash = getHash(atomname, element)
    let id = this.dict[ hash ]
    if (id === undefined) {
      const atomType = new AtomType(this.structure, atomname, element)
      id = this.list.length
      this.dict[ hash ] = id
      this.list.push(atomType)
    }
    return id
  }

  get (id) {
    return this.list[ id ]
  }
}

export default AtomMap
