Clazz.declarePackage ("J.renderspecial");
Clazz.load (["J.render.ShapeRenderer", "JU.P3", "$.P3i", "$.V3"], "J.renderspecial.VectorsRenderer", ["J.shape.Shape", "JU.Vibration"], function () {
c$ = Clazz.decorateAsClass (function () {
this.pointVectorEnd = null;
this.pointArrowHead = null;
this.screenVectorEnd = null;
this.screenArrowHead = null;
this.headOffsetVector = null;
this.diameter = 0;
this.headWidthPixels = 0;
this.vectorScale = 0;
this.vectorSymmetry = false;
this.headScale = 0;
this.doShaft = false;
this.vibTemp = null;
Clazz.instantialize (this, arguments);
}, J.renderspecial, "VectorsRenderer", J.render.ShapeRenderer);
Clazz.prepareFields (c$, function () {
this.pointVectorEnd =  new JU.P3 ();
this.pointArrowHead =  new JU.P3 ();
this.screenVectorEnd =  new JU.P3i ();
this.screenArrowHead =  new JU.P3i ();
this.headOffsetVector =  new JU.V3 ();
});
Clazz.overrideMethod (c$, "render", 
function () {
var vectors = this.shape;
if (!vectors.isActive) return false;
var mads = vectors.mads;
if (mads == null) return false;
var atoms = vectors.atoms;
var colixes = vectors.colixes;
var needTranslucent = false;
this.vectorScale = this.vwr.getFloat (1649410049);
this.vectorSymmetry = this.vwr.getBoolean (603979973);
for (var i = this.ms.getAtomCount (); --i >= 0; ) {
var atom = atoms[i];
if (!this.isVisibleForMe (atom)) continue;
var vibrationVector = this.vwr.getVibration (i);
if (vibrationVector == null) continue;
if (!this.transform (mads[i], atom, vibrationVector)) continue;
if (!this.g3d.setC (J.shape.Shape.getColix (colixes, i, atom))) {
needTranslucent = true;
continue;
}this.renderVector (atom);
if (this.vectorSymmetry) {
if (this.vibTemp == null) this.vibTemp =  new JU.Vibration ();
this.vibTemp.setT (vibrationVector);
this.vibTemp.scale (-1);
this.transform (mads[i], atom, this.vibTemp);
this.renderVector (atom);
}}
return needTranslucent;
});
Clazz.defineMethod (c$, "transform", 
 function (mad, atom, vibrationVector) {
var len = vibrationVector.length ();
if (Math.abs (len * this.vectorScale) < 0.01) return false;
this.headScale = -0.2;
if (this.vectorScale < 0) this.headScale = -this.headScale;
this.doShaft = (0.1 + Math.abs (this.headScale / len) < Math.abs (this.vectorScale));
this.headOffsetVector.setT (vibrationVector);
this.headOffsetVector.scale (this.headScale / len);
this.pointVectorEnd.scaleAdd2 (this.vectorScale, vibrationVector, atom);
this.pointArrowHead.add2 (this.pointVectorEnd, this.headOffsetVector);
this.screenArrowHead.setT (this.tm.transformPtVib (this.pointArrowHead, vibrationVector, this.vectorScale));
this.screenVectorEnd.setT (this.tm.transformPtVib (this.pointVectorEnd, vibrationVector, this.vectorScale));
this.diameter = Clazz.floatToInt (mad < 0 ? -mad : mad < 1 ? 1 : this.vwr.scaleToScreen (this.screenVectorEnd.z, mad));
this.headWidthPixels = this.diameter << 1;
if (this.headWidthPixels < this.diameter + 2) this.headWidthPixels = this.diameter + 2;
return true;
}, "~N,JM.Atom,JU.Vibration");
Clazz.defineMethod (c$, "renderVector", 
 function (atom) {
if (this.doShaft) this.g3d.fillCylinderScreen (1, this.diameter, atom.sX, atom.sY, atom.sZ, this.screenArrowHead.x, this.screenArrowHead.y, this.screenArrowHead.z);
this.g3d.fillConeScreen (2, this.headWidthPixels, this.screenArrowHead, this.screenVectorEnd, false);
}, "JM.Atom");
Clazz.defineStatics (c$,
"arrowHeadOffset", -0.2);
});
