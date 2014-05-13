Clazz.declarePackage ("JM");
Clazz.load (["JM.BioPolymer"], "JM.PhosphorusPolymer", null, function () {
c$ = Clazz.declareType (JM, "PhosphorusPolymer", JM.BioPolymer);
Clazz.defineMethod (c$, "getPdbData", 
function (vwr, ctype, qtype, mStep, derivType, bsAtoms, bsSelected, bothEnds, isDraw, addHeader, tokens, pdbATOM, pdbCONECT, bsWritten) {
JM.BioPolymer.getPdbData (vwr, this, ctype, qtype, mStep, derivType, bsAtoms, bsSelected, bothEnds, isDraw, addHeader, tokens, pdbATOM, pdbCONECT, bsWritten);
}, "JV.Viewer,~S,~S,~N,~N,JU.BS,JU.BS,~B,~B,~B,~A,JU.OC,JU.SB,JU.BS");
});
