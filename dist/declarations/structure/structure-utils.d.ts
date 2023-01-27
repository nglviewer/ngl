/**
 * @file Structure Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Structure from '../structure/structure';
import ResidueProxy from '../proxy/residue-proxy';
export declare function reorderAtoms(structure: Structure): void;
export interface SecStruct {
    helices: [string, number, string, string, number, string, number][];
    sheets: [string, number, string, string, number, string][];
}
export declare function assignSecondaryStructure(structure: Structure, secStruct: SecStruct): void;
export declare const calculateSecondaryStructure: (structure: Structure) => void;
export declare function getChainname(index: number): string;
export declare function calculateChainnames(structure: Structure, useExistingBonds?: boolean): void;
export declare function calculateBonds(structure: Structure): void;
export interface ResidueBonds {
    atomIndices1: number[];
    atomIndices2: number[];
    bondOrders: number[];
}
export declare function calculateResidueBonds(r: ResidueProxy): {
    atomIndices1: number[];
    atomIndices2: number[];
    bondOrders: number[];
};
export declare function calculateAtomBondMap(structure: Structure): number[][];
export declare function calculateBondsWithin(structure: Structure, onlyAddRung?: boolean): void;
export declare function calculateBondsBetween(structure: Structure, onlyAddBackbone?: boolean, useExistingBonds?: boolean): void;
export declare function buildUnitcellAssembly(structure: Structure): void;
export declare function guessElement(atomName: string): string;
/**
 * Assigns ResidueType bonds.
 * @param {Structure} structure - the structure object
 * @return {undefined}
 */
export declare function assignResidueTypeBonds(structure: Structure): void;
export declare function concatStructures(name: string, ...structures: Structure[]): Structure;
