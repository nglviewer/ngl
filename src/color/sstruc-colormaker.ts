/**
 * @file Sstruc Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals'
import Colormaker, { StuctureColormakerParams, manageColor } from './colormaker'
import AtomProxy from '../proxy/atom-proxy'
import ResidueProxy from '../proxy/residue-proxy'

// from Jmol http://jmol.sourceforge.net/jscolors/ (shapely)
const StructureColors = {
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
const DefaultStructureColor = 0x808080

/**
 * Color by secondary structure
 */
class SstrucColormaker extends Colormaker {
  residueProxy: ResidueProxy

  constructor (params: StuctureColormakerParams) {
    super(params)

    this.residueProxy = params.structure.getResidueProxy()
  }

  @manageColor
  atomColor (ap: AtomProxy) {
    const sstruc = ap.sstruc
    const rp = this.residueProxy

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

ColormakerRegistry.add('sstruc', SstrucColormaker as any)

export default SstrucColormaker
