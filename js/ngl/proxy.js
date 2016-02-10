/**
 * @file Proxy
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
        // parse again to check for a second integer
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
NGL.WaterType = 1;
NGL.IonType = 2;
NGL.ProteinType = 3;
NGL.RnaType = 4;
NGL.DnaType = 5;

// backbone types
NGL.UnknownBackboneType = 0;
NGL.ProteinBackboneType = 1;
NGL.RnaBackboneType = 2;
NGL.DnaBackboneType = 3;
NGL.CgProteinBackboneType = 4;
NGL.CgRnaBackboneType = 5;
NGL.CgDnaBackboneType = 6;


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

NGL.AA3 = Object.keys( NGL.AA1 );

NGL.RnaBases = [ "A", "C", "T", "G", "U" ];

NGL.DnaBases = [ "DA", "DC", "DT", "DG", "DU", "TCY", "MCY", "5CM" ];

NGL.WaterNames = [ "SOL", "WAT", "HOH", "H2O", "W", "DOD", "D3O" ];

NGL.IonNames = [
    "3CO", "3NI", "4MO", "6MO", "AG", "AL", "AU", "AU3", "BA", "BR", "CA",
    "CD", "CE", "CL", "CO", "CR", "CU", "CU1", "CU3", "F", "FE", "FE2", "GA",
    "K", "LI", "MG", "MN", "MN3", "NA", "ND4", "NH4", "NI", "OH", "RB", "SR",
    "V", "Y1", "YT3", "ZN"
];


NGL.ProteinBackboneAtoms = [
    "CA", "C", "N", "O", "O1", "O2", "OC1", "OC2",
    "H", "H1", "H2", "H3", "HA",
    "BB"
];

NGL.NucleicBackboneAtoms = [
    "P", "O3'", "O5'", "C5'", "C4'", "C3'", "OP1", "OP2",
    "O3*", "O5*", "C5*", "C4*", "C3*"
];


//////////
// Proxy



//////////////
// BondProxy

NGL.BondProxy = function( structure, index ){

    this.structure = structure;
    this.bondStore = structure.bondStore;
    this.index = index;

};

NGL.BondProxy.prototype = {

    constructor: NGL.BondProxy,
    type: "BondProxy",

    structure: undefined,
    bondStore: undefined,
    index: undefined,

    get atom1 () {
        return this.structure.getAtomProxy( this.atomIndex1 );
    },

    get atom2 () {
        return this.structure.getAtomProxy( this.atomIndex2 );
    },

    get atomIndex1 () {
        return this.bondStore.atomIndex1[ this.index ];
    },
    set atomIndex1 ( value ) {
        this.bondStore.atomIndex1[ this.index ] = value;
    },

    get atomIndex2 () {
        return this.bondStore.atomIndex2[ this.index ];
    },
    set atomIndex2 ( value ) {
        this.bondStore.atomIndex2[ this.index ] = value;
    },

    get bondOrder () {
        return this.bondStore.bondOrder[ this.index ];
    },
    set bondOrder ( value ) {
        this.bondStore.bondOrder[ this.index ] = value;
    },

    //

    qualifiedName: function(){

        return this.atomIndex1 + "=" + this.atomIndex2;

    },

    clone: function(){

        return new this.constructor( this.structure, this.index );

    },

    toObject: function(){

        return {
            atomIndex1: this.atomIndex1,
            atomIndex2: this.atomIndex2,
            bondOrder: this.bondOrder
        };

    }

};


//////////////
// AtomProxy

NGL.AtomProxy = function( structure, index ){

    this.structure = structure;
    this.chainStore = structure.chainStore;
    this.residueStore = structure.residueStore;
    this.atomStore = structure.atomStore;
    this.residueMap = structure.residueMap;
    this.atomMap = structure.atomMap;
    this.index = index;

};

NGL.AtomProxy.prototype = {

    constructor: NGL.AtomProxy,
    type: "AtomProxy",

    structure: undefined,
    chainStore: undefined,
    residueStore: undefined,
    atomStore: undefined,
    index: undefined,

    get modelIndex () {
        return this.chainStore.modelIndex[ this.chainIndex ];
    },
    get chainIndex () {
        return this.residueStore.chainIndex[ this.residueIndex ];
    },
    get residue () {
        console.warn("residue")
        return this.structure.getResidueProxy( this.residueIndex, false );
    },

    get residueIndex () {
        return this.atomStore.residueIndex[ this.index ];
    },
    set residueIndex ( value ) {
        this.atomStore.residueIndex[ this.index ] = value;
    },

    //

    get sstruc () {
        return this.residueStore.getSstruc( this.residueIndex );
    },
    get resno () {
        return this.residueStore.resno[ this.residueIndex ];
    },
    get chainname () {
        return this.chainStore.getChainname( this.chainIndex );
    },

    //

    get residueType () {
        return this.residueMap.get( this.residueStore.residueTypeId[ this.residueIndex ] );
    },
    get atomType () {
        return  this.atomMap.get( this.atomStore.atomTypeId[ this.index ] );
    },

    //

    get resname () {
        return this.residueType.resname;
    },
    get hetero () {
        return this.residueType.hetero;
    },

    //

    get atomname () {
        return this.atomType.atomname;
    },
    get element () {
        return this.atomType.element;
    },
    get vdw () {
        return this.atomType.vdw;
    },
    get covalent () {
        return this.atomType.covalent;
    },

    //

    get x () {
        return this.atomStore.x[ this.index ];
    },
    set x ( value ) {
        this.atomStore.x[ this.index ] = value;
    },

    get y () {
        return this.atomStore.y[ this.index ];
    },
    set y ( value ) {
        this.atomStore.y[ this.index ] = value;
    },

    get z () {
        return this.atomStore.z[ this.index ];
    },
    set z ( value ) {
        this.atomStore.z[ this.index ] = value;
    },

    get serial () {
        return this.atomStore.serial[ this.index ];
    },
    set serial ( value ) {
        this.atomStore.serial[ this.index ] = value;
    },

    get bfactor () {
        return this.atomStore.bfactor[ this.index ];
    },
    set bfactor ( value ) {
        this.atomStore.bfactor[ this.index ] = value;
    },

    // get bonds () {
    //     return this.atomStore.bonds[ this.index ];
    // },
    // set bonds ( value ) {
    //     this.atomStore.bonds[ this.index ] = value;
    // },

    get altloc () {
        return this.atomStore.getAltloc( this.index );
    },
    set altloc ( value ) {
        this.atomStore.setAltloc( this.index, value );
    },

    //

    isBackbone: function(){
        var backboneIndexList = this.residueType.backboneIndexList;
        // console.log(backboneIndexList)
        if( backboneIndexList.length > 0 ){
            var atomOffset = this.residueStore.atomOffset[ this.residueIndex ];
            return backboneIndexList.indexOf( this.index - atomOffset ) !== -1;
        }else{
            return false;
        }
    },

    isPolymer: function(){
        var moleculeType = this.residueType.moleculeType;
        return (
            moleculeType === NGL.ProteinType ||
            moleculeType === NGL.NucleicType ||
            moleculeType === NGL.CgType
        );
    },

    isSidechain: function(){
        return this.isPolymer() && !this.isBackbone();
    },

    isCg: function(){
        var backboneType = this.residueType.backboneType;
        return (
            backboneType === NGL.CgProteinBackboneType ||
            backboneType === NGL.CgRnaBackboneType ||
            backboneType === NGL.CgDnaBackboneType
        );
    },

    isHetero: function(){
        return this.residueType.hetero === 1;
    },

    isProtein: function(){
        return this.residueType.moleculeType === NGL.ProteinType;
    },

    isNucleic: function(){
        var moleculeType = this.residueType.moleculeType;
        return (
            moleculeType === NGL.RnaType ||
            moleculeType === NGL.DnaType
        );
    },

    isRna: function(){
        return this.residueType.moleculeType === NGL.RnaType;
    },

    isDna: function(){
        return this.residueType.moleculeType === NGL.DnaType;
    },

    isWater: function(){
        return this.residueType.moleculeType === NGL.WaterType;
    },

    isIon: function(){
        return this.residueType.moleculeType === NGL.IonType;
    },

    distanceTo: function( atom ){
        var taa = this.atomStore;
        var aaa = atom.atomStore;
        var ti = this.index;
        var ai = atom.index;
        var x = taa.x[ ti ] - aaa.x[ ai ];
        var y = taa.y[ ti ] - aaa.y[ ai ];
        var z = taa.z[ ti ] - aaa.z[ ai ];
        var distSquared = x * x + y * y + z * z;
        return Math.sqrt( distSquared );
    },

    connectedTo: function( atom ){

        var taa = this.atomStore;
        var aaa = atom.atomStore;
        var ti = this.index;
        var ai = atom.index;
        var ta = taa.altloc[ ti ];  // use Uint8 value to compare
        var aa = aaa.altloc[ ai ];  // no need to convert to char

        if( !( ta === 0 || aa === 0 || ( ta === aa ) ) ) return false;

        var x = taa.x[ ti ] - aaa.x[ ai ];
        var y = taa.y[ ti ] - aaa.y[ ai ];
        var z = taa.z[ ti ] - aaa.z[ ai ];

        var distSquared = x * x + y * y + z * z;

        // if( this.residue.isCg() ) console.log( this.qualifiedName(), Math.sqrt( distSquared ), distSquared )
        if( distSquared < 64.0 && this.isCg() ) return true;

        if( isNaN( distSquared ) ) return false;

        var d = this.covalent + atom.covalent;
        var d1 = d + 0.3;
        var d2 = d - 0.3;

        return distSquared < ( d1 * d1 ) && distSquared > ( d2 * d2 );

    },

    qualifiedName: function( noResname ){

        var name = "";

        if( this.resname && !noResname ) name += "[" + this.resname + "]";
        if( this.resno ) name += this.resno;
        if( this.chainname ) name += ":" + this.chainname;
        if( this.atomname ) name += "." + this.atomname;
        if( this.modelIndex ) name += "/" + this.modelIndex;

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

    //

    clone: function(){

        return new this.constructor( this.structure, this.index );

    },

    toObject: function(){

        return {
            index: this.index,
            residueIndex: this.residueIndex,

            atomno: this.atomno,
            resname: this.resname,
            x: this.x,
            y: this.y,
            z: this.z,
            element: this.element,
            chainname: this.chainname,
            resno: this.resno,
            serial: this.serial,
            vdw: this.vdw,
            covalent: this.covalent,
            hetero: this.hetero,
            bfactor: this.bfactor,
            altloc: this.altloc,
            atomname: this.atomname,
            modelindex: this.modelindex
        };

    }

};


/////////////////
// ResidueProxy

NGL.Residue = {

    atomnames: function(){

        var atomnames = {};

        atomnames[ NGL.ProteinBackboneType ] = {
            trace: "CA",
            direction1: "C",
            direction2: [ "O", "OC1", "O1" ],
            backboneStart: "N",
            backboneEnd: "C",
        };

        atomnames[ NGL.RnaBackboneType ] = {
            trace: [ "C4'", "C4*" ],
            direction1: [ "C1'", "C1*" ],
            direction2: [ "C3'", "C3*" ],
            backboneStart: "P",
            backboneEnd: [ "O3'", "O3*" ]
        };

        atomnames[ NGL.DnaBackboneType ] = {
            trace: [ "C3'", "C3*" ],
            direction1: [ "C2'", "C2*" ],
            direction2: [ "O4'", "O4*" ],
            backboneStart: "P",
            backboneEnd: [ "O3'", "O3*" ]
        };

        atomnames[ NGL.CgProteinBackboneType ] = {
            trace: [ "CA", "BB" ],
            backboneStart: [ "CA", "BB" ],
            backboneEnd: [ "CA", "BB" ],
        };

        atomnames[ NGL.CgRnaBackboneType ] = {
            trace: [ "C4'", "C4*" ],
            backboneStart: [ "C4'", "C4*" ],
            backboneEnd: [ "C4'", "C4*" ],
        };

        atomnames[ NGL.CgDnaBackboneType ] = {
            trace: [ "C3'", "C3*", "C2'" ],  // C2' is used in martini ff
            backboneStart: [ "C3'", "C3*", "C2'" ],
            backboneEnd: [ "C3'", "C3*", "C2'" ],
        };

        // workaround for missing CA only type
        atomnames[ NGL.UnknownType ] = {
            trace: "CA",
            backboneStart: "CA",
            backboneEnd: "CA",
        };

        return atomnames;

    }()

};


NGL.ResidueProxy = function( structure, index ){

    this.structure = structure;
    this.chainStore = structure.chainStore;
    this.residueStore = structure.residueStore;
    this.atomStore = structure.atomStore;
    this.residueMap = structure.residueMap;
    this.atomMap = structure.atomMap;
    this.index = index;

};

NGL.ResidueProxy.prototype = {

    constructor: NGL.ResidueProxy,
    type: "ResidueProxy",

    structure: undefined,
    chainStore: undefined,
    residueStore: undefined,
    atomStore: undefined,
    index: undefined,

    get chain () {
        return this.structure.getChainProxy( this.chainIndex );
    },

    get chainIndex () {
        return this.residueStore.chainIndex[ this.index ];
    },
    set chainIndex ( value ) {
        this.residueStore.chainIndex[ this.index ] = value;
    },

    get atomOffset () {
        return this.residueStore.atomOffset[ this.index ];
    },
    set atomOffset ( value ) {
        this.residueStore.atomOffset[ this.index ] = value;
    },

    get atomCount () {
        return this.residueStore.atomCount[ this.index ];
    },
    set atomCount ( value ) {
        this.residueStore.atomCount[ this.index ] = value;
    },

    //

    get modelIndex () {
        return this.chainStore.modelIndex[ this.chainIndex ];
    },
    get chainname () {
        return this.chainStore.getChainname( this.chainIndex );
    },

    //

    get resno () {
        return this.residueStore.resno[ this.index ];
    },
    set resno ( value ) {
        this.residueStore.resno[ this.index ] = value;
    },

    get sstruc () {
        return this.residueStore.getSstruc( this.index );
    },
    set sstruc ( value ) {
        this.residueStore.setSstruc( this.index, value );
    },

    //

    get residueType () {
        return this.residueMap.get( this.residueStore.residueTypeId[ this.index ] );
    },

    get resname () {
        return this.residueType.resname;
    },
    get hetero () {
        return this.residueType.hetero;
    },
    get moleculeType () {
        return this.residueType.moleculeType;
    },
    get backboneType () {
        return this.residueType.backboneType;
    },
    get backboneStartType () {
        return this.residueType.backboneStartType;
    },
    get backboneEndType () {
        return this.residueType.backboneEndType;
    },
    get traceAtomIndex () {
        return this.residueType.traceAtomIndex + this.atomOffset;
    },
    get direction1AtomIndex () {
        return this.residueType.direction1AtomIndex + this.atomOffset;
    },
    get direction2AtomIndex () {
        return this.residueType.direction2AtomIndex + this.atomOffset;
    },
    get backboneStartAtomIndex () {
        return this.residueType.backboneStartAtomIndex + this.atomOffset;
    },
    get backboneEndAtomIndex () {
        return this.residueType.backboneEndAtomIndex + this.atomOffset;
    },

    //

    eachAtom: function( callback, selection ){

        var count = this.atomCount;
        var offset = this.atomOffset;
        var ap = this.structure.getAtomProxy();
        var end = offset + count;

        if( selection && selection.atomOnlyTest ){
            var atomOnlyTest = selection.atomOnlyTest;
            for( var i = offset; i < end; ++i ){
                ap.index = i;
                if( atomOnlyTest( ap ) ) callback( ap );
            }
        }else{
            for( var i = offset; i < end; ++i ){
                ap.index = i;
                callback( ap );
            }
        }

    },

    eachAtom2: function( callback, selection ){

        var count = this.atomCount;
        var offset = this.atomOffset;
        var ap = this.structure._ap;
        var end = offset + count;

        if( selection && selection.atomOnlyTest ){
            var atomOnlyTest = selection.atomOnlyTest;
            for( var i = offset; i < end; ++i ){
                ap.index = i;
                if( atomOnlyTest( ap ) ) callback( ap );
            }
        }else{
            for( var i = offset; i < end; ++i ){
                ap.index = i;
                callback( ap );
            }
        }

    },

    //

    isProtein: function(){
        return this.residueType.moleculeType === NGL.ProteinType;
    },

    isNucleic: function(){
        var moleculeType = this.residueType.moleculeType;
        return (
            moleculeType === NGL.RnaType ||
            moleculeType === NGL.DnaType
        );
    },

    isRna: function(){
        return this.residueType.moleculeType === NGL.RnaType;
    },

    isDna: function(){
        return this.residueType.moleculeType === NGL.DnaType;
    },

    isCg: function(){
        var backboneType = this.residueType.backboneType;
        return (
            backboneType === NGL.CgProteinBackboneType ||
            backboneType === NGL.CgRnaBackboneType ||
            backboneType === NGL.CgDnaBackboneType
        );
    },

    isPolymer: function(){
        var moleculeType = this.residueType.moleculeType;
        return (
            moleculeType === NGL.ProteinType ||
            moleculeType === NGL.RnaType ||
            moleculeType === NGL.DnaType
        );
    },

    isHetero: function(){
        return this.residueType.hetero === 1;
    },

    isWater: function(){
        return this.residueType.moleculeType === NGL.WaterType;
    },

    isIon: function(){
        return this.residueType.moleculeType === NGL.IonType;
    },

    hasBackbone: function( position ){
        console.warn("hasBackbone")
        return this.residueType.hasBackbone( position );
    },

    getAtomType: function( index ){
        return this.atomMap.get( this.atomStore.atomTypeId[ index ] );
    },

    getResname1: function(){
        return NGL.AA1[ this.resname.toUpperCase() ] || '?';
    },

    getBackboneType: function( position ){
        switch( position ){
            case -1:
                return this.residueType.backboneStartType;
            case 1:
                return this.residueType.backboneEndType;
            default:
                return this.residueType.backboneType;
        }
    },

    getAtomIndexByName: function( atomname ){
        return this.residueType.getAtomIndexByName( atomname );
    },

    getAtomByName: function( atomname ){
        return this.residueType.getAtomByName( atomname );
    },

    hasAtomWithName: function( atomname ){
        return this.residueType.hasAtomWithName( atomname );
    },

    getAtomnameList: function(){
        console.warn("getAtomnameList")
        var n = this.atomCount;
        var offset = this.atomOffset;
        var list = new Array( n );
        for( var i = 0; i < n; ++i ){
            list[ i ] = this.getAtomType( offset + i ).atomname;
        }
        return list;
    },

    connectedTo: function( rNext ){
        var bbAtomEnd = this.structure.getAtomProxy( this.backboneEndAtomIndex );
        var bbAtomStart = this.structure.getAtomProxy( rNext.backboneStartAtomIndex );
        if( bbAtomEnd && bbAtomStart ){
            return bbAtomEnd.connectedTo( bbAtomStart );
        }else{
            return false;
        }
    },

    getNextConnectedResidue: function(){
        var rOffset = this.chainStore.residueOffset[ this.chainIndex ];
        var rCount = this.chainStore.residueCount[ this.chainIndex ];
        var nextIndex = this.index + 1;
        if( nextIndex < rOffset + rCount ){
            var rpNext = this.structure.getResidueProxy( nextIndex );
            if( this.connectedTo( rpNext ) ){
                return rpNext;
            }
        }
        return undefined;
    },

    getPreviousConnectedResidue: function(){
        var rOffset = this.chainStore.residueOffset[ this.chainIndex ];
        var prevIndex = this.index - 1;
        if( prevIndex >= rOffset ){
            var rpPrev = this.structure.getResidueProxy( prevIndex );
            if( rpPrev.connectedTo( this ) ){
                return rpPrev;
            }
        }
        return undefined;
    },

    getBonds: function(){
        return this.residueType.getBonds( this );
    },

    //

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

    clone: function(){
        return new this.constructor( this.structure, this.index );
    },

    toObject: function(){
        return {
            index: this.index,
            chainIndex: this.chainIndex,
            atomOffset: this.atomOffset,
            atomCount: this.atomCount,

            resno: this.resno,
            resname: this.resname,
            sstruc: this.sstruc
        };
    }

};


////////////
// Polymer

NGL.Polymer = function( structure, residueIndexStart, residueIndexEnd ){

    this.structure = structure;
    this.residueStore = structure.residueStore;
    this.atomStore = structure.atomStore;

    this.residueIndexStart = residueIndexStart;
    this.residueIndexEnd = residueIndexEnd;
    this.residueCount = residueIndexEnd - residueIndexStart + 1;

    var rpStart = this.structure.getResidueProxy( this.residueIndexStart );
    var rpEnd = this.structure.getResidueProxy( this.residueIndexEnd );
    this.isPrevConnected = rpStart.getPreviousConnectedResidue() !== undefined;
    var rpNext = rpEnd.getNextConnectedResidue();
    this.isNextConnected = rpNext !== undefined;
    this.isNextNextConnected = this.isNextConnected && rpNext.getNextConnectedResidue() !== undefined;

    this.__residueProxy = this.structure.getResidueProxy();

    // console.log( this.qualifiedName(), this );

};

NGL.Polymer.prototype = {

    constructor: NGL.Polymer,
    type: "Polymer",

    structure: undefined,
    residueStore: undefined,
    atomStore: undefined,

    residueIndexStart: undefined,
    residueIndexEnd: undefined,
    residueCount: undefined,

    //

    isProtein: function(){
        this.__residueProxy.index = this.residueIndexStart;
        return this.__residueProxy.isProtein();
    },

    isCg: function(){
        this.__residueProxy.index = this.residueIndexStart;
        return this.__residueProxy.isCg();
    },

    isNucleic: function(){
        this.__residueProxy.index = this.residueIndexStart;
        return this.__residueProxy.isNucleic();
    },

    getMoleculeType: function(){
        this.__residueProxy.index = this.residueIndexStart;
        return this.__residueProxy.moleculeType;
    },

    getBackboneType: function( position ){
        this.__residueProxy.index = this.residueIndexStart;
        return this.__residueProxy.getBackboneType( position );
    },

    getAtomIndexByType: function( index, type ){

        // TODO pre-calculate, add to residueStore???

        if( index === -1 && !this.isPrevConnected ) index += 1;
        if( index === this.residueCount && !this.isNextNextConnected ) index -= 1;
        // if( index === this.residueCount - 1 && !this.isNextConnected ) index -= 1;

        var rp = this.__residueProxy;
        rp.index = this.residueIndexStart + index;
        var aIndex;

        switch( type ){
            case "trace":
                aIndex = rp.traceAtomIndex;
                break;
            case "direction1":
                aIndex = rp.direction1AtomIndex;
                break;
            case "direction2":
                aIndex = rp.direction2AtomIndex;
                break;
            default:
                var ap = rp.getAtomByName( type );
                aIndex = ap ? ap.index : undefined;
        }

        // if( !ap ){
        //     console.log( this, type, rp.residueType )
        //     // console.log( rp.qualifiedName(), rp.index, index, this.residueCount - 1 )
        //     // rp.index = this.residueIndexStart;
        //     // console.log( rp.qualifiedName(), this.residueIndexStart )
        //     // rp.index = this.residueIndexEnd;
        //     // console.log( rp.qualifiedName(), this.residueIndexEnd )
        // }

        return aIndex;

    },

    eachAtom: function( callback, selection ){

        this.eachResidue( function( rp ){
            rp.eachAtom( callback );
        }, selection );

    },

    eachAtomN: function( n, callback, type ){

        var m = this.residueCount;

        var array = new Array( n );
        for( var i = 0; i < n; ++i ){
            array[ i ] = this.structure.getAtomProxy( this.getAtomIndexByType( i, type ) );
        }
        callback.apply( this, array );

        for( var j = n; j < m; ++j ){
            for( var i = 1; i < n; ++i ){
                array[ i - 1 ].index = array[ i ].index;
            }
            array[ n - 1 ].index = this.getAtomIndexByType( j, type );
            callback.apply( this, array );
        }

    },

    eachAtomN2: function( n, callback, type ){

        // console.log(this.residueOffset,this.residueCount)

        var offset = this.atomOffset;
        var count = this.atomCount;
        var end = offset + count;
        if( count < n ) return;

        var array = new Array( n );
        for( var i = 0; i < n; ++i ){
            array[ i ] = this.structure.getAtomProxy();
        }
        // console.log( array, offset, end, count )

        var as = this.structure.atomSetCache[ "__" + type ];
        if( as === undefined ){
            NGL.warn( "no precomputed atomSet for: " + type );
            as = this.structure.getAtomSet( false );
            this.eachResidue( function( rp ){
                var ap = rp.getAtomByName( type );
                as.add_unsafe( ap.index );
            } );
        }
        var j = 0;

        as.forEach( function( index ){
            if( index >= offset && index < end ){
                for( var i = 1; i < n; ++i ){
                    array[ i - 1 ].index = array[ i ].index;
                }
                array[ n - 1 ].index = index;
                j += 1;
                if( j >= n ){
                    callback.apply( this, array );
                }
            }
        } );

    },

    eachDirectionAtomsN: function( n, callback ){

        var n2 = n * 2;
        var offset = this.atomOffset;
        var count = this.atomCount;
        var end = offset + count;
        if( count < n ) return;

        var array = new Array( n2 );
        for( var i = 0; i < n2; ++i ){
            array[ i ] = this.structure.getAtomProxy();
        }

        var as1 = this.structure.atomSetCache[ "__direction1" ];
        var as2 = this.structure.atomSetCache[ "__direction2" ];
        if( as1 === undefined || as2 === undefined ){
            NGL.error( "no precomputed atomSet for direction1 or direction2" );
            return;
        }
        var j = 0;

        TypedFastBitSet.forEach( function( index1, index2 ){
            if( index1 >= offset && index1 < end && index2 >= offset && index2 < end ){
                for( var i = 1; i < n; ++i ){
                    array[ i - 1 ].index = array[ i ].index;
                    array[ i - 1 + n ].index = array[ i + n ].index;
                }
                array[ n - 1 ].index = index1;
                array[ n - 1 + n ].index = index2;
                j += 1;
                if( j >= n ){
                    callback.apply( this, array );
                }
            }
        }, as1, as2 );

    },

    eachResidue: function( callback ){

        var rp = this.structure.getResidueProxy();
        var n = this.residueCount;
        var rStartIndex = this.residueIndexStart;

        for( var i = 0; i < n; ++i ){
            rp.index = rStartIndex + i;
            callback( rp );
        }

    },

    qualifiedName: function(){
        var rpStart = this.structure.getResidueProxy( this.residueIndexStart );
        var rpEnd = this.structure.getResidueProxy( this.residueIndexEnd );
        return rpStart.qualifiedName() + " - " + rpEnd.qualifiedName();
    }

};


///////////////
// ChainProxy

NGL.ChainProxy = function( structure, index ){

    this.structure = structure;
    this.chainStore = structure.chainStore;
    this.index = index;

};

NGL.ChainProxy.prototype = {

    constructor: NGL.ChainProxy,
    type: "ChainProxy",

    structure: undefined,
    chainStore: undefined,
    index: undefined,

    get model () {
        return this.structure.getModelProxy( this.modelIndex );
    },

    get modelIndex () {
        return this.chainStore.modelIndex[ this.index ];
    },
    set modelIndex ( value ) {
        this.chainStore.modelIndex[ this.index ] = value;
    },

    get residueOffset () {
        return this.chainStore.residueOffset[ this.index ];
    },
    set residueOffset ( value ) {
        this.chainStore.residueOffset[ this.index ] = value;
    },

    get residueCount () {
        return this.chainStore.residueCount[ this.index ];
    },
    set residueCount ( value ) {
        this.chainStore.residueCount[ this.index ] = value;
    },

    //

    get chainname () {
        return this.chainStore.getChainname( this.index );
    },
    set chainname ( value ) {
        this.chainStore.setChainname( this.index, value );
    },

    //

    eachAtom: function( callback, selection ){

        var i, j, o, r, a;
        var n = this.residueCount;

        if( selection && selection.residueOnlyTest ){

            var test = selection.residueOnlyTest;

            for( i = 0; i < n; ++i ){

                r = this.residues[ i ];
                if( test( r ) ) r.eachAtom( callback, selection );

            }

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

            for( i = 0; i < n; ++i ){

                r = this.residues[ i ];
                o = r.atomCount;

                for( j = 0; j < o; ++j ){

                    callback( r.atoms[ j ] );

                }

            }

        }

    },

    eachAtom2: function( callback, selection ){

        this.eachResidue( function( rp ){
            rp.eachAtom2( callback, selection )
        }, selection );

    },

    eachResidue: function( callback, selection ){

        var count = this.residueCount;
        var offset = this.residueOffset;
        var rp = this.structure._rp;
        var end = offset + count;

        if( selection && selection.test ){
            var residueOnlyTest = selection.residueOnlyTest;
            if( residueOnlyTest ){
                for( var i = offset; i < end; ++i ){
                    rp.index = i;
                    if( residueOnlyTest( rp ) ){
                        callback( rp, selection );
                    }
                }
            }else{
                for( var i = offset; i < end; ++i ){
                    rp.index = i;
                    callback( rp, selection );
                }
            }
        }else{
            for( var i = offset; i < end; ++i ){
                rp.index = i;
                callback( rp );
            }
        }

    },

    eachResidueN: function( n, callback ){

        var count = this.residueCount;
        var offset = this.residueOffset;
        var end = offset + count;
        if( count < n ) return;
        var array = new Array( n );

        for( var i = 0; i < n; ++i ){
            array[ i ] = this.structure.getResidueProxy( offset + i );
        }
        callback.apply( this, array );

        for( var j = offset + n; j < end; ++j ){
            for( var i = 0; i < n; ++i ){
                array[ i ].index += 1;
            }
            callback.apply( this, array );
        }

    },

    eachPolymer: function( callback, selection ){

        var rStartIndex, rNextIndex;
        var test = selection ? selection.residueOnlyTest : undefined;
        var structure = this.model.structure;

        var count = this.residueCount;
        var offset = this.residueOffset;
        var end = offset + count;

        var rp1 = this.structure.getResidueProxy();
        var rp2 = this.structure.getResidueProxy( offset );

        var ap1 = this.structure.getAtomProxy();
        var ap2 = this.structure.getAtomProxy();

        var first = true;

        for( var i = offset + 1; i < end; ++i ){

            rp1.index = rp2.index;
            rp2.index = i;

            if( first ){
                rStartIndex = rp1.index;
                first = false;
            }
            rNextIndex = rp2.index;

            var bbType1 = first ? rp1.backboneEndType : rp1.backboneType;
            var bbType2 = rp2.backboneType;

            if( bbType1 !== NGL.UnknownBackboneType && bbType1 === bbType2 ){

                ap1.index = rp1.backboneEndAtomIndex;
                ap2.index = rp2.backboneStartAtomIndex;

            }else{

                if( bbType1 !== NGL.UnknownBackboneType ){
                    if( rp1.index - rStartIndex > 1 ){
                        // console.log("FOO1",rStartIndex, rp1.index)
                        callback( new NGL.Polymer( structure, rStartIndex, rp1.index ) );
                    }
                }

                rStartIndex = rNextIndex;

                continue;

            }

            if( !ap1 || !ap2 || !ap1.connectedTo( ap2 ) ||
                ( test && ( !test( rp1 ) || !test( rp2 ) ) ) ){
                if( rp1.index - rStartIndex > 1 ){
                    // console.log("FOO2",rStartIndex, rp1.index)
                    callback( new NGL.Polymer( structure, rStartIndex, rp1.index ) );
                }
                rStartIndex = rNextIndex;

            }

        }

        if( rNextIndex - rStartIndex > 1 ){
            if( this.structure.getResidueProxy( rStartIndex ).backboneStartType ){
                // console.log("FOO3",rStartIndex, rNextIndex)
                callback( new NGL.Polymer( structure, rStartIndex, rNextIndex ) );
            }
        }

    },

    //

    qualifiedName: function(){
        var name = ":" + this.chainname + "/" + this.modelIndex;
        return name;
    },

    clone: function(){

        return new this.constructor( this.structure, this.index );

    },

    toObject: function(){

        return {
            index: this.index,
            residueOffset: this.residueOffset,
            residueCount: this.residueCount,

            chainname: this.chainname
        };

    }

};


///////////////
// ModelProxy

NGL.ModelProxy = function( structure, index ){

    this.structure = structure;
    this.modelStore = structure.modelStore;
    this.index = index;

};

NGL.ModelProxy.prototype = {

    constructor: NGL.ModelProxy,
    type: "ModelProxy",

    structure: undefined,
    modelStore: undefined,
    index: undefined,

    get chainOffset () {
        return this.modelStore.chainOffset[ this.index ];
    },
    set chainOffset ( value ) {
        this.modelStore.chainOffset[ this.index ] = value;
    },

    get chainCount () {
        return this.modelStore.chainCount[ this.index ];
    },
    set chainCount ( value ) {
        this.modelStore.chainCount[ this.index ] = value;
    },

    //

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

    eachAtom2: function( callback, selection ){

        this.eachChain( function( cp ){
            cp.eachAtom2( callback, selection )
        }, selection );

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

    eachPolymer: function( callback, selection ){

        if( selection && selection.chainOnlyTest ){

            var chainOnlyTest = selection.chainOnlyTest;

            this.eachChain( function( cp ){
                if( chainOnlyTest( cp ) ){
                    cp.eachPolymer( callback, selection );
                }
            } );

        }else{

            this.eachChain( function( cp ){
                cp.eachPolymer( callback, selection );
            } );

        }

    },

    eachChain: function( callback, selection ){

        var count = this.chainCount;
        var offset = this.chainOffset;
        var cp = this.structure._cp;
        var end = offset + count;

        if( selection && selection.test ){
            var chainOnlyTest = selection.chainOnlyTest;
            if( chainOnlyTest ){
                for( var i = offset; i < end; ++i ){
                    cp.index = i;
                    if( chainOnlyTest( cp ) ){
                        callback( cp, selection );
                    }
                }
            }else{
                for( var i = offset; i < end; ++i ){
                    cp.index = i;
                    callback( cp, selection );
                }
            }
        }else{
            for( var i = offset; i < end; ++i ){
                cp.index = i;
                callback( cp );
            }
        }

    },

    //

    qualifiedName: function(){
        var name = "/" + this.index;
        return name;
    },

    clone: function(){

        return new this.constructor( this.structure, this.index );

    },

    toObject: function(){

        return {
            index: this.index,
            chainOffset: this.chainOffset,
            chainCount: this.chainCount,
        };

    }

};


///////////////
// Type & Map

NGL.AtomType = function( structure, atomname, element ){

    this.structure = structure;

    element = element || NGL.guessElement( atomname );

    this.atomname = atomname;
    this.element = element;
    this.vdw = NGL.VdwRadii[ element ];
    this.covalent = NGL.CovalentRadii[ element ];

};

NGL.AtomType.prototype = {

    constructor: NGL.AtomType,
    type: "AtomType",

    atomname: undefined,
    element: undefined,
    vdw: undefined,
    covalent: undefined,

    toJSON: function(){
        var output = {
            atomname: this.atomname,
            element: this.element,
        };
        return output;
    }

};


NGL.AtomMap = function( structure ){

    var idDict = {};
    var typeList = [];

    function getHash( atomname, element ){
        var hash = atomname;
        if( element !== undefined ) hash += "|" + element;
        return hash;
    }

    function add( atomname, element ){
        var hash = getHash( atomname, element );
        var id = idDict[ hash ];
        if( id === undefined ){
            var atomType = new NGL.AtomType( structure, atomname, element );
            id = typeList.length;
            idDict[ hash ] = id;
            typeList.push( atomType );
        }
        return id;
    }

    function get( id ){
        return typeList[ id ];
    }

    // API

    this.add = add;
    this.get = get;

    this.list = typeList;
    this.dict = idDict;

    this.toJSON = function(){
        var output = {
            metadata: {
                version: 0.1,
                type: 'AtomMap',
                generator: 'AtomMapExporter'
            },
            idDict: idDict,
            typeList: typeList.map( function( atomType ){
                return atomType.toJSON();
            } )
        };
        return output;
    };

    this.fromJSON = function( input ){
        idDict = input.idDict;
        typeList = input.typeList.map( function( input ){
            return new NGL.AtomType( structure, input.atomname, input.element );
        } );
        this.list = typeList;
        this.dict = idDict;
    };

}


NGL.ResidueType = function( structure, resname, atomTypeIdList, hetero ){

    this.structure = structure;

    this.resname = resname;
    this.atomTypeIdList = atomTypeIdList;
    this.hetero = hetero;
    this.atomCount = atomTypeIdList.length;

    this.moleculeType = this.getMoleculeType();
    this.backboneType = this.getBackboneType( 0 );
    this.backboneEndType = this.getBackboneType( -1 );
    this.backboneStartType = this.getBackboneType( 1 );
    this.backboneIndexList = this.getBackboneIndexList();

    //

    var rAtomnames = NGL.Residue.atomnames;
    var atomnames = rAtomnames[ this.backboneType ];
    var atomnamesStart = rAtomnames[ this.backboneStartType ];
    var atomnamesEnd = rAtomnames[ this.backboneEndType ];

    var traceIndex = this.getAtomIndexByName( atomnames.trace );
    this.traceAtomIndex = traceIndex !== undefined ? traceIndex : -1;

    var dir1Index = this.getAtomIndexByName( atomnames.direction1 );
    this.direction1AtomIndex = dir1Index !== undefined ? dir1Index : -1;

    var dir2Index = this.getAtomIndexByName( atomnames.direction2 );
    this.direction2AtomIndex = dir2Index !== undefined ? dir2Index : -1;

    var bbStartIndex = this.getAtomIndexByName( atomnamesStart.backboneStart );
    this.backboneStartAtomIndex = bbStartIndex !== undefined ? bbStartIndex : -1;

    var bbEndIndex = this.getAtomIndexByName( atomnamesEnd.backboneEnd );
    this.backboneEndAtomIndex = bbEndIndex !== undefined ? bbEndIndex : -1;

};

NGL.ResidueType.prototype = {

    constructor: NGL.ResidueType,
    type: "ResidueType",

    resname: undefined,
    atomTypeIdList: undefined,
    atomCount: undefined,

    getBackboneIndexList: function(){
        var backboneIndexList = [];
        var atomnameList;
        switch( this.moleculeType ){
            case NGL.ProteinType:
                atomnameList = NGL.ProteinBackboneAtoms;
                break;
            case NGL.RnaType:
            case NGL.DnaType:
                atomnameList = NGL.NucleicBackboneAtoms;
                break;
            default:
                return backboneIndexList;
        }
        var atomMap = this.structure.atomMap;
        var atomTypeIdList = this.atomTypeIdList;
        for( var i = 0, il = this.atomCount; i < il; ++i ){
            var atomType = atomMap.get( atomTypeIdList[ i ] );
            if( atomnameList.indexOf( atomType.atomname ) !== -1 ){
                backboneIndexList.push( i );
            }
        }
        return backboneIndexList;
    },

    getMoleculeType: function(){
        if( this.isProtein() ){
            return NGL.ProteinType;
        }else if( this.isRna() ){
            return NGL.RnaType;
        }else if( this.isDna() ){
            return NGL.DnaType;
        }else if( this.isWater() ){
            return NGL.WaterType;
        }else if( this.isIon() ){
            return NGL.IonType;
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
        }else if( this.hasCgProteinBackbone( position ) ){
            return NGL.CgProteinBackboneType;
        }else if( this.hasCgRnaBackbone( position ) ){
            return NGL.CgRnaBackboneType;
        }else if( this.hasCgDnaBackbone( position ) ){
            return NGL.CgDnaBackboneType;
        }else{
            return NGL.UnknownBackboneType;
        }
    },

    isProtein: function(){
        return (
            this.hasAtomWithName( "CA", "C", "N" ) ||
            NGL.AA3.indexOf( this.resname ) !== -1
        );
    },

    isCg: function(){
        var backboneType = this.backboneType;
        return (
            backboneType === NGL.CgProteinBackboneType ||
            backboneType === NGL.CgRnaBackboneType ||
            backboneType === NGL.CgDnaBackboneType
        );
    },

    isNucleic: function(){
        return this.isRna() || this.isDna();
    },

    isRna: function(){
        return NGL.RnaBases.indexOf( this.resname ) !== -1;
    },

    isDna: function(){
        return NGL.DnaBases.indexOf( this.resname ) !== -1;
    },

    isPolymer: function(){
        return this.isProtein() || this.isNucleic();
    },

    isHetero: function(){
        return this.hetero === 1;
    },

    isIon: function(){
        return NGL.IonNames.indexOf( this.resname ) !== -1;
    },

    isWater: function(){
        return NGL.WaterNames.indexOf( this.resname ) !== -1;
    },

    hasBackboneAtoms: function( position, type ){
        var atomnames = NGL.Residue.atomnames[ type ];
        if( position === -1 ){
            return this.hasAtomWithName(
                atomnames.trace,
                atomnames.backboneEnd,
                atomnames.direction1,
                atomnames.direction2
            );
        }else if( position === 0 ){
            return this.hasAtomWithName(
                atomnames.trace,
                atomnames.direction1,
                atomnames.direction2
            );
        }else if( position === 1 ){
            return this.hasAtomWithName(
                atomnames.trace,
                atomnames.backboneStart,
                atomnames.direction1,
                atomnames.direction2
            );
        }else{
            return this.hasAtomWithName(
                atomnames.trace,
                atomnames.backboneStart,
                atomnames.backboneEnd,
                atomnames.direction1,
                atomnames.direction2
            );
        }
    },

    hasProteinBackbone: function( position ){
        return (
            this.isProtein() &&
            this.hasBackboneAtoms( position, NGL.ProteinBackboneType )
        );
    },

    hasRnaBackbone: function( position ){
        return (
            this.isRna() &&
            this.hasBackboneAtoms( position, NGL.RnaBackboneType )
        );
    },

    hasDnaBackbone: function( position ){
        return (
            this.isDna() &&
            this.hasBackboneAtoms( position, NGL.DnaBackboneType )
        );
    },

    hasCgProteinBackbone: function( position ){
        return (
            this.isProtein() &&
            this.hasBackboneAtoms( position, NGL.CgProteinBackboneType )
        );
    },

    hasCgRnaBackbone: function( position ){
        return (
            this.isRna() &&
            this.hasBackboneAtoms( position, NGL.CgRnaBackboneType )
        );
    },

    hasCgDnaBackbone: function( position ){
        return (
            this.isDna() &&
            this.hasBackboneAtoms( position, NGL.CgDnaBackboneType )
        );
    },

    hasBackbone: function( position ){
        return (
            this.hasProteinBackbone( position ) ||
            this.hasRnaBackbone( position ) ||
            this.hasDnaBackbone( position ) ||
            this.hasCgProteinBackbone( position ) ||
            this.hasCgRnaBackbone( position ) ||
            this.hasCgDnaBackbone( position )
        );
    },

    getAtomIndexByName: function( atomname ){
        var n = this.atomCount;
        var atomMap = this.structure.atomMap;
        var atomTypeIdList = this.atomTypeIdList;
        if( Array.isArray( atomname ) ){
            for( var i = 0; i < n; ++i ){
                var index = atomTypeIdList[ i ];
                if( atomname.indexOf( atomMap.get( index ).atomname ) !== -1 ){
                    return i;
                }
            }
        }else{
            for( var i = 0; i < n; ++i ){
                var index = atomTypeIdList[ i ];
                if( atomname === atomMap.get( index ).atomname ){
                    return i;
                }
            }
        }
        return undefined;
    },

    hasAtomWithName: function( atomname ){
        var n = arguments.length;
        for( var i = 0; i < n; ++i ){
            if( arguments[ i ] === undefined ) continue;
            if( this.getAtomIndexByName( arguments[ i ] ) === undefined ){
                return false;
            }
        }
        return true;
    },

    getBonds: function( r ){
        if( !this.bonds ){
            this.bonds = NGL.calculateResidueBonds( r );
        }
        return this.bonds;
    },

    toJSON: function(){
        var output = {
            resname: this.resname,
            atomTypeIdList: this.atomTypeIdList,
            hetero: this.hetero
        };
        return output;
    }

};


NGL.ResidueMap = function( structure ){

    var idDict = {};
    var typeList = [];

    function getHash( resname, atomTypeIdList, hetero ){
        var hash = resname + "|" + atomTypeIdList.join( "," ) + "|" + ( hetero ? 1 : 0 );
        return hash;
    }

    function add( resname, atomTypeIdList, hetero ){
        var hash = getHash( resname, atomTypeIdList, hetero );
        var id = idDict[ hash ];
        if( id === undefined ){
            var residueType = new NGL.ResidueType(
                structure, resname, atomTypeIdList, hetero
            );
            id = typeList.length;
            idDict[ hash ] = id;
            typeList.push( residueType );
        }
        return id;
    }

    function get( id ){
        return typeList[ id ];
    }

    // API

    this.add = add;
    this.get = get;

    this.list = typeList;
    this.dict = idDict;

    this.toJSON = function(){
        var output = {
            metadata: {
                version: 0.1,
                type: 'ResidueMap',
                generator: 'ResidueMapExporter'
            },
            idDict: idDict,
            typeList: typeList.map( function( residueType ){
                return residueType.toJSON();
            } )
        };
        return output;
    };

    this.fromJSON = function( input ){
        idDict = input.idDict;
        typeList = input.typeList.map( function( input ){
            return new NGL.ResidueType(
                structure, input.resname, input.atomTypeIdList, input.hetero
            );
        } );
        this.list = typeList;
        this.dict = idDict;
    };

}
