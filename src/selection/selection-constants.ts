/**
 * @file Selection Constants
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

export enum kwd {
  PROTEIN = 1,
  NUCLEIC = 2,
  RNA = 3,
  DNA = 4,
  POLYMER = 5,
  WATER = 6,
  HELIX = 7,
  SHEET = 8,
  TURN = 9,
  BACKBONE = 10,
  SIDECHAIN = 11,
  ALL = 12,
  HETERO = 13,
  ION = 14,
  SACCHARIDE = 15,
  SUGAR = 15,
  BONDED = 16,
  RING = 17,
  AROMATICRING = 18,
  METAL = 19,
  POLARH = 20,
  NONE = 21
}

export const SelectAllKeyword = [ '*', '', 'ALL' ]
export const SelectNoneKeyword = [ 'NONE' ]

export const AtomOnlyKeywords = [
  kwd.BACKBONE, kwd.SIDECHAIN, kwd.BONDED, kwd.RING, kwd.AROMATICRING, kwd.METAL, kwd.POLARH
]

export const ChainKeywords = [
  kwd.POLYMER, kwd.WATER
]

export const SmallResname = [ 'ALA', 'GLY', 'SER' ]
export const NucleophilicResname = [ 'CYS', 'SER', 'THR' ]
export const HydrophobicResname = [ 'ALA', 'ILE', 'LEU', 'MET', 'PHE', 'PRO', 'TRP', 'VAL' ]
export const AromaticResname = [ 'PHE', 'TRP', 'TYR', 'HIS' ]
export const AmideResname = [ 'ASN', 'GLN' ]
export const AcidicResname = [ 'ASP', 'GLU' ]
export const BasicResname = [ 'ARG', 'HIS', 'LYS' ]
export const ChargedResname = [ 'ARG', 'ASP', 'GLU', 'HIS', 'LYS' ]
export const PolarResname = [ 'ASN', 'ARG', 'ASP', 'CYS', 'GLY', 'GLN', 'GLU', 'HIS', 'LYS', 'SER', 'THR', 'TYR' ]
export const NonpolarResname = [ 'ALA', 'ILE', 'LEU', 'MET', 'PHE', 'PRO', 'TRP', 'VAL' ]
export const CyclicResname = [ 'HIS', 'PHE', 'PRO', 'TRP', 'TYR' ]
export const AliphaticResname = [ 'ALA', 'GLY', 'ILE', 'LEU', 'VAL' ]
