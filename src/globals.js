/**
 * @file Globals
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { getBrowser, GET, boolean, defaults } from "./utils.js";
import _GidPool from "./utils/gid-pool.js";
import _WorkerRegistry from "./worker/worker-registry.js";
import { ColorMakerRegistry as _ColorMakerRegistry } from "./utils/color-maker.js";


var Browser = getBowser();

var Log = {
	log: Function.prototype.bind.call( console.log, console ),
	info: Function.prototype.bind.call( console.info, console ),
	warn: Function.prototype.bind.call( console.warn, console ),
	error: Function.prototype.bind.call( console.error, console ),
	time: Function.prototype.bind.call( console.time, console ),
	timeEnd: Function.prototype.bind.call( console.timeEnd, console )
};

var Debug = boolean( GET( "debug" ) );

var GidPool = new _GidPool();

var WebglErrorMessage = "<div style=\"display:flex; align-items:center; justify-content:center; height:100%;\"><p style=\"padding:15px; text-align:center;\">Your browser/graphics card does not seem to support <a target=\"_blank\" href=\"https://en.wikipedia.org/wiki/WebGL\">WebGL</a>.<br /><br />Find out how to get it <a target=\"_blank\" href=\"http://get.webgl.org/\">here</a>.</p></div>";

var MainScriptFilePath = "../js/build/ngl.full.min.js";

var WorkerRegistry = new _WorkerRegistry();

var ColorMakerRegistry = new _ColorMakerRegistry();


export {
	Browser,
	Log,
	GidPool,
	Debug,
	WebglErrorMessage,
	MainScriptFilePath,
	WorkerRegistry,
	ColorMakerRegistry
};
