// Type definitions for mmtf
export = Mmtf;
export as namespace mmtf;

declare namespace Mmtf {
	
	export type Fields = 
    "mmtfVersion"| "mmtfProducer"|
    "unitCell"| "spaceGroup"| "structureId"| "title"|
    "depositionDate"| "releaseDate"|
    "experimentalMethods"| "resolution"| "rFree"| "rWork"|
    "bioAssemblyList"| "ncsOperatorList"| "entityList"| "groupList"|
    "numBonds"| "numAtoms"| "numGroups"| "numChains"| "numModels"|
    "groupsPerChain"| "chainsPerModel"| "xCoordList"| "yCoordList"| "zCoordList"|
    "groupIdList"| "groupTypeList"|
    "chainIdList"|
    // optional
    "bFactorList"| "atomIdList"| "altLocList"| "occupancyList"|
    "secStructList"| "insCodeList"| "sequenceIndexList"|
    "chainNameList"|
    "bondAtomList"| "bondOrderList"
	
	/**
	 * decode binary encoded MessagePack v5 (http://msgpack.org/) data
	 */
	export function decodeMsgpack( buffer: Uint8Array): {[k in Fields]: string|Uint8Array};
	
	export interface DecodingParameters {
		ignoreFields: string[],
		[k: string]: any
	}

	export function decodeMmtf(inputDict: {[k in Fields]: Uint8Array|string}, params?:Partial<DecodingParameters>): {[k in Fields]: any}

	
}