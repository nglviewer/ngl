/**
 * @file Structure
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


// from Jmol http://jmol.sourceforge.net/jscolors/ (or 0xFFFFFF)
NGL.ElementColors = {
    "H": 0xFFFFFF, "HE": 0xD9FFFF, "LI": 0xCC80FF, "BE": 0xC2FF00, "B": 0xFFB5B5,
    "C": 0x909090, "N": 0x3050F8, "O": 0xFF0D0D, "F": 0x90E050, "NE": 0xB3E3F5,
    "NA": 0xAB5CF2, "MG": 0x8AFF00, "AL": 0xBFA6A6, "SI": 0xF0C8A0, "P": 0xFF8000,
    "S": 0xFFFF30, "CL": 0x1FF01F, "AR": 0x80D1E3, "K": 0x8F40D4, "CA": 0x3DFF00,
    "SC": 0xE6E6E6, "TI": 0xBFC2C7, "V": 0xA6A6AB, "CR": 0x8A99C7, "MN": 0x9C7AC7,
    "FE": 0xE06633, "CO": 0xF090A0, "NI": 0x50D050, "CU": 0xC88033, "ZN": 0x7D80B0,
    "GA": 0xC28F8F, "GE": 0x668F8F, "AS": 0xBD80E3, "SE": 0xFFA100, "BR": 0xA62929,
    "KR": 0x5CB8D1, "RB": 0x702EB0, "SR": 0x00FF00, "Y": 0x94FFFF, "ZR": 0x94E0E0,
    "NB": 0x73C2C9, "MO": 0x54B5B5, "TC": 0x3B9E9E, "RU": 0x248F8F, "RH": 0x0A7D8C,
    "PD": 0x006985, "AG": 0xC0C0C0, "CD": 0xFFD98F, "IN": 0xA67573, "SN": 0x668080,
    "SB": 0x9E63B5, "TE": 0xD47A00, "I": 0x940094, "XE": 0x940094, "CS": 0x57178F,
    "BA": 0x00C900, "LA": 0x70D4FF, "CE": 0xFFFFC7, "PR": 0xD9FFC7, "ND": 0xC7FFC7,
    "PM": 0xA3FFC7, "SM": 0x8FFFC7, "EU": 0x61FFC7, "GD": 0x45FFC7, "TB": 0x30FFC7,
    "DY": 0x1FFFC7, "HO": 0x00FF9C, "ER": 0x00E675, "TM": 0x00D452, "YB": 0x00BF38,
    "LU": 0x00AB24, "HF": 0x4DC2FF, "TA": 0x4DA6FF, "W": 0x2194D6, "RE": 0x267DAB,
    "OS": 0x266696, "IR": 0x175487, "PT": 0xD0D0E0, "AU": 0xFFD123, "HG": 0xB8B8D0,
    "TL": 0xA6544D, "PB": 0x575961, "BI": 0x9E4FB5, "PO": 0xAB5C00, "AT": 0x754F45,
    "RN": 0x428296, "FR": 0x420066, "RA": 0x007D00, "AC": 0x70ABFA, "TH": 0x00BAFF,
    "PA": 0x00A1FF, "U": 0x008FFF, "NP": 0x0080FF, "PU": 0x006BFF, "AM": 0x545CF2,
    "CM": 0x785CE3, "BK": 0x8A4FE3, "CF": 0xA136D4, "ES": 0xB31FD4, "FM": 0xB31FBA,
    "MD": 0xB30DA6, "NO": 0xBD0D87, "LR": 0xC70066, "RF": 0xCC0059, "DB": 0xD1004F,
    "SG": 0xD90045, "BH": 0xE00038, "HS": 0xE6002E, "MT": 0xEB0026, "DS": 0xFFFFFF,
    "RG": 0xFFFFFF, "CN": 0xFFFFFF, "UUT": 0xFFFFFF, "FL": 0xFFFFFF, "UUP": 0xFFFFFF,
    "LV": 0xFFFFFF, "UUH": 0xFFFFFF,

    "D": 0xFFFFC0, "T": 0xFFFFA0,

    "": 0xFFFFFF
};


// from Jmol http://jmol.sourceforge.net/jscolors/ (protein + shapely for nucleic)
/*NGL._ResidueColors = {
    "ALA": 0xC8C8C8,
    "ARG": 0x145AFF,
    "ASN": 0x00DCDC,
    "ASP": 0xE60A0A,
    "CYS": 0xE6E600,
    "GLN": 0x00DCDC,
    "GLU": 0xE60A0A,
    "GLY": 0xEBEBEB,
    "HIS": 0x8282D2,
    "ILE": 0x0F820F,
    "LEU": 0x0F820F,
    "LYS": 0x145AFF,
    "MET": 0xE6E600,
    "PHE": 0x3232AA,
    "PRO": 0xDC9682,
    "SER": 0xFA9600,
    "THR": 0xFA9600,
    "TRP": 0xB45AB4,
    "TYR": 0x3232AA,
    "VAL": 0x0F820F,

    "ASX": 0xFF69B4,
    "GLX": 0xFF69B4,
    "ASH": 0xFF69B4,
    "GLH": 0xFF69B4,

    "A": 0xA0A0FF,
    "G": 0xFF7070,
    "I": 0x80FFFF,
    "C": 0xFF8C4B,
    "T": 0xA0FFA0,
    "U": 0xFF8080,

    "DA": 0xA0A0FF,
    "DG": 0xFF7070,
    "DI": 0x80FFFF,
    "DC": 0xFF8C4B,
    "DT": 0xA0FFA0,
    "DU": 0xFF8080,

    "": 0xBEA06E
};*/
NGL.ResidueColors = {
    "ALA": 0x8CFF8C,
    "ARG": 0x00007C,
    "ASN": 0xFF7C70,
    "ASP": 0xA00042,
    "CYS": 0xFFFF70,
    "GLN": 0xFF4C4C,
    "GLU": 0x660000,
    "GLY": 0xFFFFFF,
    "HIS": 0x7070FF,
    "ILE": 0x004C00,
    "LEU": 0x455E45,
    "LYS": 0x4747B8,
    "MET": 0xB8A042,
    "PHE": 0x534C52,
    "PRO": 0x525252,
    "SER": 0xFF7042,
    "THR": 0xB84C00,
    "TRP": 0x4F4600,
    "TYR": 0x8C704C,
    "VAL": 0xFF8CFF,

    "ASX": 0xFF00FF,
    "GLX": 0xFF00FF,
    "ASH": 0xFF00FF,
    "GLH": 0xFF00FF,

    "A": 0xA0A0FF,
    "G": 0xFF7070,
    "I": 0x80FFFF,
    "C": 0xFF8C4B,
    "T": 0xA0FFA0,
    "U": 0xFF8080,

    "DA": 0xA0A0FF,
    "DG": 0xFF7070,
    "DI": 0x80FFFF,
    "DC": 0xFF8C4B,
    "DT": 0xA0FFA0,
    "DU": 0xFF8080,

    "": 0xFF00FF
};


// from Jmol http://jmol.sourceforge.net/jscolors/ (shapely)
NGL.StructureColors = {
    "alphaHelix": 0xFF0080,
    "3_10Helix": 0xA00080,
    "piHelix": 0x600080,
    "betaStrand": 0xFFC800,
    "betaTurn": 0x6080FF,
    "coil": 0xFFFFFF,

    "dna": 0xAE00FE,
    "rna": 0xFD0162,

    "carbohydrate": 0xA6A6FA,

    "": 0x808080
}


// PDB helix record encoding
NGL.HelixTypes = {
    1: "h",  // Right-handed alpha (default)
    2: "h",  // Right-handed omega
    3: "i",  // Right-handed pi
    4: "h",  // Right-handed gamma
    5: "g",  // Right-handed 310
    6: "h",  // Left-handed alpha
    7: "h",  // Left-handed omega
    8: "h",  // Left-handed gamma
    9: "h",  // 27 ribbon/helix
    10: "h",  // Polyproline
    "": "h",
}


// http://dx.doi.org/10.1021/jp8111556 (or 2.0)
NGL.VdwRadii = {
    "H": 1.1, "HE": 1.4, "LI": 1.81, "BE": 1.53, "B": 1.92, "C": 1.7,
    "N": 1.55, "O": 1.52, "F": 1.47, "NE": 1.54, "NA": 2.27, "MG": 1.73, "AL": 1.84,
    "SI": 2.1, "P": 1.8, "S": 1.8, "CL": 1.75, "AR": 1.88, "K": 2.75, "CA": 2.31,
    "SC": 2.3, "TI": 2.15, "V": 2.05, "CR": 2.05, "MN": 2.05, "FE": 2.05, "CO": 2.0,
    "NI": 2.0, "CU": 2.0, "ZN": 2.1, "GA": 1.87, "GE": 2.11, "AS": 1.85, "SE": 1.9,
    "BR": 1.83, "KR": 2.02, "RB": 3.03, "SR": 2.49, "Y": 2.4, "ZR": 2.3, "NB": 2.15,
    "MO": 2.1, "TC": 2.05, "RU": 2.05, "RH": 2.0, "PD": 2.05, "AG": 2.1, "CD": 2.2,
    "IN": 2.2, "SN": 1.93, "SB": 2.17, "TE": 2.06, "I": 1.98, "XE": 2.16, "CS": 3.43,
    "BA": 2.68, "LA": 2.5, "CE": 2.48, "PR": 2.47, "ND": 2.45, "PM": 2.43, "SM": 2.42,
    "EU": 2.4, "GD": 2.38, "TB": 2.37, "DY": 2.35, "HO": 2.33, "ER": 2.32, "TM": 2.3,
    "YB": 2.28, "LU": 2.27, "HF": 2.25, "TA": 2.2, "W": 2.1, "RE": 2.05, "OS": 2.0,
    "IR": 2.0, "PT": 2.05, "AU": 2.1, "HG": 2.05, "TL": 1.96, "PB": 2.02, "BI": 2.07,
    "PO": 1.97, "AT": 2.02, "RN": 2.2, "FR": 3.48, "RA": 2.83, "AC": 2.0, "TH": 2.4,
    "PA": 2.0, "U": 2.3, "NP": 2.0, "PU": 2.0, "AM": 2.0, "CM": 2.0, "BK": 2.0,
    "CF": 2.0, "ES": 2.0, "FM": 2.0, "MD": 2.0, "NO": 2.0, "LR": 2.0, "RF": 2.0,
    "DB": 2.0, "SG": 2.0, "BH": 2.0, "HS": 2.0, "MT": 2.0, "DS": 2.0, "RG": 2.0,
    "CN": 2.0, "UUT": 2.0, "FL": 2.0, "UUP": 2.0, "LV": 2.0, "UUH": 2.0,

    "": 2.0
};


// http://dx.doi.org/10.1039/b801115j (or 1.6)
NGL.CovalentRadii = {
    "H": 0.31, "HE": 0.28, "LI": 1.28, "BE": 0.96, "B": 0.84, "C": 0.76,
    "N": 0.71, "O": 0.66, "F": 0.57, "NE": 0.58, "NA": 1.66, "MG": 1.41, "AL": 1.21,
    "SI": 1.11, "P": 1.07, "S": 1.05, "CL": 1.02, "AR": 1.06, "K": 2.03, "CA": 1.76,
    "SC": 1.7, "TI": 1.6, "V": 1.53, "CR": 1.39, "MN": 1.39, "FE": 1.32, "CO": 1.26,
    "NI": 1.24, "CU": 1.32, "ZN": 1.22, "GA": 1.22, "GE": 1.2, "AS": 1.19, "SE": 1.2,
    "BR": 1.2, "KR": 1.16, "RB": 2.2, "SR": 1.95, "Y": 1.9, "ZR": 1.75, "NB": 1.64,
    "MO": 1.54, "TC": 1.47, "RU": 1.46, "RH": 1.42, "PD": 1.39, "AG": 1.45, "CD": 1.44,
    "IN": 1.42, "SN": 1.39, "SB": 1.39, "TE": 1.38, "I": 1.39, "XE": 1.4, "CS": 2.44,
    "BA": 2.15, "LA": 2.07, "CE": 2.04, "PR": 2.03, "ND": 2.01, "PM": 1.99, "SM": 1.98,
    "EU": 1.98, "GD": 1.96, "TB": 1.94, "DY": 1.92, "HO": 1.92, "ER": 1.89, "TM": 1.9,
    "YB": 1.87, "LU": 1.87, "HF": 1.75, "TA": 1.7, "W": 1.62, "RE": 1.51, "OS": 1.44,
    "IR": 1.41, "PT": 1.36, "AU": 1.36, "HG": 1.32, "TL": 1.45, "PB": 1.46, "BI": 1.48,
    "PO": 1.4, "AT": 1.5, "RN": 1.5, "FR": 2.6, "RA": 2.21, "AC": 2.15, "TH": 2.06,
    "PA": 2.0, "U": 1.96, "NP": 1.9, "PU": 1.87, "AM": 1.8, "CM": 1.69, "BK": 1.6,
    "CF": 1.6, "ES": 1.6, "FM": 1.6, "MD": 1.6, "NO": 1.6, "LR": 1.6, "RF": 1.6,
    "DB": 1.6, "SG": 1.6, "BH": 1.6, "HS": 1.6, "MT": 1.6, "DS": 1.6, "RG": 1.6,
    "CN": 1.6, "UUT": 1.6, "FL": 1.6, "UUP": 1.6, "LV": 1.6, "UUH": 1.6,

    "": 1.6
};


// Peter Rose (peter.rose@rcsb.org), private communication, average accross PDB
NGL.ResidueRadii = {
    "2QY": 6.58, "CY0": 11.98, "2QZ": 2.52, "CY1": 6.59, "HHK": 5.11, "CXM": 4.69, "HHI": 4.58, "CY4": 4.57,
    "S12": 18.57, "CY3": 2.79, "C5C": 5.35, "PFX": 11.84, "2R3": 6.94, "2R1": 3.78, "ILX": 4.99, "32S": 5.68,
    "BTK": 8.59, "32T": 5.72, "FAK": 9.8, "B27": 2.78, "ILM": 3.84, "C4R": 5.63, "32L": 6.75, "SYS": 3.01,
    "1MH": 5.04, "ILE": 3.65, "YNM": 6.39, "2RX": 4.91, "B3A": 2.48, "GEE": 4.76, "7MN": 7.34, "B3E": 5.4,
    "ARG": 6.33, "200": 6.89, "HIP": 5.47, "HIA": 4.64, "B3K": 5.89, "HIC": 5.76, "B3L": 4.96, "B3M": 5.07,
    "ARM": 6.86, "ARO": 7.35, "AR4": 8.42, "PG1": 10.67, "YOF": 6.44, "IML": 3.74, "SXE": 6.65, "HIQ": 7.98,
    "PFF": 6.31, "HIS": 4.52, "0TD": 3.62, "C3Y": 5.24, "1OP": 11.55, "02Y": 4.77, "02V": 4.83, "ASB": 5.59,
    "30V": 8.53, "S2P": 4.81, "ASP": 3.55, "ASN": 3.54, "2OR": 6.91, "QMM": 6.13, "2P0": 8.52, "ASL": 5.36,
    "HFA": 5.14, "5PG": 5.69, "B3X": 4.38, "AS9": 4.1, "ARV": 7.59, "B3U": 6.06, "S2C": 7.54, "B3T": 3.34,
    "175": 5.64, "GFT": 8.18, "HG7": 6.8, "B3Q": 4.48, "ASA": 3.64, "02K": 2.94, "B3Y": 7.45, "PHD": 5.35,
    "C6C": 6.42, "BUC": 5.8, "HGL": 8.07, "PHE": 5.06, "03Y": 2.6, "PHA": 5.11, "OCY": 5.0, "4PH": 6.79,
    "5OH": 4.7, "31Q": 10.46, "BTR": 7.98, "3PX": 4.7, "1PA": 8.07, "ASX": 3.54, "IOR": 7.23, "03E": 3.38,
    "PHL": 5.17, "KWS": 5.09, "PHI": 7.12, "NAL": 7.22, "S1H": 19.21, "2ML": 3.86, "2MR": 7.35, "GHG": 4.83,
    "TYY": 6.54, "2MT": 3.67, "56A": 13.01, "SVA": 5.46, "TYX": 8.31, "TYS": 8.59, "TYR": 6.38, "TYQ": 6.43,
    "HLU": 3.99, "MYK": 19.47, "TYO": 7.71, "HLX": 4.98, "TYN": 9.87, "TYJ": 6.25, "TYI": 6.49, "LYH": 5.13,
    "LYF": 12.19, "SUN": 6.73, "LYR": 18.28, "TYB": 6.46, "11W": 14.39, "LYS": 5.54, "LYN": 4.8, "11Q": 4.85,
    "LYO": 4.71, "LYZ": 1.76, "TXY": 6.44, "MYN": 4.71, "TY5": 10.6, "HMR": 5.09, "01W": 8.55, "LYX": 13.36,
    "TY8": 7.22, "TY2": 6.49, "KYN": 6.18, "KYQ": 9.75, "CZZ": 5.14, "IIL": 3.81, "HNC": 10.41, "OIC": 4.62,
    "LVN": 2.89, "QIL": 3.84, "JJL": 8.3, "VAH": 3.88, "JJJ": 7.5, "JJK": 7.43, "VAD": 2.56, "CYW": 4.65,
    "0QL": 5.72, "143": 8.22, "SVX": 7.04, "CYJ": 11.64, "SVY": 7.1, "SVZ": 6.6, "CYG": 8.03, "CYF": 13.54,
    "SVV": 5.09, "GL3": 2.72, "8SP": 14.26, "CYS": 2.78, "004": 4.33, "CYR": 10.33, "PLJ": 3.71, "EXY": 7.37,
    "HL2": 3.75, "A5N": 5.21, "CYQ": 5.67, "CZ2": 5.16, "LWY": 4.12, "PM3": 8.78, "OHS": 6.98, "OHI": 5.35,
    "3TY": 8.42, "CYD": 8.55, "DYS": 7.87, "DAH": 6.47, "4IK": 11.81, "3EG": 3.66, "AYA": 3.65, "4IN": 6.31,
    "DAB": 3.48, "4HT": 6.03, "RGL": 7.03, "DAM": 2.49, "NFA": 5.04, "WFP": 6.07, "2JC": 2.97, "HAR": 7.55,
    "2JG": 5.67, "MH6": 1.72, "2JF": 9.13, "3FG": 4.96, "MGN": 4.84, "AZH": 5.36, "AZK": 6.03, "ZBZ": 7.79,
    "TBG": 2.58, "VAL": 2.51, "MGG": 7.34, "AZS": 5.61, "FHL": 9.75, "2JH": 4.56, "IEL": 7.07, "FHO": 6.75,
    "DA2": 7.79, "FH7": 6.99, "ME0": 4.52, "3GL": 4.84, "MDO": 5.03, "AZY": 7.37, "A8E": 3.76, "ZCL": 6.71,
    "MDH": 2.58, "LA2": 14.07, "4FW": 6.1, "YCM": 5.32, "MDF": 4.95, "YCP": 3.01, "TEF": 8.63, "FGP": 4.34,
    "UF0": 19.72, "XCN": 4.57, "FGL": 2.56, "MF3": 6.37, "MEQ": 5.13, "LAA": 3.23, "IGL": 5.52, "MET": 4.49,
    "NIY": 6.81, "QCS": 5.18, "TCQ": 8.56, "MEN": 4.33, "4HL": 8.79, "MEA": 4.95, "EFC": 5.28, "LAL": 2.41,
    "2HF": 5.52, "KBE": 5.64, "OCS": 3.94, "CAF": 5.46, "NC1": 11.4, "NBQ": 9.82, "CAB": 4.19, "MBQ": 9.55,
    "193": 7.38, "192": 2.44, "0WZ": 7.61, "CAS": 5.35, "NB8": 11.98, "OBS": 11.71, "1AC": 2.42, "PCA": 3.48,
    "MCL": 9.73, "LBY": 7.75, "GAU": 4.67, "PBF": 9.75, "MCG": 6.46, "DDE": 6.86, "19W": 3.94, "MD5": 9.33,
    "MD6": 6.44, "MD3": 8.41, "MCS": 7.56, "OBF": 3.64, "UAL": 4.68, "PAT": 6.05, "IAM": 8.88, "PAQ": 8.77,
    "FDL": 9.49, "NCB": 3.45, "LCK": 9.81, "DDZ": 2.52, "2FM": 5.54, "IAR": 6.77, "OAS": 4.8, "HBN": 8.8,
    "TA4": 5.55, "1C3": 7.43, "ECX": 5.51, "PF5": 6.28, "RE3": 5.29, "FCL": 6.25, "ECC": 4.79, "LDH": 7.06,
    "NCY": 2.91, "CCS": 4.58, "PEC": 6.54, "2CO": 4.45, "LE1": 2.72, "HCM": 5.53, "07O": 8.05, "HCL": 4.96,
    "NEP": 6.94, "PE1": 8.01, "LEF": 4.37, "FC0": 5.18, "LED": 4.34, "HCS": 4.09, "DBU": 2.49, "RE0": 5.53,
    "LEN": 3.82, "1E3": 8.71, "BB9": 2.56, "BB8": 5.14, "PCS": 5.05, "BB7": 4.56, "BB6": 2.62, "LEU": 3.83,
    "DBZ": 7.08, "LET": 11.29, "DBY": 6.46, "ICY": 7.76, "MAA": 2.4, "CGA": 7.91, "5CS": 8.34, "UGY": 3.7,
    "LGY": 11.71, "N10": 8.96, "AAR": 6.39, "FT6": 7.5, "MOD": 12.62, "5CW": 7.21, "PVH": 4.58, "BBC": 6.42,
    "YYA": 7.3, "O12": 14.08, "NOT": 7.15, "KGC": 9.88, "MP4": 5.86, "0CS": 4.07, "MP8": 3.75, "VLL": 2.54,
    "VLM": 2.51, "BCS": 8.03, "MNL": 4.9, "AA4": 4.47, "SAC": 3.49, "BCX": 2.99, "3CF": 6.47, "SAH": 11.7,
    "NNH": 6.86, "CGU": 4.71, "SIB": 12.41, "TLY": 8.78, "SIC": 4.81, "VMS": 8.82, "TMD": 6.76, "MMO": 6.53,
    "PXU": 2.46, "4AW": 6.22, "OTH": 3.6, "DLS": 6.84, "MME": 4.99, "DM0": 6.99, "0FL": 2.76, "SBL": 8.96,
    "CDV": 3.72, "OTY": 6.51, "PYA": 7.75, "2AS": 3.57, "DMH": 4.92, "ELY": 7.42, "GVL": 9.6, "FVA": 2.9,
    "SAR": 2.48, "4BF": 6.92, "EME": 4.69, "CDE": 2.51, "3AR": 7.86, "3AH": 9.11, "AC5": 2.44, "FTR": 6.08,
    "MLL": 3.76, "NPH": 11.66, "NPI": 6.9, "DMT": 6.67, "PYX": 11.3, "MLE": 3.87, "PYL": 9.67, "ZZU": 6.94,
    "H5M": 3.61, "SCH": 4.46, "DMK": 3.52, "FTY": 9.07, "2AG": 3.7, "ABA": 2.55, "ZZJ": 2.44, "MLZ": 6.8,
    "MLY": 6.88, "KCX": 7.28, "ZZD": 8.16, "3A5": 5.37, "LHC": 7.75, "9AT": 2.47, "OZT": 3.4, "THO": 2.62,
    "THR": 2.5, "DFI": 3.93, "MKD": 6.42, "4CY": 4.6, "SDP": 6.07, "DFO": 3.94, "0A0": 3.45, "4DB": 9.73,
    "ML3": 6.26, "BG1": 8.02, "SD4": 4.57, "THC": 3.8, "SCS": 5.48, "TH5": 4.65, "BFD": 5.33, "AEI": 6.34,
    "TH6": 2.85, "SCY": 4.53, "TIS": 4.81, "SEE": 4.53, "BHD": 3.48, "SEB": 8.18, "SEC": 2.96, "SEP": 4.8,
    "CLH": 7.13, "TIH": 5.02, "CLG": 13.62, "SEN": 6.43, "XXA": 7.34, "SEL": 2.46, "SE7": 4.19, "4CF": 7.72,
    "G8M": 3.57, "BH2": 3.51, "UN2": 3.22, "VR0": 10.51, "MK8": 4.76, "DHA": 2.32, "LMQ": 4.69, "SFE": 5.01,
    "AHB": 3.47, "OXX": 7.05, "BIF": 9.63, "IZO": 4.47, "NMM": 8.25, "0BN": 7.0, "HZP": 3.12, "NMC": 4.23,
    "DHL": 2.69, "9DS": 9.29, "SER": 2.41, "CHG": 4.2, "MIR": 6.54, "AGQ": 7.79, "SET": 2.46, "MIS": 6.32,
    "4FB": 3.08, "0AR": 8.46, "LME": 3.99, "FZN": 24.42, "AGT": 9.04, "IYR": 6.46, "9DN": 9.31, "CHP": 5.75,
    "UNK": 1.64, "XX1": 9.92, "AGM": 6.57, "0AH": 5.78, "LLP": 10.22, "0AF": 6.72, "4DP": 9.28, "HYP": 2.25,
    "DIR": 5.8, "LLY": 8.71, "0AK": 6.11, "NLE": 4.67, "OYL": 6.42, "WVL": 4.69, "0A8": 8.1, "NLY": 6.37,
    "MHO": 4.89, "VOL": 2.55, "0A1": 7.1, "MHL": 3.92, "NLP": 4.81, "NLQ": 4.65, "MHW": 2.74, "BIL": 4.7,
    "NLO": 4.8, "MHU": 7.51, "XW1": 9.36, "LLO": 10.13, "SGB": 6.88, "MHV": 3.6, "MHS": 4.51, "0A9": 5.17,
    "0LF": 9.96, "HT7": 6.82, "X2W": 6.6, "YPZ": 9.38, "I58": 6.73, "FLA": 2.4, "M0H": 4.83, "HSL": 2.46,
    "FLE": 6.17, "KOR": 10.1, "1VR": 3.89, "HSO": 4.56, "TTS": 9.41, "RVX": 7.01, "TTQ": 7.71, "H14": 5.27,
    "HTI": 7.8, "ONH": 6.14, "LP6": 8.58, "ONL": 4.83, "AHH": 5.06, "HS8": 7.4, "HS9": 4.71, "BL2": 5.82,
    "AHP": 5.26, "6HN": 7.34, "HRP": 5.46, "POM": 3.6, "WPA": 5.11, "2ZC": 4.29, "CPC": 2.65, "AIB": 2.4,
    "XSN": 3.47, "M2S": 5.28, "GND": 6.67, "GNC": 4.6, "MVA": 2.56, "OLZ": 5.32, "M2L": 6.15, "TRF": 6.69,
    "NZH": 7.66, "SRZ": 5.27, "OLD": 10.47, "CME": 5.86, "CMH": 5.3, "ALA": 2.38, "TRQ": 7.36, "PPN": 7.24,
    "TRP": 6.07, "TRO": 5.82, "TRN": 5.95, "NYS": 8.1, "ALC": 5.26, "U3X": 11.7, "HVA": 2.58, "TS9": 3.92,
    "TRX": 7.27, "TRW": 11.8, "LPL": 7.51, "GMA": 4.4, "OMT": 5.07, "CMT": 3.54, "GME": 4.66, "NYB": 6.07,
    "PR3": 5.12, "LPD": 2.48, "GLU": 4.49, "1X6": 6.84, "LPG": 2.39, "GLX": 4.52, "PR4": 4.52, "CML": 6.16,
    "FME": 4.52, "HTR": 6.48, "PR7": 4.66, "Z3E": 7.2, "GLZ": 2.39, "BMT": 6.37, "WRP": 8.16, "GLY": 2.37,
    "OMY": 6.11, "MTY": 5.46, "OMX": 6.15, "GLN": 4.46, "2XA": 8.25, "28X": 7.84, "7JA": 9.46, "FLT": 9.65,
    "GLJ": 3.7, "OMH": 5.26, "TSY": 4.26, "PRV": 4.28, "CS4": 11.21, "DOA": 12.33, "23P": 5.42, "CS3": 8.24,
    "6CL": 6.47, "PRR": 5.58, "KST": 11.58, "CS1": 7.23, "PRS": 2.63, "ZYJ": 11.4, "IT1": 9.75, "UU5": 4.98,
    "ESB": 6.69, "UU4": 2.49, "ESC": 5.65, "LSO": 10.58, "ZYK": 11.45, "9NV": 8.99, "23F": 5.27, "ORN": 4.25,
    "HOX": 6.61, "CSD": 3.95, "FP9": 3.03, "DO2": 4.44, "SLL": 11.53, "P3Q": 9.54, "ORQ": 6.04, "MSL": 5.21,
    "DNP": 2.45, "CSB": 3.51, "WLU": 4.24, "CSA": 5.7, "MT2": 5.51, "CSO": 3.53, "TPO": 4.73, "MSP": 13.11,
    "23S": 6.09, "MSO": 4.96, "PRO": 2.41, "TPL": 5.41, "DNS": 8.79, "CSK": 3.91, "Z70": 7.4, "CSJ": 7.51,
    "DNW": 7.97, "PRK": 9.15, "GSU": 11.81, "LTA": 6.57, "HPE": 6.63, "TPQ": 6.48, "PRJ": 5.26, "PSW": 4.65,
    "L3O": 3.89, "CSU": 4.89, "ALY": 7.38, "M3L": 7.12, "CSW": 3.68, "XPR": 7.68, "D4P": 5.66, "FOE": 8.17,
    "SLZ": 5.69, "CSP": 5.26, "TQI": 7.68, "ALT": 2.72, "CSR": 5.42, "CSS": 3.61, "M3R": 7.18, "ALO": 2.57,
    "R4K": 4.67, "SMF": 9.0, "MSA": 2.73, "SMC": 3.39, "CSX": 3.47, "SME": 4.8, "ETA": 2.4, "CSZ": 3.6,
    "22G": 8.8, "MSE": 4.62, "ALN": 6.16, "PSH": 7.26, "CTE": 7.27, "DON": 6.72, "CTH": 3.45, "U2X": 11.54,
    "6CW": 7.56, "TQZ": 6.97, "3YM": 6.52, "OSE": 4.49, "2VA": 9.82, "TQQ": 7.76, "NRG": 8.35, "BPE": 7.24,
    "F2F": 6.25, "1TQ": 8.58, "I2M": 3.13, "NVA": 3.76, "R1A": 8.2, "QPA": 6.95, "C1X": 11.63, "FRD": 5.05,
    "HR7": 6.98, "SNC": 3.93, "QPH": 5.15, "26B": 8.39, "DPQ": 6.54, "DPP": 2.51, "2TY": 8.65, "TNR": 6.88,
    "PTH": 8.35, "DPL": 3.58, "APK": 8.79, "1TY": 8.84, "HRG": 7.36, "PTM": 8.74, "1U8": 3.62, "PTR": 8.64,
    "LVG": 3.01, "6FL": 4.85, "SOC": 4.05, "KPI": 9.79, "IPG": 2.91, "P2Y": 2.51, "N2C": 3.55, "T0I": 7.34,
    "MPH": 5.29, "R2T": 4.71, "TOX": 6.78, "P2Q": 9.8, "GPL": 10.77, "MPJ": 5.07, "F2Y": 6.2, "T11": 8.58,
    "9NR": 9.33, "FPR": 8.85, "9NF": 8.93, "KPY": 10.17, "9NE": 9.77, "TOQ": 7.5, "MPQ": 4.2, "FPK": 3.08,
    "HQA": 7.25, "SOY": 10.94,

    "": 5.0
};


// http://blanco.biomol.uci.edu/Whole_residue_HFscales.txt
NGL.ResidueHydrophobicity = {
    // AA  DGwif   DGwoct  Oct-IF
    "ALA": [  0.17,  0.50,  0.33 ],
    "ARG": [  0.81,  1.81,  1.00 ],
    "ASN": [  0.42,  0.85,  0.43 ],
    "ASP": [  1.23,  3.64,  2.41 ],
    "ASH": [ -0.07,  0.43,  0.50 ],
    "CYS": [ -0.24, -0.02,  0.22 ],
    "GLN": [  0.58,  0.77,  0.19 ],
    "GLU": [  2.02,  3.63,  1.61 ],
    "GLH": [ -0.01,  0.11,  0.12 ],
    "GLY": [  0.01,  1.15,  1.14 ],
    // "His+": [  0.96,  2.33,  1.37 ],
    "HIS": [  0.17,  0.11, -0.06 ],
    "ILE": [ -0.31, -1.12, -0.81 ],
    "LEU": [ -0.56, -1.25, -0.69 ],
    "LYS": [  0.99,  2.80,  1.81 ],
    "MET": [ -0.23, -0.67, -0.44 ],
    "PHE": [ -1.13, -1.71, -0.58 ],
    "PRO": [  0.45,  0.14, -0.31 ],
    "SER": [  0.13,  0.46,  0.33 ],
    "THR": [  0.14,  0.25,  0.11 ],
    "TRP": [ -1.85, -2.09, -0.24 ],
    "TYR": [ -0.94, -0.71,  0.23 ],
    "VAL": [  0.07, -0.46, -0.53 ],

    "": [ 0.00, 0.00, 0.00 ]
};


NGL.guessElement = function(){

    var elm1 = [ "H", "C", "O", "N", "S", "P" ];
    var elm2 = [ "NA", "CL" ];

    return function( atomName ){

        var at = atomName.trim().toUpperCase();
        if( parseInt( at.charAt( 0 ) ) ) at = at.substr( 1 );
        var n = at.length;

        if( n===0 ) return "";

        if( n===1 ) return at;

        if( n===2 ){

            if( elm2.indexOf( at )!==-1 ) return at;

            if( elm1.indexOf( at[0] )!==-1 ) return at[0];

        }

        if( n>=3 ){

            if( elm1.indexOf( at[0] )!==-1 ) return at[0];

        }

        return "";

    };

}();


// molecule types
NGL.UnknownType = 0;
NGL.CgType = 1;
NGL.ProteinType = 2;
NGL.ProteinBackboneType = 3;
NGL.NucleicType = 4;
NGL.RnaBackboneType = 5;
NGL.DnaBackboneType = 6;
NGL.WaterType = 7;


NGL.AA1 = {
    'HIS': 'H',
    'ARG': 'R',
    'LYS': 'K',
    'ILE': 'I',
    'PHE': 'F',
    'LEU': 'L',
    'TRP': 'W',
    'ALA': 'A',
    'MET': 'M',
    'PRO': 'P',
    'CYS': 'C',
    'ASN': 'N',
    'VAL': 'V',
    'GLY': 'G',
    'SER': 'S',
    'GLN': 'Q',
    'TYR': 'Y',
    'ASP': 'D',
    'GLU': 'E',
    'THR': 'T',

    'ASH': 'D',
    'GLH': 'E',

    'UNK': '',
};


////////////
// GidPool

NGL.GidPool = {

    // REMEMBER not synced with worker

    nextGid: 1,

    objectList: [],

    rangeList: [],

    addObject: function( object ){

        NGL.GidPool.objectList.push( object );

        NGL.GidPool.rangeList.push( NGL.GidPool.allocateGidRange( object ) );

        return NGL.GidPool;

    },

    removeObject: function( object ){

        var idx = NGL.GidPool.objectList.indexOf( object );

        if( idx !== -1 ){

            NGL.GidPool.objectList.splice( idx, 1 );
            NGL.GidPool.rangeList.splice( idx, 1 );

            if( NGL.GidPool.objectList.length === 0 ){
                NGL.GidPool.nextGid = 1;
            }

        }

        return NGL.GidPool;

    },

    updateObject: function( object, silent ){

        var idx = NGL.GidPool.objectList.indexOf( object );

        if( idx !== -1 ){

            var range = NGL.GidPool.rangeList[ idx ];

            if( range[1] === NGL.GidPool.nextGid ){

                var count = NGL.GidPool.getGidCount( object );
                NGL.GidPool.nextGid += count - ( range[1] - range[0] );
                range[ 1 ] = NGL.GidPool.nextGid;

            }else{

                NGL.GidPool.rangeList[ idx ] = NGL.GidPool.allocateGidRange( object );

            }

        }else{

            if( !silent ){

                NGL.warn( "NGL.GidPool.updateObject: object not found." );

            }

        }

        return NGL.GidPool;

    },

    getGidCount: function( object ){

        var count = 0;

        if( object instanceof NGL.Structure ){

            count = object.atomCount;

        }else if( object instanceof NGL.BondSet ){

            count = object.bondCount;

        }else if( object instanceof NGL.Volume ){

            count = object.__data.length;

        }

        return count;

    },

    allocateGidRange: function( object ){

        var firstGid = NGL.GidPool.nextGid;

        NGL.GidPool.nextGid += NGL.GidPool.getGidCount( object );

        return [ firstGid, NGL.GidPool.nextGid ];

    },

    freeGidRange: function( object ){

        // TODO

    },

    getNextGid: function(){

        return NGL.GidPool.nextGid++;

    },

    getGid: function( object, offset ){

        offset = offset || 0;

        var gid = 0;
        var idx = NGL.GidPool.objectList.indexOf( object );

        if( idx !== -1 ){

            var range = NGL.GidPool.rangeList[ idx ];
            var first = range[ 0 ];

            gid = first + offset;

        }else{

            NGL.warn( "NGL.GidPool.getGid: object not found." );

        }

        return gid;

    },

    getByGid: function( gid ){

        // TODO
        // - early exit
        // - binary search

        var entity;

        NGL.GidPool.objectList.forEach( function( o, i ){

            if( o instanceof NGL.Structure ){

                o.eachAtom( function( a ){

                    if( NGL.GidPool.getGid( o, a.index ) === gid ){
                        entity = a;
                    }

                } );

            }else if( o instanceof NGL.BondSet ){

                o.eachBond( function( b ){

                    if( NGL.GidPool.getGid( o, b.index ) === gid ){
                        entity = b;
                    }

                } );

            }else if( o instanceof NGL.Volume ){

                var range = NGL.GidPool.rangeList[ i ];

                if( gid >= range[ 0 ] && gid < range[ 1 ] ){

                    var offset = gid - range[ 0 ];

                    entity = {
                        volume: o,
                        index: offset,
                        value: o.data[ offset ],
                        x: o.dataPosition[ offset * 3 ],
                        y: o.dataPosition[ offset * 3 + 1 ],
                        z: o.dataPosition[ offset * 3 + 2 ],
                    };

                }

            }

        } );

        return entity;

    }

}


///////////////
// ColorMaker

NGL.ColorMakerRegistry = {

    signals: {

        typesChanged: new signals.Signal(),

    },

    scales: {

        "": "",

        // Sequential
        "OrRd": "[S] Orange-Red",
        "PuBu": "[S] Purple-Blue",
        "BuPu": "[S] Blue-Purple",
        "Oranges": "[S] Oranges",
        "BuGn": "[S] Blue-Green",
        "YlOrBr": "[S] Yellow-Orange-Brown",
        "YlGn": "[S] Yellow-Green",
        "Reds": "[S] Reds",
        "RdPu": "[S] Red-Purple",
        "Greens": "[S] Greens",
        "YlGnBu": "[S] Yellow-Green-Blue",
        "Purples": "[S] Purples",
        "GnBu": "[S] Green-Blue",
        "Greys": "[S] Greys",
        "YlOrRd": "[S] Yellow-Orange-Red",
        "PuRd": "[S] Purple-Red",
        "Blues": "[S] Blues",
        "PuBuGn": "[S] Purple-Blue-Green",

        // Diverging
        "Spectral": "[D] Spectral",
        "RdYlGn": "[D] Red-Yellow-Green",
        "RdBu": "[D] Red-Blue",
        "PiYG": "[D] Pink-Yellowgreen",
        "PRGn": "[D] Purplered-Green",
        "RdYlBu": "[D] Red-Yellow-Blue",
        "BrBG": "[D] Brown-Bluegreen",
        "RdGy": "[D] Red-Grey",
        "PuOr": "[D] Purple-Orange",

        // Qualitative
        "Set1": "[Q] Set1",
        "Set2": "[Q] Set2",
        "Set3": "[Q] Set3",
        "Dark2": "[Q] Dark2",
        "Paired": "[Q] Paired",
        "Pastel1": "[Q] Pastel1",
        "Pastel2": "[Q] Pastel2",
        "Accent": "[Q] Accent",

        // Other
        "roygb": "[?] Rainbow",
        "rwb": "[?] Red-White-Blue",

    },

    modes: {

        "": "",

        "rgb": "Red Green Blue",
        "hsv": "Hue Saturation Value",
        "hsl": "Hue Saturation Lightness",
        "hsi": "Hue Saturation Intensity",
        "lab": "CIE L*a*b*",
        "hcl": "Hue Chroma Lightness"

    },

    types: {},

    userSchemes: {},

    getScheme: function( params ){

        var p = params || {};

        var id = p.scheme || "";

        var schemeClass;

        if( id in NGL.ColorMakerRegistry.types ){

            schemeClass = NGL.ColorMakerRegistry.types[ id ];

        }else if( id in NGL.ColorMakerRegistry.userSchemes ){

            schemeClass = NGL.ColorMakerRegistry.userSchemes[ id ];

        }else{

            schemeClass = NGL.ColorMaker;

        }

        return new schemeClass( params );

    },

    getPickingScheme: function( params ){

        var p = Object.assign( params || {} );
        p.scheme = "picking";

        return NGL.ColorMakerRegistry.getScheme( p );

    },

    getTypes: function(){

        var types = {};

        Object.keys( NGL.ColorMakerRegistry.types ).forEach( function( k ){
            // NGL.ColorMakerRegistry.types[ k ]
            types[ k ] = k;
        } );

        Object.keys( NGL.ColorMakerRegistry.userSchemes ).forEach( function( k ){
            types[ k ] = k.split( "|" )[ 1 ];
        } );

        return types;

    },

    getScales: function(){

        return NGL.ColorMakerRegistry.scales;

    },

    getModes: function(){

        return NGL.ColorMakerRegistry.modes;

    },

    addScheme: function( scheme, label ){

        if( !( scheme instanceof NGL.ColorMaker ) ){

            scheme = NGL.ColorMakerRegistry.createScheme( scheme, label );

        }

        label = label || "";
        var id = "" + THREE.Math.generateUUID() + "|" + label;

        NGL.ColorMakerRegistry.userSchemes[ id ] = scheme;
        NGL.ColorMakerRegistry.signals.typesChanged.dispatch();

        return id;

    },

    removeScheme: function( id ){

        delete NGL.ColorMakerRegistry.userSchemes[ id ];
        NGL.ColorMakerRegistry.signals.typesChanged.dispatch();

    },

    createScheme: function( constructor, label ){

        var ColorMaker = function( params ){

            NGL.ColorMaker.call( this, params );

            this.label = label || "";

            constructor.call( this, params );

        }

        ColorMaker.prototype = NGL.ColorMaker.prototype;

        ColorMaker.prototype.constructor = ColorMaker;

        return ColorMaker;

    },

    addSelectionScheme: function( pairList, label ){

        return NGL.ColorMakerRegistry.addScheme( function( params ){

            var colorList = [];
            var selectionList = [];

            pairList.forEach( function( pair ){

                colorList.push( new THREE.Color( pair[ 0 ] ).getHex() );
                selectionList.push( new NGL.Selection( pair[ 1 ] ) );

            } );

            var n = pairList.length;

            this.atomColor = function( a ){

                for( var i = 0; i < n; ++i ){

                    if( selectionList[ i ].test( a ) ){

                        return colorList[ i ];

                    }

                }

                return 0xFFFFFF;

            };

        }, label );

    }

}


NGL.ColorMaker = function( params ){

    var p = params || {};

    this.scale = p.scale || "uniform";
    this.mode = p.mode || "hcl";
    this.domain = p.domain || [ 0, 1 ];
    this.value = new THREE.Color( p.value || 0xFFFFFF ).getHex();

    this.structure = p.structure;
    this.bondSet = p.bondSet;
    this.volume = p.volume;
    this.surface = p.surface;

};

NGL.ColorMaker.prototype = {

    constructor: NGL.ColorMaker,

    getScale: function( params ){

        var p = params || {};

        var scale = p.scale || this.scale;
        if( scale === "rainbow" || scale === "roygb" ){
            scale = [ "red", "orange", "yellow", "green", "blue" ];
        }else if( scale === "rwb" ){
            scale = [ "red", "white", "blue" ];
        }

        return chroma
            .scale( scale )
            .mode( p.mode || this.mode )
            .domain( p.domain || this.domain )
            .out( "num" );

    },

    atomColor: function( a ){

        return 0xFFFFFF;

    },

    atomColorToArray: function( a, array, offset ){

        var c = this.atomColor( a );

        if( array === undefined ) array = [];
        if( offset === undefined ) offset = 0;

        array[ offset + 0 ] = ( c >> 16 & 255 ) / 255;
        array[ offset + 1 ] = ( c >> 8 & 255 ) / 255;
        array[ offset + 2 ] = ( c & 255 ) / 255;

        return array;

    },

    bondColor: function( b, fromTo ){

        return this.atomColor( fromTo ? b.atom1 : b.atom2 );

    },

    bondColorToArray: function( b, fromTo, array, offset ){

        var c = this.bondColor( b, fromTo );

        if( array === undefined ) array = [];
        if( offset === undefined ) offset = 0;

        array[ offset + 0 ] = ( c >> 16 & 255 ) / 255;
        array[ offset + 1 ] = ( c >> 8 & 255 ) / 255;
        array[ offset + 2 ] = ( c & 255 ) / 255;

        return array;

    },

    volumeColor: function( i ){

        return 0xFFFFFF;

    },

    volumeColorToArray: function( i, array, offset ){

        var c = this.volumeColor( i );

        if( array === undefined ) array = [];
        if( offset === undefined ) offset = 0;

        array[ offset + 0 ] = ( c >> 16 & 255 ) / 255;
        array[ offset + 1 ] = ( c >> 8 & 255 ) / 255;
        array[ offset + 2 ] = ( c & 255 ) / 255;

        return array;

    }

};


NGL.ValueColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

    var valueScale = this.getScale();

    this.volumeColor = function( i ){

        return valueScale( this.volume.data[ i ] );

    };

};

NGL.ValueColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.ValueColorMaker.prototype.constructor = NGL.ValueColorMaker;


NGL.PickingColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

    this.atomColor = function( a ){

        return NGL.GidPool.getGid( this.structure, a.index );

    };

    this.bondColor = function( b, fromTo ){

        return NGL.GidPool.getGid( this.bondSet, b.index );

    };

    this.volumeColor = function( i ){

        return NGL.GidPool.getGid( this.volume, i );

    };

};

NGL.PickingColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.PickingColorMaker.prototype.constructor = NGL.PickingColorMaker;


NGL.RandomColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

    this.atomColor = function( a ){

        return Math.random() * 0xFFFFFF;

    };

};

NGL.RandomColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.RandomColorMaker.prototype.constructor = NGL.RandomColorMaker;


NGL.UniformColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

    var color = this.value;

    this.atomColor = function(){

        return color;

    };

    this.bondColor = function(){

        return color;

    };

    this.valueColor = function(){

        return color;

    };

};

NGL.UniformColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.UniformColorMaker.prototype.constructor = NGL.UniformColorMaker;


NGL.AtomindexColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

    if( !params.scale ){
        this.scale = "roygb";
    }

    if( !params.domain ){
        this.domain = [ 0, this.structure.atomCount ];
    }

    var atomindexScale = this.getScale();

    this.atomColor = function( a ){

        return atomindexScale( a.index );

    };

};

NGL.AtomindexColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.AtomindexColorMaker.prototype.constructor = NGL.AtomindexColorMaker;


NGL.ResidueindexColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

    if( !params.scale ){
        this.scale = "roygb";
    }

    if( !params.domain ){
        this.domain = [ 0, this.structure.residueCount ];
    }

    var residueindexScale = this.getScale();

    this.atomColor = function( a ){

        return residueindexScale( a.residue.index );

    };

};

NGL.ResidueindexColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.ResidueindexColorMaker.prototype.constructor = NGL.ResidueindexColorMaker;


NGL.ChainindexColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

    if( !params.scale ){
        this.scale = "Spectral";
    }

    if( !params.domain ){
        this.domain = [ 0, this.structure.chainCount ];
    }

    var chainindexScale = this.getScale();

    var chainNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
                      "abcdefghijklmnopqrstuvwxyz" +
                      "0123456789";

    var chainnameScale = this.getScale( { domain: [ 0, 26 ] } );

    this.atomColor = function( a ){

        if( a.residue.chain.chainname === "" ){
            return chainnameScale(
                chainNames.indexOf( a.chainname ) * 10
            );
        }else{
            return chainindexScale( a.residue.chain.index );
        }

    };

};

NGL.ChainindexColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.ChainindexColorMaker.prototype.constructor = NGL.ChainindexColorMaker;


NGL.ModelindexColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

    if( !params.scale ){
        this.scale = "roygb";
    }

    if( !params.domain ){
        this.domain = [ 0, this.structure.modelCount ];
    }

    var modelindexScale = this.getScale();

    this.atomColor = function( a ){

        return modelindexScale( a.residue.chain.model.index );

    };

};

NGL.ModelindexColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.ModelindexColorMaker.prototype.constructor = NGL.ModelindexColorMaker;


NGL.SstrucColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

    var strucColors = NGL.StructureColors;
    var defaultStrucColor = NGL.StructureColors[""];

    this.atomColor = function( a ){

        if( a.ss === "h" ){
            return strucColors[ "alphaHelix" ];
        }else if( a.ss === "g" ){
            return strucColors[ "3_10Helix" ];
        }else if( a.ss === "i" ){
            return strucColors[ "piHelix" ];
        }else if( a.ss === "s" ){
            return strucColors[ "betaStrand" ];
        }else if( a.residue.isNucleic() ){
            return strucColors[ "dna" ];
        }else if( a.residue.isProtein() || a.ss === "c" ){
            return strucColors[ "coil" ];
        }else{
            return defaultStrucColor;
        }

    };

};

NGL.SstrucColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.SstrucColorMaker.prototype.constructor = NGL.SstrucColorMaker;


NGL.ElementColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

    var elemColors = NGL.ElementColors;
    var defaultElemColor = NGL.ElementColors[""];

    this.atomColor = function( a ){

        return elemColors[ a.element ] || defaultElemColor;

    };

};

NGL.ElementColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.ElementColorMaker.prototype.constructor = NGL.ElementColorMaker;


NGL.ResnameColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

    var resColors = NGL.ResidueColors;
    var defaultResColor = NGL.ResidueColors[""];

    this.atomColor = function( a ){

        return resColors[ a.resname ] || defaultResColor;

    };

};

NGL.ResnameColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.ResnameColorMaker.prototype.constructor = NGL.ResnameColorMaker;


NGL.BfactorColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

    if( !params.scale ){
        this.scale = "OrRd";
    }

    if( !params.domain ){

        var bfactor;
        var min = Infinity;
        var max = -Infinity;

        if( params.sele ){

            var selection = new NGL.Selection( params.sele );

            this.structure.eachAtom( function( a ){

                bfactor = a.bfactor;
                min = Math.min( min, bfactor );
                max = Math.max( max, bfactor );

            }, selection );

        }else{

            var atoms = this.structure.atoms;
            var n = atoms.length;

            for( var i = 0; i < n; ++i ){

                bfactor = atoms[ i ].bfactor;
                min = Math.min( min, bfactor );
                max = Math.max( max, bfactor );

            }

        }

        this.domain = [ min, max ];

    }

    var bfactorScale = this.getScale();

    this.atomColor = function( a ){

        return bfactorScale( a.bfactor );

    };

};

NGL.BfactorColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.BfactorColorMaker.prototype.constructor = NGL.BfactorColorMaker;


NGL.HydrophobicityColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

    if( !params.scale ){
        this.scale = "RdYlGn";
    }

    var idx = 0;  // 0: DGwif, 1: DGwoct, 2: Oct-IF

    var resHF = {};
    for( var name in NGL.ResidueHydrophobicity ){
        resHF[ name ] = NGL.ResidueHydrophobicity[ name ][ idx ];
    }
    var defaultResHF = resHF[""];

    if( !params.domain ){

        var val;
        var min = Infinity;
        var max = -Infinity;

        for( var name in resHF ){

            val = resHF[ name ];
            min = Math.min( min, val );
            max = Math.max( max, val );

        }

        this.domain = [ min, 0, max ];

    }

    var hfScale = this.getScale();

    this.atomColor = function( a ){

        return hfScale( resHF[ a.resname ] || defaultResHF );

    };

};

NGL.HydrophobicityColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.HydrophobicityColorMaker.prototype.constructor = NGL.HydrophobicityColorMaker;


NGL.ColorMakerRegistry.types = {

    "": NGL.ColorMaker,
    "picking": NGL.PickingColorMaker,
    "random": NGL.RandomColorMaker,
    "uniform": NGL.UniformColorMaker,
    "atomindex": NGL.AtomindexColorMaker,
    "residueindex": NGL.ResidueindexColorMaker,
    "chainindex": NGL.ChainindexColorMaker,
    "modelindex": NGL.ModelindexColorMaker,
    "sstruc": NGL.SstrucColorMaker,
    "element": NGL.ElementColorMaker,
    "resname": NGL.ResnameColorMaker,
    "bfactor": NGL.BfactorColorMaker,
    "hydrophobicity": NGL.HydrophobicityColorMaker,
    "value": NGL.ValueColorMaker,

};


////////////
// Factory

NGL.RadiusFactory = function( type, scale ){

    this.type = type;
    this.scale = scale || 1.0;

    this.max = 10;

};

NGL.RadiusFactory.types = {

    "": "",
    "vdw": "by vdW radius",
    "covalent": "by covalent radius",
    "ss": "by secondary structure",
    "bfactor": "by bfactor",
    "size": "size"

};

NGL.RadiusFactory.prototype = {

    constructor: NGL.RadiusFactory,

    atomRadius: function( a ){

        var type = this.type;
        var scale = this.scale;
        var vdwRadii = NGL.VdwRadii;
        var covalentRadii = NGL.CovalentRadii;

        var defaultVdwRadius = NGL.VdwRadii[""];
        var defaultCovalentRadius = NGL.CovalentRadii[""];
        var defaultBfactor = 1;

        var nucleic = [ "C3'", "C3*", "C4'", "C4*", "P" ];

        var r;

        switch( type ){

            case "vdw":

                r = vdwRadii[ a.element ] || defaultVdwRadius;
                break;

            case "covalent":

                r = covalentRadii[ a.element ] || defaultCovalentRadius;
                break;

            case "bfactor":

                r = a.bfactor || defaultBfactor;
                break;

            case "ss":

                if( a.ss === "h" ){
                    r = 0.25;
                }else if( a.ss === "g" ){
                    r = 0.25;
                }else if( a.ss === "i" ){
                    r = 0.25;
                }else if( a.ss === "s" ){
                    r = 0.25;
                // }else if( a.atomname === "P" ){
                }else if( nucleic.indexOf( a.atomname ) !== -1 ){
                    r = 0.4;
                }else{
                    r = 0.1;
                }
                break;

            default:

                r = type || 1.0;
                break;

        }

        return Math.min( r * scale, this.max );

    }

};


NGL.LabelFactory = function( type, text ){

    this.type = type;
    this.text = text || {};

};

NGL.LabelFactory.types = {

    "": "",
    "atomname": "atom name",
    "atomindex": "atom index",
    "atom": "atom name + index",
    "resname": "residue name",
    "resno": "residue no",
    "res": "residue name + no",
    "text": "text"

};

NGL.LabelFactory.prototype = {

    constructor: NGL.LabelFactory,

    atomLabel: function( a ){

        var type = this.type;

        var l;

        switch( type ){

            case "atomname":

                l = a.atomname;
                break;

            case "atomindex":

                l = "" + a.index;
                break;

            case "atom":

                l = a.atomname + "|" + a.index;
                break;

            case "resname":

                l = a.resname;
                break;

            case "resno":

                l = "" + a.resno;
                break;

            case "res":

                l = ( NGL.AA1[ a.resname.toUpperCase() ] || '' ) + a.resno;
                break;

            case "text":

                // TODO
                l = this.text[ a.globalindex ];
                break;

            default:

                l = a.qualifiedName();
                break;

        }

        return l === undefined ? '' : l;

    }

};


////////
// Set

NGL.AtomSet = function( structure, selection ){

    this.atoms = [];
    this.bonds = [];

    this.atomCount = 0;

    if( structure ){

        this.fromStructure( structure, selection );

    }

};

NGL.AtomSet.prototype = {

    constructor: NGL.AtomSet,

    apply: function( object ){

        object.getAtoms = NGL.AtomSet.prototype.getAtoms;

        object.getBoundingBox = NGL.AtomSet.prototype.getBoundingBox;

        object.atomPosition = NGL.AtomSet.prototype.atomPosition;
        object.atomColor = NGL.AtomSet.prototype.atomColor;
        object.atomRadius = NGL.AtomSet.prototype.atomRadius;
        object.atomCenter = NGL.AtomSet.prototype.atomCenter;
        object.atomIndex = NGL.AtomSet.prototype.atomIndex;

    },

    getAtoms: function( selection, first ){

        var atoms;

        if( selection ){

            atoms = [];

            this.eachAtom( function( a ){

                atoms.push( a );

            }, selection );

        }else{

            atoms = this.atoms;

        }

        if( first ){

            // TODO early exit after first atom is found
            return atoms[ 0 ];

        }else{

            return atoms;

        }

    },

    addAtom: function( atom ){

        this.atoms.push( atom );

        this.atomCount = this.atoms.length;

    },

    fromStructure: function( structure, selection ){

        var scope = this;

        this.structure = structure;

        this.selection = selection;

        this.selection.signals.stringChanged.add( function( string ){

            scope.applySelection();

        } );

        this.applySelection();

    },

    applySelection: function(){

        // atoms

        NGL.time( "NGL.AtomSet.applySelection#atoms" );

        this.atoms.length = 0;
        var atoms = this.atoms;

        this.structure.eachAtom( function( a ){

            atoms.push( a );

        }, this.selection );

        this.atomCount = this.atoms.length;
        this.center = this.atomCenter();

        this._atomPosition = undefined;

        NGL.timeEnd( "NGL.AtomSet.applySelection#atoms" );

        // bonds

        NGL.time( "NGL.AtomSet.applySelection#bonds" );

        this.bonds.length = 0;
        var bonds = this.bonds;

        if( this.selection ){

            var idxDict = {};

            this.eachAtom( function( a ){

                var ab = a.bonds;
                var n = ab.length;

                idxDict[ a.index ] = true;

                for( var i = 0; i < n; ++i ){

                    var b = ab[ i ];

                    if( idxDict[ b.atom1.index ] && idxDict[ b.atom2.index ] ){

                        bonds.push( b );

                    }

                }

            } );

        }else{

            this.eachAtom( function( a ){

                var ab = a.bonds;
                var n = ab.length;

                for( var i = 0; i < n; ++i ){

                    bonds.push( ab[ i ] );

                }

            } );

        }

        this.bondCount = this.bonds.length;

        this._bondPositionFrom = undefined;
        this._bondPositionTo = undefined;

        NGL.timeEnd( "NGL.AtomSet.applySelection#bonds" );

    },

    getBoundingBox: function( selection ){

        var box = new THREE.Box3();
        var vector = new THREE.Vector3();

        var a;
        var i = 0;
        var n = this.atoms.length;

        if( selection ){

            var test = selection.test;

            for( i = 0; i < n; ++i ){

                a = this.atoms[ i ];

                if( test( a ) ){

                    vector.copy( a );
                    box.expandByPoint( vector );

                }

            };

        }else{

            for( i = 0; i < n; ++i ){

                vector.copy( this.atoms[ i ] );
                box.expandByPoint( vector );

            };

        }

        return box;

    },

    eachAtom: function( callback, selection ){

        if( selection ){

            var test = selection.test;

            this.atoms.forEach( function( a ){

                if( test( a ) ) callback( a );

            } );

        }else{

            this.atoms.forEach( callback );

        }

    },

    atomPosition: function( selection ){

        var j, position, a;

        var i = 0;
        var n = this.atomCount;

        if( selection ){

            position = [];

            this.eachAtom( function( a ){

                position[ i + 0 ] = a.x;
                position[ i + 1 ] = a.y;
                position[ i + 2 ] = a.z;

                i += 3;

            }, selection );

            position = new Float32Array( position );

        }else{

            if( this._atomPosition ){

                position = this._atomPosition;

            }else{

                position = new Float32Array( this.atomCount * 3 );

            }

            for( j = 0; j < n; ++j ){

                a = this.atoms[ j ];

                position[ i + 0 ] = a.x;
                position[ i + 1 ] = a.y;
                position[ i + 2 ] = a.z;

                i += 3;

            };

            this._atomPosition = position;

        }

        return position;

    },

    getColorMaker: function( params ){

        var p = params || {};
        p.structure = this.structure;
        p.bondSet = this.structure.bondSet;

        return NGL.ColorMakerRegistry.getScheme( p );

    },

    atomColor: function( selection, params ){

        // NGL.time( "atomColor" );

        // TODO cache
        var c, color;
        var colorMaker = this.getColorMaker( params );

        if( selection ){
            color = [];
        }else{
            color = new Float32Array( this.atomCount * 3 );
        }

        var i = 0;

        this.eachAtom( function( a ){

            colorMaker.atomColorToArray( a, color, i );
            i += 3;

        }, selection );

        if( selection ) color = new Float32Array( color );

        // NGL.timeEnd( "atomColor" );

        return color;

    },

    atomPickingColor: function( selection, params ){

        var p = Object.assign( params || {} );
        p.scheme = "picking";

        return this.atomColor( selection, p );

    },

    atomRadius: function( selection, type, scale ){

        // TODO cache
        var i, radius;
        var radiusFactory = new NGL.RadiusFactory( type, scale );

        if( selection ){
            radius = [];
        }else{
            radius = new Float32Array( this.atomCount );
        }

        i = 0;

        this.eachAtom( function( a ){

            radius[ i ] = radiusFactory.atomRadius( a );

            i += 1;

        }, selection );

        if( selection ) radius = new Float32Array( radius );

        return radius;

    },

    atomIndex: function( selection ){

        var index = [];

        this.eachAtom( function( a ){

            index.push( a.index );

        }, selection );

        return index;

    },

    atomCenter: function(){

        var box = new THREE.Box3();
        var vector = new THREE.Vector3();

        return function( selection ){

            // NGL.time( "NGL.AtomSet.atomCenter" );

            var a;
            var i = 0;
            var n = this.atoms.length;

            box.makeEmpty();

            if( selection ){

                var test = selection.test;

                for( i = 0; i < n; ++i ){

                    a = this.atoms[ i ];

                    if( test( a ) ){

                        vector.copy( a );
                        box.expandByPoint( vector );

                    }

                };

            }else{

                for( i = 0; i < n; ++i ){

                    vector.copy( this.atoms[ i ] );
                    box.expandByPoint( vector );

                };

            }

            // NGL.timeEnd( "NGL.AtomSet.atomCenter" );

            return box.center();

        };

    }(),

    eachBond: function( callback, selection ){

        selection = selection || this.selection;

        if( selection && selection.test ){

            var test = selection.test;

            this.bonds.forEach( function( b ){

                if( test( b.atom1 ) && test( b.atom2 ) ){

                    callback( b );

                }

            } );

        }else{

            var bonds = this.bonds;
            var n = bonds.length;

            for( var i = 0; i < n; ++i ){

                callback( bonds[ i ] );

            }

        }

    },

    /*eachBondBAK: function( callback, selection ){

        selection = selection || this.selection;

        if( selection ){

            var test = selection.test;

            this.atoms.forEach( function( a ){

                if( test( a ) ){

                    a.bonds.forEach( function( b ){

                        // if( b.atom1 === a && test( b.atom2 ) ){

                        //     callback( b );

                        // }else if( b.atom2 === a && test( b.atom2 ) ){

                        //     callback( b );

                        // }

                        if( test( b.atom1 ) && test( b.atom2 ) ){

                            callback( b );

                        }

                    } );

                }

            } );

        }else{

            this.atoms.forEach( function( a ){

                a.bonds.forEach( function( b ){

                    callback( b );

                } );

            } );

        }

    },*/

    bondPosition: function( selection, fromTo ){

        // NGL.time( "NGL.AtomSet.bondPosition" );

        var j, position, b;

        var i = 0;
        var n = this.bondCount;

        if( selection ){

            position = [];

            this.eachBond( function( b ){

                if( fromTo ){

                    position[ i + 0 ] = b.atom1.x;
                    position[ i + 1 ] = b.atom1.y;
                    position[ i + 2 ] = b.atom1.z;

                }else{

                    position[ i + 0 ] = b.atom2.x;
                    position[ i + 1 ] = b.atom2.y;
                    position[ i + 2 ] = b.atom2.z;

                }

                i += 3;

            }, selection );

            position = new Float32Array( position );

        }else{

            position = [];

            if( fromTo ){

                if( this._bondPositionFrom ){
                    position = this._bondPositionFrom;
                }

            }else{

                if( this._bondPositionTo ){
                    position = this._bondPositionTo;
                }

            }

            for( j = 0; j < n; ++j ){

                b = this.bonds[ j ];

                if( fromTo ){

                    position[ i + 0 ] = b.atom1.x;
                    position[ i + 1 ] = b.atom1.y;
                    position[ i + 2 ] = b.atom1.z;

                }else{

                    position[ i + 0 ] = b.atom2.x;
                    position[ i + 1 ] = b.atom2.y;
                    position[ i + 2 ] = b.atom2.z;

                }

                i += 3;

            };

            if( fromTo ){

                if( !this._bondPositionFrom ){
                    this._bondPositionFrom = new Float32Array( position );
                }

            }else{

                if( !this._bondPositionTo ){
                    this._bondPositionTo = new Float32Array( position );
                }

            }

        }

        // NGL.timeEnd( "NGL.AtomSet.bondPosition" );

        return position;

    },

    bondColor: function( selection, fromTo, params ){

        // NGL.time( "NGL.AtomSet.bondColor" );

        var i = 0;
        var color = [];

        var c;
        var colorMaker = this.getColorMaker( params );

        if( selection ){

            this.eachBond( function( b ){

                colorMaker.bondColorToArray( b, fromTo, color, i );
                i += 3;

            }, selection );

        }else{

            var bonds = this.bonds;
            var n = bonds.length;

            for( var j = 0; j < n; ++j ){

                colorMaker.bondColorToArray( bonds[ j ], fromTo, color, i );
                i += 3;

            }

        }

        // NGL.timeEnd( "NGL.AtomSet.bondColor" );

        return new Float32Array( color );

    },

    bondPickingColor: function( selection, fromTo, params ){

        var p = Object.assign( {}, params );
        p.scheme = "picking";

        return this.bondColor( selection, fromTo, p );

    },

    bondRadius: function( selection, fromTo, type, scale ){

        // NGL.time( "NGL.AtomSet.bondRadius" );

        var i = 0;
        var radius = [];
        var radiusFactory = new NGL.RadiusFactory( type, scale );

        if( selection ){

            this.eachBond( function( b ){

                radius[ i ] = radiusFactory.atomRadius(
                    fromTo ? b.atom1 : b.atom2
                );

                i += 1;

            }, selection );

        }else{

            var bonds = this.bonds;
            var n = bonds.length;

            for( i = 0; i < n; ++i ){

                var b = bonds[ i ];

                radius[ i ] = radiusFactory.atomRadius(
                    fromTo ? b.atom1 : b.atom2
                );

            }

        }

        // NGL.timeEnd( "NGL.AtomSet.bondRadius" );

        return new Float32Array( radius );

    },

    toJSON: function(){

        var output = {

            metadata: {
                version: 0.1,
                type: 'AtomSet',
                generator: 'AtomSetExporter'
            },

            atomCount: this.atomCount

        };

        var atoms = this.atoms;
        var n = atoms.length;
        var atomArray = new NGL.AtomArray( n );
        var pa = new NGL.ProxyAtom( atomArray );

        for( var i = 0; i < n; ++i ){

            pa.copy( atoms[ i ], i );

        }

        output.atomArray = atomArray.toJSON();

        return output;

    },

    fromJSON: function( input ){

        this.atomCount = input.atomCount;

        var atoms = this.atoms;
        var atomArray = new NGL.AtomArray( input.atomArray );
        var n = atomArray.length;

        for( var i = 0; i < n; ++i ){

            atoms.push(
                new NGL.ProxyAtom( atomArray, i )
            );

        }

        return this;

    },

    dispose: function(){

        this.atoms.length = 0;
        this.bonds.length = 0;

        delete this.structure;

    }

};


NGL.BondSet = function(){

    this.bonds = [];
    this.bondCount = 0;

    NGL.GidPool.addObject( this );

};

NGL.BondSet.prototype = {

    constructor: NGL.BondSet,

    addBond: function( atom1, atom2, notToAtoms, bondOrder ){

        var b = new NGL.Bond( atom1, atom2, bondOrder );
        b.index = this.bondCount;

        if( !notToAtoms ){
            atom1.bonds.push( b );
            atom2.bonds.push( b );
        }
        this.bonds.push( b );

        this.bondCount += 1;

        NGL.GidPool.updateObject( this );

    },

    addBondIfConnected: function( atom1, atom2, notToAtoms, bondOrder ){

        if( atom1.connectedTo( atom2 ) ){

            this.addBond( atom1, atom2, notToAtoms, bondOrder );

            return true;

        }

        return false;

    },

    eachBond: function( callback, selection ){

        var bonds = this.bonds;
        var n = bonds.length;

        if( selection && selection.test ){

            var test = selection.test;

            for( var i = 0; i < n; ++i ){

                var b = bonds[ i ];

                if( test( b.atom1 ) && test( b.atom2 ) ){

                    callback( b );

                }

            }

            // this.bonds.forEach( function( b ){

            //     if( test( b.atom1 ) && test( b.atom2 ) ){

            //         callback( b );

            //     }

            // } );

        }else{

            for( var i = 0; i < n; ++i ){

                callback( bonds[ i ] );

            }

        }

    },

    getColorMaker: function( params ){

        var p = params || {};
        p.structure = this.structure;
        p.bondSet = this;

        return NGL.ColorMakerRegistry.getScheme( p );

    },

    bondPosition: NGL.AtomSet.prototype.bondPosition,

    bondColor: NGL.AtomSet.prototype.bondColor,

    bondPickingColor: NGL.AtomSet.prototype.bondPickingColor,

    bondRadius: NGL.AtomSet.prototype.bondRadius,

    toJSON: function(){

        var output = {

            metadata: {
                version: 0.1,
                type: 'BondSet',
                generator: 'BondSetExporter'
            },

            bondCount: this.bondCount

        };

        var bonds = this.bonds;
        var n = bonds.length;
        var bondArray = new Uint32Array( 3 * n );
        var j, b;

        for( var i = 0; i < n; ++i ){

            j = i * 3;
            b = bonds[ i ];

            bondArray[ j     ] = b.atom1.index;
            bondArray[ j + 1 ] = b.atom2.index;
            bondArray[ j + 2 ] = b.bondOrder;

        }

        output.bondArray = bondArray;

        return output;

    },

    fromJSON: function( input, atoms ){

        this.bondCount = input.bondCount;

        var bonds = this.bonds;
        var bondArray = input.bondArray;
        var n = bondArray.length;

        for( var i = 0; i < n; i += 3 ){

            var b = new NGL.Bond(
                atoms[ bondArray[ i ] ],
                atoms[ bondArray[ i + 1 ] ],
                bondArray[ i + 2 ]
            );

            b.index = i / 3;

            bonds.push( b );

        }

        NGL.GidPool.updateObject( this );

        return this;

    },

    clear: function(){

        this.bonds.length = 0;
        this.bondCount = 0;

        if( !this.__disposed ){
            NGL.GidPool.updateObject( this );
        }

    },

    dispose: function(){

        this.__disposed = true;

        this.clear();

        NGL.GidPool.removeObject( this );

    }

};


/////////
// Bond

NGL.Bond = function( atomA, atomB, bondOrder ){

    if( atomA.index < atomB.index ){
        this.atom1 = atomA;
        this.atom2 = atomB;
    }else{
        this.atom1 = atomB;
        this.atom2 = atomA;
    }

    this.bondOrder = bondOrder || 1;

};

NGL.Bond.prototype = {

    constructor: NGL.Bond,

    atom1: undefined,
    atom2: undefined,
    bondOrder: undefined,

    index: undefined,

    qualifiedName: function(){

        return this.atom1.index + "=" + this.atom2.index;

    }

};


/////////
// Math

NGL.Matrix = function( columns, rows ){

    var dtype = jsfeat.F32_t | jsfeat.C1_t;

    return new jsfeat.matrix_t( columns, rows, dtype );

};


//////////////////
// Superposition

NGL.Superposition = function( atoms1, atoms2 ){

    // allocate & init data structures

    var n;
    if( typeof atoms1.eachAtom === "function" ){
        n = atoms1.atomCount;
    }else if( atoms1 instanceof Float32Array ){
        n = atoms1.length / 3;
    }

    var coords1 = new NGL.Matrix( 3, n );
    var coords2 = new NGL.Matrix( 3, n );

    this.coords1t = new NGL.Matrix( n, 3 );
    this.coords2t = new NGL.Matrix( n, 3 );

    this.A = new NGL.Matrix( 3, 3 );
    this.W = new NGL.Matrix( 1, 3 );
    this.U = new NGL.Matrix( 3, 3 );
    this.V = new NGL.Matrix( 3, 3 );
    this.VH = new NGL.Matrix( 3, 3 );
    this.R = new NGL.Matrix( 3, 3 );

    this.tmp = new NGL.Matrix( 3, 3 );
    this.c = new NGL.Matrix( 3, 3 );
    this.c.data.set([ 1, 0, 0, 0, 1, 0, 0, 0, -1 ]);

    // prep coords

    this.prepCoords( atoms1, coords1 );
    this.prepCoords( atoms2, coords2 );

    // superpose

    this._superpose( coords1, coords2 );

};

NGL.Superposition.prototype = {

    constructor: NGL.Superposition,

    _superpose: function( coords1, coords2 ){

        // NGL.time( "superpose" );

        this.mean1 = jsfeat.matmath.mean_rows( coords1 );
        this.mean2 = jsfeat.matmath.mean_rows( coords2 );

        jsfeat.matmath.sub_rows( coords1, this.mean1 );
        jsfeat.matmath.sub_rows( coords2, this.mean2 );

        jsfeat.matmath.transpose( this.coords1t, coords1 );
        jsfeat.matmath.transpose( this.coords2t, coords2 );

        jsfeat.matmath.multiply_ABt( this.A, this.coords2t, this.coords1t );

        var svd = jsfeat.linalg.svd_decompose(
            this.A, this.W, this.U, this.V
        );

        jsfeat.matmath.invert_3x3( this.V, this.VH );
        jsfeat.matmath.multiply_3x3( this.R, this.U, this.VH );

        if( jsfeat.matmath.mat3x3_determinant( this.R ) < 0.0 ){

            NGL.log( "R not a right handed system" );

            jsfeat.matmath.multiply_3x3( this.tmp, this.c, this.VH );
            jsfeat.matmath.multiply_3x3( this.R, this.U, this.tmp );

        }

        // NGL.timeEnd( "superpose" );

    },

    prepCoords: function( atoms, coords ){

        var i = 0;
        var cd = coords.data;

        if( typeof atoms.eachAtom === "function" ){

            atoms.eachAtom( function( a ){

                cd[ i + 0 ] = a.x;
                cd[ i + 1 ] = a.y;
                cd[ i + 2 ] = a.z;

                i += 3;

            } );

        }else if( atoms instanceof Float32Array ){

            cd.set( atoms );

        }else{

            NGL.warn( "prepCoords: input type unknown" );

        }

    },

    transform: function( atoms ){

        // allocate data structures

        var n;
        if( typeof atoms.eachAtom === "function" ){
            n = atoms.atomCount;
        }else if( atoms instanceof Float32Array ){
            n = atoms.length / 3;
        }

        var coords = new NGL.Matrix( 3, n );
        var tmp = new NGL.Matrix( n, 3 );

        // prep coords

        this.prepCoords( atoms, coords );

        // do transform

        jsfeat.matmath.sub_rows( coords, this.mean1 );
        jsfeat.matmath.multiply_ABt( tmp, this.R, coords );
        jsfeat.matmath.transpose( coords, tmp );
        jsfeat.matmath.add_rows( coords, this.mean2 );

        var i = 0;
        var cd = coords.data;

        if( typeof atoms.eachAtom === "function" ){

            atoms.eachAtom( function( a ){

                a.x = cd[ i + 0 ];
                a.y = cd[ i + 1 ];
                a.z = cd[ i + 2 ];

                i += 3;

            } );

        }else if( atoms instanceof Float32Array ){

            atoms.set( cd.subarray( 0, n * 3 ) );

        }else{

            NGL.warn( "transform: input type unknown" );

        }

    }

};


//////////////
// Structure

NGL.Structure = function( name, path ){

    this.name = name;
    this.path = path;
    this.title = "";
    this.id = "";

    this.atoms = [];
    this.models = [];

    this.biomolDict = {};
    this.defaultAssembly = "BU1";
    this.helices = [];
    this.sheets = [];

    this.frames = [];
    this.boxes = [];

    this.reset();

    NGL.GidPool.addObject( this );

};

NGL.Structure.prototype = {

    constructor: NGL.Structure,

    atomArray: undefined,

    reset: function(){

        this.atomCount = 0;
        this.residueCount = 0;
        this.chainCount = 0;
        this.modelCount = 0;

        this.atoms.length = 0;
        this.models.length = 0;

        if( this.bondSet ){
            this.bondSet.clear();
        }else{
             this.bondSet = new NGL.BondSet();
        }

        this.biomolDict = {};
        this.helices.length = 0;
        this.sheets.length = 0;
        this.unitcell = new NGL.Unitcell();

        this.frames.length = 0;
        this.boxes.length = 0;

        this.center = new THREE.Vector3();
        this.boundingBox = new THREE.Box3();

        NGL.GidPool.updateObject( this, true );

    },

    setDefaultAssembly: function( value ){

        this.defaultAssembly = value;

    },

    postProcess: function( callback ){

        var self = this;

        async.series( [

            function( wcallback ){

                if( !self._dontAutoBond ){
                    self.autoBond();
                }
                wcallback();

            },

            function( wcallback ){

                if( self._doAutoSS ){
                    self.autoSS();
                }
                wcallback();

            },

            function( wcallback ){

                if( self._doAutoChainName ){
                    self.autoChainName();
                }
                wcallback();

            },

            function( wcallback ){

                self.center = self.atomCenter();
                self.boundingBox = self.getBoundingBox();
                wcallback();

            }

        ], function(){

            NGL.GidPool.updateObject( self );

            callback();

        } );

    },

    nextAtomIndex: function(){

        return this.atomCount++;

    },

    nextResidueIndex: function(){

        return this.residueCount++;

    },

    nextChainIndex: function(){

        return this.chainCount++;

    },

    nextModelIndex: function(){

        return this.modelCount++;

    },

    addModel: function( m ){

        if( !m ){
            m = new NGL.Model( this );
        }else{
            m.structure = this;
        }
        m.index = this.nextModelIndex();
        this.models.push( m );
        return m;

    },

    eachAtom: function( callback, selection ){

        if( selection && selection.modelOnlyTest ){

            // NGL.log( "structure.eachAtom#model", selection.selection )

            var test = selection.modelOnlyTest;

            this.models.forEach( function( m ){

                if( test( m ) ) m.eachAtom( callback, selection );

            } );

        }else if( selection ){

            this.models.forEach( function( m ){

                m.eachAtom( callback, selection );

            } );

        }else{

            var atoms = this.atoms;
            var n = this.atomCount;

            for( var i = 0; i < n; ++i ){

                callback( atoms[ i ] );

            }

        }

    },

    eachResidue: function( callback, selection ){

        if( selection && selection.modelOnlyTest ){

            var test = selection.modelOnlyTest;

            this.models.forEach( function( m ){

                if( test( m ) ) m.eachResidue( callback, selection );

            } );

        }else{

            this.models.forEach( function( m ){

                m.eachResidue( callback, selection );

            } );

        }

    },

    eachResidueN: function( n, callback ){

        this.models.forEach( function( m ){
            m.eachResidueN( n, callback );
        } );

    },

    eachFiber: function( callback, selection, padded ){

        if( selection && selection.modelOnlyTest ){

            var test = selection.modelOnlyTest;

            this.models.forEach( function( m ){

                if( test( m ) ) m.eachFiber( callback, selection, padded );

            } );

        }else{

            this.models.forEach( function( m ){

                m.eachFiber( callback, selection, padded );

            } );

        }

    },

    eachChain: function( callback, selection ){

        if( selection && selection.modelOnlyTest ){

            var test = selection.modelOnlyTest;

            this.models.forEach( function( m ){

                if( test( m ) ) m.eachChain( callback, selection );

            } );

        }else{

            this.models.forEach( function( m ){

                m.eachChain( callback, selection );

            } );

        }

    },

    eachModel: function( callback, selection ){

        if( selection && selection.modelOnlyTest ){

            var test = selection.modelOnlyTest;

            this.models.forEach( function( m ){

                if( test( m ) ) callback( m );

            } );

        }else{

            this.models.forEach( callback );

        }

    },

    getSequence: function(){

        var seq = [];

        // FIXME nucleic support

        this.eachResidue( function( r ){

            if( r.getAtomByName( "CA" ) ){
                seq.push( r.getResname1() );
            }

        } );

        return seq;

    },

    autoBond: function(){

        NGL.time( "NGL.Structure.autoBond" );

        var bondSet = this.bondSet;

        var i, j, n, n1, m, ra, a1, a2;
        var kdtree, nearestAtoms, radius, maxd;
        var resname, atomnameList, bonding, equalAtomnames;

        var bondingDict = {};

        NGL.time( "NGL.Structure.autoBond within" );

        this.eachResidue( function( r ){

            ra = r.atoms;
            n = r.atomCount;
            n1 = n - 1;

            resname = r.resname;
            equalAtomnames = false;

            if( bondingDict[ resname ] ){

                atomnameList = bondingDict[ resname ].atomnameList;

                if( n === atomnameList.length ){

                    equalAtomnames = true;

                    for( i = 0; i < n; ++i ){

                        if( ra[ i ].atomname !== atomnameList[ i ] ){

                            equalAtomnames = false;
                            break;

                        }

                    }

                }else{

                    equalAtomnames = false;

                }

            }

            if( equalAtomnames ){

                var atomIndices1 = bondingDict[ resname ].atomIndices1;
                var atomIndices2 = bondingDict[ resname ].atomIndices2;
                var nn = atomIndices1.length;

                for( i = 0; i < nn; ++i ){

                    bondSet.addBond(
                        ra[ atomIndices1[ i ] ], ra[ atomIndices2[ i ] ]
                    );

                }

            }else{

                var atomIndices1 = [];
                var atomIndices2 = [];

                if( n > 20 ){

                    kdtree = new NGL.Kdtree( ra, true );
                    radius = r.hasBackbone() ? 1.2 : 2.3;

                    for( i = 0; i <= n1; ++i ){

                        a1 = ra[ i ];

                        maxd = a1.covalent + radius + 0.3;
                        nearestAtoms = kdtree.nearest(
                            a1, Infinity, maxd * maxd
                        );
                        m = nearestAtoms.length;

                        for( j = 0; j < m; ++j ){

                            a2 = nearestAtoms[ j ].atom;

                            if( a1.index < a2.index ){

                                if( bondSet.addBondIfConnected( a1, a2 ) ){

                                    atomIndices1.push( i );
                                    atomIndices2.push( ra.indexOf( a2 ) );

                                };

                            }

                        }

                    }

                }else{

                    for( i = 0; i < n1; ++i ){

                        a1 = ra[ i ];

                        for( j = i + 1; j <= n1; ++j ){

                            a2 = ra[ j ];

                            if( bondSet.addBondIfConnected( a1, a2 ) ){

                                atomIndices1.push( i );
                                atomIndices2.push( j );

                            };

                        }

                    }

                }

                bondingDict[ resname ] = {

                    atomnameList: r.getAtomnameList(),
                    atomIndices1: atomIndices1,
                    atomIndices2: atomIndices2

                };

            }

        } );

        NGL.timeEnd( "NGL.Structure.autoBond within" );

        // bonds between residues

        NGL.time( "NGL.Structure.autoBond between" );

        this.eachResidueN( 2, function( r1, r2 ){

            var bbType1 = r1.getBackboneType();
            var bbType2 = r2.getBackboneType();

            if( bbType1 !== NGL.UnknownType && bbType1 === bbType2 ){

                bondSet.addBondIfConnected(
                    r1.getBackboneAtomStart(),
                    r2.getBackboneAtomEnd()
                );

            }

        } );

        NGL.timeEnd( "NGL.Structure.autoBond between" );

        NGL.timeEnd( "NGL.Structure.autoBond" );

    },

    autoSS: function(){

        // Implementation for proteins based on "pv"
        //
        // assigns secondary structure information based on a simple and very fast
        // algorithm published by Zhang and Skolnick in their TM-align paper.
        // Reference:
        //
        // TM-align: a protein structure alignment algorithm based on the Tm-score
        // (2005) NAR, 33(7) 2302-2309

        var zhangSkolnickSS = function(){

            var d;

            var ca1 = new THREE.Vector3();
            var ca2 = new THREE.Vector3();

            return function( fiber, i, distances, delta ){

                for( var j = Math.max( 0, i - 2 ); j <= i; ++j ){

                    for( var k = 2;  k < 5; ++k ){

                        if( j + k >= fiber.residueCount ){
                            continue;
                        }

                        ca1.copy( fiber.residues[ j ].getTraceAtom() );
                        ca2.copy( fiber.residues[ j + k ].getTraceAtom() );

                        d = ca1.distanceTo( ca2 );
                        // NGL.log( d )

                        if( Math.abs( d - distances[ k - 2 ] ) > delta ){
                            return false;
                        }

                    }

                }

                return true;

            };

        }();

        var isHelical = function( fiber, i ){

            var helixDistances = [ 5.45, 5.18, 6.37 ];
            var helixDelta = 2.1;

            return zhangSkolnickSS( fiber, i, helixDistances, helixDelta );

        };

        var isSheet = function( fiber, i ){

            var sheetDistances = [ 6.1, 10.4, 13.0 ];
            var sheetDelta = 1.42;

            return zhangSkolnickSS( fiber, i, sheetDistances, sheetDelta );

        };

        var proteinFiber = function( f ){

            var i;

            var n = f.residueCount;

            for( i = 0; i < n; ++i ){

                if( isHelical( f, i ) ){

                    f.residues[ i ].ss = "h";

                }else if( isSheet( f, i ) ){

                    f.residues[ i ].ss = "s";

                }else{

                    f.residues[ i ].ss = "c";

                }

            }

        }

        var cgFiber = function( f ){

            var localAngle = 20;
            var centerDist = 2.0;

            var helixbundle = new NGL.Helixbundle( f );

            var pos = helixbundle.position;
            var res = helixbundle.fiber.residues;

            var n = helixbundle.size;

            var c = new THREE.Vector3();
            var c2 = new THREE.Vector3();

            var i, d, r, r2;

            for( i = 0; i < n - 1; ++i ){

                r = res[ i ];
                r2 = res[ i + 1 ];

                c.fromArray( pos.center, i * 3 );
                c2.fromArray( pos.center, i * 3 + 3 );

                d = c.distanceTo( c2 );

                // NGL.log( r.ss, r2.ss, c.distanceTo( c2 ), pos.bending[ i ] )

                if( d < centerDist && d > 1.0 &&
                        pos.bending[ i ] < localAngle ){

                    r.ss = "h";
                    r2.ss = "h";

                }

            }

        }

        return function(){

            NGL.time( "NGL.Structure.autoSS" );

            // assign secondary structure

            this.eachFiber( function( f ){

                if( f.residueCount < 4 ) return;

                if( f.isProtein() ){

                    proteinFiber( f );

                }else if( f.isCg() ){

                    cgFiber( f );

                }

            } );

            // set lone secondary structure assignments to "c"

            this.eachFiber( function( f ){

                if( !f.isProtein() && !f.isCg ) return;

                var r;
                var ssType = undefined;
                var ssCount = 0;

                f.eachResidueN( 2, function( r1, r2 ){

                    if( r1.ss===r2.ss ){

                        ssCount += 1;

                    }else{

                        if( ssCount===1 ){

                            r1.ss = "c";

                        }

                        ssCount = 1;

                    }

                    r = r2;

                } );

                if( ssCount===1 ){

                    r.ss = "c";

                }

            } );

            NGL.timeEnd( "NGL.Structure.autoSS" );

        }

    }(),

    autoChainName: function(){

        var names = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
                    "abcdefghijklmnopqrstuvwxyz" +
                    "0123456789";
        var n = names.length;

        return function(){

            NGL.time( "NGL.Structure.autoChainName" );

            var i, name;

            this.eachModel( function( m ){

                i = 0;

                m.eachFiber( function( f ){

                    name = names[ i ];

                    f.eachAtom( function( a ){

                        a.chainname = name;

                    } );

                    i += 1;

                    if( i === n ){

                        NGL.warn( "out of chain names" );

                        i = 0;

                    }

                } )

            } );

            NGL.timeEnd( "NGL.Structure.autoChainName" );

        }

    }(),

    updatePosition: function( position ){

        // uses the atoms array directly as its
        // 1) faster, and
        // 2) ensures that atoms are traversed in order

        var i, i3, a;
        var atoms = this.atoms;
        var n = this.atomCount;

        for( i = 0; i < n; ++i ){

            a = atoms[ i ];
            i3 = i * 3;

            a.x = position[ i3     ];
            a.y = position[ i3 + 1 ];
            a.z = position[ i3 + 2 ];

        }

    },

    toPdb: function(){

        // http://www.bmsc.washington.edu/CrystaLinks/man/pdb/part_62.html

        // Sample PDB line, the coords X,Y,Z are fields 5,6,7 on each line.
        // ATOM      1  N   ARG     1      29.292  13.212 -12.751  1.00 33.78      1BPT 108

        // use sprintf %8.3f for coords
        // printf PDB2 ("ATOM  %5d %4s %3s A%4d    %8.3f%8.3f%8.3f%6.2f%6.2f      %4s%2s\n", $index,$atname[$i],$resname[$i],$resnum[$i],$x[$i],$y[$i],$z[$i],$occ[$i],$bfac[$i]),$segid[$i],$element[$i];

        function DEF( x, y ){
            return x !== undefined ? x : y;
        }

        var pdbFormatString =
            "ATOM  %5d %4s %3s %1s%4d    %8.3f%8.3f%8.3f%6.2f%6.2f      %4s%2s\n";

        return function(){

            var ia;
            var im = 1;
            var pdbRecords = [];

            // FIXME multiline if title line longer than 80 chars
            pdbRecords.push( sprintf( "TITEL %-74s\n", this.name ) );

            if( this.trajectory ){
                pdbRecords.push( sprintf(
                    "REMARK %-73s\n",
                    "Trajectory '" + this.trajectory.name + "'"
                ) );
                pdbRecords.push( sprintf(
                    "REMARK %-73s\n",
                    "Frame " + this.trajectory.frame + ""
                ) );
            }

            this.eachModel( function( m ){

                pdbRecords.push( sprintf( "MODEL %-74d\n", im++ ) );

                m.eachAtom( function( a ){

                    pdbRecords.push(
                        sprintf(
                            pdbFormatString,

                            a.serial, a.atomname, a.resname,
                            DEF( a.chainname, " " ),
                            a.resno,
                            a.x, a.y, a.z,
                            DEF( a.occurence, 1.0 ),
                            DEF( a.bfactor, 0.0 ),
                            DEF( a.segid, "" ),
                            DEF( a.element, "" )
                        )
                    );

                } );

                pdbRecords.push( sprintf( "%-80s\n", "ENDMDL" ) );

            } );

            pdbRecords.push( sprintf( "%-80s\n", "END" ) );

            return pdbRecords.join( "" );

        }

    }(),

    clone: function(){

        NGL.time( "NGL.Structure.clone" );

        var s = new NGL.Structure();

        s.name = this.name;
        s.path = this.path;

        s.title = this.title;
        s.id = this.id;

        if( this.biomolDict ) s.biomolDict = this.biomolDict;

        // s.center = this.center.clone();
        // s.boundingBox = this.boundingBox.clone();

        // clone atomArray

        if( this.atomArray ){

            s.atomArray = this.atomArray.clone();

        }

        // clone entities

        this.eachModel( function( m ){

            var sm = m.clone( s );
            s.addModel( sm );

            sm.eachAtom( function( a ){

                s.atoms.push( a );

            } );

        } );

        // clone trajectory

        // FIXME clone?
        s.frames = this.frames;
        s.boxes = this.boxes;

        // clone bonds

        this.bondSet.eachBond( function( b ){

            s.bondSet.addBond(

                s.atoms[ b.atom1.index ],
                s.atoms[ b.atom2.index ]

            );

        } );

        NGL.timeEnd( "NGL.Structure.clone" );

        if( NGL.debug ) NGL.log( s );

        return s;

    },

    toJSON: function(){

        NGL.time( "NGL.Structure.toJSON" );

        var output = {

            metadata: {
                version: 0.1,
                type: 'Structure',
                generator: 'StructureExporter'
            },

            name: this.name,
            path: this.path,
            title: this.title,
            id: this.id,

            biomolDict: this.biomolDict,
            helices: this.helices,
            sheets: this.sheets,
            unitcell: this.unitcell.toJSON(),

            frames: this.frames,
            boxes: this.boxes,

            center: this.center.toArray(),
            boundingBox: [
                this.boundingBox.min.toArray(),
                this.boundingBox.max.toArray()
            ],

            atoms: [],
            // models: [],

        };

        if( this.atomArray ){

            output.atomArray = this.atomArray.toJSON();

        }else{

            var atoms = this.atoms;
            var n = atoms.length;

            for( var i = 0; i < n; ++i ){

                output.atoms.push( atoms[ i ].toJSON() );

            };

        }

        // this.eachModel( function( m ){

        //     output.models.push( m.toJSON() );

        // } );

        output.bondSet = this.bondSet.toJSON();

        NGL.timeEnd( "NGL.Structure.toJSON" );

        return output;

    },

    fromJSON: function( input ){

        NGL.time( "NGL.Structure.fromJSON" );

        this.reset();

        this.name = input.name;
        this.path = input.path;
        this.title = input.title;
        this.id = input.id;

        this.biomolDict = input.biomolDict;
        this.helices = input.helices;
        this.sheets = input.sheets;
        this.unitcell = new NGL.Unitcell().fromJSON( input.unitcell );

        this.frames = input.frames;
        this.boxes = input.boxes;

        this.center = new THREE.Vector3().fromArray( input.center );
        this.boundingBox = new THREE.Box3(
            new THREE.Vector3().fromArray( input.boundingBox[ 0 ] ),
            new THREE.Vector3().fromArray( input.boundingBox[ 1 ] )
        );

        var atoms = this.atoms;

        if( input.atomArray ){

            this.atomArray = new NGL.AtomArray( input.atomArray );

            var atomArray = this.atomArray;
            var n = atomArray.usedLength;

            for( var i = 0; i < n; ++i ){

                atoms.push( new NGL.ProxyAtom( atomArray, i ) );

            }

        }else{

            var inputAtoms = input.atoms;
            var n = input.atoms.length;

            for( var i = 0; i < n; ++i ){

                var a = new NGL.Atom().fromJSON( inputAtoms[ i ] );
                a.index = i;
                atoms.push( a );

            }

        }

        // input.models.forEach( function( m ){

        //     this.addModel( new NGL.Model( this ).fromJSON( m ) );

        // }.bind( this ) );

        this.bondSet.fromJSON( input.bondSet, this.atoms );

        this.bondSet.eachBond( function( b ){

            atoms[ b.atom1.index ].bonds.push( b );
            atoms[ b.atom2.index ].bonds.push( b );

        } );

        NGL.GidPool.updateObject( this );

        NGL.timeEnd( "NGL.Structure.fromJSON" );

        return this;

    },

    getTransferable: function(){

        var transferable = [];

        if( this.atomArray ){

            transferable.concat( this.atomArray.getTransferable() );

        }

        if( this.frames ){

            var frames = this.frames;
            var n = this.frames.length;

            for( var i = 0; i < n; ++i ){

                transferable.push( frames[ i ].buffer );

            }

        }

        if( this.boxes ){

            var boxes = this.boxes;
            var n = this.boxes.length;

            for( var i = 0; i < n; ++i ){

                transferable.push( boxes[ i ].buffer );

            }

        }

        return transferable;

    },

    dispose: function(){

        this.atomCount = 0;
        this.residueCount = 0;
        this.chainCount = 0;
        this.modelCount = 0;

        this.atoms.length = 0;
        this.models.length = 0;

        if( this.cif ) delete this.cif;

        if( this.frames ) this.frames.length = 0;
        if( this.boxes ) this.boxes.length = 0;

        this.bondSet.dispose();

        if( this.atomArray ) this.atomArray.dispose();

        NGL.GidPool.removeObject( this );

    }

};

NGL.AtomSet.prototype.apply( NGL.Structure.prototype );


NGL.Model = function( structure ){

    this.structure = structure;
    this.chains = [];

    this.atomCount = 0;
    this.residueCount = 0;
    this.chainCount = 0;

};

NGL.Model.prototype = {

    constructor: NGL.Model,

    modelno: undefined,

    nextAtomIndex: function(){

        this.atomCount += 1;
        return this.structure.nextAtomIndex();

    },

    nextResidueIndex: function(){

        this.residueCount += 1;
        return this.structure.nextResidueIndex();

    },

    nextChainIndex: function(){

        this.chainCount += 1;
        return this.structure.nextChainIndex();

    },

    addChain: function( c ){

        if( !c ){
            c = new NGL.Chain( this );
        }else{
            c.model = this;
        }
        c.index = this.nextChainIndex();
        this.chains.push( c );
        return c;

    },

    eachAtom: function( callback, selection ){

        if( selection && selection.chainOnlyTest ){

            var test = selection.chainOnlyTest;

            this.chains.forEach( function( c ){

                // NGL.log( "model.eachAtom#chain", c.chainname, selection.selection )

                if( test( c ) ){
                    c.eachAtom( callback, selection );
                }/*else{
                    NGL.log( "chain", c.chainname );
                }*/

            } );

        }else{

            this.chains.forEach( function( c ){

                c.eachAtom( callback, selection );

            } );

        }

    },

    eachResidue: function( callback, selection ){

        var i, j, o, c, r;
        var n = this.chainCount;

        if( selection && selection.chainOnlyTest ){

            var test = selection.chainOnlyTest;

            for( i = 0; i < n; ++i ){

                c = this.chains[ i ];
                if( test( c ) ) c.eachResidue( callback, selection );

                // if( !test( c ) ) continue;

                // o = c.residueCount;

                // var residueTest = selection.residueTest;

                // for( j = 0; j < o; ++j ){

                //     r = c.residues[ j ];
                //     if( residueTest( r ) ) callback( r );

                // }

            }

        }else{

            for( i = 0; i < n; ++i ){

                c = this.chains[ i ];
                c.eachResidue( callback, selection );

                // o = c.residueCount;

                // for( j = 0; j < o; ++j ){

                //     callback( c.residues[ j ] );

                // }

            }

        }

    },

    eachResidueN: function( n, callback ){

        this.chains.forEach( function( c ){
            c.eachResidueN( n, callback );
        } );

    },

    eachFiber: function( callback, selection, padded ){

        if( selection && selection.chainOnlyTest ){

            var test = selection.chainOnlyTest;

            this.chains.forEach( function( c ){

                if( test( c ) ) c.eachFiber( callback, selection, padded );

            } );

        }else{

            this.chains.forEach( function( c ){

                c.eachFiber( callback, selection, padded );

            } );

        }

    },

    eachChain: function( callback, selection ){

        var i, c;
        var n = this.chainCount;

        if( selection && selection.chainOnlyTest ){

            var test = selection.chainOnlyTest;

            for( i = 0; i < n; ++i ){

                c = this.chains[ i ];
                if( test( c ) ) callback( c );

            }

        }else{

            for( i = 0; i < n; ++i ){

                callback( this.chains[ i ] );

            }

        }

    },

    clone: function( s ){

        var m = new NGL.Model( s );

        m.modelno = this.modelno;

        this.eachChain( function( c ){

            m.addChain( c.clone( m ) );

        } );

        return m;

    },

    toJSON: function(){

        var output = {

            modelno: this.modelno,

        };

        output.chains = [];

        this.eachChain( function( c ){

            output.chains.push( c.toJSON() );

        } );

        return output;

    },

    fromJSON: function( input ){

        this.modelno = input.modelno;

        input.chains.forEach( function( c ){

            this.addChain( new NGL.Chain( this ).fromJSON( c ) );

        }.bind( this ) );

        return this;

    }

};

NGL.AtomSet.prototype.apply( NGL.Model.prototype );


NGL.Chain = function( model ){

    this.model = model;
    this.residues = [];

    this.atomCount = 0;
    this.residueCount = 0;

};

NGL.Chain.prototype = {

    constructor: NGL.Chain,

    chainname: undefined,

    nextAtomIndex: function(){

        this.atomCount += 1;
        return this.model.nextAtomIndex();

    },

    nextResidueIndex: function(){

        this.residueCount += 1;
        return this.model.nextResidueIndex();

    },

    addResidue: function( r ){

        if( !r ){
            r = new NGL.Residue( this );
        }else{
            r.chain = this;
        }
        r.index = this.nextResidueIndex();
        this.residues.push( r );
        return r;

    },

    eachAtom: function( callback, selection ){

        var i, j, o, r, a;
        var n = this.residueCount;

        if( selection && selection.residueOnlyTest ){

            // NGL.log( "chain.eachAtom#residue", selection.selection )

            var test = selection.residueOnlyTest;

            for( i = 0; i < n; ++i ){

                r = this.residues[ i ];
                if( test( r ) ) r.eachAtom( callback, selection );

            }

            // for( i = 0; i < n; ++i ){

            //     r = this.residues[ i ];

            //     if( !test( r ) ) continue;

            //     o = r.atomCount;

            //     var atomTest = selection.atomOnlyTest;

            //     for( j = 0; j < o; ++j ){

            //         a = r.atoms[ j ];
            //         if( atomTest( a ) ) callback( a );

            //     }

            // }

        }else if( selection && (
                selection.atomOnlyTest ||
                ( this.chainname === "" && selection.test )
            )
        ){

            for( i = 0; i < n; ++i ){

                r = this.residues[ i ];
                r.eachAtom( callback, selection );

            }

        }else{

            // console.log( "moin" )

            for( i = 0; i < n; ++i ){

                r = this.residues[ i ];
                o = r.atomCount;

                for( j = 0; j < o; ++j ){

                    callback( r.atoms[ j ] );

                }

            }

        }

    },

    eachResidue: function( callback, selection ){

        var i, r;
        var n = this.residueCount;

        if( selection && selection.residueOnlyTest ){

            var test = selection.residueOnlyTest;

            for( i = 0; i < n; ++i ){

                r = this.residues[ i ];
                if( test( r ) ) callback( r );

            }

        }else{

            for( i = 0; i < n; ++i ){

                callback( this.residues[ i ] );

            }

        }

    },

    eachResidueN: function( n, callback ){

        if( this.residues.length < n ) return;

        var residues = this.residues;
        var array = new Array( n );
        var len = residues.length;
        var i;

        for( i = 0; i < n; i++ ){

            array[ i ] = residues[ i ];

        }

        callback.apply( this, array );

        for( i = n; i < len; i++ ){

            array.shift();
            array.push( residues[ i ] );

            callback.apply( this, array );

        }

    },

    getFiber: function( i, j, padded ){

        // NGL.log( i, j, this.residueCount );

        var n = this.residueCount;
        var n1 = n - 1;
        var residues = this.residues.slice( i, j );

        if( padded ){

            var rPrev = this.residues[ i - 1 ];
            var rStart = this.residues[ i ];
            var rEnd = this.residues[ j - 1 ];
            var rNext = this.residues[ j ];

            if( i === 0 ||
                rPrev.getBackboneType( -1 ) !== rStart.getBackboneType( 1 ) ||
                !rPrev.connectedTo( rStart )
            ){

                residues.unshift( rStart );

            }else{

                residues.unshift( rPrev );

            }

            if( j === n ||
                rNext.getBackboneType( 1 ) !== rStart.getBackboneType( -1 ) ||
                !rEnd.connectedTo( rNext )
            ){

                residues.push( rEnd );

            }else{

                residues.push( rNext );

            }

        }

        // NGL.log( i, j, padded, residues );

        return new NGL.Fiber( residues, this.model.structure );

    },

    eachFiber: function( callback, selection, padded ){

        var scope = this;

        var i = 0;
        var j = 1;
        var residues = this.residues;
        var test = selection ? selection.test : undefined;

        var a1, a2;
        var bbType1, bbType2

        this.eachResidueN( 2, function( r1, r2 ){

            bbType1 = r1.getBackboneType( i === j - 1 ? -1 : undefined );
            bbType2 = r2.getBackboneType();

            if( bbType1 !== NGL.UnknownType && bbType1 === bbType2 ){

                a1 = r1.getBackboneAtomStart();
                a2 = r2.getBackboneAtomEnd();

            }else{

                if( bbType1 !== NGL.UnknownType ){

                    callback( scope.getFiber( i, j, padded ) );

                }

                i = j;
                ++j;

                return;

            }

            if( !a1 || !a2 || !a1.connectedTo( a2 ) ||
                ( test && ( !test( a1 ) || !test( a2 ) ) ) ){

                callback( scope.getFiber( i, j, padded ) );
                i = j;

            }

            ++j;

        } );

        if( residues[ i ].hasBackbone( -1 ) ){

            callback( scope.getFiber( i, j, padded ) );

        }

    },

    clone: function( m ){

        var c = new NGL.Chain( m );

        c.chainname = this.chainname;

        this.eachResidue( function( r ){

            c.addResidue( r.clone( c ) );

        } );

        return c;

    },

    toJSON: function(){

        var output = {

            chainname: this.chainname,

        };

        output.residues = [];

        this.eachResidue( function( r ){

            output.residues.push( r.toJSON() );

        } );

        return output;

    },

    fromJSON: function( input ){

        this.chainname = input.chainname;

        input.residues.forEach( function( r ){

            this.addResidue( new NGL.Residue( this ).fromJSON( r ) );

        }.bind( this ) );

        return this;

    }

};

NGL.AtomSet.prototype.apply( NGL.Chain.prototype );


NGL.Fiber = function( residues, structure ){

    this.structure = structure;

    this.residues = residues;
    this.residueCount = residues.length;

    if( !this.isProtein() &&
        !this.isNucleic() &&
        !this.isCg()
    ){

        NGL.error( "NGL.fiber: could not determine molecule type" );

    }

};

NGL.Fiber.prototype = {

    constructor: NGL.Fiber,

    eachAtom: NGL.Chain.prototype.eachAtom,

    eachResidue: NGL.Chain.prototype.eachResidue,

    eachResidueN: NGL.Chain.prototype.eachResidueN,

    isProtein: function(){

        return this.residues[ 0 ].isProtein();

    },

    isCg: function(){

        return this.residues[ 0 ].isCg();

    },

    isNucleic: function(){

        return this.residues[ 0 ].isNucleic();

    },

    getType: function(){

        return this.residues[ 0 ].getType();

    },

    getBackboneType: function( position ){

        return this.residues[ 0 ].getBackboneType( position );

    }

};


NGL.Residue = function( chain ){

    this.chain = chain;
    this.atoms = [];

    this.atomCount = 0;

};

NGL.Residue.atomnames = function(){;

    var atomnames = {};

    atomnames[ NGL.ProteinBackboneType ] = {
        trace: "CA",
        direction1: "C",
        direction2: [ "O", "OC1", "O1" ],
        backboneStart: "C",
        backboneEnd: "N",
    };

    atomnames[ NGL.RnaBackboneType ] = {
        trace: [ "C4'", "C4*" ],
        direction1: [ "C1'", "C1*" ],
        direction2: [ "C3'", "C3*" ],
        backboneStart: [ "O3'", "O3*" ],
        backboneEnd: "P",
    };

    atomnames[ NGL.DnaBackboneType ] = {
        trace: [ "C3'", "C3*" ],
        direction1: [ "C2'", "C2*" ],
        direction2: [ "O4'", "O4*" ],
        backboneStart: [ "O3'", "O3*" ],
        backboneEnd: "P",
    };

    atomnames[ NGL.CgType ] = {
        trace: [ "CA", "BB" ],
        direction1: null,
        direction2: null,
        backboneStart: [ "CA", "BB" ],
        backboneEnd: [ "CA", "BB" ],
    };

    // workaround for missing CA only type
    atomnames[ NGL.UnknownType ] = {
        trace: "CA",
        direction1: null,
        direction2: null,
        backboneStart: "CA",
        backboneEnd: "CA",
    };

    return atomnames;

}();

NGL.Residue.makeHasBackboneFn = function( typeFn, atomnames ){

    return function( position ){

        if( position === -1 ){

            return typeFn.call( this ) &&
                this.hasAtomWithName(
                    atomnames.backboneStart,
                    atomnames.direction1,
                    atomnames.direction2
                );

        }else if( position === 0 ){

            return typeFn.call( this ) &&
                this.hasAtomWithName(
                    atomnames.direction1,
                    atomnames.direction2
                );

        }else if( position === 1 ){

            return typeFn.call( this ) &&
                this.hasAtomWithName(
                    atomnames.backboneEnd,
                    atomnames.direction1,
                    atomnames.direction2
                );

        }else{

            return typeFn.call( this ) &&
                this.hasAtomWithName(
                    atomnames.backboneStart,
                    atomnames.backboneEnd,
                    atomnames.direction1,
                    atomnames.direction2
                );

        }

    }

};

NGL.Residue.prototype = {

    constructor: NGL.Residue,

    index: undefined,
    chain: undefined,
    atoms: undefined,
    atomCount: undefined,

    resno: undefined,
    resname: undefined,

    _ss: undefined,
    get ss () {
        return this._ss;
    },
    set ss ( value ) {

        this._ss = value;

        var i;
        var n = this.atomCount;
        var atoms = this.atoms;

        for( i = 0; i < n; ++i ){

            atoms[ i ].ss = value;

        }

    },

    isProtein: function(){

        return this.hasAtomWithName( "CA", "C", "N" );

    },

    isCg: function(){

        var AA3 = Object.keys( NGL.AA1 );

        return function(){

            return this._cg = !this.isProtein() &&
                this.hasAtomWithName([ "CA", "BB" ]) &&
                this.atomCount <= 5 &&
                AA3.indexOf( this.resname ) !== -1;

        }

    }(),

    isNucleic: function(){

        var bases = [
            "A", "C", "T", "G", "U",
            "DA", "DC", "DT", "DG", "DU"
        ];

        return function(){

            return bases.indexOf( this.resname ) !== -1;

        }

    }(),

    isRna: function(){

        var bases = [ "A", "C", "T", "G", "U" ];

        return function(){

            return bases.indexOf( this.resname ) !== -1;

        }

    }(),

    isDna: function(){

        var bases = [ "DA", "DC", "DT", "DG", "DU" ];

        return function(){

            return bases.indexOf( this.resname ) !== -1;

        }

    }(),

    isHetero: function(){

        return this.atoms.length && this.atoms[0].hetero === 1;

    },

    isWater: function(){

        var water = [ "SOL", "WAT", "HOH", "H2O", "W" ];

        return function(){

            return water.indexOf( this.resname ) !== -1;

        }

    }(),

    hasProteinBackbone: function(){

        return NGL.Residue.makeHasBackboneFn(
            function(){
                return this.isProtein();
            },
            NGL.Residue.atomnames[ NGL.ProteinBackboneType ]
        );

    }(),

    hasRnaBackbone: function(){

        var resnames = [ "A", "C", "T", "G", "U" ];

        return NGL.Residue.makeHasBackboneFn(
            function(){
                return resnames.indexOf( this.resname ) !== -1;
            },
            NGL.Residue.atomnames[ NGL.RnaBackboneType ]
        );

    }(),

    hasDnaBackbone: function(){

        var resnames = [ "DA", "DC", "DT", "DG", "DU" ];

        return NGL.Residue.makeHasBackboneFn(
            function(){
                return resnames.indexOf( this.resname ) !== -1;
            },
            NGL.Residue.atomnames[ NGL.DnaBackboneType ]
        );

    }(),

    hasCgBackbone: function(){

        return this.isCg();

    },

    hasBackbone: function( position ){

        return this.hasProteinBackbone( position ) ||
            this.hasCgBackbone() ||
            this.hasRnaBackbone( position ) ||
            this.hasDnaBackbone( position );

    },

    getResname1: function(){

        return NGL.AA1[ this.resname.toUpperCase() ] || '?';

    },

    getType: function(){

        if( this.isProtein() ){

            return NGL.ProteinType;

        }else if( this.isNucleic() ){

            return NGL.NucleicType;

        }else if( this.isCg() ){

            return NGL.CgType;

        }else if( this.isWater() ){

            return NGL.WaterType;

        }else{

            return NGL.UnknownType;

        }

    },

    getBackboneType: function( position ){

        if( this.hasProteinBackbone( position ) ){

            return NGL.ProteinBackboneType;

        }else if( this.hasRnaBackbone( position ) ){

            return NGL.RnaBackboneType;

        }else if( this.hasDnaBackbone( position ) ){

            return NGL.DnaBackboneType;

        }else if( this.isCg() ){

            return NGL.CgType;

        }else{

            return NGL.UnknownType;

        }

    },

    nextAtomIndex: function(){

        this.atomCount += 1;
        return this.chain.nextAtomIndex();

    },

    addAtom: function( a ){

        if( !a ){
            a = new NGL.Atom( this );
        }else{
            a.residue = this;
        }
        a.index = this.nextAtomIndex();
        this.atoms.push( a );
        return a;

    },

    addProxyAtom: function( atomArray ){

        var a = new NGL.ProxyAtom( atomArray, this.nextAtomIndex() );
        a.residue = this;
        this.atoms.push( a );
        return a;

    },

    eachAtom: function( callback, selection ){

        var i, a;
        var n = this.atomCount;

        if( selection && (
                selection.atomOnlyTest ||
                ( this.chain.chainname === "" && selection.test )
            )
        ){

            // NGL.log( "residue.eachAtom#atom", selection.selection )

            var test;
            if( this.chain.chainname === "" ){
                test = selection.test;
            }else{
                test = selection.atomOnlyTest;
            }

            for( i = 0; i < n; ++i ){

                a = this.atoms[ i ];
                if( test( a ) ) callback( a );

            }

        }else{

            for( i = 0; i < n; ++i ){

                callback( this.atoms[ i ] );

            }

        }

    },

    getAtomByName: function( atomname ){

        var i, a;
        var atom = undefined;
        var n = this.atomCount;

        if( Array.isArray( atomname ) ){

            for( i = 0; i < n; ++i ){

                a = this.atoms[ i ];

                if( atomname.indexOf( a.atomname ) !== -1 ){

                    atom = a;
                    break

                }

            }

        }else{

            for( i = 0; i < n; ++i ){

                a = this.atoms[ i ];

                if( atomname === a.atomname ){

                    atom = a;
                    break

                }

            }

        }

        return atom;

    },

    hasAtomWithName: function( atomname ){

        var n = arguments.length;

        for( var i = 0; i < n; ++i ){

            if( this.getAtomByName( arguments[ i ] ) === undefined ){

                return false;

            }

        }

        return true;

    },

    getAtomnameList: function(){

        var n = this.atoms.length;
        var list = [];

        for( var i = 0; i < n; ++i ){

            list.push( this.atoms[ i ].atomname );

        }

        return list;

    },

    getTraceAtom: function(){

        return this.getAtomByName(
            NGL.Residue.atomnames[ this.getBackboneType( 0 ) ].trace
        );

    },

    getDirectionAtom1: function(){

        return this.getAtomByName(
            NGL.Residue.atomnames[ this.getBackboneType( 0 ) ].direction1
        );

    },

    getDirectionAtom2: function(){

        return this.getAtomByName(
            NGL.Residue.atomnames[ this.getBackboneType( 0 ) ].direction2
        );

    },

    getBackboneAtomStart: function(){

        return this.getAtomByName(
            NGL.Residue.atomnames[ this.getBackboneType( -1 ) ].backboneStart
        );

    },

    getBackboneAtomEnd: function(){

        return this.getAtomByName(
            NGL.Residue.atomnames[ this.getBackboneType( 1 ) ].backboneEnd
        );

    },

    connectedTo: function( rNext ){

        return this.getBackboneAtomStart().connectedTo(
            rNext.getBackboneAtomEnd()
        );

    },

    getNextConnectedResidue: function(){

        var chainResidues = this.chain.residues;
        var idx = chainResidues.indexOf( this );

        if( idx !== -1 && idx < chainResidues.length ){

            var nextResidue = chainResidues[ idx + 1 ];

            if( this.connectedTo( nextResidue ) ){

                return nextResidue;

            }

        }

        return undefined;

    },

    getPreviousConnectedResidue: function(){

        var chainResidues = this.chain.residues;
        var idx = chainResidues.indexOf( this );

        if( idx !== -1 && idx > 0 ){

            var prevResidue = chainResidues[ idx - 1 ];

            if( prevResidue.connectedTo( this ) ){

                return prevResidue;

            }

        }

        return undefined;

    },

    qualifiedName: function( noResname ){

        var name = "";

        if( this.resname && !noResname ) name += "[" + this.resname + "]";
        if( this.resno ) name += this.resno;
        if( this.chain ) name += ":" + this.chain.chainname;

        if( this.chain && this.chain.model ){
            name += "/" + this.chain.model.index;
        }

        return name;

    },

    clone: function( c ){

        var r = new NGL.Residue( c );

        r.resno = this.resno;
        r.resname = this.resname;

        this.eachAtom( function( a ){

            r.addAtom( a.clone( r ) );

        } );

        return r;

    },

    toJSON: function(){

        var output = {

            resno: this.resno,
            resname: this.resname,
            _ss: this._ss,

        };

        output.atoms = [];

        if( this.chain.model.structure.atomArray ){

            this.eachAtom( function( a ){

                output.atoms.push( a.index );

            } );

        }else{

            this.eachAtom( function( a ){

                output.atoms.push( a.toJSON() );

            } );

        }

        return output;

    },

    fromJSON: function( input ){

        this.resno = input.resno;
        this.resname = input.resname;
        this._ss = input._ss;

        if( this.chain.model.structure.atomArray ){

            var atomArray = this.chain.model.structure.atomArray;

            input.atoms.forEach( function( i ){

                this.addAtom( new NGL.ProxyAtom( atomArray, i ) );

            }.bind( this ) );

        }else{

            input.atoms.forEach( function( a ){

                this.addAtom( new NGL.Atom( this ).fromJSON( a ) );

            }.bind( this ) );

        }

        return this;

    }

};

NGL.AtomSet.prototype.apply( NGL.Residue.prototype );


NGL.Atom = function( residue ){

    this.residue = residue;

    this.bonds = [];

}

NGL.Atom.prototype = {

    constructor: NGL.Atom,

    index: undefined,
    atomno: undefined,
    resname: undefined,
    x: undefined,
    y: undefined,
    z: undefined,
    element: undefined,
    chainname: undefined,
    resno: undefined,
    serial: undefined,
    ss: undefined,
    vdw: undefined,
    covalent: undefined,
    hetero: undefined,
    bfactor: undefined,
    altloc: undefined,
    atomname: undefined,
    modelindex: undefined,

    residue: undefined,
    bonds: undefined,

    distanceTo: function( atom ){

        var x = this.x - atom.x;
        var y = this.y - atom.y;
        var z = this.z - atom.z;

        var distSquared = x * x + y * y + z * z;

        return Math.sqrt( distSquared );

    },

    connectedTo: function( atom ){

        if( !( this.altloc === '' || atom.altloc === '' ||
                ( this.altloc === atom.altloc ) ) ) return false;

        var x = this.x - atom.x;
        var y = this.y - atom.y;
        var z = this.z - atom.z;

        var distSquared = x * x + y * y + z * z;

        // NGL.log( distSquared );
        if( distSquared < 28.0 && this.residue.isCg() ) return true;

        if( isNaN( distSquared ) ) return false;

        var d = this.covalent + atom.covalent;
        var d1 = d + 0.3;
        var d2 = d - 0.5;

        return distSquared < ( d1 * d1 ) && distSquared > ( d2 * d2 );

    },

    qualifiedName: function( noResname ){

        var name = "";

        if( this.resname && !noResname ) name += "[" + this.resname + "]";
        if( this.resno ) name += this.resno;
        if( this.chainname ) name += ":" + this.chainname;
        if( this.atomname ) name += "." + this.atomname;
        if( this.residue && this.residue.chain &&
                this.residue.chain.model ){
            name += "/" + this.residue.chain.model.index;
        }

        return name;

    },

    positionFromArray: function( array, offset ){

        if( offset === undefined ) offset = 0;

        this.x = array[ offset + 0 ];
        this.y = array[ offset + 1 ];
        this.z = array[ offset + 2 ];

        return this;

    },

    positionToArray: function( array, offset ){

        if( array === undefined ) array = [];
        if( offset === undefined ) offset = 0;

        array[ offset + 0 ] = this.x;
        array[ offset + 1 ] = this.y;
        array[ offset + 2 ] = this.z;

        return array;

    },

    positionToVector3: function( v ){

        if( v === undefined ) v = new THREE.Vector3();

        v.x = this.x;
        v.y = this.y;
        v.z = this.z;

        return v;

    },

    positionFromVector3: function( v ){

        this.x = v.x;
        this.y = v.y;
        this.z = v.z;

        return this;

    },

    copy: function( atom ){

        this.index = atom.index;
        this.atomno = atom.atomno;
        this.resname = atom.resname;
        this.x = atom.x;
        this.y = atom.y;
        this.z = atom.z;
        this.element = atom.element;
        this.chainname = atom.chainname;
        this.resno = atom.resno;
        this.serial = atom.serial;
        this.ss = atom.ss;
        this.vdw = atom.vdw;
        this.covalent = atom.covalent;
        this.hetero = atom.hetero;
        this.bfactor = atom.bfactor;
        this.bonds = atom.bonds;
        this.altloc = atom.altloc;
        this.atomname = atom.atomname;
        this.modelindex = atom.modelindex;

        this.residue = atom.residue;

        return this;

    },

    clone: function( r ){

        var a = new NGL.Atom( r );

        // a.index = this.index;
        a.atomno = this.atomno;
        a.resname = this.resname;
        a.x = this.x;
        a.y = this.y;
        a.z = this.z;
        a.element = this.element;
        a.chainname = this.chainname;
        a.resno = this.resno;
        a.serial = this.serial;
        a.ss = this.ss;
        a.vdw = this.vdw;
        a.covalent = this.covalent;
        a.hetero = this.hetero;
        a.bfactor = this.bfactor;
        // a.bonds = this.bonds;  // cloned in structure.clone()
        a.altloc = this.altloc;
        a.atomname = this.atomname;
        a.modelindex = this.modelindex;

        return a;

    },

    toJSON: function(){

        var output = {

            // index: this.index,
            atomno: this.atomno,
            resname: this.resname,
            x: this.x,
            y: this.y,
            z: this.z,
            element: this.element,
            chainname: this.chainname,
            resno: this.resno,
            serial: this.serial,
            ss: this.ss,
            vdw: this.vdw,
            covalent: this.covalent,
            hetero: this.hetero,
            bfactor: this.bfactor,
            // bonds: this.bonds,  // exported in structure.toJSON()
            altloc: this.altloc,
            atomname: this.atomname,
            modelindex: this.modelindex,

        };

        return output;

    },

    fromJSON: function( input ){

        // this.index = input.index;
        this.atomno = input.atomno;
        this.resname = input.resname;
        this.x = input.x;
        this.y = input.y;
        this.z = input.z;
        this.element = input.element;
        this.chainname = input.chainname;
        this.resno = input.resno;
        this.serial = input.serial;
        this.ss = input.ss;
        this.vdw = input.vdw;
        this.covalent = input.covalent;
        this.hetero = input.hetero;
        this.bfactor = input.bfactor;
        // a.bonds = input.bonds;  // imported in structure.fromJSON()
        this.altloc = input.altloc;
        this.atomname = input.atomname;
        this.modelindex = input.modelindex;

        return this;

    }

}


NGL.AtomArray = function( sizeOrObject ){

    this.useBuffer = false;

    if( Number.isInteger( sizeOrObject ) ){

        this.init( sizeOrObject );

    }else{

        this.fromJSON( sizeOrObject );

    }

};

NGL.AtomArray.prototype = {

    constructor: NGL.AtomArray,

    init: function( size ){

        this.length = size;
        this.usedLength = 0;

        if( this.useBuffer ){

            this.makeOffsetAndSize();
            this.buffer = new ArrayBuffer( this.byteLength );
            this.makeTypedArrays();

        }else{

            this.atomno = new Int32Array( size );
            this.resname = new Uint8Array( 5 * size );
            this.x = new Float32Array( size );
            this.y = new Float32Array( size );
            this.z = new Float32Array( size );
            this.element = new Uint8Array( 3 * size );
            this.chainname = new Uint8Array( 4 * size );
            this.resno = new Int32Array( size );
            this.serial = new Int32Array( size );
            this.ss = new Uint8Array( size );
            this.vdw = new Float32Array( size );
            this.covalent = new Float32Array( size );
            this.hetero = new Uint8Array( size );
            this.bfactor = new Float32Array( size );
            this.altloc = new Uint8Array( size );
            this.atomname = new Uint8Array( 4 * size );
            this.modelindex = new Int32Array( size );

        }

        this.makeBonds();
        this.makeResidue();

    },

    getTransferable: function(){

        if( this.useBuffer ){

            return [ this.buffer ];

        }else{

            return [
                this.atomno.buffer,
                this.resname.buffer,
                this.x.buffer,
                this.y.buffer,
                this.z.buffer,
                this.element.buffer,
                this.chainname.buffer,
                this.resno.buffer,
                this.serial.buffer,
                this.ss.buffer,
                this.vdw.buffer,
                this.covalent.buffer,
                this.hetero.buffer,
                this.bfactor.buffer,
                this.altloc.buffer,
                this.atomname.buffer,
                this.modelindex.buffer
            ];

        }

    },

    makeOffsetAndSize: function(){

        var size = this.length;

        // align the offset to multiple of 4 when necessary
        // (offset + 3) & ~0x3 == (offset + 3) / 4 * 4;

        // Int32

        this.atomnoOffset = 0;
        this.atomnoSize = 4 * size;

        this.resnoOffset = this.atomnoOffset + this.atomnoSize;
        this.resnoSize = 4 * size;

        this.serialOffset = this.resnoOffset + this.resnoSize;
        this.serialSize = 4 * size;

        this.modelindexOffset = this.serialOffset + this.serialSize;
        this.modelindexSize = 4 * size;

        // Float32

        this.xOffset = this.modelindexOffset + this.modelindexSize;
        this.xSize = 4 * size;

        this.yOffset = this.xOffset + this.xSize;
        this.ySize = 4 * size;

        this.zOffset = this.yOffset + this.ySize;
        this.zSize = 4 * size;

        this.vdwOffset = this.zOffset + this.zSize;
        this.vdwSize = 4 * size;

        this.covalentOffset = this.vdwOffset + this.vdwSize;
        this.covalentSize = 4 * size;

        this.bfactorOffset = this.covalentOffset + this.covalentSize;
        this.bfactorSize = 4 * size;

        // Uint8

        this.atomnameOffset = this.bfactorOffset + this.bfactorSize;
        this.atomnameSize = 4 * size;

        this.chainnameOffset = this.atomnameOffset + this.atomnameSize;
        this.chainnameSize = 4 * size;

        this.elementOffset = this.chainnameOffset + this.chainnameSize;
        this.elementSize = 3 * size;

        this.resnameOffset = this.elementOffset + this.elementSize;
        this.resnameSize =  5 * size;

        this.ssOffset = this.resnameOffset + this.resnameSize;
        this.ssSize = size;

        this.heteroOffset = this.ssOffset + this.ssSize;
        this.heteroSize = size;

        this.altlocOffset = this.heteroOffset + this.heteroSize;
        this.altlocSize = size;

        this.byteLength = this.altlocOffset + this.altlocSize;

    },

    makeTypedArrays: function(){

        var size = this.length;

        this.atomno = new Int32Array( this.buffer, this.atomnoOffset, this.atomnoSize / 4 );
        this.resname = new Uint8Array( this.buffer, this.resnameOffset, this.resnameSize );
        this.x = new Float32Array( this.buffer, this.xOffset, this.xSize / 4 );
        this.y = new Float32Array( this.buffer, this.yOffset, this.ySize / 4 );
        this.z = new Float32Array( this.buffer, this.zOffset, this.zSize / 4 );
        this.element = new Uint8Array( this.buffer, this.elementOffset, this.elementSize );
        this.chainname = new Uint8Array( this.buffer, this.chainnameOffset, this.chainnameSize );
        this.resno = new Int32Array( this.buffer, this.resnoOffset, this.resnoSize / 4 );
        this.serial = new Int32Array( this.buffer, this.serialOffset, this.serialSize / 4 );
        this.ss = new Uint8Array( this.buffer, this.ssOffset, this.ssSize );
        this.vdw = new Float32Array( this.buffer, this.vdwOffset, this.vdwSize / 4 );
        this.covalent = new Float32Array( this.buffer, this.covalentOffset, this.covalentSize / 4 );
        this.hetero = new Uint8Array( this.buffer, this.heteroOffset, this.heteroSize );
        this.bfactor = new Float32Array( this.buffer, this.bfactorOffset, this.bfactorSize / 4 );
        this.altloc = new Uint8Array( this.buffer, this.altlocOffset, this.altlocSize );
        this.atomname = new Uint8Array( this.buffer, this.atomnameOffset, this.atomnameSize );
        this.modelindex = new Int32Array( this.buffer, this.modelindexOffset, this.modelindexSize / 4 );

    },

    makeResidue: function(){

        this.residue = new Array( this.length );

    },

    makeBonds: function(){

        var size = this.length;

        this.bonds = new Array( size );

        for( var i = 0; i < size; ++i ){
            this.bonds[ i ] = [];
        }

    },

    setResname: function( i, str ){

        var j = 5 * i;
        this.resname[ j ] = str.charCodeAt( 0 );
        this.resname[ j + 1 ] = str.charCodeAt( 1 );
        this.resname[ j + 2 ] = str.charCodeAt( 2 );
        this.resname[ j + 3 ] = str.charCodeAt( 3 );
        this.resname[ j + 4 ] = str.charCodeAt( 4 );

    },

    getResname: function( i ){

        var code;
        var resname = "";
        var j = 5 * i;
        for( var k = 0; k < 5; ++k ){
            code = this.resname[ j + k ];
            if( code ){
                resname += String.fromCharCode( code );
            }else{
                break;
            }
        }
        return resname;

    },

    setElement: function( i, str ){

        var j = 3 * i;
        this.element[ j ] = str.charCodeAt( 0 );
        this.element[ j + 1 ] = str.charCodeAt( 1 );
        this.element[ j + 2 ] = str.charCodeAt( 2 );

    },

    getElement: function( i ){

        var code;
        var element = "";
        var j = 3 * i;
        for( var k = 0; k < 3; ++k ){
            code = this.element[ j + k ];
            if( code ){
                element += String.fromCharCode( code );
            }else{
                break;
            }
        }
        return element;

    },

    setChainname: function( i, str ){

        var j = 4 * i;
        this.chainname[ j ] = str.charCodeAt( 0 );
        this.chainname[ j + 1 ] = str.charCodeAt( 1 );
        this.chainname[ j + 2 ] = str.charCodeAt( 2 );
        this.chainname[ j + 3 ] = str.charCodeAt( 3 );

    },

    getChainname: function( i ){

        var code;
        var chainname = "";
        var j = 4 * i;
        for( var k = 0; k < 4; ++k ){
            code = this.chainname[ j + k ];
            if( code ){
                chainname += String.fromCharCode( code );
            }else{
                break;
            }
        }
        return chainname;

    },

    setSS: function( i, str ){

        this.ss[ i ] = str.charCodeAt( 0 );

    },

    getSS: function( i ){

        var code = this.ss[ i ];
        return code ? String.fromCharCode( code ) : "";

    },

    setAltloc: function( i, str ){

        this.altloc[ i ] = str.charCodeAt( 0 );

    },

    getAltloc: function( i ){

        var code = this.altloc[ i ];
        return code ? String.fromCharCode( code ) : "";

    },

    setAtomname: function( i, str ){

        var j = 4 * i;
        this.atomname[ j ] = str.charCodeAt( 0 );
        this.atomname[ j + 1 ] = str.charCodeAt( 1 );
        this.atomname[ j + 2 ] = str.charCodeAt( 2 );
        this.atomname[ j + 3 ] = str.charCodeAt( 3 );

    },

    getAtomname: function( i ){

        var code;
        var atomname = "";
        var j = 4 * i;
        for( var k = 0; k < 4; ++k ){
            code = this.atomname[ j + k ];
            if( code ){
                atomname += String.fromCharCode( code );
            }else{
                break;
            }
        }
        return atomname;

    },

    clone: function(){

        // FIXME take useBuffer into account

        var aa = new NGL.AtomArray( this.length );

        aa.atomno.set( this.atomno );
        aa.resname.set( this.resname );
        aa.x.set( this.x );
        aa.y.set( this.y );
        aa.z.set( this.z );
        aa.element.set( this.element );
        aa.chainname.set( this.chainname );
        aa.resno.set( this.resno );
        aa.serial.set( this.serial );
        aa.ss.set( this.ss );
        aa.vdw.set( this.vdw );
        aa.covalent.set( this.covalent );
        aa.hetero.set( this.hetero );
        aa.bfactor.set( this.bfactor );
        aa.altloc.set( this.altloc );
        aa.atomname.set( this.atomname );
        aa.modelindex.set( this.modelindex );

        aa.usedLength = this.usedLength;

        return aa;

    },

    toJSON: function(){

        if( this.useBuffer ){

            return {
                length: this.length,
                usedLength: this.usedLength,

                buffer: this.buffer,

                // bonds: this.bonds,
                // residue: this.residue
            };

        }else{

            return {
                length: this.length,
                usedLength: this.usedLength,

                atomno: this.atomno,
                resname: this.resname,
                x: this.x,
                y: this.y,
                z: this.z,
                element: this.element,
                chainname: this.chainname,
                resno: this.resno,
                serial: this.serial,
                ss: this.ss,
                vdw: this.vdw,
                covalent: this.covalent,
                hetero: this.hetero,
                bfactor: this.bfactor,
                altloc: this.altloc,
                atomname: this.atomname,
                modelindex: this.modelindex,

                // bonds: this.bonds,
                // residue: this.residue
            };

        }

    },

    fromJSON: function( input ){

        this.length = input.length;
        this.usedLength = input.usedLength;

        if( this.useBuffer ){

            this.makeOffsetAndSize();
            this.buffer = input.buffer;
            this.makeTypedArrays();

        }else{

            this.atomno = input.atomno;
            this.resname = input.resname;
            this.x = input.x;
            this.y = input.y;
            this.z = input.z;
            this.element = input.element;
            this.chainname = input.chainname;
            this.resno = input.resno;
            this.serial = input.serial;
            this.ss = input.ss;
            this.vdw = input.vdw;
            this.covalent = input.covalent;
            this.hetero = input.hetero;
            this.bfactor = input.bfactor;
            this.altloc = input.altloc;
            this.atomname = input.atomname;
            this.modelindex = input.modelindex;

        }

        if( input.bonds ){
            this.bonds = input.bonds;
        }else{
            this.makeBonds();
        }

        if( input.residue ){
            this.residue = input.residue;
        }else{
            this.makeResidue();
        }

    },

    dispose: function(){

        if( this.useBuffer ){

            delete this.buffer;

        }

        delete this.atomno;
        delete this.resname;
        delete this.x;
        delete this.y;
        delete this.z;
        delete this.element;
        delete this.chainname;
        delete this.resno;
        delete this.serial;
        delete this.ss;
        delete this.vdw;
        delete this.covalent;
        delete this.hetero;
        delete this.bfactor;
        delete this.altloc;
        delete this.atomname;
        delete this.modelindex;

        delete this.bonds;
        delete this.residue;

        this.length = 0;
        this.usedLength = 0;

    }

};


NGL.ProxyAtom = function( atomArray, index ){

    this.atomArray = atomArray;
    this.index = index;

};

NGL.ProxyAtom.prototype = {

    constructor: NGL.ProxyAtom,

    atomArray: undefined,
    index: undefined,

    get atomno () {
        return this.atomArray.atomno[ this.index ];
    },
    set atomno ( value ) {
        this.atomArray.atomno[ this.index ] = value;
    },

    get resname () {
        return this.atomArray.getResname( this.index );
    },
    set resname ( value ) {
        this.atomArray.setResname( this.index, value );
    },

    get x () {
        return this.atomArray.x[ this.index ];
    },
    set x ( value ) {
        this.atomArray.x[ this.index ] = value;
    },

    get y () {
        return this.atomArray.y[ this.index ];
    },
    set y ( value ) {
        this.atomArray.y[ this.index ] = value;
    },

    get z () {
        return this.atomArray.z[ this.index ];
    },
    set z ( value ) {
        this.atomArray.z[ this.index ] = value;
    },

    get element () {
        return this.atomArray.getElement( this.index );
    },
    set element ( value ) {
        this.atomArray.setElement( this.index, value );
    },

    get chainname () {
        return this.atomArray.getChainname( this.index );
    },
    set chainname ( value ) {
        this.atomArray.setChainname( this.index, value );
    },

    get resno () {
        return this.atomArray.resno[ this.index ];
    },
    set resno ( value ) {
        this.atomArray.resno[ this.index ] = value;
    },

    get serial () {
        return this.atomArray.serial[ this.index ];
    },
    set serial ( value ) {
        this.atomArray.serial[ this.index ] = value;
    },

    get ss () {
        return this.atomArray.getSS( this.index );
    },
    set ss ( value ) {
        this.atomArray.setSS( this.index, value );
    },

    get vdw () {
        return this.atomArray.vdw[ this.index ];
    },
    set vdw ( value ) {
        this.atomArray.vdw[ this.index ] = value;
    },

    get covalent () {
        return this.atomArray.covalent[ this.index ];
    },
    set covalent ( value ) {
        this.atomArray.covalent[ this.index ] = value;
    },

    get hetero () {
        return this.atomArray.hetero[ this.index ];
    },
    set hetero ( value ) {
        this.atomArray.hetero[ this.index ] = value;
    },

    get bfactor () {
        return this.atomArray.bfactor[ this.index ];
    },
    set bfactor ( value ) {
        this.atomArray.bfactor[ this.index ] = value;
    },

    get bonds () {
        return this.atomArray.bonds[ this.index ];
    },
    set bonds ( value ) {
        this.atomArray.bonds[ this.index ] = value;
    },

    get altloc () {
        return this.atomArray.getAltloc( this.index );
    },
    set altloc ( value ) {
        this.atomArray.setAltloc( this.index, value );
    },

    get atomname () {
        return this.atomArray.getAtomname( this.index );
    },
    set atomname ( value ) {
        this.atomArray.setAtomname( this.index, value );
    },

    get residue () {
        return this.atomArray.residue[ this.index ];
    },
    set residue ( value ) {
        this.atomArray.residue[ this.index ] = value;
    },

    get modelindex () {
        return this.atomArray.modelindex[ this.index ];
    },
    set modelindex ( value ) {
        this.atomArray.modelindex[ this.index ] = value;
    },

    // distanceTo: NGL.Atom.prototype.distanceTo,

    distanceTo: function( atom ){

        var taa = this.atomArray;
        var aaa = atom.atomArray;
        var ti = this.index;
        var ai = atom.index;

        var x = taa.x[ ti ] - aaa.x[ ai ];
        var y = taa.y[ ti ] - aaa.y[ ai ];
        var z = taa.z[ ti ] - aaa.z[ ai ];

        var distSquared = x * x + y * y + z * z;

        return Math.sqrt( distSquared );

    },

    // connectedTo: NGL.Atom.prototype.connectedTo,

    connectedTo: function( atom ){

        var taa = this.atomArray;
        var aaa = atom.atomArray;
        var ti = this.index;
        var ai = atom.index;
        var ta = taa.altloc[ ti ];  // use Uint8 value to compare
        var aa = aaa.altloc[ ai ];  // no need to convert to char

        if( !( ta === 0 || aa === 0 || ( ta === aa ) ) ) return false;

        var x = taa.x[ ti ] - aaa.x[ ai ];
        var y = taa.y[ ti ] - aaa.y[ ai ];
        var z = taa.z[ ti ] - aaa.z[ ai ];

        var distSquared = x * x + y * y + z * z;

        // NGL.log( distSquared );
        if( distSquared < 28.0 && taa.residue[ ti ].isCg() ) return true;

        if( isNaN( distSquared ) ) return false;

        var d = taa.covalent[ ti ] + aaa.covalent[ ai ];
        var d1 = d + 0.3;
        var d2 = d - 0.5;

        return distSquared < ( d1 * d1 ) && distSquared > ( d2 * d2 );

    },

    qualifiedName: NGL.Atom.prototype.qualifiedName,

    positionFromArray: NGL.Atom.prototype.positionFromArray,

    positionToArray: NGL.Atom.prototype.positionToArray,

    positionFromVector3: NGL.Atom.prototype.positionFromVector3,

    positionToVector3: NGL.Atom.prototype.positionToVector3,

    // copy: NGL.Atom.prototype.copy,

    copy: function( atom, index ){

        this.index = index;

        this.atomno = atom.atomno;
        this.resname = atom.resname;
        this.x = atom.x;
        this.y = atom.y;
        this.z = atom.z;
        this.element = atom.element;
        this.chainname = atom.chainname;
        this.resno = atom.resno;
        this.serial = atom.serial;
        this.ss = atom.ss;
        this.vdw = atom.vdw;
        this.covalent = atom.covalent;
        this.hetero = atom.hetero;
        this.bfactor = atom.bfactor;
        this.bonds = atom.bonds;
        this.altloc = atom.altloc;
        this.atomname = atom.atomname;
        this.modelindex = atom.modelindex;

        this.residue = atom.residue;

        return this;

    },

    clone: function( r ){

        var atomArray = r.chain.model.structure.atomArray;

        var a = new NGL.ProxyAtom( atomArray, this.index );

        return a;

    },

    toJSON: function(){

        return {};

    },

    fromJSON: function( input ){

        return this;

    }

}


NGL.StructureSubset = function( structure, selection ){

    NGL.Structure.call( this, structure.name, structure.path );

    this.structure = structure;
    this.selection = selection;

    this._build();

};

NGL.StructureSubset.prototype = Object.create( NGL.Structure.prototype );

NGL.StructureSubset.prototype.constructor = NGL.StructureSubset;

NGL.StructureSubset.prototype.setDefaultAssembly = function( value ){

    this.defaultAssembly = value;
    this.structure.setDefaultAssembly( value );

};

NGL.StructureSubset.prototype._build = function(){

    NGL.time( "NGL.StructureSubset._build" );

    var structure = this.structure;
    var selection = this.selection;
    var atoms = this.atoms;
    var bondSet = this.bondSet;

    var _s = this;
    var _m, _c, _r, _a;

    var atomIndexDict = {};

    structure.eachModel( function( m ){

        _m = _s.addModel();

        m.eachChain( function( c ){

            _c = _m.addChain();
            _c.chainname = c.chainname;

            c.eachResidue( function( r ){

                _r = _c.addResidue();
                _r.resno = r.resno;
                _r.resname = r.resname;
                _r.ss = r.ss;

                r.eachAtom( function( a ){

                    // TODO by reference? index? bonds? residue?

                    _a = _r.addAtom();
                    _a.atomno = a.atomno;
                    _a.resname = a.resname;
                    _a.x = a.x;
                    _a.y = a.y;
                    _a.z = a.z;
                    _a.element = a.element;
                    _a.chainname = a.chainname;
                    _a.resno = a.resno;
                    _a.serial = a.serial;
                    _a.ss = a.ss;
                    _a.vdw = a.vdw;
                    _a.covalent = a.covalent;
                    _a.hetero = a.hetero;
                    _a.bfactor = a.bfactor;
                    _a.bonds = [];
                    _a.altloc = a.altloc;
                    _a.atomname = a.atomname;
                    _a.modelindex = a.modelindex;

                    atomIndexDict[ a.index ] = _a;
                    atoms.push( _a );

                }, selection );

                if( _r.atoms.length === 0 ){
                    _c.residues.pop();
                    --_c.residueCount;
                    --_m.residueCount;
                    --_s.residueCount;
                }

            }, selection );

            if( _c.residues.length === 0 ){
                _m.chains.pop();
                --_m.chainCount;
                --_s.chainCount;
            }

        }, selection );

        if( _m.chains.length === 0 ){
            _s.models.pop();
            --_s.modelCount;
        }

    }, selection );

    structure.bondSet.eachBond( function( b ){

        _s.bondSet.addBond(
            atomIndexDict[ b.atom1.index ],
            atomIndexDict[ b.atom2.index ]
        );

    }, selection );

    _s.title = structure.title;
    _s.id = structure.id;

    _s.center = _s.atomCenter();
    _s.boundingBox = _s.getBoundingBox();

    _s.frames = structure.frames;
    _s.boxes = structure.boxes;
    _s.helices = structure.helices;
    _s.sheets = structure.sheets;

    _s.biomolDict = structure.biomolDict;
    _s.defaultAssembly = structure.defaultAssembly;

    NGL.GidPool.updateObject( this );

    NGL.timeEnd( "NGL.StructureSubset._build" );

};


//////////////
// Selection

NGL.Selection = function( string, extraString ){

    var SIGNALS = signals;

    this.signals = {

        stringChanged: new SIGNALS.Signal(),

    };

    this.setString( string, extraString );

};


NGL.Selection.prototype = {

    constructor: NGL.Selection,

    setString: function( string, extraString, silent ){

        if( string === undefined ){
            string = this.string || "";
        }

        if( extraString === undefined ){
            extraString = this.extraString || "";
        }

        if( string === this.string && extraString === this.extraString ){
            return;
        }

        //

        var combinedString;

        if( !string && !extraString ){

            combinedString = "";

        }else if( !string ){

            combinedString = extraString;

        }else if( !extraString ){

            combinedString = string;

        }else{

            combinedString = (
                "( " + string + " ) and " +
                "( " + extraString + " )"
            );

        }

        if( combinedString === this.combinedString ){
            return;
        }

        //

        try{

            this.parse( combinedString );

        }catch( e ){

            // NGL.error( e.stack );
            this.selection = { "error": e.message };

        }

        this.string = string;
        this.extraString = extraString;
        this.combinedString = combinedString;

        this.test = this.makeAtomTest();
        this.residueTest = this.makeResidueTest();
        this.chainTest = this.makeChainTest();
        this.modelTest = this.makeModelTest();

        this.atomOnlyTest = this.makeAtomTest( true );
        this.residueOnlyTest = this.makeResidueTest( true );
        this.chainOnlyTest = this.makeChainTest( true )
        this.modelOnlyTest = this.makeModelTest( true );

        if( !silent ){
            this.signals.stringChanged.dispatch( this.string );
        }

    },

    parse: function( string ){

        this.selection = {
            operator: undefined,
            rules: []
        };

        if( !string ) return;

        var scope = this;

        var selection = this.selection;
        var selectionStack = [];
        var newSelection, oldSelection;
        var andContext = null;

        string = string.replace( /\(/g, ' ( ' ).replace( /\)/g, ' ) ' ).trim();
        if( string.charAt( 0 ) === "(" && string.substr( -1 ) === ")" ){
            string = string.slice( 1, -1 ).trim();
        }
        var chunks = string.split( /\s+/ );

        // NGL.log( string, chunks )

        var all = [ "*", "", "ALL" ];

        var c, sele, i, error, not;
        var atomname, chain, resno, resname, model, resi;
        var j = 0;

        var createNewContext = function( operator ){

            newSelection = {
                operator: operator,
                rules: []
            };
            if( selection === undefined ){
                selection = newSelection;
                scope.selection = newSelection;
            }else{
                selection.rules.push( newSelection );
                selectionStack.push( selection );
                selection = newSelection;
            }
            j = 0;

        }

        var getPrevContext = function( operator ){

            oldSelection = selection;
            selection = selectionStack.pop();
            if( selection === undefined ){
                createNewContext( operator );
                pushRule( oldSelection );
            }else{
                j = selection.rules.length;
            }

        }

        var pushRule = function( rule ){

            selection.rules.push( rule );
            j += 1;

        }

        for( i = 0; i < chunks.length; ++i ){

            c = chunks[ i ];

            // handle parens

            if( c === "(" ){

                // NGL.log( "(" );

                not = false;
                createNewContext();
                continue;

            }else if( c === ")" ){

                // NGL.log( ")" );

                getPrevContext();
                if( selection.negate ){
                    getPrevContext();
                }
                continue;

            }

            // leave 'not' context

            if( not > 0 ){

                if( c.toUpperCase() === "NOT" ){

                    not = 1;

                }else if( not === 1 ){

                    not = 2;

                }else if( not === 2 ){

                    not = false;
                    getPrevContext();

                }else{

                    throw new Error( "something went wrong with 'not'" );

                }

            }

            // handle logic operators

            if( c.toUpperCase() === "AND" ){

                // NGL.log( "AND" );

                if( selection.operator === "OR" ){
                    var lastRule = selection.rules.pop();
                    createNewContext( "AND" );
                    pushRule( lastRule );
                }else{
                    selection.operator = "AND";
                }
                continue;

            }else if( c.toUpperCase() === "OR" ){

                // NGL.log( "OR" );

                if( selection.operator === "AND" ){
                    getPrevContext( "OR" );
                }else{
                    selection.operator = "OR";
                }
                continue;

            }else if( c.toUpperCase() === "NOT" ){

                // NGL.log( "NOT", j );

                not = 1;
                createNewContext();
                selection.negate = true;
                continue;

            }else{

                // NGL.log( "chunk", c, j, selection );

            }

            // handle keyword attributes

            sele = {};

            if( c.toUpperCase() === "HETERO" ){
                sele.keyword = "HETERO";
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "WATER" ){
                sele.keyword = "WATER";
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "PROTEIN" ){
                sele.keyword = "PROTEIN";
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "NUCLEIC" ){
                sele.keyword = "NUCLEIC";
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "RNA" ){
                sele.keyword = "RNA";
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "DNA" ){
                sele.keyword = "DNA";
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "POLYMER" ){
                sele.keyword = "POLYMER";
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "HYDROGEN" ){
                sele.element = "H";
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "SMALL" ){
                sele = {
                    operator: "OR",
                    rules: [
                        { resname: "GLY" },
                        { resname: "ALA" }
                    ]
                };
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "NUCLEOPHILIC" ){
                sele = {
                    operator: "OR",
                    rules: [
                        { resname: "SER" },
                        { resname: "THR" },
                        { resname: "CYS" }
                    ]
                };
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "HYDROPHOBIC" ){
                sele = {
                    operator: "OR",
                    rules: [
                        { resname: "VAL" },
                        { resname: "LEU" },
                        { resname: "ILE" },
                        { resname: "MET" },
                        { resname: "PRO" }
                    ]
                };
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "AROMATIC" ){
                sele = {
                    operator: "OR",
                    rules: [
                        { resname: "PHE" },
                        { resname: "TYR" },
                        { resname: "TRP" }
                    ]
                };
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "AMIDE" ){
                sele = {
                    operator: "OR",
                    rules: [
                        { resname: "ASN" },
                        { resname: "GLN" }
                    ]
                };
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "ACIDIC" ){
                sele = {
                    operator: "OR",
                    rules: [
                        { resname: "ASP" },
                        { resname: "GLU" }
                    ]
                };
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "BASIC" ){
                sele = {
                    operator: "OR",
                    rules: [
                        { resname: "HIS" },
                        { resname: "LYS" },
                        { resname: "ARG" }
                    ]
                };
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "CHARGED" ){
                sele = {
                    operator: "OR",
                    rules: [
                        { resname: "ASP" },
                        { resname: "GLU" },
                        { resname: "HIS" },
                        { resname: "LYS" },
                        { resname: "ARG" }
                    ]
                };
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "POLAR" ){
                sele = {
                    operator: "OR",
                    rules: [
                        { resname: "ASP" },
                        { resname: "GLU" },
                        { resname: "HIS" },
                        { resname: "LYS" },
                        { resname: "ARG" },
                        { resname: "ASN" },
                        { resname: "GLN" },
                        { resname: "SER" },
                        { resname: "THR" },
                        { resname: "TYR" }
                    ]
                };
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "NONPOLAR" ){
                sele = {
                    operator: "OR",
                    rules: [
                        { resname: "ALA" },
                        { resname: "CYS" },
                        { resname: "GLY" },
                        { resname: "ILE" },
                        { resname: "LEU" },
                        { resname: "MET" },
                        { resname: "PHE" },
                        { resname: "PRO" },
                        { resname: "VAL" },
                        { resname: "TRP" }
                    ]
                };
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "HELIX" ){
                sele.keyword = "HELIX";
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "SHEET" ){
                sele.keyword = "SHEET";
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "TURN" ){
                sele = {
                    operator: "OR",
                    negate: true,
                    rules: [
                        { keyword: "HELIX" },
                        { keyword: "SHEET" }
                    ]
                };
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "BACKBONE" ){
                sele.keyword = "BACKBONE";
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "SIDECHAIN" ){
                sele.keyword = "SIDECHAIN";
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "SIDECHAINATTACHED" ){
                sele = {
                    operator: "OR",
                    rules: [
                        {
                            operator: "AND",
                            negate: false,
                            rules: [
                                { resname: "PRO" },
                                { atomname: "N" },
                            ]
                        },
                        { keyword: "SIDECHAIN" },
                        { atomname: "CA" },
                        { atomname: "BB" }
                    ]
                };
                pushRule( sele );
                continue;
            }

            if( all.indexOf( c.toUpperCase() )!==-1 ){
                sele.keyword = "ALL";
                pushRule( sele );
                continue;
            }

            // handle atom expressions

            // TODO make replacement
            // if( c.charAt( 0 ) === "@" ){
            //     sele.globalindex = parseInt( c.substr( 1 ) );
            //     pushRule( sele );
            //     continue;
            // }

            if( c.charAt( 0 ) === "#" ){
                sele.element = c.substr( 1 ).toUpperCase();
                pushRule( sele );
                continue;
            }

            if( c.charAt( 0 ) === "~" ){
                sele.altloc = c.substr( 1 );
                pushRule( sele );
                continue;
            }

            if( ( c.length >= 1 && c.length <= 4 ) &&
                    c[0] !== ":" && c[0] !== "." && c[0] !== "/" &&
                    isNaN( parseInt( c ) ) ){

                sele.resname = c.toUpperCase();
                pushRule( sele );
                continue;
            }

            // there must be only one constraint per rule
            // otherwise a test quickly becomes not applicable
            // e.g. chainTest for chainname when resno is present too

            sele = {
                operator: "AND",
                rules: []
            };

            model = c.split("/");
            if( model.length > 1 && model[1] ){
                if( isNaN( parseInt( model[1] ) ) ){
                    throw new Error( "model must be an integer" );
                }
                sele.rules.push( {
                    model: parseInt( model[1] )
                } );
            }

            atomname = model[0].split(".");
            if( atomname.length > 1 && atomname[1] ){
                if( atomname[1].length > 4 ){
                    throw new Error( "atomname must be one to four characters" );
                }
                sele.rules.push( {
                    atomname: atomname[1].substring( 0, 4 ).toUpperCase()
                } );
            }

            chain = atomname[0].split(":");
            if( chain.length > 1 && chain[1] ){
                sele.rules.push( {
                    chainname: chain[1]
                } );
            }

            if( chain[0] ){
                resi = chain[0].split("-");
                if( resi.length === 1 ){
                    resi = parseInt( resi[0] );
                    if( isNaN( resi ) ){
                        throw new Error( "resi must be an integer" );
                    }
                    sele.rules.push( {
                        resno: resi
                    } );
                }else if( resi.length === 2 ){
                    sele.rules.push( {
                        resno: [ parseInt( resi[0] ), parseInt( resi[1] ) ]
                    } );
                }else{
                    throw new Error( "resi range must contain one '-'" );
                }
            }

            // round up

            if( sele.rules.length === 1 ){
                pushRule( sele.rules[ 0 ] );
            }else if( sele.rules.length > 1 ){
                pushRule( sele );
            }else{
                throw new Error( "empty selection chunk" );
            }

        }

        // cleanup

        if( this.selection.operator === undefined &&
                this.selection.rules.length === 1 &&
                this.selection.rules[ 0 ].hasOwnProperty( "operator" ) ){

            this.selection = this.selection.rules[ 0 ];

        }

    },

    _makeTest: function( fn, selection ){

        if( selection === undefined ) selection = this.selection;
        if( selection === null ) return false;
        if( selection.error ) return false;

        var n = selection.rules.length;
        if( n === 0 ) return false;

        var t = selection.negate ? false : true;
        var f = selection.negate ? true : false;

        var s, and, ret, na;

        var subTests = [];

        for( var i = 0; i < n; ++i ){

            s = selection.rules[ i ];

            if( s.hasOwnProperty( "operator" ) ){

                subTests[ i ] = this._makeTest( fn, s );

            }

        }

        return function( entity ){

            and = selection.operator === "AND";
            na = false;

            for( var i = 0; i < n; ++i ){

                s = selection.rules[ i ];

                if( s.hasOwnProperty( "operator" ) ){

                    if( subTests[ i ] ){

                        ret = subTests[ i ]( entity );

                    }else{

                        ret = -1;

                    }

                    if( ret === -1 ){

                        // return -1;
                        na = true;
                        continue;

                    }else if( ret === true){

                        if( and ){ continue; }else{ return t; }

                    }else{

                        if( and ){ return f; }else{ continue; }

                    }

                }else{

                    if( s.keyword!==undefined && s.keyword==="ALL" ){

                        if( and ){ continue; }else{ return t; }

                    }

                    ret = fn( entity, s );

                    if( ret === -1 ){

                        // return -1;
                        na = true;
                        continue;

                    }else if( ret === true){

                        if( and ){ continue; }else{ return t; }

                    }else{

                        if( and ){ return f; }else{ continue; }

                    }

                }

            }

            if( na ){

                return -1;

            }else{

                if( and ){ return t; }else{ return f; }

            }

        }

    },

    _filter: function( fn, selection ){

        if( selection === undefined ) selection = this.selection;
        if( selection.error ) return selection;

        var n = selection.rules.length;
        if( n === 0 ) return selection;

        var filtered = {
            operator: selection.operator,
            rules: []
        };
        if( selection.hasOwnProperty( "negate" ) ){
            filtered.negate = selection.negate;
        }

        for( var i = 0; i < n; ++i ){

            var s = selection.rules[ i ];

            if( s.hasOwnProperty( "operator" ) ){

                var fs = this._filter( fn, s );
                if( fs !== null ) filtered.rules.push( fs );

            }else if( !fn( s ) ){

                filtered.rules.push( s );

            }

        }

        if( filtered.rules.length > 0 ){

            // TODO maybe the filtered rules could be returned
            // in some case, but the way how tests are applied
            // e.g. when traversing a structure would also need
            // to change
            return selection;

        }else{

            return null;

        }

    },

    makeAtomTest: function( atomOnly ){

        var backboneProtein = [
            "CA", "C", "N", "O",
            "O1", "O2", "OC1", "OC2",
            "H", "H1", "H2", "H3", "HA"
        ];
        var backboneNucleic = [
            "P", "O3'", "O5'", "C5'", "C4'", "C3'", "OP1", "OP2",
            "O3*", "O5*", "C5*", "C4*", "C3*"
        ];
        var backboneCg = [
            "CA", "BB"
        ];

        var helixTypes = [
            "h", "g", "i"
        ];

        var selection;

        if( atomOnly ){

            // console.log( this.selection )

            selection = this._filter( function( s ){

                if( s.model!==undefined ) return true;
                if( s.chainname!==undefined ) return true;
                if( s.resname!==undefined ) return true;
                if( s.resno!==undefined ) return true;

                return false;

            } );

        }else{

            selection = this.selection;

        }

        var fn = function( a, s ){

            // returning -1 means the rule is not applicable

            if( s.keyword!==undefined ){

                if( s.keyword==="HETERO" && a.hetero===1 ) return true;
                if( s.keyword==="PROTEIN" && (
                        a.residue.isProtein() || a.residue.isCg()
                    )
                ) return true;
                if( s.keyword==="NUCLEIC" && a.residue.isNucleic() ) return true;
                if( s.keyword==="RNA" && a.residue.isRna() ) return true;
                if( s.keyword==="DNA" && a.residue.isDna() ) return true;
                if( s.keyword==="POLYMER" && (
                        a.residue.isProtein() ||
                        a.residue.isNucleic() ||
                        a.residue.isCg()
                    )
                ) return true;
                if( s.keyword==="WATER" && a.residue.isWater() ) return true;
                if( s.keyword==="HELIX" && helixTypes.indexOf( a.ss )!==-1 ) return true;
                if( s.keyword==="SHEET" && a.ss==="s" ) return true;
                if( s.keyword==="BACKBONE" && (
                        ( a.residue.isProtein() &&
                            backboneProtein.indexOf( a.atomname )!==-1 ) ||
                        ( a.residue.isNucleic() &&
                            backboneNucleic.indexOf( a.atomname )!==-1 ) ||
                        ( a.residue.isCg() &&
                            backboneCg.indexOf( a.atomname )!==-1 )
                    )
                ) return true;
                if( s.keyword==="SIDECHAIN" && (
                        ( a.residue.isProtein() &&
                            backboneProtein.indexOf( a.atomname )===-1 ) ||
                        ( a.residue.isNucleic() &&
                            backboneNucleic.indexOf( a.atomname )===-1 ) ||
                        ( a.residue.isCg() &&
                            backboneCg.indexOf( a.atomname )===-1 )
                    )
                ) return true;

                return false;

            }

            // TODO make replacement
            // if( s.globalindex!==undefined && s.globalindex!==a.globalindex ) return false;
            if( s.resname!==undefined && s.resname!==a.resname ) return false;
            if( s.chainname!==undefined && s.chainname!==a.chainname ) return false;
            if( s.atomname!==undefined && s.atomname!==a.atomname ) return false;
            if( s.model!==undefined && s.model!==a.residue.chain.model.index ) return false;

            if( s.resno!==undefined ){
                if( Array.isArray( s.resno ) && s.resno.length===2 ){
                    if( s.resno[0]>a.resno || s.resno[1]<a.resno ) return false;
                }else{
                    if( s.resno!==a.resno ) return false;
                }
            }

            if( s.element!==undefined && s.element!==a.element ) return false;

            if( s.altloc!==undefined && s.altloc!==a.altloc ) return false;

            return true;

        }

        return this._makeTest( fn, selection );

    },

    makeResidueTest: function( residueOnly ){

        var selection;

        if( residueOnly ){

            // console.log( this.selection )

            selection = this._filter( function( s ){

                if( s.model!==undefined ) return true;
                // TODO make replacement
                // if( s.globalindex!==undefined ) return true;
                if( s.chainname!==undefined ) return true;
                if( s.atomname!==undefined ) return true;
                if( s.element!==undefined ) return true;
                if( s.altloc!==undefined ) return true;

                return false;

            } );

        }else{

            selection = this.selection;

        }

        var fn = function( r, s ){

            // returning -1 means the rule is not applicable

            if( s.keyword!==undefined ){

                if( s.keyword==="HETERO" && r.isHetero() ) return true;
                if( s.keyword==="PROTEIN" && (
                        r.isProtein() || r.isCg() )
                ) return true;
                if( s.keyword==="NUCLEIC" && r.isNucleic() ) return true;
                if( s.keyword==="RNA" && r.isRna() ) return true;
                if( s.keyword==="DNA" && r.isDna() ) return true;
                if( s.keyword==="POLYMER" && (
                        r.isProtein() || r.isNucleic() || r.isCg() )
                ) return true;
                if( s.keyword==="WATER" && r.isWater() ) return true;

            }

            if( s.chainname===undefined && s.model===undefined &&
                    s.resname===undefined && s.resno===undefined
            ) return -1;
            if( s.chainname!==undefined && r.chain.chainname===undefined ) return -1;

            // support autoChainNames which work only on atoms
            if( s.chainname!==undefined && r.chain.chainname==="" ) return -1;

            if( s.resname!==undefined && s.resname!==r.resname ) return false;
            if( s.chainname!==undefined && s.chainname!==r.chain.chainname ) return false;
            if( s.model!==undefined && s.model!==r.chain.model.index ) return false;

            if( s.resno!==undefined ){
                if( Array.isArray( s.resno ) && s.resno.length===2 ){
                    if( s.resno[0]>r.resno || s.resno[1]<r.resno ) return false;
                }else{
                    if( s.resno!==r.resno ) return false;
                }
            }

            return true;

        }

        return this._makeTest( fn, selection );

    },

    makeChainTest: function( chainOnly ){

        var selection;

        if( chainOnly ){

            // console.log( this.selection )

            selection = this._filter( function( s ){

                if( s.model!==undefined ) return true;
                if( s.resname!==undefined ) return true;
                if( s.resno!==undefined ) return true;
                // TODO make replacement
                // if( s.globalindex!==undefined ) return true;
                if( s.atomname!==undefined ) return true;
                if( s.element!==undefined ) return true;
                if( s.altloc!==undefined ) return true;

                return false;

            } );

        }else{

            selection = this.selection;

        }

        var fn = function( c, s ){

            // returning -1 means the rule is not applicable

            if( s.chainname!==undefined && c.chainname===undefined ) return -1;
            if( s.chainname===undefined && s.model===undefined ) return -1;

            // support autoChainNames which work only on atoms
            if( s.chainname!==undefined && c.chainname==="" ) return -1;

            if( s.chainname!==undefined && s.chainname!==c.chainname ) return false;
            if( s.model!==undefined && s.model!==c.model.index ) return false;

            return true;

        }

        return this._makeTest( fn, selection );

    },

    makeModelTest: function( modelOnly ){

        var selection;

        if( modelOnly ){

            // console.log( this.selection )

            selection = this._filter( function( s ){

                if( s.chainname!==undefined ) return true;
                if( s.resname!==undefined ) return true;
                if( s.resno!==undefined ) return true;
                // TODO make replacement
                // if( s.globalindex!==undefined ) return true;
                if( s.atomname!==undefined ) return true;
                if( s.element!==undefined ) return true;
                if( s.altloc!==undefined ) return true;

                return false;

            } );

        }else{

            selection = this.selection;

        }

        var fn = function( m, s ){

            // returning -1 means the rule is not applicable

            if( s.model===undefined ) return -1;
            if( s.model!==m.index ) return false;

            return true;

        }

        return this._makeTest( fn, selection );

    }

};


//////////////
// Alignment

NGL.SubstitutionMatrices = function(){

    var blosum62x = [
        [4,0,-2,-1,-2,0,-2,-1,-1,-1,-1,-2,-1,-1,-1,1,0,0,-3,-2],        // A
        [0,9,-3,-4,-2,-3,-3,-1,-3,-1,-1,-3,-3,-3,-3,-1,-1,-1,-2,-2],    // C
        [-2,-3,6,2,-3,-1,-1,-3,-1,-4,-3,1,-1,0,-2,0,-1,-3,-4,-3],       // D
        [-1,-4,2,5,-3,-2,0,-3,1,-3,-2,0,-1,2,0,0,-1,-2,-3,-2],          // E
        [-2,-2,-3,-3,6,-3,-1,0,-3,0,0,-3,-4,-3,-3,-2,-2,-1,1,3],        // F
        [0,-3,-1,-2,-3,6,-2,-4,-2,-4,-3,0,-2,-2,-2,0,-2,-3,-2,-3],      // G
        [-2,-3,-1,0,-1,-2,8,-3,-1,-3,-2,1,-2,0,0,-1,-2,-3,-2,2],        // H
        [-1,-1,-3,-3,0,-4,-3,4,-3,2,1,-3,-3,-3,-3,-2,-1,3,-3,-1],       // I
        [-1,-3,-1,1,-3,-2,-1,-3,5,-2,-1,0,-1,1,2,0,-1,-2,-3,-2],        // K
        [-1,-1,-4,-3,0,-4,-3,2,-2,4,2,-3,-3,-2,-2,-2,-1,1,-2,-1],       // L
        [-1,-1,-3,-2,0,-3,-2,1,-1,2,5,-2,-2,0,-1,-1,-1,1,-1,-1],        // M
        [-2,-3,1,0,-3,0,1,-3,0,-3,-2,6,-2,0,0,1,0,-3,-4,-2],            // N
        [-1,-3,-1,-1,-4,-2,-2,-3,-1,-3,-2,-2,7,-1,-2,-1,-1,-2,-4,-3],   // P
        [-1,-3,0,2,-3,-2,0,-3,1,-2,0,0,-1,5,1,0,-1,-2,-2,-1],           // Q
        [-1,-3,-2,0,-3,-2,0,-3,2,-2,-1,0,-2,1,5,-1,-1,-3,-3,-2],        // R
        [1,-1,0,0,-2,0,-1,-2,0,-2,-1,1,-1,0,-1,4,1,-2,-3,-2],           // S
        [0,-1,-1,-1,-2,-2,-2,-1,-1,-1,-1,0,-1,-1,-1,1,5,0,-2,-2],       // T
        [0,-1,-3,-2,-1,-3,-3,3,-2,1,1,-3,-2,-2,-3,-2,0,4,-3,-1],        // V
        [-3,-2,-4,-3,1,-2,-2,-3,-3,-2,-1,-4,-4,-2,-3,-3,-2,-3,11,2],    // W
        [-2,-2,-3,-2,3,-3,2,-1,-2,-1,-1,-2,-3,-1,-2,-2,-2,-1,2,7]       // Y
    ];

    var blosum62 = [
        //A  R  N  D  C  Q  E  G  H  I  L  K  M  F  P  S  T  W  Y  V  B  Z  X
        [ 4,-1,-2,-2, 0,-1,-1, 0,-2,-1,-1,-1,-1,-2,-1, 1, 0,-3,-2, 0,-2,-1, 0], // A
        [-1, 5, 0,-2,-3, 1, 0,-2, 0,-3,-2, 2,-1,-3,-2,-1,-1,-3,-2,-3,-1, 0,-1], // R
        [-2, 0, 6, 1,-3, 0, 0, 0, 1,-3,-3, 0,-2,-3,-2, 1, 0,-4,-2,-3, 3, 0,-1], // N
        [-2,-2, 1, 6,-3, 0, 2,-1,-1,-3,-4,-1,-3,-3,-1, 0,-1,-4,-3,-3, 4, 1,-1], // D
        [ 0,-3,-3,-3, 9,-3,-4,-3,-3,-1,-1,-3,-1,-2,-3,-1,-1,-2,-2,-1,-3,-3,-2], // C
        [-1, 1, 0, 0,-3, 5, 2,-2, 0,-3,-2, 1, 0,-3,-1, 0,-1,-2,-1,-2, 0, 3,-1], // Q
        [-1, 0, 0, 2,-4, 2, 5,-2, 0,-3,-3, 1,-2,-3,-1, 0,-1,-3,-2,-2, 1, 4,-1], // E
        [ 0,-2, 0,-1,-3,-2,-2, 6,-2,-4,-4,-2,-3,-3,-2, 0,-2,-2,-3,-3,-1,-2,-1], // G
        [-2, 0, 1,-1,-3, 0, 0,-2, 8,-3,-3,-1,-2,-1,-2,-1,-2,-2, 2,-3, 0, 0,-1], // H
        [-1,-3,-3,-3,-1,-3,-3,-4,-3, 4, 2,-3, 1, 0,-3,-2,-1,-3,-1, 3,-3,-3,-1], // I
        [-1,-2,-3,-4,-1,-2,-3,-4,-3, 2, 4,-2, 2, 0,-3,-2,-1,-2,-1, 1,-4,-3,-1], // L
        [-1, 2, 0,-1,-3, 1, 1,-2,-1,-3,-2, 5,-1,-3,-1, 0,-1,-3,-2,-2, 0, 1,-1], // K
        [-1,-1,-2,-3,-1, 0,-2,-3,-2, 1, 2,-1, 5, 0,-2,-1,-1,-1,-1, 1,-3,-1,-1], // M
        [-2,-3,-3,-3,-2,-3,-3,-3,-1, 0, 0,-3, 0, 6,-4,-2,-2, 1, 3,-1,-3,-3,-1], // F
        [-1,-2,-2,-1,-3,-1,-1,-2,-2,-3,-3,-1,-2,-4, 7,-1,-1,-4,-3,-2,-2,-1,-2], // P
        [ 1,-1, 1, 0,-1, 0, 0, 0,-1,-2,-2, 0,-1,-2,-1, 4, 1,-3,-2,-2, 0, 0, 0], // S
        [ 0,-1, 0,-1,-1,-1,-1,-2,-2,-1,-1,-1,-1,-2,-1, 1, 5,-2,-2, 0,-1,-1, 0], // T
        [-3,-3,-4,-4,-2,-2,-3,-2,-2,-3,-2,-3,-1, 1,-4,-3,-2,11, 2,-3,-4,-3,-2], // W
        [-2,-2,-2,-3,-2,-1,-2,-3, 2,-1,-1,-2,-1, 3,-3,-2,-2, 2, 7,-1,-3,-2,-1], // Y
        [ 0,-3,-3,-3,-1,-2,-2,-3,-3, 3, 1,-2, 1,-1,-2,-2, 0,-3,-1, 4,-3,-2,-1], // V
        [-2,-1, 3, 4,-3, 0, 1,-1, 0,-3,-4, 0,-3,-3,-2, 0,-1,-4,-3,-3, 4, 1,-1], // B
        [-1, 0, 0, 1,-3, 3, 4,-2, 0,-3,-3, 1,-1,-3,-1, 0,-1,-3,-2,-2, 1, 4,-1], // Z
        [ 0,-1,-1,-1,-2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-2, 0, 0,-2,-1,-1,-1,-1,-1]  // X
    ];

    var nucleotides = 'ACTG';

    var aminoacidsX = 'ACDEFGHIKLMNPQRSTVWY';

    var aminoacids = 'ARNDCQEGHILKMFPSTWYVBZ?';

    function prepareMatrix( cellNames, mat ){

        var j;
        var i = 0;
        var matDict = {};

        mat.forEach( function( row ){

            j = 0;
            var rowDict = {};

            row.forEach( function( elm ){

                rowDict[ cellNames[ j++ ] ] = elm;

            } );

            matDict[ cellNames[ i++ ] ] = rowDict;

        } );

        return matDict;

    }

    return {

        blosum62: prepareMatrix( aminoacids, blosum62 ),

        blosum62x: prepareMatrix( aminoacidsX, blosum62x ),

    };

}();


NGL.Alignment = function( seq1, seq2, gapPenalty, gapExtensionPenalty, substMatrix ){

    // TODO try encoding seqs as integers and use array subst matrix, maybe faster

    this.seq1 = seq1;
    this.seq2 = seq2;

    this.gapPenalty = gapPenalty || -10;
    this.gapExtensionPenalty = gapExtensionPenalty || -1;
    this.substMatrix = substMatrix || "blosum62";

    if( this.substMatrix ){
        this.substMatrix = NGL.SubstitutionMatrices[ this.substMatrix ];
    }

};

NGL.Alignment.prototype = {

    constructor: NGL.Alignment,

    initMatrices: function(){

        this.n = this.seq1.length;
        this.m = this.seq2.length;

        // NGL.log(this.n, this.m);

        this.score = undefined;
        this.ali = '';

        this.S = [];
        this.V = [];
        this.H = [];

        for( var i = 0; i <= this.n; ++i ){

            this.S[ i ] = [];
            this.V[ i ] = [];
            this.H[ i ] = [];

            for( var j = 0; j <= this.m; ++j ){

                this.S[ i ][ j ] = 0;
                this.V[ i ][ j ] = 0;
                this.H[ i ][ j ] = 0;

            }

        }

        for( var i = 0; i <= this.n; ++i ){

            this.S[ i ][ 0 ] = this.gap( 0 );
            this.H[ i ][ 0 ] = -Infinity;

        }

        for( var j = 0; j <= this.m; ++j ){

            this.S[ 0 ][ j ] = this.gap( 0 );
            this.V[ 0 ][ j ] = -Infinity;

        }

        this.S[ 0 ][ 0 ] = 0;

        // NGL.log(this.S, this.V, this.H);

    },

    gap: function( len ){

        return this.gapPenalty + len * this.gapExtensionPenalty;

    },

    makeScoreFn: function(){

        var seq1 = this.seq1;
        var seq2 = this.seq2;

        var substMatrix = this.substMatrix;

        var c1, c2;

        if( substMatrix ){

            return function( i, j ){

                c1 = seq1[ i ];
                c2 = seq2[ j ];

                try{

                    return substMatrix[ c1 ][ c2 ];

                }catch( e ){

                    return -4;

                }

            }

        } else {

            NGL.warn('NGL.Alignment: no subst matrix');

            return function( i, j ){

                c1 = seq1[ i ];
                c2 = seq2[ j ];

                return c1 === c2 ? 5 : -3;

            }

        }

    },

    calc: function(){

        NGL.time( "NGL.Alignment.calc" );

        this.initMatrices();

        var gap0 = this.gap(0);
        var scoreFn = this.makeScoreFn();
        var gapExtensionPenalty = this.gapExtensionPenalty;

        var V = this.V;
        var H = this.H;
        var S = this.S;

        var n = this.n;
        var m = this.m;

        var Vi1, Si1, Vi, Hi, Si;

        var i, j;

        for( i = 1; i <= n; ++i ){

            Si1 = S[ i - 1 ];
            Vi1 = V[ i - 1 ];

            Vi = V[ i ];
            Hi = H[ i ];
            Si = S[ i ];

            for( j = 1; j <= m; ++j ){

                Vi[j] = Math.max(
                    Si1[ j ] + gap0,
                    Vi1[ j ] + gapExtensionPenalty
                );

                Hi[j] = Math.max(
                    Si[ j - 1 ] + gap0,
                    Hi[ j - 1 ] + gapExtensionPenalty
                );

                Si[j] = Math.max(
                    Si1[ j - 1 ] + scoreFn( i - 1, j - 1 ), // match
                    Vi[ j ], //del
                    Hi[ j ]  // ins
                );

            }

        }

        NGL.timeEnd( "NGL.Alignment.calc" );

        // NGL.log(this.S, this.V, this.H);

    },

    trace: function(){

        // NGL.time( "NGL.Alignment.trace" );

        this.ali1 = '';
        this.ali2 = '';

        var scoreFn = this.makeScoreFn();

        var i = this.n;
        var j = this.m;
        var mat = "S";

        if( this.S[i][j] >= this.V[i][j] && this.S[i][j] >= this.V[i][j] ){
            mat = "S";
            this.score = this.S[i][j];
        }else if( this.V[i][j] >= this.H[i][j] ){
            mat = "V";
            this.score = this.V[i][j];
        }else{
            mat = "H";
            this.score = this.H[i][j];
        }

        // NGL.log("NGL.Alignment: SCORE", this.score);
        // NGL.log("NGL.Alignment: S, V, H", this.S[i][j], this.V[i][j], this.H[i][j]);

        while( i > 0 && j > 0 ){

            if( mat=="S" ){

                if( this.S[i][j]==this.S[i-1][j-1] + scoreFn(i-1, j-1) ){
                    this.ali1 = this.seq1[i-1] + this.ali1;
                    this.ali2 = this.seq2[j-1] + this.ali2;
                    --i;
                    --j;
                    mat = "S";
                }else if( this.S[i][j]==this.V[i][j] ){
                    mat = "V";
                }else if( this.S[i][j]==this.H[i][j] ){
                    mat = "H";
                }else{
                    NGL.error('NGL.Alignment: S');
                    --i;
                    --j;
                }

            }else if( mat=="V" ){

                if( this.V[i][j]==this.V[i-1][j] + this.gapExtensionPenalty ){
                    this.ali1 = this.seq1[i-1] + this.ali1;
                    this.ali2 = '-' + this.ali2;
                    --i;
                    mat = "V";
                }else if( this.V[i][j]==this.S[i-1][j] + this.gap(0) ){
                    this.ali1 = this.seq1[i-1] + this.ali1;
                    this.ali2 = '-' + this.ali2;
                    --i;
                    mat = "S";
                }else{
                    NGL.error('NGL.Alignment: V');
                    --i;
                }

            }else if( mat=="H" ){

                if( this.H[i][j] == this.H[i][j-1] + this.gapExtensionPenalty ){
                    this.ali1 = '-' + this.ali1;
                    this.ali2 = this.seq2[j-1] + this.ali2;
                    --j;
                    mat = "H";
                }else if( this.H[i][j] == this.S[i][j-1] + this.gap(0) ){
                    this.ali1 = '-' + this.ali1;
                    this.ali2 = this.seq2[j-1] + this.ali2;
                    --j;
                    mat = "S";
                }else{
                    NGL.error('NGL.Alignment: H');
                    --j;
                }

            }else{

                NGL.error('NGL.Alignment: no matrix');

            }

        }

        while( i > 0 ){

            this.ali1 = this.seq1[ i - 1 ] + this.ali1;
            this.ali2 = '-' + this.ali2;
            --i;

        }

        while( j > 0 ){

            this.ali1 = '-' + this.ali1;
            this.ali2 = this.seq2[ j - 1 ] + this.ali2;
            --j;

        }

        // NGL.timeEnd( "NGL.Alignment.trace" );

        // NGL.log([this.ali1, this.ali2]);

    }

};


NGL.superpose = function( s1, s2, align, sele1, sele2, xsele1, xsele2 ){

    align = align || false;
    sele1 = sele1 || "";
    sele2 = sele2 || "";
    xsele1 = xsele1 || "";
    xsele2 = xsele2 || "";

    var atoms1, atoms2;

    if( align ){

        var _s1 = s1;
        var _s2 = s2;

        if( sele1 && sele2 ){
            _s1 = new NGL.StructureSubset( s1, new NGL.Selection( sele1 ) );
            _s2 = new NGL.StructureSubset( s2, new NGL.Selection( sele2 ) );
        }

        var seq1 = _s1.getSequence();
        var seq2 = _s2.getSequence();

        // NGL.log( seq1.join("") );
        // NGL.log( seq2.join("") );

        var ali = new NGL.Alignment( seq1.join(""), seq2.join("") );

        ali.calc();
        ali.trace();

        // NGL.log( "superpose alignment score", ali.score );

        // NGL.log( ali.ali1 );
        // NGL.log( ali.ali2 );

        var l, _i, _j, x, y;
        var i = 0;
        var j = 0;
        var n = ali.ali1.length;
        var aliIdx1 = [];
        var aliIdx2 = [];

        for( l = 0; l < n; ++l ){

            x = ali.ali1[ l ];
            y = ali.ali2[ l ];

            _i = 0;
            _j = 0;

            if( x === "-" ){
                aliIdx2[ j ] = false;
            }else{
                aliIdx2[ j ] = true;
                _i = 1;
            }

            if( y === "-" ){
                aliIdx1[ i ] = false;
            }else{
                aliIdx1[ i ] = true;
                _j = 1;
            }

            i += _i;
            j += _j;

        }

        // NGL.log( i, j );

        // NGL.log( aliIdx1 );
        // NGL.log( aliIdx2 );

        atoms1 = new NGL.AtomSet();
        atoms2 = new NGL.AtomSet();

        i = 0;
        _s1.eachResidue( function( r ){

            if( !r.getResname1() || !r.getAtomByName( "CA" ) ) return;

            if( aliIdx1[ i ] ){
                atoms1.addAtom( r.getAtomByName( "CA" ) );
            }
            i += 1;

        } );

        i = 0;
        _s2.eachResidue( function( r ){

            if( !r.getResname1() || !r.getAtomByName( "CA" ) ) return;

            if( aliIdx2[ i ] ){
                atoms2.addAtom( r.getAtomByName( "CA" ) );
            }
            i += 1;

        } );

    }else{

        atoms1 = new NGL.AtomSet(
            s1, new NGL.Selection( sele1 + " and .CA" )
        );
        atoms2 = new NGL.AtomSet(
            s2, new NGL.Selection( sele2 + " and .CA" )
        );

    }

    if( xsele1 && xsele2 ){

        var _atoms1 = new NGL.AtomSet();
        var _atoms2 = new NGL.AtomSet();

        var xselection1 = new NGL.Selection( xsele1 );
        var xselection2 = new NGL.Selection( xsele2 );

        var test1 = xselection1.test;
        var test2 = xselection2.test;

        var i, a1, a2;
        var n = atoms1.atomCount;

        for( i = 0; i < n; ++i ){

            a1 = atoms1.atoms[ i ];
            a2 = atoms2.atoms[ i ];

            if( test1( a1 ) && test2( a2 ) ){

                _atoms1.addAtom( a1 );
                _atoms2.addAtom( a2 );

                // NGL.log( a1.qualifiedName(), a2.qualifiedName() )

            }

        }

        atoms1 = _atoms1;
        atoms2 = _atoms2;

    }

    var superpose = new NGL.Superposition( atoms1, atoms2 );

    var atoms = new NGL.AtomSet( s1, new NGL.Selection( "*" ) );
    superpose.transform( atoms );

    s1.center = s1.atomCenter();

}
