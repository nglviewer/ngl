/**
 * @file Ellipsoid Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import EllipsoidGeometryBuffer from "./ellipsoidgeometry-buffer.js";


function EllipsoidBuffer( position, color, majorAxis, minorAxis, pickingColor, params ){

    return new EllipsoidGeometryBuffer(
        position, color, majorAxis, minorAxis, pickingColor, params
    );

}


export default EllipsoidBuffer;
