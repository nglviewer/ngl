/**
 * @file Cylinder Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ExtensionFragDepth } from "../globals.js";
import CylinderGeometryBuffer from "./cylindergeometry-buffer.js";
import CylinderImpostorBuffer from "./cylinderimpostor-buffer.js";


/**
 * Cylinder buffer
 * @class
 * @augments {Buffer}
 * @param {Object} data - buffer data
 * @param {Float32Array} data.position1 - from positions
 *                                  [x1,y1,z1, x2,y2,z2, ..., xN,yN,zN]
 * @param {Float32Array} data.position2 - to positions
 *                                  [x1,y1,z1, x2,y2,z2, ..., xN,yN,zN]
 * @param {Float32Array} data.color - from colors
 *                               [r1,g1,b1, r2,g2,b2, ..., rN,gN,bN]
 * @param {Float32Array} data.color2 - to colors
 *                               [r1,g1,b1, r2,g2,b2, ..., rN,gN,bN]
 * @param {Float32Array} data.radius - radii
 *                               [r1, r2, ..., rN]
 * @param {Float32Array} [data.pickingColor] - from picking colors
 *                                      [r1,g1,b1, r2,g2,b2, ..., rN,gN,bN]
 * @param {Float32Array} [data.pickingColor2] - to picking colors
 *                                      [r1,g1,b1, r2,g2,b2, ..., rN,gN,bN]
 * @param {BufferParams} [params] - parameters object
 */
function CylinderBuffer( data, params ){

    if( !ExtensionFragDepth || ( params && params.disableImpostor ) ){

        return new CylinderGeometryBuffer( data, params );

    }else{

        return new CylinderImpostorBuffer( data, params );

    }

}


export default CylinderBuffer;
