/**
 * @file Sphere Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { ExtensionFragDepth } from "../globals.js";
import SphereGeometryBuffer from "./spheregeometry-buffer.js";
import SphereImpostorBuffer from "./sphereimpostor-buffer.js";


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
