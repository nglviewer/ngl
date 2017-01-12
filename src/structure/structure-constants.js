/**
 * @file Structure Constants
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


// entity types
var UnknownEntity = 0;
var PolymerEntity = 1;
var NonPolymerEntity = 2;
var MacrolideEntity = 3;
var WaterEntity = 4;


// molecule types
var UnknownType = 0;
var WaterType = 1;
var IonType = 2;
var ProteinType = 3;
var RnaType = 4;
var DnaType = 5;
var SaccharideType = 6;


// backbone types
var UnknownBackboneType = 0;
var ProteinBackboneType = 1;
var RnaBackboneType = 2;
var DnaBackboneType = 3;
var CgProteinBackboneType = 4;
var CgRnaBackboneType = 5;
var CgDnaBackboneType = 6;


// chemical component types
var ChemCompProtein = [
    "D-BETA-PEPTIDE, C-GAMMA LINKING", "D-GAMMA-PEPTIDE, C-DELTA LINKING",
    "D-PEPTIDE COOH CARBOXY TERMINUS", "D-PEPTIDE NH3 AMINO TERMINUS", "D-PEPTIDE LINKING",
    "L-BETA-PEPTIDE, C-GAMMA LINKING", "L-GAMMA-PEPTIDE, C-DELTA LINKING",
    "L-PEPTIDE COOH CARBOXY TERMINUS", "L-PEPTIDE NH3 AMINO TERMINUS", "L-PEPTIDE LINKING",
    "PEPTIDE LINKING", "PEPTIDE-LIKE"
];
var ChemCompRna = [
    "RNA OH 3 PRIME TERMINUS", "RNA OH 5 PRIME TERMINUS", "RNA LINKING"
];
var ChemCompDna = [
    "DNA OH 3 PRIME TERMINUS", "DNA OH 5 PRIME TERMINUS", "DNA LINKING",
    "L-DNA LINKING", "L-RNA LINKING"
];
var ChemCompSaccharide = [
    "D-SACCHARIDE", "D-SACCHARIDE 1,4 AND 1,4 LINKING", "D-SACCHARIDE 1,4 AND 1,6 LINKING",
    "L-SACCHARIDE", "L-SACCHARIDE 1,4 AND 1,4 LINKING", "L-SACCHARIDE 1,4 AND 1,6 LINKING",
    "SACCHARIDE"
];
var ChemCompOther = [
    "OTHER"
];
var ChemCompNonPolymer = [
    "NON-POLYMER"
];
var ChemCompHetero = ChemCompNonPolymer.concat( ChemCompOther, ChemCompSaccharide );


// http://dx.doi.org/10.1021/jp8111556 (or 2.0)
var VdwRadii = {
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
    "CN": 2.0, "UUT": 2.0, "FL": 2.0, "UUP": 2.0, "LV": 2.0, "UUH": 2.0
};
var DefaultVdwRadius = 2.0;


// Peter Rose (peter.rose@rcsb.org), private communication, average accross PDB
var ResidueRadii = {
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
    "HQA": 7.25, "SOY": 10.94
};
var DefaultResidueRadius = 5.0;


// http://dx.doi.org/10.1039/b801115j (or 1.6)
var CovalentRadii = {
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
    "CN": 1.6, "UUT": 1.6, "FL": 1.6, "UUP": 1.6, "LV": 1.6, "UUH": 1.6
};
var DefaultCovalentRadius = 1.6;


// http://blanco.biomol.uci.edu/Whole_residue_HFscales.txt
var ResidueHydrophobicity = {
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
    "VAL": [  0.07, -0.46, -0.53 ]
};
var DefaultResidueHydrophobicity = [ 0.00, 0.00, 0.00 ];


var AA1 = {
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

var AA3 = Object.keys( AA1 );

var RnaBases = [ "A", "C", "T", "G", "U" ];

var DnaBases = [ "DA", "DC", "DT", "DG", "DU", "TCY", "MCY", "5CM" ];

var PurinBases = [ "A", "G", "DA", "DG" ];

var WaterNames = [
    "SOL", "WAT", "HOH", "H2O", "W", "DOD", "D3O", "TIP3", "TIP4"
];

// all chemical components with the word "ion" in their name, Sep 2016
//
// SET SESSION group_concat_max_len = 1000000;
// SELECT GROUP_CONCAT(id_ ORDER BY id_ ASC SEPARATOR '", "') from
// (
//     SELECT count(obj_id) as c, id_
//     FROM pdb.chem_comp WHERE name LIKE "% ION%"
//     GROUP BY id_
// ) AS t1;
var IonNames = [
    "118", "119", "1AL", "1CU", "2FK", "2HP", "2OF", "3CO",
    "3MT", "3NI", "3OF", "3P8", "4MO", "4PU", "543", "6MO", "ACT", "AG", "AL",
    "ALF", "AM", "ATH", "AU", "AU3", "AUC", "AZI", "BA", "BCT", "BEF", "BF4", "BO4",
    "BR", "BS3", "BSY", "CA", "CAC", "CD", "CD1", "CD3", "CD5", "CE", "CHT", "CL",
    "CO", "CO3", "CO5", "CON", "CR", "CS", "CSB", "CU", "CU1", "CU3", "CUA", "CUZ",
    "CYN", "DME", "DMI", "DSC", "DTI", "DY", "E4N", "EDR", "EMC", "ER3", "EU",
    "EU3", "F", "FE", "FE2", "FPO", "GA", "GD3", "GEP", "HAI", "HG", "HGC", "IN",
    "IOD", "IR", "IR3", "IRI", "IUM", "K", "KO4", "LA", "LCO", "LCP", "LI", "LU",
    "MAC", "MG", "MH2", "MH3", "MLI", "MLT", "MMC", "MN", "MN3", "MN5", "MN6",
    "MO1", "MO2", "MO3", "MO4", "MO5", "MO6", "MOO", "MOS", "MOW", "MW1", "MW2",
    "MW3", "NA", "NA2", "NA5", "NA6", "NAO", "NAW", "NCO", "NET", "NH4", "NI",
    "NI1", "NI2", "NI3", "NO2", "NO3", "NRU", "O4M", "OAA", "OC1", "OC2", "OC3",
    "OC4", "OC5", "OC6", "OC7", "OC8", "OCL", "OCM", "OCN", "OCO", "OF1", "OF2",
    "OF3", "OH", "OS", "OS4", "OXL", "PB", "PBM", "PD", "PDV", "PER", "PI", "PO3",
    "PO4", "PR", "PT", "PT4", "PTN", "RB", "RH3", "RHD", "RU", "SB", "SCN", "SE4",
    "SEK", "SM", "SMO", "SO3", "SO4", "SR", "T1A", "TB", "TBA", "TCN", "TEA", "TH",
    "THE", "TL", "TMA", "TRA", "UNX", "V", "VN3", "VO4", "W", "WO5", "Y1", "YB",
    "YB2", "YH", "YT3", "ZCM", "ZN", "ZN2", "ZN3", "ZNO", "ZO3",
    // additional ion names
    "OHX"
];

// all chemical components with the word "%saccharide%" in their type, Sep 2016
//
// SET SESSION group_concat_max_len = 1000000;
// select GROUP_CONCAT(id_ ORDER BY id_ ASC SEPARATOR '", "') from
// (
//     SELECT count(obj_id), id_
//     FROM pdb.chem_comp WHERE type like "%SACCHARIDE%"
//     GROUP BY id_
// ) AS t1;
var SaccharideNames = [
    "045", "0AT", "0BD", "0MK", "0NZ", "0TS", "0V4", "0XY", "0YT", "10M",
    "147", "149", "14T", "15L", "16G", "18T", "18Y", "1AR", "1BW", "1GL", "1GN",
    "1JB", "1LL", "1NA", "1S3", "26M", "26Q", "26R", "26V", "26W", "26Y", "27C",
    "289", "291", "293", "2DG", "2F8", "2FG", "2FL", "2FP", "2GL", "2M4", "2M5",
    "32O", "34V", "3CM", "3DO", "3DY", "3FM", "3LR", "3MF", "3MG", "3SA", "3ZW",
    "46D", "46M", "46Z", "48Z", "4CQ", "4GC", "4NN", "50A", "5DI", "5GF", "5MM",
    "5RP", "5SA", "5SP", "64K", "6PG", "6SA", "7JZ", "7SA", "A1Q", "A2G", "AAB",
    "AAL", "AAO", "ABC", "ABD", "ABE", "ABF", "ABL", "ACG", "ACI", "ACR", "ACX",
    "ADA", "ADG", "ADR", "AF1", "AFD", "AFL", "AFO", "AFP", "AFR", "AGC", "AGH",
    "AGL", "AHR", "AIG", "ALL", "ALX", "AMU", "AOG", "AOS", "ARA", "ARB", "ARE",
    "ARI", "ASG", "ASO", "AXP", "AXR", "B0D", "B16", "B2G", "B4G", "B6D", "B8D",
    "B9D", "BBK", "BCD", "BDG", "BDP", "BDR", "BEM", "BFP", "BGC", "BGL", "BGP",
    "BGS", "BHG", "BMA", "BMX", "BNG", "BNX", "BOG", "BRI", "BXF", "BXP", "BXX",
    "BXY", "C3X", "C4X", "C5X", "CAP", "CBI", "CBK", "CBS", "CDR", "CEG", "CGF",
    "CHO", "CR1", "CR6", "CRA", "CT3", "CTO", "CTR", "CTT", "D6G", "DAF", "DAG",
    "DDA", "DDB", "DDL", "DEL", "DFR", "DFX", "DG0", "DGC", "DGD", "DGM", "DGS",
    "DIG", "DLF", "DLG", "DMU", "DNO", "DOM", "DP5", "DQQ", "DQR", "DR2", "DR3",
    "DR4", "DRI", "DSR", "DT6", "DVC", "E4P", "E5G", "EAG", "EBG", "EBQ", "EGA",
    "EJT", "EPG", "ERE", "ERI", "F1P", "F1X", "F6P", "FBP", "FCA", "FCB", "FCT",
    "FDP", "FDQ", "FFC", "FIX", "FMO", "FRU", "FSI", "FU4", "FUB", "FUC", "FUD",
    "FUL", "FXP", "G16", "G1P", "G2F", "G3I", "G4D", "G4S", "G6D", "G6P", "G6S",
    "GAC", "GAD", "GAL", "GC1", "GC4", "GCD", "GCN", "GCO", "GCS", "GCT", "GCU",
    "GCV", "GCW", "GCX", "GE1", "GFG", "GFP", "GIV", "GL0", "GL2", "GL5", "GL6",
    "GL7", "GL9", "GLA", "GLB", "GLC", "GLD", "GLF", "GLG", "GLO", "GLP", "GLS",
    "GLT", "GLW", "GMH", "GN1", "GNX", "GP1", "GP4", "GPH", "GPM", "GQ1", "GQ2",
    "GQ4", "GS1", "GS4", "GSA", "GSD", "GTE", "GTH", "GTK", "GTR", "GTZ", "GU0",
    "GU1", "GU2", "GU3", "GU4", "GU5", "GU6", "GU8", "GU9", "GUF", "GUP", "GUZ",
    "GYP", "GYV", "H2P", "HDL", "HMS", "HS2", "HSD", "HSG", "HSH", "HSJ", "HSQ",
    "HSR", "HSU", "HSX", "HSY", "HSZ", "IAB", "IDG", "IDR", "IDS", "IDT", "IDU",
    "IDX", "IDY", "IMK", "IN1", "IPT", "ISL", "KBG", "KD2", "KDA", "KDM", "KDO",
    "KFN", "KO1", "KO2", "KTU", "L6S", "LAG", "LAI", "LAK", "LAO", "LAT", "LB2",
    "LBT", "LCN", "LDY", "LGC", "LGU", "LM2", "LMT", "LMU", "LOG", "LOX", "LPK",
    "LSM", "LTM", "LVZ", "LXB", "LXZ", "M1F", "M3M", "M6P", "M8C", "MA1", "MA2",
    "MA3", "MAB", "MAG", "MAL", "MAN", "MAT", "MAV", "MAW", "MBG", "MCU", "MDA",
    "MDM", "MDP", "MFA", "MFB", "MFU", "MG5", "MGA", "MGL", "MLB", "MMA", "MMN",
    "MN0", "MRP", "MTT", "MUG", "MVP", "MXY", "N1L", "N9S", "NAA", "NAG", "NBG",
    "NDG", "NED", "NG1", "NG6", "NGA", "NGB", "NGC", "NGE", "NGF", "NGL", "NGS",
    "NGY", "NHF", "NM6", "NM9", "NTF", "NTO", "NTP", "NXD", "NYT", "OPG", "OPM",
    "ORP", "OX2", "P3M", "P53", "P6P", "PA5", "PNA", "PNG", "PNW", "PRP", "PSJ",
    "PSV", "PTQ", "QDK", "QPS", "QV4", "R1P", "R1X", "R2B", "R5P", "RAA", "RAE",
    "RAF", "RAM", "RAO", "RAT", "RB5", "RBL", "RCD", "RDP", "REL", "RER", "RF5",
    "RG1", "RGG", "RHA", "RIB", "RIP", "RNS", "RNT", "ROB", "ROR", "RPA", "RST",
    "RUB", "RUU", "RZM", "S6P", "S7P", "SA0", "SCR", "SDD", "SF6", "SF9", "SG4",
    "SG5", "SG6", "SG7", "SGA", "SGC", "SGD", "SGN", "SGS", "SHB", "SHG", "SI3",
    "SIO", "SOE", "SOL", "SSG", "SUC", "SUP", "SUS", "T6P", "T6T", "TAG", "TCB",
    "TDG", "TGK", "TGY", "TH1", "TIA", "TM5", "TM6", "TM9", "TMR", "TMX", "TOA",
    "TOC", "TRE", "TYV", "UCD", "UDC", "VG1", "X0X", "X1X", "X2F", "X4S", "X5S",
    "X6X", "XBP", "XDN", "XDP", "XIF", "XIM", "XLF", "XLS", "XMM", "XUL", "XXR",
    "XYP", "XYS", "YO5", "Z3Q", "Z6J", "Z9M", "ZDC", "ZDM"
];


var ProteinBackboneAtoms = [
    "CA", "C", "N", "O",
    "O1", "O2", "OC1", "OC2", "OX1", "OXT",
    "H", "H1", "H2", "H3", "HA",
    "BB"
];

var NucleicBackboneAtoms = [
    "P", "O3'", "O5'", "C5'", "C4'", "C3'", "OP1", "OP2",
    "O3*", "O5*", "C5*", "C4*", "C3*"
];


var ResidueTypeAtoms = {};

ResidueTypeAtoms[ ProteinBackboneType ] = {
    trace: "CA",
    direction1: "C",
    direction2: [ "O", "OC1", "O1", "OX1", "OXT" ],
    backboneStart: "N",
    backboneEnd: "C",
};

ResidueTypeAtoms[ RnaBackboneType ] = {
    trace: [ "C4'", "C4*" ],
    direction1: [ "C1'", "C1*" ],
    direction2: [ "C3'", "C3*" ],
    backboneStart: "P",
    backboneEnd: [ "O3'", "O3*" ]
};

ResidueTypeAtoms[ DnaBackboneType ] = {
    trace: [ "C3'", "C3*" ],
    direction1: [ "C2'", "C2*" ],
    direction2: [ "O4'", "O4*" ],
    backboneStart: "P",
    backboneEnd: [ "O3'", "O3*" ]
};

ResidueTypeAtoms[ CgProteinBackboneType ] = {
    trace: [ "CA", "BB" ],
    backboneStart: [ "CA", "BB" ],
    backboneEnd: [ "CA", "BB" ],
};

ResidueTypeAtoms[ CgRnaBackboneType ] = {
    trace: [ "C4'", "C4*", "P" ],
    backboneStart: [ "C4'", "C4*", "P" ],
    backboneEnd: [ "C4'", "C4*", "P" ],
};

ResidueTypeAtoms[ CgDnaBackboneType ] = {
    trace: [ "C3'", "C3*", "C2'", "P" ],  // C2' is used in martini ff
    backboneStart: [ "C3'", "C3*", "C2'", "P" ],
    backboneEnd: [ "C3'", "C3*", "C2'", "P" ],
};

ResidueTypeAtoms[ UnknownBackboneType ] = {};


export {
    UnknownEntity,
    PolymerEntity,
    NonPolymerEntity,
    MacrolideEntity,
    WaterEntity,

    UnknownType,
    WaterType,
    IonType,
    ProteinType,
    RnaType,
    DnaType,
    SaccharideType,

    UnknownBackboneType,
    ProteinBackboneType,
    RnaBackboneType,
    DnaBackboneType,
    CgProteinBackboneType,
    CgRnaBackboneType,
    CgDnaBackboneType,

    ChemCompProtein,
    ChemCompRna,
    ChemCompDna,
    ChemCompSaccharide,
    ChemCompOther,
    ChemCompNonPolymer,
    ChemCompHetero,

    VdwRadii,
    DefaultVdwRadius,
    ResidueRadii,
    DefaultResidueRadius,
    CovalentRadii,
    DefaultCovalentRadius,
    ResidueHydrophobicity,
    DefaultResidueHydrophobicity,

    AA1,
    AA3,
    RnaBases,
    DnaBases,
    PurinBases,
    WaterNames,
    IonNames,
    SaccharideNames,

    ProteinBackboneAtoms,
    NucleicBackboneAtoms,

    ResidueTypeAtoms
};
