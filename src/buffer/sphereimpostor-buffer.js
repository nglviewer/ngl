/**
 * @file Sphere Impostor Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import THREE from "../../lib/three.js";

import QuadBuffer from "./quad-buffer.js";


function SphereImpostorBuffer( position, color, radius, pickingColor, params ){

    this.impostor = true;
    this.count = position.length / 3;
    this.vertexShader = "SphereImpostor.vert";
    this.fragmentShader = "SphereImpostor.frag";

    QuadBuffer.call( this, params );

    this.addUniforms( {
        "projectionMatrixInverse": { value: new THREE.Matrix4() },
        "ortho": { value: 0.0 },
    } );

    this.addAttributes( {
        "radius": { type: "f", value: null },
    } );

    this.setAttributes( {
        "position": position,
        "color": color,
        "radius": radius,
    } );

    if( pickingColor ){

        this.addAttributes( {
            "pickingColor": { type: "c", value: null },
        } );

        this.setAttributes( {
            "pickingColor": pickingColor,
        } );

        this.pickable = true;

    }

    this.makeMapping();

}

SphereImpostorBuffer.prototype = Object.assign( Object.create(

    QuadBuffer.prototype ), {

    constructor: SphereImpostorBuffer

} );


export default SphereImpostorBuffer;
