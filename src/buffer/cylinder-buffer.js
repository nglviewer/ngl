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
 * @param {Float32Array} data.position2 - to positions
 * @param {Float32Array} data.color - from colors
 * @param {Float32Array} data.color2 - to colors
 * @param {Float32Array} data.radius - radii
 * @param {Float32Array} [data.picking] - from picking ids
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
