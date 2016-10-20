/**
 * @file Sphere Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ExtensionFragDepth } from "../globals.js";
import SphereGeometryBuffer from "./spheregeometry-buffer.js";
import SphereImpostorBuffer from "./sphereimpostor-buffer.js";


/**
 * Sphere buffer
 * @class
 * @augments {Buffer}
 * @param {Float32Array} position - positions
 *                                  [x1,y1,z1, x2,y2,z2, ..., xN,yN,zN]
 * @param {Float32Array} color - colors
 *                               [r1,g1,b1, r2,g2,b2, ..., rN,gN,bN]
 * @param {Float32Array} radius - radii
 *                               [r1, r2, ..., rN]
 * @param {Float32Array} [pickingColor] - picking colors
 *                                      [r1,g1,b1, r2,g2,b2, ..., rN,gN,bN]
 * @param {BufferParameters} params - parameters object
 */
function SphereBuffer( position, color, radius, pickingColor, params ){

    var p = params || {};

    if( !ExtensionFragDepth || p.disableImpostor ){

        return new SphereGeometryBuffer(
            position, color, radius, pickingColor, params
        );

    }else{

        return new SphereImpostorBuffer(
            position, color, radius, pickingColor, params
        );

    }

}


export default SphereBuffer;
