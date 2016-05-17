/**
 * @file Structure Constants
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


// molecule types
var UnknownType = 0;
var WaterType = 1;
var IonType = 2;
var ProteinType = 3;
var RnaType = 4;
var DnaType = 5;

// backbone types
var UnknownBackboneType = 0;
var ProteinBackboneType = 1;
var RnaBackboneType = 2;
var DnaBackboneType = 3;
var CgProteinBackboneType = 4;
var CgRnaBackboneType = 5;
var CgDnaBackboneType = 6;

// PDB helix record encoding
var HelixTypes = {
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
};


export {
	UnknownType,
	WaterType,
	IonType,
	ProteinType,
	RnaType,
	DnaType,

	UnknownBackboneType,
	ProteinBackboneType,
	RnaBackboneType,
	DnaBackboneType,
	CgProteinBackboneType,
	CgRnaBackboneType,
	CgDnaBackboneType,

	HelixTypes
};
