/**
 * @file Loader Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { ParserParams } from './parser-loader';
export interface LoaderParameters {
    ext: string;
    compressed: string | false;
    binary: boolean;
    name: string;
    dir: string;
    path: string;
    protocol: string;
}
export declare type LoaderInput = File | Blob | string;
export declare function getFileInfo(file: LoaderInput): {
    path: string;
    name: string;
    ext: string;
    base: string;
    dir: string;
    compressed: string | boolean;
    protocol: string;
    query: string;
    src: LoaderInput;
};
export declare function getDataInfo(src: LoaderInput): {
    path: string;
    name: string;
    ext: string;
    base: string;
    dir: string;
    compressed: string | boolean;
    protocol: string;
    query: string;
    src: LoaderInput;
};
/**
 * Load a file
 *
 * @example
 * // load from URL
 * NGL.autoLoad( "http://files.rcsb.org/download/5IOS.cif" );
 *
 * @example
 * // load binary data in CCP4 format via a Blob
 * var binaryBlob = new Blob( [ ccp4Data ], { type: 'application/octet-binary'} );
 * NGL.autoLoad( binaryBlob, { ext: "ccp4" } );
 *
 * @example
 * // load string data in PDB format via a Blob
 * var stringBlob = new Blob( [ pdbData ], { type: 'text/plain'} );
 * NGL.autoLoad( stringBlob, { ext: "pdb" } );
 *
 * @example
 * // load a File object
 * NGL.autoLoad( file );
 *
 * @param  {String|File|Blob} file - either a URL or an object containing the file data
 * @param  {LoaderParameters} params - loading parameters
 * @return {Promise} Promise resolves to the loaded data
 */
export declare function autoLoad(file: LoaderInput, params?: Partial<LoaderParameters & ParserParams>): any;
