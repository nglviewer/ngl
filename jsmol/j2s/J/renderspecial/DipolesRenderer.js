Clazz.declarePackage ("J.renderspecial");
Clazz.load (["J.render.ShapeRenderer", "JU.P3", "$.V3"], "J.renderspecial.DipolesRenderer", ["JU.P3i", "JU.C"], function () {
c$ = Clazz.decorateAsClass (function () {
this.dipoleVectorScale = 0;
this.offset = null;
this.screens = null;
this.points = null;
this.cross0 = null;
this.cross1 = null;
this.diameter = 0;
this.headWidthPixels = 0;
this.crossWidthPixels = 0;
Clazz.instantialize (this, arguments);
}, J.renderspecial, "DipolesRenderer", J.render.ShapeRenderer);
Clazz.prepareFields (c$, function () {
this.offset =  new JU.V3 ();
this.screens =  new Array (6);
this.points =  new Array (6);
{
for (var i = 0; i < 6; i++) {
this.screens[i] =  new JU.P3i ();
this.points[i] =  new JU.P3 ();
}
}this.cross0 =  new JU.P3 ();
this.cross1 =  new JU.P3 ();
});
Clazz.overrideMethod (c$, "render", 
function () {
var dipoles = this.shape;
this.dipoleVectorScale = this.vwr.getFloat (570425355);
var needTranslucent = false;
for (var i = dipoles.dipoleCount; --i >= 0; ) {
var dipole = dipoles.dipoles[i];
if (dipole.visibilityFlags != 0 && this.transform (dipole) && this.renderDipoleVector (dipole)) needTranslucent = true;
}
return needTranslucent;
});
Clazz.defineMethod (c$, "transform", 
 function (dipole) {
var vector = dipole.vector;
this.offset.setT (vector);
if (dipole.center == null) {
this.offset.scale (dipole.offsetAngstroms / dipole.dipoleValue);
if (this.dipoleVectorScale < 0) this.offset.add (vector);
this.points[0].add2 (dipole.origin, this.offset);
} else {
this.offset.scale (-0.5 * this.dipoleVectorScale);
this.points[0].add2 (dipole.center, this.offset);
if (dipole.offsetAngstroms != 0) {
this.offset.setT (vector);
this.offset.scale (dipole.offsetAngstroms / dipole.dipoleValue);
this.points[0].add (this.offset);
}}this.points[1].scaleAdd2 (this.dipoleVectorScale * 0.1, vector, this.points[0]);
this.points[2].scaleAdd2 (this.dipoleVectorScale * (0.14), vector, this.points[0]);
this.points[3].scaleAdd2 (this.dipoleVectorScale / 2, vector, this.points[0]);
this.points[4].scaleAdd2 (this.dipoleVectorScale * 0.9, vector, this.points[0]);
this.points[5].scaleAdd2 (this.dipoleVectorScale, vector, this.points[0]);
if (dipole.atoms[0] != null && this.ms.isAtomHidden (dipole.atoms[0].i)) return false;
this.offset.setT (this.points[3]);
this.offset.cross (this.offset, vector);
if (this.offset.length () == 0) {
this.offset.set (this.points[3].x + 0.2345, this.points[3].y + 0.1234, this.points[3].z + 0.4321);
this.offset.cross (this.offset, vector);
}this.offset.scale (dipole.offsetSide / this.offset.length ());
for (var i = 0; i < 6; i++) this.points[i].add (this.offset);

for (var i = 0; i < 6; i++) this.tm.transformPtScr (this.points[i], this.screens[i]);

this.tm.transformPt3f (this.points[1], this.cross0);
this.tm.transformPt3f (this.points[2], this.cross1);
this.mad = dipole.mad;
var d = this.vwr.scaleToScreen (this.screens[3].z, this.mad);
this.diameter = Clazz.floatToInt (d);
this.headWidthPixels = Clazz.doubleToInt (Math.floor (d * 2.0));
if (this.headWidthPixels < this.diameter + 5) this.headWidthPixels = this.diameter + 5;
this.crossWidthPixels = this.headWidthPixels;
return true;
}, "J.shapespecial.Dipole");
Clazz.defineMethod (c$, "renderDipoleVector", 
 function (dipole) {
var colixA = (dipole.bond == null ? dipole.colix : JU.C.getColixInherited (dipole.colix, dipole.bond.colix));
var colixB = colixA;
if (dipole.atoms[0] != null) {
colixA = JU.C.getColixInherited (colixA, dipole.atoms[0].getColix ());
colixB = JU.C.getColixInherited (colixB, dipole.atoms[1].getColix ());
}if (colixA == 0) colixA = 5;
if (colixB == 0) colixB = 5;
if (this.dipoleVectorScale < 0) {
var c = colixA;
colixA = colixB;
colixB = c;
}this.colix = colixA;
if (this.colix == colixB) {
if (!this.g3d.setC (this.colix)) return true;
this.g3d.fillCylinder (1, this.diameter, this.screens[0], this.screens[4]);
if (!dipole.noCross) this.g3d.fillCylinderBits (2, this.crossWidthPixels, this.cross0, this.cross1);
this.g3d.fillConeScreen (2, this.headWidthPixels, this.screens[4], this.screens[5], false);
return false;
}var needTranslucent = false;
if (this.g3d.setC (this.colix)) {
this.g3d.fillCylinder (1, this.diameter, this.screens[0], this.screens[3]);
if (!dipole.noCross) this.g3d.fillCylinderBits (2, this.crossWidthPixels, this.cross0, this.cross1);
} else {
needTranslucent = true;
}this.colix = colixB;
if (this.g3d.setC (this.colix)) {
this.g3d.fillCylinder (4, this.diameter, this.screens[3], this.screens[4]);
this.g3d.fillConeScreen (2, this.headWidthPixels, this.screens[4], this.screens[5], false);
} else {
needTranslucent = true;
}return needTranslucent;
}, "J.shapespecial.Dipole");
Clazz.defineStatics (c$,
"cylinderBase", 0,
"cross", 1,
"crossEnd", 2,
"center", 3,
"arrowHeadBase", 4,
"arrowHeadTip", 5,
"arrowHeadOffset", 0.9,
"arrowHeadWidthFactor", 2,
"crossOffset", 0.1,
"crossWidth", 0.04);
});
