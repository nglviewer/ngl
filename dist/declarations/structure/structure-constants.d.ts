/**
 * @file Structure Constants
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
export declare const UnknownEntity = 0;
export declare const PolymerEntity = 1;
export declare const NonPolymerEntity = 2;
export declare const MacrolideEntity = 3;
export declare const WaterEntity = 4;
export declare const UnknownType = 0;
export declare const WaterType = 1;
export declare const IonType = 2;
export declare const ProteinType = 3;
export declare const RnaType = 4;
export declare const DnaType = 5;
export declare const SaccharideType = 6;
export declare const UnknownBackboneType = 0;
export declare const ProteinBackboneType = 1;
export declare const RnaBackboneType = 2;
export declare const DnaBackboneType = 3;
export declare const CgProteinBackboneType = 4;
export declare const CgRnaBackboneType = 5;
export declare const CgDnaBackboneType = 6;
export declare const ChemCompProtein: string[];
export declare const ChemCompRna: string[];
export declare const ChemCompDna: string[];
export declare const ChemCompSaccharide: string[];
export declare const ChemCompOther: string[];
export declare const ChemCompNonPolymer: string[];
export declare const ChemCompHetero: string[];
export declare const SecStrucHelix: string[];
export declare const SecStrucSheet: string[];
export declare const SecStrucTurn: string[];
export declare const AtomicNumbers: {
    [e: string]: number | undefined;
};
export declare const DefaultAtomicNumber = 0;
/**
 * Enum mapping element to atomic number
 */
export declare const enum Elements {
    H = 1,
    D = 1,
    T = 1,
    HE = 2,
    LI = 3,
    BE = 4,
    B = 5,
    C = 6,
    N = 7,
    O = 8,
    F = 9,
    NE = 10,
    NA = 11,
    MG = 12,
    AL = 13,
    SI = 14,
    P = 15,
    S = 16,
    CL = 17,
    AR = 18,
    K = 19,
    CA = 20,
    SC = 21,
    TI = 22,
    V = 23,
    CR = 24,
    MN = 25,
    FE = 26,
    CO = 27,
    NI = 28,
    CU = 29,
    ZN = 30,
    GA = 31,
    GE = 32,
    AS = 33,
    SE = 34,
    BR = 35,
    KR = 36,
    RB = 37,
    SR = 38,
    Y = 39,
    ZR = 40,
    NB = 41,
    MO = 42,
    TC = 43,
    RU = 44,
    RH = 45,
    PD = 46,
    AG = 47,
    CD = 48,
    IN = 49,
    SN = 50,
    SB = 51,
    TE = 52,
    I = 53,
    XE = 54,
    CS = 55,
    BA = 56,
    LA = 57,
    CE = 58,
    PR = 59,
    ND = 60,
    PM = 61,
    SM = 62,
    EU = 63,
    GD = 64,
    TB = 65,
    DY = 66,
    HO = 67,
    ER = 68,
    TM = 69,
    YB = 70,
    LU = 71,
    HF = 72,
    TA = 73,
    W = 74,
    RE = 75,
    OS = 76,
    IR = 77,
    PT = 78,
    AU = 79,
    HG = 80,
    TL = 81,
    PB = 82,
    BI = 83,
    PO = 84,
    AT = 85,
    RN = 86,
    FR = 87,
    RA = 88,
    AC = 89,
    TH = 90,
    PA = 91,
    U = 92,
    NP = 93,
    PU = 94,
    AM = 95,
    CM = 96,
    BK = 97,
    CF = 98,
    ES = 99,
    FM = 100,
    MD = 101,
    NO = 102,
    LR = 103,
    RF = 104,
    DB = 105,
    SG = 106,
    BH = 107,
    HS = 108,
    MT = 109,
    DS = 110,
    RG = 111,
    CN = 112,
    NH = 113,
    FL = 114,
    MC = 115,
    LV = 116,
    TS = 117,
    OG = 118
}
export declare const AtomWeights: {
    [e: number]: number | undefined;
};
export declare const DefaultAtomWeight = 10.81;
export declare const VdwRadii: {
    [e: number]: number | undefined;
};
export declare const DefaultVdwRadius = 2;
export declare const ResidueRadii: {
    [k: string]: number;
};
export declare const DefaultResidueRadius = 5;
export declare const CovalentRadii: {
    [e: number]: number | undefined;
};
export declare const DefaultCovalentRadius = 1.6;
export declare const Valences: {
    [e: number]: number[] | undefined;
};
export declare const DefaultValence = -1;
export declare const OuterShellElectronCounts: {
    [e: number]: number | undefined;
};
export declare const DefaultOuterShellElectronCount = 2;
export declare const ResidueHydrophobicity: {
    [k: string]: [number, number, number];
};
export declare const DefaultResidueHydrophobicity: number[];
export declare const AA1: {
    [k: string]: string;
};
export declare const AA3: string[];
export declare const RnaBases: string[];
export declare const DnaBases: string[];
export declare const PurinBases: string[];
export declare const Bases: string[];
export declare const WaterNames: string[];
export declare const IonNames: string[];
export declare const SaccharideNames: string[];
export declare const ProteinBackboneAtoms: string[];
export declare const NucleicBackboneAtoms: string[];
export declare const ResidueTypeAtoms: {
    [k: number]: {
        [k: string]: string | string[];
    };
};
export declare const PDBQTSpecialElements: {
    HD: string;
    HS: string;
    A: string;
    NA: string;
    NS: string;
    OA: string;
    OS: string;
    SA: string;
    G0: string;
    G1: string;
    G2: string;
    G3: string;
    CG0: string;
    CG1: string;
    CG2: string;
    CG3: string;
    W: string;
};
