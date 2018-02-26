/**
 * @file Sstruc Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals.js'
import Colormaker from './colormaker.js'

// from Jmol http://jmol.sourceforge.net/jscolors/ (shapely)
var StructureColors = {
  'alphaHelix': 0xFF0080,
  'threeTenHelix': 0xA00080,
  'piHelix': 0x600080,
  'betaStrand': 0xFFC800,
  'betaTurn': 0x6080FF,
  'coil': 0xFFFFFF,

  'dna': 0xAE00FE,
  'rna': 0xFD0162,

  'carbohydrate': 0xA6A6FA
}
var DefaultStructureColor = 0x808080

/**
 * Color by secondary structure
 */
class SstrucColormaker extends Colormaker {
  constructor (params) {
    super(params)

    this.rp = this.structure.getResidueProxy()
  }

  atomColor (ap) {
    var sstruc = ap.sstruc
    var rp = this.rp

    if (sstruc === 'h') {
      return StructureColors.alphaHelix
    } else if (sstruc === 'g') {
      return StructureColors.threeTenHelix
    } else if (sstruc === 'i') {
      return StructureColors.piHelix
    } else if (sstruc === 'e' || sstruc === 'b') {
      return StructureColors.betaStrand
    } else if (sstruc === 't') {
      return StructureColors.betaTurn
    } else {
      rp.index = ap.residueIndex
      if (rp.isDna()) {
        return StructureColors.dna
      } else if (rp.isRna()) {
        return StructureColors.rna
      } else if (rp.isSaccharide()) {
        return StructureColors.carbohydrate
      } else if (rp.isProtein() || sstruc === 's' || sstruc === 'l') {
        return StructureColors.coil
      } else {
        return DefaultStructureColor
      }
    }
  }
}

ColormakerRegistry.add('sstruc', SstrucColormaker)

export default SstrucColormaker
