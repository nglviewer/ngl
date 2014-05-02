Clazz.declarePackage ("J.shape");
Clazz.load (["J.shape.FontLineShape"], "J.shape.Bbcage", null, function () {
c$ = Clazz.decorateAsClass (function () {
this.isVisible = false;
Clazz.instantialize (this, arguments);
}, J.shape, "Bbcage", J.shape.FontLineShape);
Clazz.overrideMethod (c$, "setProperty", 
function (propertyName, value, bs) {
this.setPropFLS (propertyName, value);
}, "~S,~O,JU.BS");
Clazz.defineMethod (c$, "initShape", 
function () {
Clazz.superCall (this, J.shape.Bbcage, "initShape", []);
this.font3d = this.gdata.getFont3D (14);
this.myType = "boundBox";
});
Clazz.overrideMethod (c$, "setVisibilityFlags", 
function (bs) {
this.isVisible = ((this.mad = this.vwr.getObjectMad (4)) != 0);
if (!this.isVisible) return;
var bboxModels = this.vwr.ms.getBoundBoxModels ();
if (bboxModels == null) return;
for (var i = bs.nextSetBit (0); i >= 0; i = bs.nextSetBit (i + 1)) if (bboxModels.get (i)) return;

this.isVisible = false;
}, "JU.BS");
});
