/**
 * @file Alignment
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
export declare type SubstitutionMatrix = '' | 'blosum62' | 'blosum62x';
declare class Alignment {
    readonly seq1: string;
    readonly seq2: string;
    readonly gapPenalty: number;
    readonly gapExtensionPenalty: number;
    substMatrix: {
        [k: string]: {
            [k: string]: number;
        };
    };
    n: number;
    m: number;
    score?: number;
    ali: string;
    S: number[][];
    V: number[][];
    H: number[][];
    ali1: string;
    ali2: string;
    constructor(seq1: string, seq2: string, gapPenalty?: number, gapExtensionPenalty?: number, substMatrix?: SubstitutionMatrix);
    initMatrices(): void;
    gap(len: number): number;
    makeScoreFn(): (i: number, j: number) => number;
    calc(): void;
    trace(): void;
}
export default Alignment;
