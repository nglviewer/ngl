/**
 * @file Sphere Impostor Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Matrix4 } from "../../lib/three.es6.js";

import "../shader/SphereImpostor.vert";
import "../shader/SphereImpostor.frag";

import QuadBuffer from "./quad-buffer.js";


class SphereImpostorBuffer extends QuadBuffer{

    /**
     * make sphere impostor buffer
     * @param  {Object} data - attribute object
     * @param  {Float32Array} data.position - positions
     * @param  {Float32Array} data.color - colors
     * @param  {Float32Array} data.radius - radii
     * @param  {BufferParameters} params - parameter object
     */
    constructor( data, params ){

        super( data, params );

        this.addUniforms( {
            "projectionMatrixInverse": { value: new Matrix4() },
            "ortho": { value: 0.0 },
        } );

        this.addAttributes( {
            "radius": { type: "f", value: null },
        } );

        this.setAttributes( data );
        this.makeMapping();

    }

    get impostor (){ return true; }
    get vertexShader (){ return "SphereImpostor.vert"; }
    get fragmentShader (){ return "SphereImpostor.frag"; }

}


export default SphereImpostorBuffer;
