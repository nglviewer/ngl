/**
 * @file Residue Map
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Structure from '../structure/structure'
import { ResidueBonds } from '../structure/structure-utils'
import ResidueType from './residue-type'

function getHash (resname: string, atomTypeIdList: number[], hetero: boolean, chemCompType = '') {
  return (
    resname + '|' +
    atomTypeIdList.join(',') + '|' +
    (hetero ? 1 : 0) + '|' +
    chemCompType
  )
}

class ResidueMap {
  dict: { [k: string]: number } = {}
  list: ResidueType[] = []

  constructor (readonly structure: Structure) {}

  add (resname: string, atomTypeIdList: number[], hetero: boolean, chemCompType = '', bonds?: ResidueBonds) {
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

  get (id: number) {
    return this.list[ id ]
  }
}

export default ResidueMap
