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
 * @param {Float32Array} from - from positions
 *                                  [x1,y1,z1, x2,y2,z2, ..., xN,yN,zN]
 * @param {Float32Array} to - to positions
 *                                  [x1,y1,z1, x2,y2,z2, ..., xN,yN,zN]
 * @param {Float32Array} color - from colors
 *                               [r1,g1,b1, r2,g2,b2, ..., rN,gN,bN]
 * @param {Float32Array} color2 - to colors
 *                               [r1,g1,b1, r2,g2,b2, ..., rN,gN,bN]
 * @param {Float32Array} radius - radii
 *                               [r1, r2, ..., rN]
 * @param {Float32Array} [pickingColor] - from picking colors
 *                                      [r1,g1,b1, r2,g2,b2, ..., rN,gN,bN]
 * @param {Float32Array} [pickingColor2] - to picking colors
 *                                      [r1,g1,b1, r2,g2,b2, ..., rN,gN,bN]
 * @param {BufferParams} [params] - parameters object
 */
function CylinderBuffer( from, to, color, color2, radius, pickingColor, pickingColor2, params ){

    var p = params || {};

    if( !ExtensionFragDepth || p.disableImpostor ){

        return new CylinderGeometryBuffer(
            from, to, color, color2, radius,
            pickingColor, pickingColor2, params
        );

    }else{

        return new CylinderImpostorBuffer(
            from, to, color, color2, radius,
            pickingColor, pickingColor2, params
        );

    }

}


export default CylinderBuffer;
