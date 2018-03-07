/**
 * @file Pdbqt Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ParserRegistry } from '../globals'
import PdbParser from './pdb-parser'

// autodock variant of PDB format with
// - atom partial charges (empty column in pdb format)
// - atom types (bfactor column in pdb format)
// http://autodock.scripps.edu/faqs-help/faq/what-is-the-format-of-a-pdbqt-file

class PdbqtParser extends PdbParser {
  get type () { return 'pdbqt' }
}

ParserRegistry.add('pdbqt', PdbqtParser)

export default PdbqtParser
