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
 * @param {Float32Array} from - from positions
 *                                  [x1,y1,z1, x2,y2,z2, ..., xN,yN,zN]
 * @param {Float32Array} to - to positions
 *                                  [x1,y1,z1, x2,y2,z2, ..., xN,yN,zN]
 * @param {Float32Array} color - colors
 *                               [r1,g1,b1, r2,g2,b2, ..., rN,gN,bN]
 * @param {Float32Array} radius - radii
 *                               [r1, r2, ..., rN]
 * @param {Float32Array} [pickingColor] - picking colors
 *                                      [r1,g1,b1, r2,g2,b2, ..., rN,gN,bN]
 * @param {BufferParams} [params] - parameters object
 */
function ConeBuffer( from, to, color, radius, pickingColor, params ){

    return new ConeGeometryBuffer(
        from, to, color, radius, pickingColor, params
    );

}


export default ConeBuffer;
