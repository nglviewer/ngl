/**
 * @file Atom Map
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import AtomType from './atom-type'
import { guessElement } from '../structure/structure-utils'
import Structure from '../structure/structure'

function getHash (atomname: string, element: string) {
  return atomname + '|' + element
}

class AtomMap {
  dict: { [k: string]: number } = {}
  list: AtomType[] = []

  constructor (readonly structure: Structure) {
    this.structure = structure
  }

  add (atomname: string, element?: string) {
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

  get (id: number) {
    return this.list[ id ]
  }
}

export default AtomMap
