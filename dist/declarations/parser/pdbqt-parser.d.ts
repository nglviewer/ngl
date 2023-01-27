/**
 * @file Pdbqt Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import PdbParser from './pdb-parser';
declare class PdbqtParser extends PdbParser {
    get type(): string;
}
export default PdbqtParser;
