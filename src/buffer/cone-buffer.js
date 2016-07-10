/**
 * @file Cone Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import ConeGeometryBuffer from "./conegeometry-buffer.js";


function ConeBuffer( from, to, color, radius, pickingColor, params ){

    return new ConeGeometryBuffer(
        from, to, color, radius, pickingColor, params
    );

}


export default ConeBuffer;
