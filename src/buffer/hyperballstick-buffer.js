/**
 * @file Hyperball Stick Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ExtensionFragDepth } from "../globals.js";
import { calculateMinArray } from "../math/array-utils.js";
import CylinderGeometryBuffer from "./cylindergeometry-buffer.js";
import HyperballStickImpostorBuffer from "./hyperballstickimpostor-buffer.js";


/**
 * Hyperball stick buffer. Depending on the value {@link ExtensionFragDepth} and
 * `params.disableImpostor` the constructor returns either a
 * {@link CylinderGeometryBuffer} or a {@link HyperballStickImpostorBuffer}
 * @implements {Buffer}
 *
 * @example
 * var hyperballStickBuffer = new NGL.HyperballStickBuffer( {
 *     position1: new Float32Array( [ 0, 0, 0 ] ),
 *     position2: new Float32Array( [ 2, 2, 2 ] ),
 *     color: new Float32Array( [ 1, 0, 0 ] ),
 *     color2: new Float32Array( [ 0, 1, 0 ] ),
 *     radius1: new Float32Array( [ 1 ] ),
 *     radius2: new Float32Array( [ 2 ] )
 * } );
 */
class HyperballStickBuffer{

    constructor( data, params ){

        if( !ExtensionFragDepth || ( params && params.disableImpostor ) ){
            data.radius = calculateMinArray( data.radius1, data.radius2 );
            return new CylinderGeometryBuffer( data, params );
        }else{
            return new HyperballStickImpostorBuffer( data, params );
        }

    }

}


export default HyperballStickBuffer;
