/**
 * @file Pqr Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ParserRegistry } from '../globals.js'
import PdbParser from './pdb-parser.js'

// http://www.poissonboltzmann.org/docs/file-format-info/

class PqrParser extends PdbParser {
  get type () { return 'pqr' }
}

ParserRegistry.add('pqr', PqrParser)

export default PqrParser
