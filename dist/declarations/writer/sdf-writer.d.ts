/**
 * Writer class for sdf/mol files.
 */
import Writer from './writer';
import Structure from '../structure/structure';
import AtomProxy from '../proxy/atom-proxy';
import BondProxy from '../proxy/bond-proxy';
declare class SdfWriter extends Writer {
    readonly mimeType = "text/plain";
    readonly defaultName = "structure";
    readonly defaultExt = "sdf";
    structure: Structure;
    private _records;
    /**
     * @param {Structure} structure - structure to write
     * @param {Object} params - parameters
     */
    constructor(structure: Structure);
    get idString(): string;
    get titleString(): string;
    get countsString(): string;
    get chargeLines(): string[];
    formatAtom(ap: AtomProxy): string;
    formatBond(bp: BondProxy): string;
    _writeRecords(): void;
    _writeHeader(): void;
    _writeCTab(): void;
    _writeFooter(): void;
    getData(): string;
}
export default SdfWriter;
