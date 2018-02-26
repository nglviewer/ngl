/**
 * @file Selection Constants
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

const kwd = {
  PROTEIN: 1,
  NUCLEIC: 2,
  RNA: 3,
  DNA: 4,
  POLYMER: 5,
  WATER: 6,
  HELIX: 7,
  SHEET: 8,
  TURN: 9,
  BACKBONE: 10,
  SIDECHAIN: 11,
  ALL: 12,
  HETERO: 13,
  ION: 14,
  SACCHARIDE: 15,
  SUGAR: 15,
  BONDED: 16,
  RING: 17
}

const SelectAllKeyword = [ '*', '', 'ALL' ]

const AtomOnlyKeywords = [
  kwd.BACKBONE, kwd.SIDECHAIN, kwd.BONDED, kwd.RING
]

const ChainKeywords = [
  kwd.POLYMER, kwd.WATER
]

const SmallResname = [ 'ALA', 'GLY', 'SER' ]
const NucleophilicResname = [ 'CYS', 'SER', 'THR' ]
const HydrophobicResname = [ 'ALA', 'ILE', 'LEU', 'MET', 'PHE', 'PRO', 'TRP', 'VAL' ]
const AromaticResname = [ 'PHE', 'TRP', 'TYR', 'HIS' ]
const AmideResname = [ 'ASN', 'GLN' ]
const AcidicResname = [ 'ASP', 'GLU' ]
const BasicResname = [ 'ARG', 'HIS', 'LYS' ]
const ChargedResname = [ 'ARG', 'ASP', 'GLU', 'HIS', 'LYS' ]
const PolarResname = [ 'ASN', 'ARG', 'ASP', 'CYS', 'GLY', 'GLN', 'GLU', 'HIS', 'LYS', 'SER', 'THR', 'TYR' ]
const NonpolarResname = [ 'ALA', 'ILE', 'LEU', 'MET', 'PHE', 'PRO', 'TRP', 'VAL' ]
const CyclicResname = [ 'HIS', 'PHE', 'PRO', 'TRP', 'TYR' ]
const AliphaticResname = [ 'ALA', 'GLY', 'ILE', 'LEU', 'VAL' ]

export {
  kwd,
  SelectAllKeyword,

  AtomOnlyKeywords,
  ChainKeywords,

  SmallResname,
  NucleophilicResname,
  HydrophobicResname,
  AromaticResname,
  AmideResname,
  AcidicResname,
  BasicResname,
  ChargedResname,
  PolarResname,
  NonpolarResname,
  CyclicResname,
  AliphaticResname
}
