/**
 * @file Structure Builder
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Structure from './structure';
declare class StructureBuilder {
    readonly structure: Structure;
    currentModelindex: number | null;
    currentChainid: string | null;
    currentResname: string | null;
    currentResno: number | null;
    currentInscode: string | undefined;
    currentHetero: boolean | null;
    previousResname: string | null;
    previousHetero: boolean | null;
    ai: number;
    ri: number;
    ci: number;
    mi: number;
    constructor(structure: Structure);
    addResidueType(ri: number): void;
    addAtom(modelindex: number, chainname: string, chainid: string, resname: string, resno: number, hetero: boolean, sstruc?: string | undefined, inscode?: string | undefined): void;
    finalize(): void;
}
export default StructureBuilder;
