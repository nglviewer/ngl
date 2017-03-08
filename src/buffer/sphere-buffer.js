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
 * @param {Object} data - buffer data
 * @param {Float32Array} data.position - positions
 *                                  [x1,y1,z1, x2,y2,z2, ..., xN,yN,zN]
 * @param {Float32Array} data.color - colors
 *                               [r1,g1,b1, r2,g2,b2, ..., rN,gN,bN]
 * @param {Float32Array} data.radius - radii
 *                               [r1, r2, ..., rN]
 * @param {Float32Array} [data.pickingColor] - picking colors
 *                                      [r1,g1,b1, r2,g2,b2, ..., rN,gN,bN]
 * @param {BufferParameters} params - parameters object
 */
function SphereBuffer( data, params ){

    if( !ExtensionFragDepth || ( params && params.disableImpostor ) ){

        return new SphereGeometryBuffer( data, params );

    }else{

        return new SphereImpostorBuffer( data, params );

    }

}


export default SphereBuffer;
