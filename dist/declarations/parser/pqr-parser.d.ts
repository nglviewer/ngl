/**
 * @file Pqr Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import PdbParser from './pdb-parser';
declare class PqrParser extends PdbParser {
    get type(): string;
}
export default PqrParser;
