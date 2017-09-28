/**
 * @file Residue Map
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import ResidueType from './residue-type.js'

function getHash (resname, atomTypeIdList, hetero, chemCompType) {
  return (
    resname + '|' +
    atomTypeIdList.join(',') + '|' +
    (hetero ? 1 : 0) + '|' +
    (chemCompType || '')
  )
}

class ResidueMap {
  constructor (structure) {
    this.structure = structure

    this.dict = {}
    this.list = []
  }

  add (resname, atomTypeIdList, hetero, chemCompType, bonds) {
    resname = resname.toUpperCase()
    const hash = getHash(resname, atomTypeIdList, hetero, chemCompType)
    let id = this.dict[ hash ]
    if (id === undefined) {
      const residueType = new ResidueType(
        this.structure, resname, atomTypeIdList, hetero, chemCompType, bonds
      )
      id = this.list.length
      this.dict[ hash ] = id
      this.list.push(residueType)
    }
    return id
  }

  get (id) {
    return this.list[ id ]
  }
}

export default ResidueMap
