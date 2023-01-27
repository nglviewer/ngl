/**
 * @file Netcdf Reader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 *
 * Adapted from https://github.com/cheminfo-js/netcdfjs
 * MIT License, Copyright (c) 2016 cheminfo
 */
import IOBuffer from './io-buffer';
export interface NetCDFRecordDimension {
    length: number;
    id?: number;
    name?: string;
    recordStep?: number;
}
export interface NetCDFHeader {
    recordDimension: NetCDFRecordDimension;
    version: number;
    dimensions: any[];
    globalAttributes: any[];
    variables: any[];
}
export interface NetCDFDimension {
    name: string;
    size: number;
}
/**
 * Reads a NetCDF v3.x file
 * https://www.unidata.ucar.edu/software/netcdf/docs/file_format_specifications.html
 */
declare class NetcdfReader {
    header: Partial<NetCDFHeader>;
    buffer: IOBuffer;
    /**
     * @param {ArrayBuffer} data - ArrayBuffer or any Typed Array with the data
     */
    constructor(data: ArrayBuffer);
    /**
     * @return {string} - Version for the NetCDF format
     */
    get version(): "classic format" | "64-bit offset format";
    /**
     * @return {object} - Metadata for the record dimension
     *  * `length`: Number of elements in the record dimension
     *  * `id`: Id number in the list of dimensions for the record dimension
     *  * `name`: String with the name of the record dimension
     *  * `recordStep`: Number with the record variables step size
     */
    get recordDimension(): NetCDFRecordDimension | undefined;
    /**
     * @return {Array<object>} - List of dimensions with:
     *  * `name`: String with the name of the dimension
     *  * `size`: Number with the size of the dimension
     */
    get dimensions(): any[] | undefined;
    /**
     * @return {Array<object>} - List of global attributes with:
     *  * `name`: String with the name of the attribute
     *  * `type`: String with the type of the attribute
     *  * `value`: A number or string with the value of the attribute
     */
    get globalAttributes(): any[] | undefined;
    /**
     * @return {Array<object>} - List of variables with:
     *  * `name`: String with the name of the variable
     *  * `dimensions`: Array with the dimension IDs of the variable
     *  * `attributes`: Array with the attributes of the variable
     *  * `type`: String with the type of the variable
     *  * `size`: Number with the size of the variable
     *  * `offset`: Number with the offset where of the variable begins
     *  * `record`: True if is a record variable, false otherwise
     */
    get variables(): any[] | undefined;
    /**
     * Checks if a variable is available
     * @param {string|object} variableName - Name of the variable to check
     * @return {Boolean} - Variable existence
     */
    hasDataVariable(variableName: string): boolean;
    /**
     * Retrieves the data for a given variable
     * @param {string|object} variableName - Name of the variable to search or variable object
     * @return {Array} - List with the variable values
     */
    getDataVariable(variableName: string | {}): any[];
}
export default NetcdfReader;
