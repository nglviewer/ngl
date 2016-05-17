/**
 * @file Globals
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


var Log = {
	log: Function.prototype.bind.call( console.log, console ),
	info: Function.prototype.bind.call( console.info, console ),
	warn: Function.prototype.bind.call( console.warn, console ),
	error: Function.prototype.bind.call( console.error, console ),
	time: Function.prototype.bind.call( console.time, console ),
	timeEnd: Function.prototype.bind.call( console.timeEnd, console )
};

var Debug = false;

var GidPool = undefined;


export {
	Log,
	GidPool,
	Debug
};
