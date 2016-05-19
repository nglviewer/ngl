/**
 * @file Cylinder Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { ExtensionFragDepth } from "../globals.js";
import CylinderGeometryBuffer from "./cylindergeometry-buffer.js";
import CylinderImpostorBuffer from "./cylinderimpostor-buffer.js";


function CylinderBuffer( from, to, color, color2, radius, pickingColor, pickingColor2, params ){

    var p = params || {};

    if( !ExtensionFragDepth || p.disableImpostor ){

        // FIXME cap support missing

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
