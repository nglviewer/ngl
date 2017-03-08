/**
 * @file Hyperball Stick Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ExtensionFragDepth } from "../globals.js";
import { calculateMinArray } from "../math/array-utils.js";
import CylinderGeometryBuffer from "./cylindergeometry-buffer.js";
import HyperballStickImpostorBuffer from "./hyperballstickimpostor-buffer.js";


// from, to, color, color2, radius1, radius2, pickingColor, pickingColor2
function HyperballStickBuffer( data, params ){

    if( !ExtensionFragDepth || ( params && params.disableImpostor ) ){

        data.radius = calculateMinArray( data.radius1, data.radius2 );

        return new CylinderGeometryBuffer( data, params );

    }else{

        return new HyperballStickImpostorBuffer( data, params );

    }

}


export default HyperballStickBuffer;
