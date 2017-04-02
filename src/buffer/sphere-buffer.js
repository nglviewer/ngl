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
 * @param {Float32Array} data.color - colors
 * @param {Float32Array} data.radius - radii
 * @param {Float32Array} [data.picking] - picking ids
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
