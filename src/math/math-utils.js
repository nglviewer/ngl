/**
 * @file Math Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


function degToRad( deg ){
	return deg * 0.01745;  // deg * Math.PI / 180
}

function radToDeg( rad ){
	return rad * 57.29578;  // rad * 180 / Math.PI
}

export {
	degToRad,
	radToDeg
};
