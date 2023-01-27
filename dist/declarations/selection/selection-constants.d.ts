/**
 * @file Selection Constants
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
export declare enum kwd {
    PROTEIN = 1,
    NUCLEIC = 2,
    RNA = 3,
    DNA = 4,
    POLYMER = 5,
    WATER = 6,
    HELIX = 7,
    SHEET = 8,
    TURN = 9,
    BACKBONE = 10,
    SIDECHAIN = 11,
    ALL = 12,
    HETERO = 13,
    ION = 14,
    SACCHARIDE = 15,
    SUGAR = 15,
    BONDED = 16,
    RING = 17,
    AROMATICRING = 18,
    METAL = 19,
    POLARH = 20,
    NONE = 21
}
export declare const SelectAllKeyword: string[];
export declare const SelectNoneKeyword: string[];
export declare const AtomOnlyKeywords: kwd[];
export declare const ChainKeywords: kwd[];
export declare const SmallResname: string[];
export declare const NucleophilicResname: string[];
export declare const HydrophobicResname: string[];
export declare const AromaticResname: string[];
export declare const AmideResname: string[];
export declare const AcidicResname: string[];
export declare const BasicResname: string[];
export declare const ChargedResname: string[];
export declare const PolarResname: string[];
export declare const NonpolarResname: string[];
export declare const CyclicResname: string[];
export declare const AliphaticResname: string[];
