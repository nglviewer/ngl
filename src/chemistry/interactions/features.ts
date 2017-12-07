/**
 * @file Features
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import AtomProxy from '../../proxy/atom-proxy'

export interface Features {
  types: FeatureType[]
  groups: FeatureGroup[]
  centers: { x: number[], y: number[], z: number[] }
  atomSets: number[][]
}

export const enum FeatureType {
  Unknown = 0,
  PositiveCharge = 1,
  NegativeCharge = 2,
  AromaticRing = 3,
  HydrogenDonor = 4,
  HydrogenAcceptor = 5,
  HalogenDonor = 6,
  HalogenAcceptor = 7,
  Hydrophobic = 8,
  WeakHydrogenDonor = 9,
  IonicTypePartner = 10,
  DativeBondPartner = 11,
  TransitionMetal = 12,
  IonicTypeMetal = 13
}

export const enum FeatureGroup {
  Unknown = 0,
  QuaternaryAmine = 1,
  TertiaryAmine = 2,
  Sulfonium = 3,
  SulfonicAcid = 4,
  Sulfate = 5,
  Phosphate = 6,
  Halocarbon = 7,
  Guanidine = 8,
  Acetamidine = 9,
  Carboxylate = 10
}

export function createFeatures (): Features {
  return {
    types: [],
    groups: [],
    centers: { x: [], y: [], z: [] },
    atomSets: []
  }
}

export interface FeatureState {
  type: FeatureType
  group: FeatureGroup
  x: number
  y: number
  z: number
  atomSet: number[]
}

export function createFeatureState(type = FeatureType.Unknown, group = FeatureGroup.Unknown): FeatureState {
  return { type, group, x: 0, y: 0, z: 0, atomSet: [] }
}

export function addAtom (state: FeatureState, atom: AtomProxy) {
  state.x += atom.x
  state.y += atom.y
  state.z += atom.z
  state.atomSet.push(atom.index)
}

export function addFeature (features: Features, state: FeatureState) {
  const n = state.atomSet.length
  if (n > 0) {
    const { types, groups, centers, atomSets } = features
    types.push(state.type)
    groups.push(state.group)
    centers.x.push(state.x / n)
    centers.y.push(state.y / n)
    centers.z.push(state.z / n)
    atomSets.push(state.atomSet)
  }
}
