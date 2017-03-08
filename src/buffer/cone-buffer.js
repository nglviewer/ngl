/**
 * @file Cone Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import ConeGeometryBuffer from "./conegeometry-buffer.js";


/**
 * Cone buffer
 * @class
 * @augments {Buffer}
 * @param {Object} data - buffer data
 * @param {Float32Array} data.position1 - from positions
 * @param {Float32Array} data.position2 - to positions
 * @param {Float32Array} data.color - colors
 * @param {Float32Array} data.radius - radii
 * @param {Float32Array} [data.pickingColor] - picking colors
 * @param {BufferParams} [params] - parameters object
 */
function ConeBuffer( data, params ){

    return new ConeGeometryBuffer( data, params );

}


export default ConeBuffer;
