/**
 * @file Globals
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { getBrowser, getQuery, boolean, defaults } from "./utils.js";
import Registry from "./utils/registry.js";
import _GidPool from "./utils/gid-pool.js";
import _WorkerRegistry from "./worker/worker-registry.js";
import { ColorMakerRegistry as _ColorMakerRegistry } from "./utils/color-maker.js";
import { DatasourceRegistry as _DatasourceRegistry } from "./loader/datasource-utils.js";


var Browser = getBrowser();

var SupportsReadPixelsFloat = false;
function setSupportsReadPixelsFloat( value ){
    SupportsReadPixelsFloat = value;
}

var ExtensionFragDepth = false;
function setExtensionFragDepth( value ){
    ExtensionFragDepth = value;
}

var Log = {
    log: Function.prototype.bind.call( console.log, console ),
    info: Function.prototype.bind.call( console.info, console ),
    warn: Function.prototype.bind.call( console.warn, console ),
    error: Function.prototype.bind.call( console.error, console ),
    time: Function.prototype.bind.call( console.time, console ),
    timeEnd: Function.prototype.bind.call( console.timeEnd, console )
};

var Debug = boolean( getQuery( "debug" ) );
function setDebug( value ){
    Debug = value;
}

var GidPool = new _GidPool();

var WebglErrorMessage = "<div style=\"display:flex; align-items:center; justify-content:center; height:100%;\"><p style=\"padding:15px; text-align:center;\">Your browser/graphics card does not seem to support <a target=\"_blank\" href=\"https://en.wikipedia.org/wiki/WebGL\">WebGL</a>.<br /><br />Find out how to get it <a target=\"_blank\" href=\"http://get.webgl.org/\">here</a>.</p></div>";

var MainScriptFilePath = "../js/build/ngl.full.min.js";

var WorkerRegistry = new _WorkerRegistry();

var ColorMakerRegistry = new _ColorMakerRegistry();

var DatasourceRegistry = new _DatasourceRegistry();

var RepresentationRegistry = new Registry();

var ParserRegistry = new Registry();


export {
    Browser,
    SupportsReadPixelsFloat,
    setSupportsReadPixelsFloat,
    ExtensionFragDepth,
    setExtensionFragDepth,
    Log,
    GidPool,
    Debug,
    setDebug,
    WebglErrorMessage,
    MainScriptFilePath,
    WorkerRegistry,
    ColorMakerRegistry,
    DatasourceRegistry,
    RepresentationRegistry,
    ParserRegistry
};
