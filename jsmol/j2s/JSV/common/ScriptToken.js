Clazz.declarePackage ("JSV.common");
Clazz.load (["java.lang.Enum"], "JSV.common.ScriptToken", ["java.util.Hashtable", "JU.Lst", "$.PT", "$.SB", "JSV.common.ScriptTokenizer"], function () {
c$ = Clazz.decorateAsClass (function () {
this.tip = null;
Clazz.instantialize (this, arguments);
}, JSV.common, "ScriptToken", Enum);
Clazz.defineMethod (c$, "getTip", 
function () {
return "  " + (this.tip === "T" ? "TRUE/FALSE/TOGGLE" : this.tip === "TF" ? "TRUE or FALSE" : this.tip === "C" ? "<color>" : this.tip);
});
Clazz.makeConstructor (c$, 
 function () {
});
Clazz.makeConstructor (c$, 
 function (tip) {
this.tip = tip;
}, "~S");
c$.getScriptToken = Clazz.defineMethod (c$, "getScriptToken", 
function (name) {
if (JSV.common.ScriptToken.htParams == null) {
JSV.common.ScriptToken.htParams =  new java.util.Hashtable ();
for (var item, $item = 0, $$item = JSV.common.ScriptToken.values (); $item < $$item.length && ((item = $$item[$item]) || true); $item++) JSV.common.ScriptToken.htParams.put (item.name (), item);

}var st = JSV.common.ScriptToken.htParams.get (name.toUpperCase ());
return (st == null ? JSV.common.ScriptToken.UNKNOWN : st);
}, "~S");
c$.getScriptTokenList = Clazz.defineMethod (c$, "getScriptTokenList", 
function (name, isExact) {
name = name.toUpperCase ();
var list =  new JU.Lst ();
var st = JSV.common.ScriptToken.getScriptToken (name);
if (isExact) {
if (st != null) list.addLast (st);
} else {
for (var entry, $entry = JSV.common.ScriptToken.htParams.entrySet ().iterator (); $entry.hasNext () && ((entry = $entry.next ()) || true);) if (entry.getKey ().startsWith (name) && entry.getValue ().tip != null) list.addLast (entry.getValue ());

}return list;
}, "~S,~B");
c$.getValue = Clazz.defineMethod (c$, "getValue", 
function (st, params, cmd) {
if (!params.hasMoreTokens ()) return "";
switch (st) {
default:
return JSV.common.ScriptTokenizer.nextStringToken (params, true);
case JSV.common.ScriptToken.CLOSE:
case JSV.common.ScriptToken.GETPROPERTY:
case JSV.common.ScriptToken.INTEGRATION:
case JSV.common.ScriptToken.INTEGRATE:
case JSV.common.ScriptToken.JMOL:
case JSV.common.ScriptToken.LABEL:
case JSV.common.ScriptToken.LOAD:
case JSV.common.ScriptToken.PEAK:
case JSV.common.ScriptToken.PLOTCOLORS:
case JSV.common.ScriptToken.YSCALE:
case JSV.common.ScriptToken.WRITE:
return JSV.common.ScriptToken.removeCommandName (cmd);
case JSV.common.ScriptToken.SELECT:
case JSV.common.ScriptToken.OVERLAY:
case JSV.common.ScriptToken.VIEW:
case JSV.common.ScriptToken.ZOOM:
return JSV.common.ScriptToken.removeCommandName (cmd).$replace (',', ' ').trim ();
}
}, "JSV.common.ScriptToken,JSV.common.ScriptTokenizer,~S");
c$.removeCommandName = Clazz.defineMethod (c$, "removeCommandName", 
 function (cmd) {
var pt = cmd.indexOf (" ");
if (pt < 0) return "";
return cmd.substring (pt).trim ();
}, "~S");
c$.getKey = Clazz.defineMethod (c$, "getKey", 
function (eachParam) {
var key = eachParam.nextToken ();
if (key.startsWith ("#") || key.startsWith ("//")) return null;
if (key.equalsIgnoreCase ("SET")) key = eachParam.nextToken ();
return key.toUpperCase ();
}, "JSV.common.ScriptTokenizer");
c$.getTokens = Clazz.defineMethod (c$, "getTokens", 
function (value) {
if (value.startsWith ("'") && value.endsWith ("'")) value = "\"" + JU.PT.trim (value, "'") + "\"";
var tokens =  new JU.Lst ();
var st =  new JSV.common.ScriptTokenizer (value, false);
while (st.hasMoreTokens ()) {
var s = JSV.common.ScriptTokenizer.nextStringToken (st, false);
if (s.startsWith ("//") || s.startsWith ("#")) break;
tokens.addLast (s);
}
return tokens;
}, "~S");
c$.getNameList = Clazz.defineMethod (c$, "getNameList", 
function (list) {
if (list.size () == 0) return "";
var sb =  new JU.SB ();
for (var i = 0; i < list.size (); i++) sb.append (",").append (list.get (i).toString ());

return sb.toString ().substring (1);
}, "JU.Lst");
c$.htParams = null;
Clazz.defineEnumConstant (c$, "UNKNOWN", 0, []);
Clazz.defineEnumConstant (c$, "APPLETID", 1, []);
Clazz.defineEnumConstant (c$, "APPLETREADYCALLBACKFUNCTIONNAME", 2, []);
Clazz.defineEnumConstant (c$, "AUTOINTEGRATE", 3, ["TF"]);
Clazz.defineEnumConstant (c$, "BACKGROUNDCOLOR", 4, ["C"]);
Clazz.defineEnumConstant (c$, "CLOSE", 5, ["spectrumId or fileName or ALL or VIEWS or SIMULATIONS"]);
Clazz.defineEnumConstant (c$, "COMPOUNDMENUON", 6, ["TF"]);
Clazz.defineEnumConstant (c$, "COORDCALLBACKFUNCTIONNAME", 7, []);
Clazz.defineEnumConstant (c$, "COORDINATESCOLOR", 8, ["C"]);
Clazz.defineEnumConstant (c$, "COORDINATESON", 9, ["T"]);
Clazz.defineEnumConstant (c$, "DEBUG", 10, ["TF"]);
Clazz.defineEnumConstant (c$, "DEFAULTLOADSCRIPT", 11, ["\"script...\""]);
Clazz.defineEnumConstant (c$, "DEFAULTNMRNORMALIZATION", 12, ["maxYvalue"]);
Clazz.defineEnumConstant (c$, "DISPLAYFONTNAME", 13, ["fontName"]);
Clazz.defineEnumConstant (c$, "DISPLAY1D", 14, ["T"]);
Clazz.defineEnumConstant (c$, "DISPLAY2D", 15, ["T"]);
Clazz.defineEnumConstant (c$, "ENABLEZOOM", 16, ["T"]);
Clazz.defineEnumConstant (c$, "ENDINDEX", 17, []);
Clazz.defineEnumConstant (c$, "FINDX", 18, ["x-value"]);
Clazz.defineEnumConstant (c$, "GETPROPERTY", 19, ["[ALL] [propertyName]"]);
Clazz.defineEnumConstant (c$, "GETSOLUTIONCOLOR", 20, [" FILL or FILLNONE or FILLALL or FILLALLNONE"]);
Clazz.defineEnumConstant (c$, "GRIDCOLOR", 21, ["C"]);
Clazz.defineEnumConstant (c$, "GRIDON", 22, ["T"]);
Clazz.defineEnumConstant (c$, "HIDDEN", 23, ["TF"]);
Clazz.defineEnumConstant (c$, "HIGHLIGHTCOLOR", 24, ["C"]);
Clazz.defineEnumConstant (c$, "INTEGRALOFFSET", 25, ["percent"]);
Clazz.defineEnumConstant (c$, "INTEGRALRANGE", 26, ["percent"]);
Clazz.defineEnumConstant (c$, "INTEGRATE", 27, []);
Clazz.defineEnumConstant (c$, "INTEGRATION", 28, ["ON/OFF/AUTO/TOGGLE/MIN value/MARK ppm1-ppm2:norm,ppm3-ppm4,... (start with 0-0 to clear)"]);
Clazz.defineEnumConstant (c$, "INTEGRALPLOTCOLOR", 29, []);
Clazz.defineEnumConstant (c$, "INTEGRATIONRATIOS", 30, []);
Clazz.defineEnumConstant (c$, "INTERFACE", 31, []);
Clazz.defineEnumConstant (c$, "IRMODE", 32, ["A or T or TOGGLE"]);
Clazz.defineEnumConstant (c$, "JMOL", 33, ["...Jmol command..."]);
Clazz.defineEnumConstant (c$, "JSV", 34, []);
Clazz.defineEnumConstant (c$, "LABEL", 35, ["x y [color and/or \"text\"]"]);
Clazz.defineEnumConstant (c$, "LINK", 36, ["AB or ABC or NONE or ALL"]);
Clazz.defineEnumConstant (c$, "LOAD", 37, ["[APPEND] \"fileName\" [first] [last]; use \"\" to reload current file"]);
Clazz.defineEnumConstant (c$, "LOADFILECALLBACKFUNCTIONNAME", 38, []);
Clazz.defineEnumConstant (c$, "LOADIMAGINARY", 39, ["T/F - default is to NOT load imaginary spectra"]);
Clazz.defineEnumConstant (c$, "MENUON", 40, []);
Clazz.defineEnumConstant (c$, "OBSCURE", 41, []);
Clazz.defineEnumConstant (c$, "OVERLAY", 42, []);
Clazz.defineEnumConstant (c$, "OVERLAYSTACKED", 43, ["TF"]);
Clazz.defineEnumConstant (c$, "PEAK", 44, ["<type(IR,CNMR,HNMR,MS, etc)> id=xxx or \"match\" [ALL], for example: PEAK HNMR id=3"]);
Clazz.defineEnumConstant (c$, "PEAKCALLBACKFUNCTIONNAME", 45, []);
Clazz.defineEnumConstant (c$, "PEAKLIST", 46, [" Example: PEAKLIST threshold=20 [%, or include=10] skip=0 interpolate=parabolic [or NONE]"]);
Clazz.defineEnumConstant (c$, "PEAKTABCOLOR", 47, ["C"]);
Clazz.defineEnumConstant (c$, "PLOTAREACOLOR", 48, ["C"]);
Clazz.defineEnumConstant (c$, "PLOTCOLOR", 49, ["C"]);
Clazz.defineEnumConstant (c$, "PLOTCOLORS", 50, ["color,color,color,..."]);
Clazz.defineEnumConstant (c$, "PRINT", 51, []);
Clazz.defineEnumConstant (c$, "REVERSEPLOT", 52, ["T"]);
Clazz.defineEnumConstant (c$, "SCALEBY", 53, ["factor"]);
Clazz.defineEnumConstant (c$, "SCALECOLOR", 54, ["C"]);
Clazz.defineEnumConstant (c$, "SCRIPT", 55, ["filename.jsv"]);
Clazz.defineEnumConstant (c$, "SELECT", 56, ["spectrumID, spectrumID,..."]);
Clazz.defineEnumConstant (c$, "SETPEAK", 57, ["x (ppm) or NONE does peak search, unlike SETX -- NMR only"]);
Clazz.defineEnumConstant (c$, "SETX", 58, ["x (ppm) does no peak search, unlike SETPEAK -- NMR only"]);
Clazz.defineEnumConstant (c$, "SHIFTX", 59, ["dx (ppm) or NONE -- NMR only"]);
Clazz.defineEnumConstant (c$, "SHOWERRORS", 60, []);
Clazz.defineEnumConstant (c$, "SHOWINTEGRATION", 61, ["T"]);
Clazz.defineEnumConstant (c$, "SHOWKEY", 62, ["T"]);
Clazz.defineEnumConstant (c$, "SHOWMEASUREMENTS", 63, ["T"]);
Clazz.defineEnumConstant (c$, "SHOWMENU", 64, []);
Clazz.defineEnumConstant (c$, "SHOWPEAKLIST", 65, ["T"]);
Clazz.defineEnumConstant (c$, "SHOWPROPERTIES", 66, []);
Clazz.defineEnumConstant (c$, "SHOWSOURCE", 67, []);
Clazz.defineEnumConstant (c$, "SPECTRUM", 68, ["spectrumID"]);
Clazz.defineEnumConstant (c$, "SPECTRUMNUMBER", 69, []);
Clazz.defineEnumConstant (c$, "STACKOFFSETY", 70, ["percent"]);
Clazz.defineEnumConstant (c$, "STARTINDEX", 71, []);
Clazz.defineEnumConstant (c$, "SYNCCALLBACKFUNCTIONNAME", 72, []);
Clazz.defineEnumConstant (c$, "SYNCID", 73, []);
Clazz.defineEnumConstant (c$, "TEST", 74, []);
Clazz.defineEnumConstant (c$, "TITLEON", 75, ["T"]);
Clazz.defineEnumConstant (c$, "TITLEBOLDON", 76, ["T"]);
Clazz.defineEnumConstant (c$, "TITLECOLOR", 77, ["C"]);
Clazz.defineEnumConstant (c$, "TITLEFONTNAME", 78, ["fontName"]);
Clazz.defineEnumConstant (c$, "UNITSCOLOR", 79, ["C"]);
Clazz.defineEnumConstant (c$, "VERSION", 80, []);
Clazz.defineEnumConstant (c$, "VIEW", 81, ["spectrumID, spectrumID, ... Example: VIEW 3.1, 3.2  or  VIEW \"acetophenone\""]);
Clazz.defineEnumConstant (c$, "XSCALEON", 82, ["T"]);
Clazz.defineEnumConstant (c$, "XUNITSON", 83, ["T"]);
Clazz.defineEnumConstant (c$, "YSCALE", 84, ["[ALL] lowValue highValue"]);
Clazz.defineEnumConstant (c$, "YSCALEON", 85, ["T"]);
Clazz.defineEnumConstant (c$, "YUNITSON", 86, ["T"]);
Clazz.defineEnumConstant (c$, "WINDOW", 87, []);
Clazz.defineEnumConstant (c$, "WRITE", 88, ["[XY,DIF,DIFDUP,PAC,FIX,SQZ,AML,CML,JPG,PDF,PNG,SVG] \"filename\""]);
Clazz.defineEnumConstant (c$, "ZOOM", 89, ["OUT or x1,x2 or x1,y1 x2,y2"]);
Clazz.defineEnumConstant (c$, "ZOOMBOXCOLOR", 90, []);
Clazz.defineEnumConstant (c$, "ZOOMBOXCOLOR2", 91, []);
});
