/**
 * @file Math Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { DEG2RAD, RAD2DEG } from "./math-constants.js";


function degToRad( deg ){
	return deg * DEG2RAD;
}

function radToDeg( rad ){
	return rad * RAD2DEG;
}


export {
	degToRad,
	radToDeg
};
