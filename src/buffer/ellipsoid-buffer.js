/**
 * @file Ellipsoid Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import EllipsoidGeometryBuffer from "./ellipsoidgeometry-buffer.js";


/**
 * Ellipsoid buffer
 * @class
 * @augments {Buffer}
 * @param {Object} data - buffer data
 * @param {Float32Array} data.position - center positions
 * @param {Float32Array} data.color - colors
 * @param {Float32Array} data.radius - radii
 * @param {Float32Array} data.majorAxis - major axis vectors, length defines radius in major direction
 * @param {Float32Array} data.minorAxis - minor axis vectors, length defines radius in minor direction
 * @param {Float32Array} [data.picking] - picking ids
 * @param {BufferParams} [params] - parameters object
 */
function EllipsoidBuffer( data, params ){

    return new EllipsoidGeometryBuffer( data, params );

}


export default EllipsoidBuffer;
