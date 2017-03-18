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
 *                                  [x1,y1,z1, x2,y2,z2, ..., xN,yN,zN]
 * @param {Float32Array} data.color - colors
 *                               [r1,g1,b1, r2,g2,b2, ..., rN,gN,bN]
 * @param {Float32Array} data.radius - radii
 *                               [r1, r2, ..., rN]
 * @param {Float32Array} data.majorAxis - major axis vectors, length defines radius in major direction
 *                                  [x1,y1,z1, x2,y2,z2, ..., xN,yN,zN]
 * @param {Float32Array} data.minorAxis - minor axis vectors, length defines radius in minor direction
 *                                  [x1,y1,z1, x2,y2,z2, ..., xN,yN,zN]
 * @param {Float32Array} [data.pickingColor] - picking colors
 *                                      [r1,g1,b1, r2,g2,b2, ..., rN,gN,bN]
 * @param {BufferParams} [params] - parameters object
 */
function EllipsoidBuffer( data, params ){

    return new EllipsoidGeometryBuffer( data, params );

}


export default EllipsoidBuffer;
