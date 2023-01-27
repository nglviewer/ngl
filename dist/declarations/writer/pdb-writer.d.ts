/**
 * @file Pdb Writer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Writer from './writer';
import Structure from '../structure/structure';
export interface PdbWriterParams {
    renumberSerial: boolean;
    remarks: string[];
}
/**
 * Create a PDB file from a Structure object
 */
export default class PdbWriter extends Writer {
    readonly mimeType = "text/plain";
    readonly defaultName = "structure";
    readonly defaultExt = "pdb";
    renumberSerial: boolean;
    remarks: string[];
    structure: Structure;
    private _records;
    /**
     * @param  {Structure} structure - the structure object
     * @param  {Object} params - parameters]
     */
    constructor(structure: Structure, params?: PdbWriterParams);
    private _writeRecords;
    private _writeTitle;
    private _writeRemarks;
    private _writeAtoms;
    getString(): string;
    /**
     * Get string containing the PDB file data
     * @return {String} PDB file
     */
    getData(): string;
}
