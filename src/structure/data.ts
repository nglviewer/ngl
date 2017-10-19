
import Structure from './structure'
import SpatialHash from '../geometry/spatial-hash'
import { ValenceModel } from '../chemistry/valence-model'

export interface Data {
  structure: Structure
  '@spatialLookup': SpatialHash | undefined
  '@valenceModel': ValenceModel | undefined
}

export function createData(structure: Structure): Data {
  return {
    structure,
    '@spatialLookup': undefined,
    '@valenceModel': undefined
  }
}

export function spatialLookup(data: Data): SpatialHash {
  if (data['@spatialLookup']) return data['@spatialLookup']!
  const lookup = new SpatialHash(data.structure.atomStore, data.structure.boundingBox)
  data['@spatialLookup'] = lookup
  return lookup
}

export function valenceModel(data: Data): ValenceModel {
  if (data['@valenceModel']) return data['@valenceModel']!
  const valenceModel = ValenceModel(data, {assignCharge: 'auto', assignH: 'auto'})
  data['@valenceModel'] = valenceModel
  return valenceModel
}
