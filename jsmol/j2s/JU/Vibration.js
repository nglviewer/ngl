Clazz.declarePackage ("JU");
Clazz.load (["JU.V3"], "JU.Vibration", null, function () {
c$ = Clazz.declareType (JU, "Vibration", JU.V3);
Clazz.defineMethod (c$, "setTempPoint", 
function (pt, t456, scale, modulationScale) {
pt.scaleAdd2 ((Math.cos (t456.x * 6.283185307179586) * scale), this, pt);
}, "JU.T3,JU.T3,~N,~N");
Clazz.defineMethod (c$, "getInfo", 
function (info) {
info.put ("vibVector", JU.V3.newV (this));
}, "java.util.Map");
Clazz.defineMethod (c$, "getUnitCell", 
function () {
return null;
});
Clazz.defineStatics (c$,
"twoPI", 6.283185307179586);
});
