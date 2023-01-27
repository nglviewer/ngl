/**
 * @file Psf Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import StructureParser from './structure-parser';
declare class PsfParser extends StructureParser {
    get type(): string;
    _parse(): void;
}
export default PsfParser;
