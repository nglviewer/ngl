/**
 * @file Resname Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals.js'
import Colormaker from './colormaker.js'

// from Jmol http://jmol.sourceforge.net/jscolors/ (protein + shapely for nucleic)
var ResidueColors = {
  'ALA': 0x8CFF8C,
  'ARG': 0x00007C,
  'ASN': 0xFF7C70,
  'ASP': 0xA00042,
  'CYS': 0xFFFF70,
  'GLN': 0xFF4C4C,
  'GLU': 0x660000,
  'GLY': 0xFFFFFF,
  'HIS': 0x7070FF,
  'ILE': 0x004C00,
  'LEU': 0x455E45,
  'LYS': 0x4747B8,
  'MET': 0xB8A042,
  'PHE': 0x534C52,
  'PRO': 0x525252,
  'SER': 0xFF7042,
  'THR': 0xB84C00,
  'TRP': 0x4F4600,
  'TYR': 0x8C704C,
  'VAL': 0xFF8CFF,

  'ASX': 0xFF00FF,
  'GLX': 0xFF00FF,
  'ASH': 0xFF00FF,
  'GLH': 0xFF00FF,

  'A': 0xA0A0FF,
  'G': 0xFF7070,
  'I': 0x80FFFF,
  'C': 0xFF8C4B,
  'T': 0xA0FFA0,
  'U': 0xFF8080,

  'DA': 0xA0A0FF,
  'DG': 0xFF7070,
  'DI': 0x80FFFF,
  'DC': 0xFF8C4B,
  'DT': 0xA0FFA0,
  'DU': 0xFF8080
}
var DefaultResidueColor = 0xFF00FF

/**
 * Color by residue name
 */
class ResnameColormaker extends Colormaker {
  atomColor (a) {
    return ResidueColors[ a.resname ] || DefaultResidueColor
  }
}

ColormakerRegistry.add('resname', ResnameColormaker)

export default ResnameColormaker
