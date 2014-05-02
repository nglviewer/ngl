Clazz.declarePackage ("JS");
Clazz.load (["JU.M4"], "JS.SymmetryOperation", ["java.lang.Float", "JU.Lst", "$.Matrix", "$.P3", "$.P4", "$.PT", "$.Quat", "$.SB", "$.V3", "JU.Escape", "$.Logger", "$.Measure", "$.Parser"], function () {
c$ = Clazz.decorateAsClass (function () {
this.xyzOriginal = null;
this.xyz = null;
this.doNormalize = true;
this.isFinalized = false;
this.opId = 0;
this.atomTest = null;
this.myLabels = null;
this.modDim = 0;
this.linearRotTrans = null;
this.rsvs = null;
this.isBio = false;
this.sigma = null;
this.index = 0;
this.subsystemCode = null;
Clazz.instantialize (this, arguments);
}, JS, "SymmetryOperation", JU.M4);
Clazz.defineMethod (c$, "setSigma", 
function (subsystemCode, sigma) {
this.subsystemCode = subsystemCode;
this.sigma = sigma;
}, "~S,JU.Matrix");
Clazz.overrideConstructor (c$, 
function (op, atoms, atomIndex, countOrId, doNormalize) {
this.doNormalize = doNormalize;
if (op == null) {
this.opId = countOrId;
return;
}this.xyzOriginal = op.xyzOriginal;
this.xyz = op.xyz;
this.opId = op.opId;
this.modDim = op.modDim;
this.myLabels = op.myLabels;
this.index = op.index;
this.linearRotTrans = op.linearRotTrans;
this.sigma = op.sigma;
this.subsystemCode = op.subsystemCode;
this.setMatrix (false);
if (!op.isFinalized) this.doFinalize ();
if (doNormalize && this.sigma == null) this.setOffset (atoms, atomIndex, countOrId);
}, "JS.SymmetryOperation,~A,~N,~N,~B");
Clazz.defineMethod (c$, "setGamma", 
 function (isReverse) {
var n = 3 + this.modDim;
var a = (this.rsvs =  new JU.Matrix (null, n + 1, n + 1)).getArray ();
var t =  Clazz.newDoubleArray (n, 0);
var pt = 0;
for (var i = 0; i < n; i++) {
for (var j = 0; j < n; j++) a[i][j] = this.linearRotTrans[pt++];

t[i] = (isReverse ? -1 : 1) * this.linearRotTrans[pt++];
}
a[n][n] = 1;
if (isReverse) this.rsvs = this.rsvs.inverse ();
for (var i = 0; i < n; i++) a[i][n] = t[i];

a = this.rsvs.getSubmatrix (0, 0, 3, 3).getArray ();
for (var i = 0; i < 3; i++) for (var j = 0; j < 4; j++) this.setElement (i, j, (j < 3 ? a[i][j] : t[i]));


this.setElement (3, 3, 1);
}, "~B");
Clazz.defineMethod (c$, "doFinalize", 
function () {
this.m03 /= 12;
this.m13 /= 12;
this.m23 /= 12;
if (this.modDim > 0) {
var a = this.rsvs.getArray ();
for (var i = a.length - 1; --i >= 0; ) a[i][3 + this.modDim] /= 12;

}this.isFinalized = true;
});
Clazz.defineMethod (c$, "getXyz", 
function (normalized) {
return (normalized && this.modDim == 0 || this.xyzOriginal == null ? this.xyz : this.xyzOriginal);
}, "~B");
Clazz.defineMethod (c$, "newPoint", 
function (atom1, atom2, x, y, z) {
this.rotTrans2 (atom1, atom2);
atom2.add3 (x, y, z);
}, "JU.P3,JU.P3,~N,~N,~N");
Clazz.defineMethod (c$, "dumpInfo", 
function () {
return "\n" + this.xyz + "\ninternal matrix representation:\n" + this.toString ();
});
c$.dumpSeitz = Clazz.defineMethod (c$, "dumpSeitz", 
function (s) {
return  new JU.SB ().append ("{\t").appendI (Clazz.floatToInt (s.m00)).append ("\t").appendI (Clazz.floatToInt (s.m01)).append ("\t").appendI (Clazz.floatToInt (s.m02)).append ("\t").append (JS.SymmetryOperation.twelfthsOf (s.m03)).append ("\t}\n").append ("{\t").appendI (Clazz.floatToInt (s.m10)).append ("\t").appendI (Clazz.floatToInt (s.m11)).append ("\t").appendI (Clazz.floatToInt (s.m12)).append ("\t").append (JS.SymmetryOperation.twelfthsOf (s.m13)).append ("\t}\n").append ("{\t").appendI (Clazz.floatToInt (s.m20)).append ("\t").appendI (Clazz.floatToInt (s.m21)).append ("\t").appendI (Clazz.floatToInt (s.m22)).append ("\t").append (JS.SymmetryOperation.twelfthsOf (s.m23)).append ("\t}\n").append ("{\t0\t0\t0\t1\t}\n").toString ();
}, "JU.M4");
c$.dumpCanonicalSeitz = Clazz.defineMethod (c$, "dumpCanonicalSeitz", 
function (s) {
return  new JU.SB ().append ("{\t").appendI (Clazz.floatToInt (s.m00)).append ("\t").appendI (Clazz.floatToInt (s.m01)).append ("\t").appendI (Clazz.floatToInt (s.m02)).append ("\t").append (JS.SymmetryOperation.twelfthsOf ((s.m03 + 12) % 12)).append ("\t}\n").append ("{\t").appendI (Clazz.floatToInt (s.m10)).append ("\t").appendI (Clazz.floatToInt (s.m11)).append ("\t").appendI (Clazz.floatToInt (s.m12)).append ("\t").append (JS.SymmetryOperation.twelfthsOf ((s.m13 + 12) % 12)).append ("\t}\n").append ("{\t").appendI (Clazz.floatToInt (s.m20)).append ("\t").appendI (Clazz.floatToInt (s.m21)).append ("\t").appendI (Clazz.floatToInt (s.m22)).append ("\t").append (JS.SymmetryOperation.twelfthsOf ((s.m23 + 12) % 12)).append ("\t}\n").append ("{\t0\t0\t0\t1\t}\n").toString ();
}, "JU.M4");
Clazz.defineMethod (c$, "setMatrixFromXYZ", 
function (xyz, modDim, allowScaling) {
if (xyz == null) return false;
this.xyzOriginal = xyz;
xyz = xyz.toLowerCase ();
var n = (modDim + 4) * (modDim + 4);
this.modDim = modDim;
if (modDim > 0) this.myLabels = JS.SymmetryOperation.labelsXn;
this.linearRotTrans =  Clazz.newFloatArray (n, 0);
var isReverse = (xyz.startsWith ("!"));
if (isReverse) xyz = xyz.substring (1);
if (xyz.indexOf ("xyz matrix:") == 0) {
this.xyz = xyz;
JU.Parser.parseStringInfestedFloatArray (xyz, null, this.linearRotTrans);
return this.setFromMatrix (null, isReverse);
}if (xyz.indexOf ("[[") == 0) {
xyz = xyz.$replace ('[', ' ').$replace (']', ' ').$replace (',', ' ');
JU.Parser.parseStringInfestedFloatArray (xyz, null, this.linearRotTrans);
for (var i = 0; i < n; i++) {
var v = this.linearRotTrans[i];
if (Float.isNaN (v)) return false;
}
this.setMatrix (isReverse);
this.isFinalized = true;
this.isBio = (xyz.indexOf ("bio") >= 0);
this.xyz = (this.isBio ? this.toString () : JS.SymmetryOperation.getXYZFromMatrix (this, false, false, false));
return true;
}var strOut = JS.SymmetryOperation.getMatrixFromString (this, xyz, this.linearRotTrans, allowScaling);
if (strOut == null) return false;
this.setMatrix (isReverse);
this.xyz = (isReverse ? JS.SymmetryOperation.getXYZFromMatrix (this, true, false, false) : strOut);
if (JU.Logger.debugging) JU.Logger.debug ("" + this);
return true;
}, "~S,~N,~B");
Clazz.defineMethod (c$, "setMatrix", 
 function (isReverse) {
if (this.linearRotTrans.length > 16) {
this.setGamma (isReverse);
} else {
this.setA (this.linearRotTrans);
if (isReverse) this.invertM (this);
}}, "~B");
Clazz.defineMethod (c$, "setFromMatrix", 
function (offset, isReverse) {
var v = 0;
var pt = 0;
this.myLabels = (this.modDim == 0 ? JS.SymmetryOperation.labelsXYZ : JS.SymmetryOperation.labelsXn);
var rowPt = 0;
var n = 3 + this.modDim;
for (var i = 0; rowPt < n; i++) {
if (Float.isNaN (this.linearRotTrans[i])) return false;
v = this.linearRotTrans[i];
if (Math.abs (v) < 0.00001) v = 0;
var isTrans = ((i + 1) % (n + 1) == 0);
if (isTrans) {
if (offset != null) {
v /= 12;
if (pt < offset.length) v += offset[pt++];
}v = JS.SymmetryOperation.normalizeTwelfths ((v < 0 ? -1 : 1) * Math.round (Math.abs (v * 12)) / 12, this.doNormalize);
rowPt++;
}this.linearRotTrans[i] = v;
}
this.linearRotTrans[this.linearRotTrans.length - 1] = 1;
this.setMatrix (isReverse);
this.isFinalized = (offset == null);
this.xyz = JS.SymmetryOperation.getXYZFromMatrix (this, true, false, false);
return true;
}, "~A,~B");
c$.getMatrixFromString = Clazz.defineMethod (c$, "getMatrixFromString", 
function (op, xyz, linearRotTrans, allowScaling) {
var isDenominator = false;
var isDecimal = false;
var isNegative = false;
var modDim = (op == null ? 0 : op.modDim);
var nRows = 4 + modDim;
var doNormalize = (op != null && op.doNormalize);
linearRotTrans[linearRotTrans.length - 1] = 1;
var myLabels = (op == null || modDim == 0 ? null : op.myLabels);
if (myLabels == null) myLabels = JS.SymmetryOperation.labelsXYZ;
xyz = xyz.toLowerCase ();
xyz += ",";
if (modDim > 0) for (var i = modDim + 3; --i >= 0; ) xyz = JU.PT.rep (xyz, JS.SymmetryOperation.labelsXn[i], JS.SymmetryOperation.labelsXnSub[i]);

var tpt0 = 0;
var rowPt = 0;
var ch;
var iValue = 0;
var decimalMultiplier = 1;
var strT = "";
var strOut = "";
for (var i = 0; i < xyz.length; i++) {
switch (ch = xyz.charAt (i)) {
case '\'':
case ' ':
case '{':
case '}':
case '!':
continue;
case '-':
isNegative = true;
continue;
case '+':
isNegative = false;
continue;
case '/':
isDenominator = true;
continue;
case 'x':
case 'y':
case 'z':
case 'a':
case 'b':
case 'c':
case 'd':
case 'e':
case 'f':
case 'g':
case 'h':
var val = (isNegative ? -1 : 1);
if (allowScaling && iValue != 0) {
val = Clazz.floatToInt (iValue);
iValue = 0;
}tpt0 = rowPt * nRows;
var ipt = (ch >= 'x' ? ch.charCodeAt (0) - 120 : ch.charCodeAt (0) - 97 + 3);
linearRotTrans[tpt0 + ipt] = val;
strT += JS.SymmetryOperation.plusMinus (strT, val, myLabels[ipt]);
break;
case ',':
iValue = JS.SymmetryOperation.normalizeTwelfths (iValue, doNormalize);
linearRotTrans[tpt0 + nRows - 1] = iValue;
strT += JS.SymmetryOperation.xyzFraction (iValue, false, true);
strOut += (strOut === "" ? "" : ",") + strT;
if (rowPt == nRows - 2) return strOut;
iValue = 0;
strT = "";
if (rowPt++ > 2 && modDim == 0) {
JU.Logger.warn ("Symmetry Operation? " + xyz);
return null;
}break;
case '.':
isDecimal = true;
decimalMultiplier = 1;
continue;
case '0':
if (!isDecimal && (isDenominator || !allowScaling)) continue;
default:
var ich = ch.charCodeAt (0) - 48;
if (isDecimal && ich >= 0 && ich <= 9) {
decimalMultiplier /= 10;
if (iValue < 0) isNegative = true;
iValue += decimalMultiplier * ich * (isNegative ? -1 : 1);
continue;
}if (ich >= 0 && ich <= 9) {
if (isDenominator) {
iValue /= ich;
} else {
iValue = iValue * 10 + (isNegative ? -1 : 1) * ich;
isNegative = false;
}} else {
JU.Logger.warn ("symmetry character?" + ch);
}}
isDecimal = isDenominator = isNegative = false;
}
return null;
}, "JS.SymmetryOperation,~S,~A,~B");
c$.xyzFraction = Clazz.defineMethod (c$, "xyzFraction", 
 function (n12ths, allPositive, halfOrLess) {
n12ths = Math.round (n12ths);
if (allPositive) {
while (n12ths < 0) n12ths += 12;

} else if (halfOrLess) {
while (n12ths > 6) n12ths -= 12;

while (n12ths < -6.0) n12ths += 12;

}var s = JS.SymmetryOperation.twelfthsOf (n12ths);
return (s.charAt (0) == '0' ? "" : n12ths > 0 ? "+" + s : s);
}, "~N,~B,~B");
c$.twelfthsOf = Clazz.defineMethod (c$, "twelfthsOf", 
 function (n12ths) {
var str = "";
var i12ths = Math.round (n12ths);
if (i12ths == 12) return "1";
if (i12ths == -12) return "-1";
if (i12ths < 0) {
i12ths = -i12ths;
if (i12ths % 12 != 0) str = "-";
}var n = Clazz.doubleToInt (i12ths / 12);
if (n < 1) return str + JS.SymmetryOperation.twelfths[i12ths % 12];
var m = 0;
switch (i12ths % 12) {
case 0:
return str + n;
case 1:
case 5:
case 7:
case 11:
m = 12;
break;
case 2:
case 10:
m = 6;
break;
case 3:
case 9:
m = 4;
break;
case 4:
case 8:
m = 3;
break;
case 6:
m = 2;
break;
}
return str + (Clazz.doubleToInt (i12ths * m / 12)) + "/" + m;
}, "~N");
c$.plusMinus = Clazz.defineMethod (c$, "plusMinus", 
 function (strT, x, sx) {
return (x == 0 ? "" : (x < 0 ? "-" : strT.length == 0 ? "" : "+") + (x == 1 || x == -1 ? "" : "" + Clazz.floatToInt (Math.abs (x))) + sx);
}, "~S,~N,~S");
c$.normalizeTwelfths = Clazz.defineMethod (c$, "normalizeTwelfths", 
 function (iValue, doNormalize) {
iValue *= 12;
if (doNormalize) {
while (iValue > 6) iValue -= 12;

while (iValue <= -6) iValue += 12;

}return iValue;
}, "~N,~B");
c$.getXYZFromMatrix = Clazz.defineMethod (c$, "getXYZFromMatrix", 
function (mat, is12ths, allPositive, halfOrLess) {
var str = "";
var op = (Clazz.instanceOf (mat, JS.SymmetryOperation) ? mat : null);
if (op != null && op.modDim > 0) return JS.SymmetryOperation.getXYZFromRsVs (op.rsvs.getRotation (), op.rsvs.getTranslation (), is12ths);
var row =  Clazz.newFloatArray (4, 0);
for (var i = 0; i < 3; i++) {
var lpt = (i < 3 ? 0 : 3);
mat.getRow (i, row);
var term = "";
for (var j = 0; j < 3; j++) if (row[j] != 0) term += JS.SymmetryOperation.plusMinus (term, row[j], JS.SymmetryOperation.labelsXYZ[j + lpt]);

term += JS.SymmetryOperation.xyzFraction ((is12ths ? row[3] : row[3] * 12), allPositive, halfOrLess);
str += "," + term;
}
return str.substring (1);
}, "JU.M4,~B,~B,~B");
Clazz.defineMethod (c$, "setOffset", 
 function (atoms, atomIndex, count) {
var i1 = atomIndex;
var i2 = i1 + count;
var x = 0;
var y = 0;
var z = 0;
if (this.atomTest == null) this.atomTest =  new JU.P3 ();
for (var i = i1; i < i2; i++) {
this.newPoint (atoms[i], this.atomTest, 0, 0, 0);
x += this.atomTest.x;
y += this.atomTest.y;
z += this.atomTest.z;
}
while (x < -0.001 || x >= count + 0.001) {
this.m03 += (x < 0 ? 1 : -1);
x += (x < 0 ? count : -count);
}
while (y < -0.001 || y >= count + 0.001) {
this.m13 += (y < 0 ? 1 : -1);
y += (y < 0 ? count : -count);
}
while (z < -0.001 || z >= count + 0.001) {
this.m23 += (z < 0 ? 1 : -1);
z += (z < 0 ? count : -count);
}
}, "~A,~N,~N");
Clazz.defineMethod (c$, "rotateAxes", 
function (vectors, unitcell, ptTemp, mTemp) {
var vRot =  new Array (3);
this.getRotationScale (mTemp);
for (var i = vectors.length; --i >= 0; ) {
ptTemp.setT (vectors[i]);
unitcell.toFractional (ptTemp, true);
mTemp.rotate (ptTemp);
unitcell.toCartesian (ptTemp, true);
vRot[i] = JU.V3.newV (ptTemp);
}
return vRot;
}, "~A,JS.UnitCell,JU.P3,JU.M3");
Clazz.defineMethod (c$, "getDescription", 
function (modelSet, uc, pt00, ptTarget, id) {
if (!this.isFinalized) this.doFinalize ();
var vtemp =  new JU.V3 ();
var ptemp =  new JU.P3 ();
var pt01 =  new JU.P3 ();
var pt02 =  new JU.P3 ();
var pt03 =  new JU.P3 ();
var ftrans =  new JU.V3 ();
var vtrans =  new JU.V3 ();
var xyz = (this.isBio ? this.xyzOriginal : JS.SymmetryOperation.getXYZFromMatrix (this, false, false, false));
var typeOnly = (id == null);
if (pt00 == null || Float.isNaN (pt00.x)) pt00 =  new JU.P3 ();
if (ptTarget != null) {
pt01.setT (pt00);
pt02.setT (ptTarget);
uc.toUnitCell (pt01, ptemp);
uc.toUnitCell (pt02, ptemp);
uc.toFractional (pt01, false);
this.rotTrans (pt01);
uc.toCartesian (pt01, false);
uc.toUnitCell (pt01, ptemp);
if (pt01.distance (pt02) > 0.1) return null;
pt01.setT (pt00);
pt02.setT (ptTarget);
uc.toFractional (pt01, false);
uc.toFractional (pt02, false);
this.rotTrans (pt01);
vtrans.sub2 (pt02, pt01);
pt01.set (0, 0, 0);
pt02.set (0, 0, 0);
}pt01.x = pt02.y = pt03.z = 1;
pt01.add (pt00);
pt02.add (pt00);
pt03.add (pt00);
var p0 = JU.P3.newP (pt00);
var p1 = JU.P3.newP (pt01);
var p2 = JU.P3.newP (pt02);
var p3 = JU.P3.newP (pt03);
uc.toFractional (p0, false);
uc.toFractional (p1, false);
uc.toFractional (p2, false);
uc.toFractional (p3, false);
this.rotTrans2 (p0, p0);
this.rotTrans2 (p1, p1);
this.rotTrans2 (p2, p2);
this.rotTrans2 (p3, p3);
p0.add (vtrans);
p1.add (vtrans);
p2.add (vtrans);
p3.add (vtrans);
JS.SymmetryOperation.approx (vtrans);
uc.toCartesian (p0, false);
uc.toCartesian (p1, false);
uc.toCartesian (p2, false);
uc.toCartesian (p3, false);
var v01 =  new JU.V3 ();
v01.sub2 (p1, p0);
var v02 =  new JU.V3 ();
v02.sub2 (p2, p0);
var v03 =  new JU.V3 ();
v03.sub2 (p3, p0);
vtemp.cross (v01, v02);
var haveinversion = (vtemp.dot (v03) < 0);
if (haveinversion) {
p1.scaleAdd2 (-2, v01, p1);
p2.scaleAdd2 (-2, v02, p2);
p3.scaleAdd2 (-2, v03, p3);
}var info;
info = JU.Measure.computeHelicalAxis (null, 135266306, pt00, p0, JU.Quat.getQuaternionFrame (p0, p1, p2).div (JU.Quat.getQuaternionFrame (pt00, pt01, pt02)));
var pa1 = info[0];
var ax1 = info[1];
var ang1 = Clazz.floatToInt (Math.abs (JU.PT.approx ((info[3]).x, 1)));
var pitch1 = JS.SymmetryOperation.approxF ((info[3]).y);
if (haveinversion) {
p1.scaleAdd2 (2, v01, p1);
p2.scaleAdd2 (2, v02, p2);
p3.scaleAdd2 (2, v03, p3);
}var trans = JU.V3.newVsub (p0, pt00);
if (trans.length () < 0.1) trans = null;
var ptinv = null;
var ipt = null;
var pt0 = null;
var istranslation = (ang1 == 0);
var isrotation = !istranslation;
var isinversion = false;
var ismirrorplane = false;
if (isrotation || haveinversion) trans = null;
if (haveinversion && istranslation) {
ipt = JU.P3.newP (pt00);
ipt.add (p0);
ipt.scale (0.5);
ptinv = p0;
isinversion = true;
} else if (haveinversion) {
var d = (pitch1 == 0 ?  new JU.V3 () : ax1);
var f = 0;
switch (ang1) {
case 60:
f = 0.6666667;
break;
case 120:
f = 2;
break;
case 90:
f = 1;
break;
case 180:
pt0 = JU.P3.newP (pt00);
pt0.add (d);
pa1.scaleAdd2 (0.5, d, pt00);
if (pt0.distance (p0) > 0.1) {
trans = JU.V3.newVsub (p0, pt0);
ptemp.setT (trans);
uc.toFractional (ptemp, false);
ftrans.setT (ptemp);
} else {
trans = null;
}isrotation = false;
haveinversion = false;
ismirrorplane = true;
}
if (f != 0) {
vtemp.sub2 (pt00, pa1);
vtemp.add (p0);
vtemp.sub (pa1);
vtemp.sub (d);
vtemp.scale (f);
pa1.add (vtemp);
ipt =  new JU.P3 ();
ipt.scaleAdd2 (0.5, d, pa1);
ptinv =  new JU.P3 ();
ptinv.scaleAdd2 (-2, ipt, pt00);
ptinv.scale (-1);
}} else if (trans != null) {
ptemp.setT (trans);
uc.toFractional (ptemp, false);
if (JS.SymmetryOperation.approxF (ptemp.x) == 1) {
ptemp.x = 0;
}if (JS.SymmetryOperation.approxF (ptemp.y) == 1) {
ptemp.y = 0;
}if (JS.SymmetryOperation.approxF (ptemp.z) == 1) {
ptemp.z = 0;
}ftrans.setT (ptemp);
uc.toCartesian (ptemp, false);
trans.setT (ptemp);
}var ang = ang1;
JS.SymmetryOperation.approx0 (ax1);
if (isrotation) {
var pt1 =  new JU.P3 ();
vtemp.setT (ax1);
var ang2 = ang1;
if (haveinversion) {
pt1.add2 (pa1, vtemp);
ang2 = Math.round (JU.Measure.computeTorsion (ptinv, pa1, pt1, p0, true));
} else if (pitch1 == 0) {
pt1.setT (pa1);
ptemp.scaleAdd2 (1, pt1, vtemp);
ang2 = Math.round (JU.Measure.computeTorsion (pt00, pa1, ptemp, p0, true));
} else {
ptemp.add2 (pa1, vtemp);
pt1.scaleAdd2 (0.5, vtemp, pa1);
ang2 = Math.round (JU.Measure.computeTorsion (pt00, pa1, ptemp, p0, true));
}if (ang2 != 0) ang1 = ang2;
}if (isrotation && !haveinversion && pitch1 == 0) {
if (ax1.z < 0 || ax1.z == 0 && (ax1.y < 0 || ax1.y == 0 && ax1.x < 0)) {
ax1.scale (-1);
ang1 = -ang1;
}}var info1 = "identity";
var draw1 =  new JU.SB ();
var drawid;
if (isinversion) {
ptemp.setT (ipt);
uc.toFractional (ptemp, false);
info1 = "inversion center|" + this.coord (ptemp);
} else if (isrotation) {
if (haveinversion) {
info1 = "" + (Clazz.doubleToInt (360 / ang)) + "-bar axis";
} else if (pitch1 != 0) {
info1 = "" + (Clazz.doubleToInt (360 / ang)) + "-fold screw axis";
ptemp.setT (ax1);
uc.toFractional (ptemp, false);
info1 += "|translation: " + this.coord (ptemp);
} else {
info1 = "C" + (Clazz.doubleToInt (360 / ang)) + " axis";
}} else if (trans != null) {
var s = " " + this.coord (ftrans);
if (istranslation) {
info1 = "translation:" + s;
} else if (ismirrorplane) {
var fx = JS.SymmetryOperation.approxF (ftrans.x);
var fy = JS.SymmetryOperation.approxF (ftrans.y);
var fz = JS.SymmetryOperation.approxF (ftrans.z);
s = " " + this.coord (ftrans);
if (fx != 0 && fy != 0 && fz != 0) info1 = "d-";
 else if (fx != 0 && fy != 0 || fy != 0 && fz != 0 || fz != 0 && fx != 0) info1 = "n-";
 else if (fx != 0) info1 = "a-";
 else if (fy != 0) info1 = "b-";
 else info1 = "c-";
info1 += "glide plane |translation:" + s;
}} else if (ismirrorplane) {
info1 = "mirror plane";
}if (haveinversion && !isinversion) {
ptemp.setT (ipt);
uc.toFractional (ptemp, false);
info1 += "|inversion center at " + this.coord (ptemp);
}var cmds = null;
if (!typeOnly) {
drawid = "\ndraw ID " + id + "_";
draw1 =  new JU.SB ();
draw1.append (("// " + this.xyzOriginal + "|" + xyz + "|" + info1).$replace ('\n', ' ')).append ("\n");
draw1.append (drawid).append ("* delete");
JS.SymmetryOperation.drawLine (draw1, drawid + "frame1X", 0.15, pt00, pt01, "red");
JS.SymmetryOperation.drawLine (draw1, drawid + "frame1Y", 0.15, pt00, pt02, "green");
JS.SymmetryOperation.drawLine (draw1, drawid + "frame1Z", 0.15, pt00, pt03, "blue");
ptemp.sub2 (p1, p0);
ptemp.scaleAdd2 (0.9, ptemp, p0);
JS.SymmetryOperation.drawLine (draw1, drawid + "frame2X", 0.2, p0, ptemp, "red");
ptemp.sub2 (p2, p0);
ptemp.scaleAdd2 (0.9, ptemp, p0);
JS.SymmetryOperation.drawLine (draw1, drawid + "frame2Y", 0.2, p0, ptemp, "green");
ptemp.sub2 (p3, p0);
ptemp.scaleAdd2 (0.9, ptemp, p0);
JS.SymmetryOperation.drawLine (draw1, drawid + "frame2Z", 0.2, p0, ptemp, "purple");
var color;
if (isrotation) {
var pt1 =  new JU.P3 ();
color = "red";
ang = ang1;
var scale = 1.0;
vtemp.setT (ax1);
if (haveinversion) {
pt1.add2 (pa1, vtemp);
if (pitch1 == 0) {
pt1.setT (ipt);
vtemp.scale (3);
ptemp.scaleAdd2 (-1, vtemp, pa1);
draw1.append (drawid).append ("rotVector2 diameter 0.1 ").append (JU.Escape.eP (pa1)).append (JU.Escape.eP (ptemp)).append (" color red");
}scale = p0.distance (pt1);
draw1.append (drawid).append ("rotLine1 ").append (JU.Escape.eP (pt1)).append (JU.Escape.eP (ptinv)).append (" color red");
draw1.append (drawid).append ("rotLine2 ").append (JU.Escape.eP (pt1)).append (JU.Escape.eP (p0)).append (" color red");
} else if (pitch1 == 0) {
var isSpecial = (pt00.distance (p0) < 0.2);
if (!isSpecial) {
draw1.append (drawid).append ("rotLine1 ").append (JU.Escape.eP (pt00)).append (JU.Escape.eP (pa1)).append (" color red");
draw1.append (drawid).append ("rotLine2 ").append (JU.Escape.eP (p0)).append (JU.Escape.eP (pa1)).append (" color red");
}vtemp.scale (3);
ptemp.scaleAdd2 (-1, vtemp, pa1);
draw1.append (drawid).append ("rotVector2 diameter 0.1 ").append (JU.Escape.eP (pa1)).append (JU.Escape.eP (ptemp)).append (" color red");
pt1.setT (pa1);
if (pitch1 == 0 && pt00.distance (p0) < 0.2) pt1.scaleAdd2 (0.5, pt1, vtemp);
} else {
color = "orange";
draw1.append (drawid).append ("rotLine1 ").append (JU.Escape.eP (pt00)).append (JU.Escape.eP (pa1)).append (" color red");
ptemp.add2 (pa1, vtemp);
draw1.append (drawid).append ("rotLine2 ").append (JU.Escape.eP (p0)).append (JU.Escape.eP (ptemp)).append (" color red");
pt1.scaleAdd2 (0.5, vtemp, pa1);
}ptemp.add2 (pt1, vtemp);
if (haveinversion && pitch1 != 0) {
draw1.append (drawid).append ("rotRotLine1").append (JU.Escape.eP (pt1)).append (JU.Escape.eP (ptinv)).append (" color red");
draw1.append (drawid).append ("rotRotLine2").append (JU.Escape.eP (pt1)).append (JU.Escape.eP (p0)).append (" color red");
}draw1.append (drawid).append ("rotRotArrow arrow width 0.10 scale " + scale + " arc ").append (JU.Escape.eP (pt1)).append (JU.Escape.eP (ptemp));
ptemp.setT (haveinversion ? ptinv : pt00);
if (ptemp.distance (p0) < 0.1) ptemp.set (Math.random (), Math.random (), Math.random ());
draw1.append (JU.Escape.eP (ptemp));
ptemp.set (0, ang, 0);
draw1.append (JU.Escape.eP (ptemp)).append (" color red");
draw1.append (drawid).append ("rotVector1 vector diameter 0.1 ").append (JU.Escape.eP (pa1)).append (JU.Escape.eP (vtemp)).append ("color ").append (color);
}if (ismirrorplane) {
if (pt00.distance (pt0) > 0.2) draw1.append (drawid).append ("planeVector arrow ").append (JU.Escape.eP (pt00)).append (JU.Escape.eP (pt0)).append (" color indigo");
if (trans != null) {
ptemp.scaleAdd2 (-1, p0, p1);
ptemp.add (pt0);
JS.SymmetryOperation.drawLine (draw1, drawid + "planeFrameX", 0.15, pt0, ptemp, "translucent red");
ptemp.scaleAdd2 (-1, p0, p2);
ptemp.add (pt0);
JS.SymmetryOperation.drawLine (draw1, drawid + "planeFrameY", 0.15, pt0, ptemp, "translucent green");
ptemp.scaleAdd2 (-1, p0, p3);
ptemp.add (pt0);
JS.SymmetryOperation.drawLine (draw1, drawid + "planeFrameZ", 0.15, pt0, ptemp, "translucent blue");
}color = (trans == null ? "green" : "blue");
vtemp.setT (ax1);
vtemp.normalize ();
var w = -vtemp.x * pa1.x - vtemp.y * pa1.y - vtemp.z * pa1.z;
var plane = JU.P4.new4 (vtemp.x, vtemp.y, vtemp.z, w);
var v =  new JU.Lst ();
v.addLast (uc.getCanonicalCopy (1.05, false));
modelSet.intersectPlane (plane, v, 3);
for (var i = v.size (); --i >= 0; ) {
var pts = v.get (i);
draw1.append (drawid).append ("planep").appendI (i).append (" ").append (JU.Escape.eP (pts[0])).append (JU.Escape.eP (pts[1]));
if (pts.length == 3) draw1.append (JU.Escape.eP (pts[2]));
draw1.append (" color translucent ").append (color);
}
if (v.size () == 0) {
ptemp.add2 (pa1, ax1);
draw1.append (drawid).append ("planeCircle scale 2.0 circle ").append (JU.Escape.eP (pa1)).append (JU.Escape.eP (ptemp)).append (" color translucent ").append (color).append (" mesh fill");
}}if (haveinversion) {
draw1.append (drawid).append ("invPoint diameter 0.4 ").append (JU.Escape.eP (ipt));
draw1.append (drawid).append ("invArrow arrow ").append (JU.Escape.eP (pt00)).append (JU.Escape.eP (ptinv)).append (" color indigo");
if (!isinversion) {
ptemp.add2 (ptinv, pt00);
ptemp.sub (pt01);
JS.SymmetryOperation.drawLine (draw1, drawid + "invFrameX", 0.15, ptinv, ptemp, "translucent red");
ptemp.add2 (ptinv, pt00);
ptemp.sub (pt02);
JS.SymmetryOperation.drawLine (draw1, drawid + "invFrameY", 0.15, ptinv, ptemp, "translucent green");
ptemp.add2 (ptinv, pt00);
ptemp.sub (pt03);
JS.SymmetryOperation.drawLine (draw1, drawid + "invFrameZ", 0.15, ptinv, ptemp, "translucent blue");
}}if (trans != null) {
if (pt0 == null) pt0 = JU.P3.newP (pt00);
draw1.append (drawid).append ("transVector vector ").append (JU.Escape.eP (pt0)).append (JU.Escape.eP (trans));
}draw1.append ("\nvar pt00 = " + JU.Escape.eP (pt00));
draw1.append ("\nvar p0 = " + JU.Escape.eP (p0));
draw1.append ("\nif (within(0.2,p0).length == 0) {");
draw1.append ("\nvar set2 = within(0.2,p0.uxyz.xyz)");
draw1.append ("\nif (set2) {");
draw1.append (drawid).append ("cellOffsetVector arrow @p0 @set2 color grey");
draw1.append (drawid).append ("offsetFrameX diameter 0.20 @{set2.xyz} @{set2.xyz + ").append (JU.Escape.eP (v01)).append ("*0.9} color red");
draw1.append (drawid).append ("offsetFrameY diameter 0.20 @{set2.xyz} @{set2.xyz + ").append (JU.Escape.eP (v02)).append ("*0.9} color green");
draw1.append (drawid).append ("offsetFrameZ diameter 0.20 @{set2.xyz} @{set2.xyz + ").append (JU.Escape.eP (v03)).append ("*0.9} color purple");
draw1.append ("\n}}\n");
cmds = draw1.toString ();
draw1 = null;
drawid = null;
}if (trans == null) ftrans = null;
if (isrotation) {
if (haveinversion) {
} else if (pitch1 == 0) {
} else {
trans = JU.V3.newV (ax1);
ptemp.setT (trans);
uc.toFractional (ptemp, false);
ftrans = JU.V3.newV (ptemp);
}}if (ismirrorplane) {
ang1 = 0;
}if (haveinversion) {
if (isinversion) {
pa1 = null;
ax1 = null;
trans = null;
ftrans = null;
}} else if (istranslation) {
pa1 = null;
ax1 = null;
}if (ax1 != null) ax1.normalize ();
var m2 = null;
m2 = JU.M4.newM4 (this);
if (vtrans.length () != 0) {
m2.m03 += vtrans.x;
m2.m13 += vtrans.y;
m2.m23 += vtrans.z;
}xyz = (this.isBio ? m2.toString () : JS.SymmetryOperation.getXYZFromMatrix (m2, false, false, false));
return [xyz, this.xyzOriginal, info1, cmds, JS.SymmetryOperation.approx0 (ftrans), JS.SymmetryOperation.approx0 (trans), JS.SymmetryOperation.approx0 (ipt), JS.SymmetryOperation.approx0 (pa1), JS.SymmetryOperation.approx0 (ax1), Integer.$valueOf (ang1), m2, vtrans];
}, "JM.ModelSet,J.api.SymmetryInterface,JU.P3,JU.P3,~S");
Clazz.defineMethod (c$, "coord", 
 function (p) {
JS.SymmetryOperation.approx0 (p);
return (this.isBio ? p.x + " " + p.y + " " + p.z : JS.SymmetryOperation.fcoord (p));
}, "JU.T3");
c$.drawLine = Clazz.defineMethod (c$, "drawLine", 
 function (s, id, diameter, pt0, pt1, color) {
s.append (id).append (" diameter ").appendF (diameter).append (JU.Escape.eP (pt0)).append (JU.Escape.eP (pt1)).append (" color ").append (color);
}, "JU.SB,~S,~N,JU.P3,JU.P3,~S");
c$.fcoord = Clazz.defineMethod (c$, "fcoord", 
function (p) {
return JS.SymmetryOperation.fc (p.x) + " " + JS.SymmetryOperation.fc (p.y) + " " + JS.SymmetryOperation.fc (p.z);
}, "JU.T3");
c$.fc = Clazz.defineMethod (c$, "fc", 
 function (x) {
var xabs = Math.abs (x);
var x24 = Clazz.floatToInt (JS.SymmetryOperation.approxF (xabs * 24));
var m = (x < 0 ? "-" : "");
if (x24 % 8 != 0) return m + JS.SymmetryOperation.twelfthsOf (x24 >> 1);
return (x24 == 0 ? "0" : x24 == 24 ? m + "1" : m + (Clazz.doubleToInt (x24 / 8)) + "/3");
}, "~N");
c$.approx0 = Clazz.defineMethod (c$, "approx0", 
 function (pt) {
if (pt != null) {
if (Math.abs (pt.x) < 0.0001) pt.x = 0;
if (Math.abs (pt.y) < 0.0001) pt.y = 0;
if (Math.abs (pt.z) < 0.0001) pt.z = 0;
}return pt;
}, "JU.T3");
c$.approx = Clazz.defineMethod (c$, "approx", 
 function (pt) {
if (pt != null) {
pt.x = JS.SymmetryOperation.approxF (pt.x);
pt.y = JS.SymmetryOperation.approxF (pt.y);
pt.z = JS.SymmetryOperation.approxF (pt.z);
}return pt;
}, "JU.T3");
c$.approxF = Clazz.defineMethod (c$, "approxF", 
 function (f) {
return JU.PT.approx (f, 100);
}, "~N");
c$.normalizeTranslation = Clazz.defineMethod (c$, "normalizeTranslation", 
function (operation) {
operation.m03 = (Clazz.floatToInt (operation.m03) + 12) % 12;
operation.m13 = (Clazz.floatToInt (operation.m13) + 12) % 12;
operation.m23 = (Clazz.floatToInt (operation.m23) + 12) % 12;
}, "JU.M4");
c$.getXYZFromRsVs = Clazz.defineMethod (c$, "getXYZFromRsVs", 
function (rs, vs, is12ths) {
var ra = rs.getArray ();
var va = vs.getArray ();
var d = ra.length;
var s = "";
for (var i = 0; i < d; i++) {
s += ",";
for (var j = 0; j < d; j++) {
var r = ra[i][j];
if (r != 0) {
s += (r < 0 ? "-" : s.endsWith (",") ? "" : "+") + (Math.abs (r) == 1 ? "" : "" + Clazz.doubleToInt (Math.abs (r))) + "x" + (j + 1);
}}
s += JS.SymmetryOperation.xyzFraction (Clazz.doubleToInt (va[i][0] * (is12ths ? 1 : 12)), false, true);
}
return JU.PT.rep (s.substring (1), ",+", ",");
}, "JU.Matrix,JU.Matrix,~B");
Clazz.defineMethod (c$, "toString", 
function () {
return (this.rsvs == null ? Clazz.superCall (this, JS.SymmetryOperation, "toString", []) : Clazz.superCall (this, JS.SymmetryOperation, "toString", []) + " " + this.rsvs.toString ());
});
Clazz.defineStatics (c$,
"twelfths", ["0", "1/12", "1/6", "1/4", "1/3", "5/12", "1/2", "7/12", "2/3", "3/4", "5/6", "11/12"]);
c$.labelsXYZ = c$.prototype.labelsXYZ = ["x", "y", "z"];
c$.labelsXn = c$.prototype.labelsXn = ["x1", "x2", "x3", "x4", "x5", "x6", "x7", "x8", "x9", "x10", "x11", "x12", "x13"];
c$.labelsXnSub = c$.prototype.labelsXnSub = ["x", "y", "z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
});
