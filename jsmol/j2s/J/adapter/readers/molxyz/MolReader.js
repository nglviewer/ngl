Clazz.declarePackage ("J.adapter.readers.molxyz");
Clazz.load (["J.adapter.smarter.AtomSetCollectionReader"], "J.adapter.readers.molxyz.MolReader", ["java.lang.Exception", "$.Float", "J.adapter.smarter.Atom", "J.api.JmolAdapter", "JU.Logger"], function () {
c$ = Clazz.decorateAsClass (function () {
this.is2D = false;
this.isV3000 = false;
this.haveAtomSerials = false;
this.dimension = null;
this.allow2D = true;
this.iatom0 = 0;
Clazz.instantialize (this, arguments);
}, J.adapter.readers.molxyz, "MolReader", J.adapter.smarter.AtomSetCollectionReader);
Clazz.overrideMethod (c$, "initializeReader", 
function () {
this.is2D = this.checkFilterKey ("2D");
});
Clazz.overrideMethod (c$, "checkLine", 
function () {
var isMDL = (this.line.startsWith ("$MDL"));
if (isMDL) {
this.discardLinesUntilStartsWith ("$HDR");
this.rd ();
if (this.line == null) {
JU.Logger.warn ("$HDR not found in MDL RG file");
this.continuing = false;
return false;
}}if (this.doGetModel (++this.modelNumber, null)) {
this.processMolSdHeader ();
this.processCtab (isMDL);
this.iatom0 = this.asc.ac;
this.isV3000 = false;
if (this.isLastModel (this.modelNumber)) {
this.continuing = false;
return false;
}return true;
}this.discardLinesUntilStartsWith ("$$$$");
return true;
});
Clazz.defineMethod (c$, "readUserData", 
 function (atom0) {
if (this.isV3000) return;
while (this.rd () != null && this.line.indexOf ("$$$$") != 0) {
if (this.line.toUpperCase ().contains ("_PARTIAL_CHARGES")) {
try {
var atoms = this.asc.atoms;
for (var i = this.parseIntStr (this.rd ()); --i >= 0; ) {
var tokens = J.adapter.smarter.AtomSetCollectionReader.getTokensStr (this.rd ());
var atomIndex = this.parseIntStr (tokens[0]) + atom0 - 1;
var partialCharge = this.parseFloatStr (tokens[1]);
if (!Float.isNaN (partialCharge)) atoms[atomIndex].partialCharge = partialCharge;
}
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
return;
} else {
throw e;
}
}
}}
}, "~N");
Clazz.overrideMethod (c$, "finalizeReader", 
function () {
this.finalizeReaderMR ();
});
Clazz.defineMethod (c$, "finalizeReaderMR", 
function () {
if (this.is2D) this.set2D ();
this.isTrajectory = false;
this.finalizeReaderASCR ();
});
Clazz.defineMethod (c$, "processMolSdHeader", 
 function () {
var header = "";
var thisDataSetName = this.line;
header += this.line + "\n";
this.asc.setCollectionName (this.line);
this.rd ();
if (this.line == null) return;
header += this.line + "\n";
this.dimension = (this.line.length < 22 ? "3D" : this.line.substring (20, 22));
if (!this.allow2D && this.dimension.equals ("2D")) throw  new Exception ("File is 2D, not 3D");
this.asc.setInfo ("dimension", this.dimension);
this.rd ();
if (this.line == null) return;
header += this.line + "\n";
JU.Logger.info (header);
this.checkCurrentLineForScript ();
this.asc.setInfo ("fileHeader", header);
this.newAtomSet (thisDataSetName);
});
Clazz.defineMethod (c$, "processCtab", 
 function (isMDL) {
var tokens = null;
if (isMDL) this.discardLinesUntilStartsWith ("$CTAB");
this.isV3000 = (this.rd () != null && this.line.indexOf ("V3000") >= 0);
if (this.isV3000) {
this.is2D = (this.dimension.equals ("2D"));
this.discardLinesUntilContains ("COUNTS");
tokens = this.getTokens ();
}if (this.line == null) return;
var ac = (this.isV3000 ? this.parseIntStr (tokens[3]) : this.parseIntRange (this.line, 0, 3));
var bondCount = (this.isV3000 ? this.parseIntStr (tokens[4]) : this.parseIntRange (this.line, 3, 6));
var atom0 = this.asc.ac;
this.readAtoms (ac);
this.readBonds (bondCount);
this.readUserData (atom0);
if (this.isV3000) this.discardLinesUntilContains ("END CTAB");
this.applySymmetryAndSetTrajectory ();
}, "~B");
Clazz.defineMethod (c$, "readAtoms", 
 function (ac) {
if (this.isV3000) this.discardLinesUntilContains ("BEGIN ATOM");
for (var i = 0; i < ac; ++i) {
this.rd ();
var len = this.line.length;
var elementSymbol;
var x;
var y;
var z;
var charge = 0;
var isotope = 0;
var iAtom = -2147483648;
if (this.isV3000) {
this.checkLineContinuation ();
var tokens = this.getTokens ();
iAtom = this.parseIntStr (tokens[2]);
elementSymbol = tokens[3];
if (elementSymbol.equals ("*")) continue;
x = this.parseFloatStr (tokens[4]);
y = this.parseFloatStr (tokens[5]);
z = this.parseFloatStr (tokens[6]);
for (var j = 7; j < tokens.length; j++) {
var s = tokens[j].toUpperCase ();
if (s.startsWith ("CHG=")) charge = this.parseIntStr (tokens[j].substring (4));
 else if (s.startsWith ("MASS=")) isotope = this.parseIntStr (tokens[j].substring (5));
}
if (isotope > 1 && elementSymbol.equals ("H")) isotope = 1 - isotope;
} else {
x = this.parseFloatRange (this.line, 0, 10);
y = this.parseFloatRange (this.line, 10, 20);
z = this.parseFloatRange (this.line, 20, 30);
if (len < 34) {
elementSymbol = this.line.substring (31).trim ();
} else {
elementSymbol = this.line.substring (31, 34).trim ();
if (len >= 39) {
var code = this.parseIntRange (this.line, 36, 39);
if (code >= 1 && code <= 7) charge = 4 - code;
code = this.parseIntRange (this.line, 34, 36);
if (code != 0 && code >= -3 && code <= 4) {
isotope = J.api.JmolAdapter.getNaturalIsotope (J.api.JmolAdapter.getElementNumber (elementSymbol));
switch (isotope) {
case 0:
break;
case 1:
isotope = -code;
break;
default:
isotope += code;
}
}if (iAtom == -2147483648 && this.haveAtomSerials) iAtom = i + 1;
}}}switch (isotope) {
case 0:
break;
case -1:
elementSymbol = "D";
break;
case -2:
elementSymbol = "T";
break;
default:
elementSymbol = isotope + elementSymbol;
}
if (this.is2D && z != 0) this.is2D = false;
var atom =  new J.adapter.smarter.Atom ();
atom.elementSymbol = elementSymbol;
atom.formalCharge = charge;
this.setAtomCoordXYZ (atom, x, y, z);
if (iAtom == -2147483648) {
this.asc.addAtom (atom);
} else {
this.haveAtomSerials = true;
atom.atomSerial = iAtom;
this.asc.addAtomWithMappedSerialNumber (atom);
}}
if (this.isV3000) this.discardLinesUntilContains ("END ATOM");
}, "~N");
Clazz.defineMethod (c$, "checkLineContinuation", 
 function () {
while (this.line.endsWith ("-")) {
var s = this.line;
this.rd ();
this.line = s + this.line;
}
});
Clazz.defineMethod (c$, "readBonds", 
 function (bondCount) {
if (this.isV3000) this.discardLinesUntilContains ("BEGIN BOND");
for (var i = 0; i < bondCount; ++i) {
this.rd ();
var iAtom1;
var iAtom2;
var order;
var stereo = 0;
if (this.isV3000) {
this.checkLineContinuation ();
var tokens = this.getTokens ();
order = this.parseIntStr (tokens[3]);
iAtom1 = tokens[4];
iAtom2 = tokens[5];
for (var j = 6; j < tokens.length; j++) {
var s = tokens[j].toUpperCase ();
if (s.startsWith ("CFG=")) {
stereo = this.parseIntStr (tokens[j].substring (4));
break;
} else if (s.startsWith ("ENDPTS=")) {
if (this.line.indexOf ("ATTACH=ALL") < 0) continue;
tokens = J.adapter.smarter.AtomSetCollectionReader.getTokensAt (this.line, this.line.indexOf ("ENDPTS=") + 8);
var n = this.parseIntStr (tokens[0]);
order = this.fixOrder (order, 0);
for (var k = 1; k <= n; k++) {
iAtom2 = tokens[k];
this.asc.addNewBondFromNames (iAtom1, iAtom2, order);
}
break;
}}
} else {
iAtom1 = this.line.substring (0, 3).trim ();
iAtom2 = this.line.substring (3, 6).trim ();
order = this.parseIntRange (this.line, 6, 9);
if (this.is2D && order == 1 && this.line.length >= 12) stereo = this.parseIntRange (this.line, 9, 12);
}order = this.fixOrder (order, stereo);
if (this.haveAtomSerials) this.asc.addNewBondFromNames (iAtom1, iAtom2, order);
 else this.asc.addNewBondWithOrder (this.iatom0 + this.parseIntStr (iAtom1) - 1, this.iatom0 + this.parseIntStr (iAtom2) - 1, order);
}
if (this.isV3000) this.discardLinesUntilContains ("END BOND");
}, "~N");
Clazz.defineMethod (c$, "fixOrder", 
 function (order, stereo) {
switch (order) {
default:
case 0:
case -10:
return 1;
case 1:
switch (stereo) {
case 1:
return 1025;
case 3:
case 6:
return 1041;
}
break;
case 2:
case 3:
break;
case 4:
return 515;
case 5:
return 66;
case 6:
return 513;
case 7:
return 514;
case 8:
case 9:
return 33;
}
return order;
}, "~N,~N");
});
