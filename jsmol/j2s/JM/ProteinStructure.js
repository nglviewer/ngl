Clazz.declarePackage ("JM");
Clazz.load (["JU.V3"], "JM.ProteinStructure", ["JU.AU", "$.P3", "JU.Logger"], function () {
c$ = Clazz.decorateAsClass (function () {
this.type = null;
this.subtype = null;
this.structureID = null;
this.strucNo = 0;
this.serialID = 0;
this.strandCount = 0;
this.apolymer = null;
this.monomerIndexFirst = 0;
this.monomerCount = 0;
this.axisA = null;
this.axisB = null;
this.axisUnitVector = null;
this.vectorProjection = null;
this.monomerIndexLast = 0;
this.segments = null;
Clazz.instantialize (this, arguments);
}, JM, "ProteinStructure");
Clazz.prepareFields (c$, function () {
this.vectorProjection =  new JU.V3 ();
});
Clazz.defineMethod (c$, "setupPS", 
function (apolymer, type, monomerIndex, monomerCount) {
this.strucNo = ++JM.ProteinStructure.globalStrucNo;
this.apolymer = apolymer;
this.type = type;
this.monomerIndexFirst = monomerIndex;
this.addMonomer (monomerIndex + monomerCount - 1);
if (JU.Logger.debugging) JU.Logger.debug ("Creating ProteinStructure " + this.strucNo + " " + type.getBioStructureTypeName (false) + " from " + this.monomerIndexFirst + " through " + this.monomerIndexLast + " in polymer " + apolymer);
}, "JM.AlphaPolymer,J.c.STR,~N,~N");
Clazz.defineMethod (c$, "addMonomer", 
function (index) {
this.monomerIndexFirst = Math.min (this.monomerIndexFirst, index);
this.monomerIndexLast = Math.max (this.monomerIndexLast, index);
this.monomerCount = this.monomerIndexLast - this.monomerIndexFirst + 1;
}, "~N");
Clazz.defineMethod (c$, "removeMonomer", 
function (monomerIndex) {
if (monomerIndex > this.monomerIndexLast || monomerIndex < this.monomerIndexFirst) return 0;
var ret = this.monomerIndexLast - monomerIndex;
this.monomerIndexLast = Math.max (this.monomerIndexFirst, monomerIndex) - 1;
this.monomerCount = this.monomerIndexLast - this.monomerIndexFirst + 1;
return ret;
}, "~N");
Clazz.defineMethod (c$, "calcAxis", 
function () {
});
Clazz.defineMethod (c$, "calcSegments", 
function () {
if (this.segments != null) return;
this.calcAxis ();
this.segments =  new Array (this.monomerCount + 1);
this.segments[this.monomerCount] = this.axisB;
this.segments[0] = this.axisA;
var axis = JU.V3.newV (this.axisUnitVector);
axis.scale (this.axisB.distance (this.axisA) / this.monomerCount);
for (var i = 1; i < this.monomerCount; i++) {
var point = this.segments[i] =  new JU.P3 ();
point.add2 (this.segments[i - 1], axis);
}
});
Clazz.defineMethod (c$, "lowerNeighborIsHelixOrSheet", 
function () {
if (this.monomerIndexFirst == 0) return false;
return this.apolymer.monomers[this.monomerIndexFirst - 1].isHelix () || this.apolymer.monomers[this.monomerIndexFirst - 1].isSheet ();
});
Clazz.defineMethod (c$, "upperNeighborIsHelixOrSheet", 
function () {
var upperNeighborIndex = this.monomerIndexFirst + this.monomerCount;
if (upperNeighborIndex == this.apolymer.monomerCount) return false;
return this.apolymer.monomers[upperNeighborIndex].isHelix () || this.apolymer.monomers[upperNeighborIndex].isSheet ();
});
Clazz.defineMethod (c$, "getMonomerCount", 
function () {
return this.monomerCount;
});
Clazz.defineMethod (c$, "isWithin", 
function (monomerIndex) {
return (monomerIndex > this.monomerIndexFirst && monomerIndex < this.monomerIndexLast);
}, "~N");
Clazz.defineMethod (c$, "getMonomerIndex", 
function () {
return this.monomerIndexFirst;
});
Clazz.defineMethod (c$, "getIndex", 
function (monomer) {
var monomers = this.apolymer.monomers;
var i;
for (i = this.monomerCount; --i >= 0; ) if (monomers[this.monomerIndexFirst + i] === monomer) break;

return i;
}, "JM.Monomer");
Clazz.defineMethod (c$, "getSegments", 
function () {
if (this.segments == null) this.calcSegments ();
return this.segments;
});
Clazz.defineMethod (c$, "getAxisStartPoint", 
function () {
this.calcAxis ();
return this.axisA;
});
Clazz.defineMethod (c$, "getAxisEndPoint", 
function () {
this.calcAxis ();
return this.axisB;
});
Clazz.defineMethod (c$, "getStructureMidPoint", 
function (index) {
if (this.segments == null) this.calcSegments ();
return this.segments[index];
}, "~N");
Clazz.defineMethod (c$, "getInfo", 
function (info) {
info.put ("type", this.type.getBioStructureTypeName (false));
var leadAtomIndices = this.apolymer.getLeadAtomIndices ();
var iArray = JU.AU.arrayCopyRangeI (leadAtomIndices, this.monomerIndexFirst, this.monomerIndexFirst + this.monomerCount);
info.put ("leadAtomIndices", iArray);
this.calcAxis ();
if (this.axisA == null) return;
info.put ("axisA", this.axisA);
info.put ("axisB", this.axisB);
info.put ("axisUnitVector", this.axisUnitVector);
}, "java.util.Map");
Clazz.defineMethod (c$, "resetAxes", 
function () {
this.axisA = null;
this.segments = null;
});
Clazz.defineStatics (c$,
"globalStrucNo", 1000);
});
