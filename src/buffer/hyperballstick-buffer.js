/**
 * @file Hyperball Stick Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ExtensionFragDepth } from "../globals.js";
import { calculateMinArray } from "../math/array-utils.js";
import CylinderGeometryBuffer from "./cylindergeometry-buffer.js";
import HyperballStickImpostorBuffer from "./hyperballstickimpostor-buffer.js";


function HyperballStickBuffer( from, to, color, color2, radius1, radius2, pickingColor, pickingColor2, params ){

    var p = params || {};

    if( !ExtensionFragDepth || p.disableImpostor ){

        return new CylinderGeometryBuffer(
            from, to, color, color2,
            calculateMinArray( radius1, radius2 ),
            pickingColor, pickingColor2, params
        );

    }else{

        return new HyperballStickImpostorBuffer(
            from, to, color, color2,
            radius1, radius2,
            pickingColor, pickingColor2, params
        );

    }

}


export default HyperballStickBuffer;
