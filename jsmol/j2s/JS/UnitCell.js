Clazz.declarePackage ("JS");
Clazz.load (["JU.SimpleUnitCell", "JU.P3", "JV.JC"], "JS.UnitCell", ["java.lang.Float", "JU.M4", "$.V3", "J.api.Interface", "JU.BoxInfo", "$.Escape"], function () {
c$ = Clazz.decorateAsClass (function () {
this.vertices = null;
this.cartesianOffset = null;
this.fractionalOffset = null;
this.allFractionalRelative = false;
this.unitCellMultiplier = null;
Clazz.instantialize (this, arguments);
}, JS, "UnitCell", JU.SimpleUnitCell);
Clazz.prepareFields (c$, function () {
this.cartesianOffset =  new JU.P3 ();
});
Clazz.makeConstructor (c$, 
function () {
Clazz.superConstructor (this, JS.UnitCell, []);
});
c$.newP = Clazz.defineMethod (c$, "newP", 
function (points, setRelative) {
var c =  new JS.UnitCell ();
var parameters = [-1, 0, 0, 0, 0, 0, points[1].x, points[1].y, points[1].z, points[2].x, points[2].y, points[2].z, points[3].x, points[3].y, points[3].z];
c.set (parameters);
c.allFractionalRelative = setRelative;
c.calcUnitcellVertices ();
c.setCartesianOffset (points[0]);
return c;
}, "~A,~B");
c$.newA = Clazz.overrideMethod (c$, "newA", 
function (notionalUnitcell) {
var c =  new JS.UnitCell ();
c.set (notionalUnitcell);
c.calcUnitcellVertices ();
return c;
}, "~A");
Clazz.defineMethod (c$, "setOrientation", 
function (mat) {
if (mat == null) return;
var m =  new JU.M4 ();
m.setToM3 (mat);
this.matrixFractionalToCartesian.mul2 (m, this.matrixFractionalToCartesian);
this.matrixCartesianToFractional.invertM (this.matrixFractionalToCartesian);
this.calcUnitcellVertices ();
}, "JU.M3");
Clazz.defineMethod (c$, "toUnitCell", 
function (pt, offset) {
if (this.matrixCartesianToFractional == null) return;
if (offset == null) {
this.matrixCartesianToFractional.rotTrans (pt);
this.unitize (pt);
this.matrixFractionalToCartesian.rotTrans (pt);
} else {
this.matrixCtoFAbsolute.rotTrans (pt);
this.unitize (pt);
pt.add (offset);
this.matrixFtoCAbsolute.rotTrans (pt);
}}, "JU.P3,JU.P3");
Clazz.defineMethod (c$, "unitize", 
function (pt) {
switch (this.dimension) {
case 3:
pt.z = JS.UnitCell.toFractionalX (pt.z);
case 2:
pt.y = JS.UnitCell.toFractionalX (pt.y);
case 1:
pt.x = JS.UnitCell.toFractionalX (pt.x);
}
}, "JU.P3");
Clazz.defineMethod (c$, "setAllFractionalRelative", 
function (TF) {
this.allFractionalRelative = TF;
}, "~B");
Clazz.defineMethod (c$, "setOffset", 
function (pt) {
if (pt == null) return;
if (pt.x >= 100 || pt.y >= 100) {
this.unitCellMultiplier = (pt.z == 0 ? null : JU.P3.newP (pt));
return;
}this.fractionalOffset =  new JU.P3 ();
this.fractionalOffset.setT (pt);
this.matrixCartesianToFractional.m03 = -pt.x;
this.matrixCartesianToFractional.m13 = -pt.y;
this.matrixCartesianToFractional.m23 = -pt.z;
this.cartesianOffset.setT (pt);
this.matrixFractionalToCartesian.m03 = 0;
this.matrixFractionalToCartesian.m13 = 0;
this.matrixFractionalToCartesian.m23 = 0;
this.matrixFractionalToCartesian.rotTrans (this.cartesianOffset);
this.matrixFractionalToCartesian.m03 = this.cartesianOffset.x;
this.matrixFractionalToCartesian.m13 = this.cartesianOffset.y;
this.matrixFractionalToCartesian.m23 = this.cartesianOffset.z;
if (this.allFractionalRelative) {
this.matrixCtoFAbsolute.setM4 (this.matrixCartesianToFractional);
this.matrixFtoCAbsolute.setM4 (this.matrixFractionalToCartesian);
}}, "JU.P3");
Clazz.defineMethod (c$, "setCartesianOffset", 
function (origin) {
this.cartesianOffset.setT (origin);
this.matrixFractionalToCartesian.m03 = this.cartesianOffset.x;
this.matrixFractionalToCartesian.m13 = this.cartesianOffset.y;
this.matrixFractionalToCartesian.m23 = this.cartesianOffset.z;
this.fractionalOffset =  new JU.P3 ();
this.fractionalOffset.setT (this.cartesianOffset);
this.matrixCartesianToFractional.m03 = 0;
this.matrixCartesianToFractional.m13 = 0;
this.matrixCartesianToFractional.m23 = 0;
this.matrixCartesianToFractional.rotTrans (this.fractionalOffset);
this.matrixCartesianToFractional.m03 = -this.fractionalOffset.x;
this.matrixCartesianToFractional.m13 = -this.fractionalOffset.y;
this.matrixCartesianToFractional.m23 = -this.fractionalOffset.z;
if (this.allFractionalRelative) {
this.matrixCtoFAbsolute.setM4 (this.matrixCartesianToFractional);
this.matrixFtoCAbsolute.setM4 (this.matrixFractionalToCartesian);
}}, "JU.T3");
Clazz.defineMethod (c$, "setMinMaxLatticeParameters", 
function (minXYZ, maxXYZ) {
if (maxXYZ.x <= maxXYZ.y && maxXYZ.y >= 555) {
var pt =  new JU.P3 ();
JU.SimpleUnitCell.ijkToPoint3f (maxXYZ.x, pt, 0);
minXYZ.x = Clazz.floatToInt (pt.x);
minXYZ.y = Clazz.floatToInt (pt.y);
minXYZ.z = Clazz.floatToInt (pt.z);
JU.SimpleUnitCell.ijkToPoint3f (maxXYZ.y, pt, 1);
maxXYZ.x = Clazz.floatToInt (pt.x);
maxXYZ.y = Clazz.floatToInt (pt.y);
maxXYZ.z = Clazz.floatToInt (pt.z);
}switch (this.dimension) {
case 1:
minXYZ.y = 0;
maxXYZ.y = 1;
case 2:
minXYZ.z = 0;
maxXYZ.z = 1;
}
}, "JU.P3i,JU.P3i");
Clazz.defineMethod (c$, "dumpInfo", 
function (isFull) {
return "a=" + this.a + ", b=" + this.b + ", c=" + this.c + ", alpha=" + this.alpha + ", beta=" + this.beta + ", gamma=" + this.gamma + (isFull ? "\nfractional to cartesian: " + this.matrixFractionalToCartesian + "\ncartesian to fractional: " + this.matrixCartesianToFractional : "");
}, "~B");
Clazz.defineMethod (c$, "getVertices", 
function () {
return this.vertices;
});
Clazz.defineMethod (c$, "getCartesianOffset", 
function () {
return this.cartesianOffset;
});
Clazz.defineMethod (c$, "getFractionalOffset", 
function () {
return this.fractionalOffset;
});
Clazz.defineMethod (c$, "getTensor", 
function (parBorU) {
var t = (J.api.Interface.getUtil ("Tensor"));
if (parBorU[0] == 0 && parBorU[1] == 0 && parBorU[2] == 0) {
var f = parBorU[7];
var eigenValues = [f, f, f];
return t.setFromEigenVectors (JS.UnitCell.unitVectors, eigenValues, "iso", "Uiso=" + f, null);
}t.parBorU = parBorU;
var Bcart =  Clazz.newDoubleArray (6, 0);
var ortepType = Clazz.floatToInt (parBorU[6]);
if (ortepType == 12) {
Bcart[0] = parBorU[0] * 19.739208802178716;
Bcart[1] = parBorU[1] * 19.739208802178716;
Bcart[2] = parBorU[2] * 19.739208802178716;
Bcart[3] = parBorU[3] * 19.739208802178716 * 2;
Bcart[4] = parBorU[4] * 19.739208802178716 * 2;
Bcart[5] = parBorU[5] * 19.739208802178716 * 2;
parBorU[7] = (parBorU[0] + parBorU[1] + parBorU[3]) / 3;
} else {
var isFractional = (ortepType == 4 || ortepType == 5 || ortepType == 8 || ortepType == 9);
var cc = 2 - (ortepType % 2);
var dd = (ortepType == 8 || ortepType == 9 || ortepType == 10 ? 19.739208802178716 : ortepType == 4 || ortepType == 5 ? 0.25 : ortepType == 2 || ortepType == 3 ? Math.log (2) : 1);
var B11 = parBorU[0] * dd * (isFractional ? this.a_ * this.a_ : 1);
var B22 = parBorU[1] * dd * (isFractional ? this.b_ * this.b_ : 1);
var B33 = parBorU[2] * dd * (isFractional ? this.c_ * this.c_ : 1);
var B12 = parBorU[3] * dd * (isFractional ? this.a_ * this.b_ : 1) * cc;
var B13 = parBorU[4] * dd * (isFractional ? this.a_ * this.c_ : 1) * cc;
var B23 = parBorU[5] * dd * (isFractional ? this.b_ * this.c_ : 1) * cc;
parBorU[7] = Math.pow (B11 / 19.739208802178716 / this.a_ / this.a_ * B22 / 19.739208802178716 / this.b_ / this.b_ * B33 / 19.739208802178716 / this.c_ / this.c_, 0.3333);
Bcart[0] = this.a * this.a * B11 + this.b * this.b * this.cosGamma * this.cosGamma * B22 + this.c * this.c * this.cosBeta * this.cosBeta * B33 + this.a * this.b * this.cosGamma * B12 + this.b * this.c * this.cosGamma * this.cosBeta * B23 + this.a * this.c * this.cosBeta * B13;
Bcart[1] = this.b * this.b * this.sinGamma * this.sinGamma * B22 + this.c * this.c * this.cA_ * this.cA_ * B33 + this.b * this.c * this.cA_ * this.sinGamma * B23;
Bcart[2] = this.c * this.c * this.cB_ * this.cB_ * B33;
Bcart[3] = 2 * this.b * this.b * this.cosGamma * this.sinGamma * B22 + 2 * this.c * this.c * this.cA_ * this.cosBeta * B33 + this.a * this.b * this.sinGamma * B12 + this.b * this.c * (this.cA_ * this.cosGamma + this.sinGamma * this.cosBeta) * B23 + this.a * this.c * this.cA_ * B13;
Bcart[4] = 2 * this.c * this.c * this.cB_ * this.cosBeta * B33 + this.b * this.c * this.cosGamma * B23 + this.a * this.c * this.cB_ * B13;
Bcart[5] = 2 * this.c * this.c * this.cA_ * this.cB_ * B33 + this.b * this.c * this.cB_ * this.sinGamma * B23;
}return t.setFromThermalEquation (Bcart, JU.Escape.eAF (parBorU));
}, "~A");
Clazz.defineMethod (c$, "getCanonicalCopy", 
function (scale, withOffset) {
var pts =  new Array (8);
var cell0 = null;
var cell1 = null;
if (withOffset && this.unitCellMultiplier != null) {
cell0 =  new JU.P3 ();
cell1 =  new JU.P3 ();
JU.SimpleUnitCell.ijkToPoint3f (Clazz.floatToInt (this.unitCellMultiplier.x), cell0, 0);
JU.SimpleUnitCell.ijkToPoint3f (Clazz.floatToInt (this.unitCellMultiplier.y), cell1, 0);
cell1.sub (cell0);
}for (var i = 0; i < 8; i++) {
var pt = pts[i] = JU.P3.newP (JU.BoxInfo.unitCubePoints[i]);
if (cell0 != null) {
scale *= this.unitCellMultiplier.z;
pts[i].add3 (cell0.x + cell1.x * pt.x, cell0.y + cell1.y * pt.y, cell0.z + cell1.z * pt.z);
}this.matrixFractionalToCartesian.rotTrans (pt);
if (!withOffset) pt.sub (this.cartesianOffset);
}
return JU.BoxInfo.getCanonicalCopy (pts, scale);
}, "~N,~B");
c$.toFractionalX = Clazz.defineMethod (c$, "toFractionalX", 
 function (x) {
x = (x - Math.floor (x));
if (x > 0.9999 || x < 0.0001) x = 0;
return x;
}, "~N");
Clazz.defineMethod (c$, "calcUnitcellVertices", 
 function () {
if (this.matrixFractionalToCartesian == null) return;
this.matrixCtoFAbsolute = JU.M4.newM4 (this.matrixCartesianToFractional);
this.matrixFtoCAbsolute = JU.M4.newM4 (this.matrixFractionalToCartesian);
this.vertices =  new Array (8);
for (var i = 8; --i >= 0; ) {
this.vertices[i] =  new JU.P3 ();
this.matrixFractionalToCartesian.rotTrans2 (JU.BoxInfo.unitCubePoints[i], this.vertices[i]);
}
});
Clazz.defineMethod (c$, "checkDistance", 
function (f1, f2, distance, dx, iRange, jRange, kRange, ptOffset) {
var p1 = JU.P3.newP (f1);
this.toCartesian (p1, true);
for (var i = -iRange; i <= iRange; i++) for (var j = -jRange; j <= jRange; j++) for (var k = -kRange; k <= kRange; k++) {
ptOffset.set (f2.x + i, f2.y + j, f2.z + k);
this.toCartesian (ptOffset, true);
var d = p1.distance (ptOffset);
if (dx > 0 ? Math.abs (d - distance) <= dx : d <= distance && d > 0.1) {
ptOffset.set (i, j, k);
return true;
}}


return false;
}, "JU.P3,JU.P3,~N,~N,~N,~N,~N,JU.P3");
Clazz.defineMethod (c$, "getUnitCellMultiplier", 
function () {
return this.unitCellMultiplier;
});
Clazz.defineMethod (c$, "getUnitCellVectors", 
function () {
var m = this.matrixFractionalToCartesian;
return [JU.V3.newV (this.cartesianOffset), JU.V3.new3 (m.m00, m.m10, m.m20), JU.V3.new3 (m.m01, m.m11, m.m21), JU.V3.new3 (m.m02, m.m12, m.m22)];
});
Clazz.defineMethod (c$, "isSameAs", 
function (uc) {
if (uc.notionalUnitcell.length != this.notionalUnitcell.length) return false;
for (var i = this.notionalUnitcell.length; --i >= 0; ) if (this.notionalUnitcell[i] != uc.notionalUnitcell[i] && !(Float.isNaN (this.notionalUnitcell[i]) && Float.isNaN (uc.notionalUnitcell[i]))) return false;

if (this.fractionalOffset == null) return (uc.fractionalOffset == null);
if (uc.fractionalOffset == null) return false;
if (this.fractionalOffset.distanceSquared (uc.fractionalOffset) != 0) return false;
return true;
}, "JS.UnitCell");
Clazz.defineMethod (c$, "getState", 
function () {
var s = "";
if (this.fractionalOffset != null) s += "  unitcell " + JU.Escape.eP (this.fractionalOffset) + ";\n";
if (this.unitCellMultiplier != null) s += "  unitcell " + JU.Escape.eP (this.unitCellMultiplier) + ";\n";
return s;
});
Clazz.defineStatics (c$,
"twoP2", 19.739208802178716);
c$.unitVectors = c$.prototype.unitVectors = [JV.JC.axisX, JV.JC.axisY, JV.JC.axisZ];
});
