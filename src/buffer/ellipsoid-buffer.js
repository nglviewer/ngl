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
 * @param {Float32Array} position - center positions
 *                                  [x1,y1,z1, x2,y2,z2, ..., xN,yN,zN]
 * @param {Float32Array} color - colors
 *                               [r1,g1,b1, r2,g2,b2, ..., rN,gN,bN]
 * @param {Float32Array} radius - radii
 *                               [r1, r2, ..., rN]
 * @param {Float32Array} majorAxis - major axis vectors, length defines radius in major direction
 *                                  [x1,y1,z1, x2,y2,z2, ..., xN,yN,zN]
 * @param {Float32Array} minorAxis - minor axis vectors, length defines radius in minor direction
 *                                  [x1,y1,z1, x2,y2,z2, ..., xN,yN,zN]
 * @param {Float32Array} [pickingColor] - picking colors
 *                                      [r1,g1,b1, r2,g2,b2, ..., rN,gN,bN]
 * @param {BufferParams} [params] - parameters object
 */
function EllipsoidBuffer( position, color, radius, majorAxis, minorAxis, pickingColor, params ){

    return new EllipsoidGeometryBuffer(
        position, color, radius, majorAxis, minorAxis, pickingColor, params
    );

}


export default EllipsoidBuffer;
