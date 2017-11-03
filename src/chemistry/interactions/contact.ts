
import { Color } from 'three'

import { Debug, Log } from '../../globals'
import { createParams } from '../../utils'
import Structure from '../../structure/structure'
import AtomProxy from '../../proxy/atom-proxy'
import SpatialHash from '../../geometry/spatial-hash'
import ContactStore from '../../store/contact-store'
import BitArray from '../../utils/bitarray'
import { ContactPicker } from '../../utils/picker'
import { createAdjacencyList, AdjacencyList } from '../../utils/adjacency-list'
import { createFeatures, Features } from './features'
import { addAromaticRings, addNegativeCharges, addPositiveCharges, addChargedContacts } from './charged'
import { addHydrogenAcceptors, addHydrogenDonors, addHydrogenBonds, addWeakHydrogenDonors } from './hydrogen-bonds'
import { addMetalBinding, addMetals, addMetalComplexation } from './metal-binding'
import { addHydrophobic, addHydrophobicContacts } from './hydrophobic'
import { addHalogenAcceptors, addHalogenDonors, addHalogenBonds } from './halogen-bonds'
import {
  refineHydrophobicContacts
} from './refine-contacts'

export interface Contacts {
  features: Features
  spatialHash: SpatialHash
  contactStore: ContactStore
  featureSet: BitArray
}

export interface FrozenContacts extends Contacts {
  contactSet: BitArray
  adjacencyList: AdjacencyList
}

export const enum ContactType {
  Unknown = 0,
  SaltBridge = 1,
  CationPi = 2,
  PiStacking = 3,
  HydrogenBond = 4,
  HalogenBond = 5,
  Hydrophobic = 6,
  MetalComplex = 7,
  WeakHydrogenBond = 8
}

export const ContactDefaultParams = {
  maxHydrophobicDistance: 4.0,
  maxHydrogenBondDistance: 3.5,
  maxHydrogenBondAngle: 40,
  backboneHydrogenBond: true,
  waterHydrogenBond: true,
  weakHydrogenBond: true,
  maxPiStackingDistance: 5.5,
  maxPiStackingOffset: 2.0,
  maxPiStackingAngle: 30,
  maxCationPiDistance: 6.0,
  maxCationPiOffset: 1.5,
  maxSaltbridgeDistance: 4.0,
  maxHalogenBondDistance: 3.5,
  maxHalogenBondAngle: 30,
  maxMetalDistance: 3.0
}

export function invalidAtomContact (ap1: AtomProxy, ap2: AtomProxy) {
  return (
    ap1.modelIndex !== ap2.modelIndex ||
    ap1.residueIndex === ap2.residueIndex ||
    (ap1.altloc && ap2.altloc && ap1.altloc !== ap2.altloc)
  )
}

export function createContacts (features: Features): Contacts {
  const { types, centers } = features

  const spatialHash = new SpatialHash(centers)
  const contactStore = new ContactStore()
  const featureSet = new BitArray(types.length, false)

  return { features, spatialHash, contactStore, featureSet }
}

export function createFrozenContacts (contacts: Contacts): FrozenContacts {
  const { index1, index2, count } = contacts.contactStore

  const adjacencyList = createAdjacencyList({
      nodeArray1: index1,
      nodeArray2: index2,
      edgeCount: count,
      nodeCount: contacts.featureSet.length
    })
  const contactSet = new BitArray(contacts.contactStore.count, true)

  return Object.assign({ adjacencyList, contactSet }, contacts)
}

function calculateFeatures (structure: Structure) {
  const features = createFeatures()

  if (Debug) Log.time('calculateFeatures')

  addPositiveCharges(structure, features)
  addNegativeCharges(structure, features)
  addAromaticRings(structure, features)

  addHydrogenAcceptors(structure, features)
  addHydrogenDonors(structure, features)
  addWeakHydrogenDonors(structure, features)

  addMetalBinding(structure, features)
  addMetals(structure, features)

  addHydrophobic(structure, features)

  addHalogenAcceptors(structure, features)
  addHalogenDonors(structure, features)

  if (Debug) Log.timeEnd('calculateFeatures')

  return features
}


export function calculateContacts (structure: Structure, params = ContactDefaultParams) {
  const features = calculateFeatures(structure)
  const contacts = createContacts(features)

  if (Debug) Log.time('calculateContacts')

  if (Debug) Log.time('addChargedContacts')
  addChargedContacts(structure, contacts, params)
  if (Debug) Log.timeEnd('addChargedContacts')
  if (Debug) Log.time('addHydrogenBonds')
  addHydrogenBonds(structure, contacts, params)
  if (Debug) Log.timeEnd('addHydrogenBonds')
  if (Debug) Log.time('addMetalComplexation')
  addMetalComplexation(structure, contacts, params)
  if (Debug) Log.timeEnd('addMetalComplexation')
  if (Debug) Log.time('addHydrophobicContacts')
  addHydrophobicContacts(structure, contacts, params)
  if (Debug) Log.timeEnd('addHydrophobicContacts')
  if (Debug) Log.time('addHalogenBonds')
  addHalogenBonds(structure, contacts, params)
  if (Debug) Log.timeEnd('addHalogenBonds')

  const frozenContacts = createFrozenContacts(contacts)

  if (Debug) Log.time('refineHydrophobicContacts')
  refineHydrophobicContacts(structure, frozenContacts)
  if (Debug) Log.timeEnd('refineHydrophobicContacts')

  if (Debug) Log.timeEnd('calculateContacts')

  console.log(frozenContacts)

  return frozenContacts
}

export function contactTypeName (type: ContactType) {
  switch (type) {
    case ContactType.HydrogenBond:
      return 'hydrogen bond'
    case ContactType.Hydrophobic:
      return 'hydrophobic contact'
    case ContactType.HalogenBond:
      return 'halogen bond'
    case ContactType.SaltBridge:
      return 'salt bridge'
    case ContactType.MetalComplex:
      return 'metal complexation'
    case ContactType.CationPi:
      return 'cation-pi interaction'
    case ContactType.PiStacking:
      return 'pi-pi stacking'
    case ContactType.WeakHydrogenBond:
      return 'weak hydrogen bond'
    default:
      return 'unknown contact'
  }
}

export const ContactDataDefaultParams = {
  hydrogenBond: true,
  hydrophobic: true,
  halogenBond: true,
  saltBridge: true,
  metalComplex: true,
  cationPi: true,
  piStacking: true,
  weakHydrogenBond: true,
  radius: 1
}
export type ContactDataParams = typeof ContactDataDefaultParams

const tmpColor = new Color()
function contactColor (type: ContactType) {
  switch (type) {
    case ContactType.HydrogenBond:
      return tmpColor.setHex(0x2B83BA).toArray()
    case ContactType.Hydrophobic:
      return tmpColor.setHex(0x808080).toArray()
    case ContactType.HalogenBond:
      return tmpColor.setHex(0x40FFBF).toArray()
    case ContactType.SaltBridge:
      return tmpColor.setHex(0xF0C814).toArray()
    case ContactType.MetalComplex:
      return tmpColor.setHex(0x8C4099).toArray()
    case ContactType.CationPi:
      return tmpColor.setHex(0xFF8000).toArray()
    case ContactType.PiStacking:
      return tmpColor.setHex(0x8CB366).toArray()
    case ContactType.WeakHydrogenBond:
      return tmpColor.setHex(0xC5DDEC).toArray()
    default:
      return tmpColor.setHex(0xCCCCCC).toArray()
  }
}

export function getContactData (contacts: FrozenContacts, structure: Structure, params: ContactDataParams) {
  const p = createParams(params, ContactDataDefaultParams)
  const types: ContactType[] = []
  if (p.hydrogenBond) types.push(ContactType.HydrogenBond)
  if (p.hydrophobic) types.push(ContactType.Hydrophobic)
  if (p.halogenBond) types.push(ContactType.HalogenBond)
  if (p.saltBridge) types.push(ContactType.SaltBridge)
  if (p.metalComplex) types.push(ContactType.MetalComplex)
  if (p.cationPi) types.push(ContactType.CationPi)
  if (p.piStacking) types.push(ContactType.PiStacking)
  if (p.weakHydrogenBond) types.push(ContactType.WeakHydrogenBond)

  const { features, contactSet, contactStore } = contacts
  const { centers } = features
  const { x, y, z } = centers
  const { index1, index2, type } = contactStore

  const position1: number[] = []
  const position2: number[] = []
  const color: number[] = []
  const radius: number[] = []
  const picking: number[] = []

  contactSet.forEach(i => {
    const ti = type[ i ]
    if (types.includes(ti)) {
      const k = index1[i]
      const l = index2[i]
      position1.push(x[k], y[k], z[k])
      position2.push(x[l], y[l], z[l])
      color.push(...contactColor(ti))
      radius.push(p.radius)
      picking.push(i)
    }
  })

  return {
    position1: new Float32Array(position1),
    position2: new Float32Array(position2),
    color: new Float32Array(color),
    radius: new Float32Array(radius),
    picking: new ContactPicker(picking, contacts, structure)
  }
}
