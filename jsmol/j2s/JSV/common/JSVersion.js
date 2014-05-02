___date="$Date: 2014-02-11 07:36:18 -0600 (Tue, 11 Feb 2014) $"
___svnRev="$LastChangedRevision: 1528 $"
___version="2.1.1"
Clazz.declarePackage ("JSV.common");
c$ = Clazz.declareType (JSV.common, "JSVersion");
Clazz.defineStatics (c$,
"VERSION", null,
"VERSION_SHORT", null);
{
var tmpVersion = null;
var tmpDate = null;
var tmpSVN = null;
{
tmpVersion = self.___version; tmpDate = self.___date; tmpSVN =
self.___svnRev;
}if (tmpDate != null) tmpDate = tmpDate.substring (7, 23);
if (tmpSVN != null) tmpSVN = tmpSVN.substring (22, 27);
JSV.common.JSVersion.VERSION_SHORT = (tmpVersion != null ? tmpVersion : "(Unknown version)");
JSV.common.JSVersion.VERSION = JSV.common.JSVersion.VERSION_SHORT + "/SVN" + tmpSVN + "/" + (tmpDate != null ? tmpDate : "(Unknown date)");
}