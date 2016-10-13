/**
 * @file Globals
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { getBrowser, getQuery, boolean } from "./utils.js";
import Registry from "./utils/registry.js";
import _WorkerRegistry from "./worker/worker-registry.js";
import { ColorMakerRegistry as _ColorMakerRegistry } from "./utils/color-maker.js";


var Browser = getBrowser();

var Mobile = typeof window !== 'undefined' ? typeof window.orientation !== 'undefined' : false;

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

var WebglErrorMessage = '<div style="display:flex;align-items:center;justify-content:center;height:100%;"><p style="padding:15px;text-align:center;">Your browser/graphics card does not seem to support <a target="_blank" href="https://en.wikipedia.org/wiki/WebGL">WebGL</a>.<br/><br/>Find out how to get it <a target="_blank" href="http://get.webgl.org/">here</a>.</p></div>';

var WorkerRegistry = new _WorkerRegistry();
var ColorMakerRegistry = new _ColorMakerRegistry();
var DatasourceRegistry = new Registry( "datasource" );
var RepresentationRegistry = new Registry( "representatation" );
var ParserRegistry = new Registry( "parser" );
var ShaderRegistry = new Registry( "shader" );
var DecompressorRegistry = new Registry( "decompressor" );
var ComponentRegistry = new Registry( "component" );


export {
    Browser,
    Mobile,
    SupportsReadPixelsFloat,
    setSupportsReadPixelsFloat,
    ExtensionFragDepth,
    setExtensionFragDepth,
    Log,
    Debug,
    setDebug,
    WebglErrorMessage,
    WorkerRegistry,
    ColorMakerRegistry,
    DatasourceRegistry,
    RepresentationRegistry,
    ParserRegistry,
    ShaderRegistry,
    DecompressorRegistry,
    ComponentRegistry
};
