/**
 * @file Cylinder Impostor Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Matrix4, Uniform } from "../../lib/three.es6.js";

import { defaults } from "../utils.js";
import { calculateCenterArray } from "../math/array-utils.js";
import Buffer from "./buffer.js";
import AlignedBoxBuffer from "./alignedbox-buffer.js";


function CylinderImpostorBuffer( from, to, color, color2, radius, pickingColor, pickingColor2, params ){

    var p = params || {};

    // Moves the cylinder in camera space to get, for example,
    // one of multiple shifted screen-aligned cylinders.
    this.shift = defaults( p.shift, 0 );
    this.cap = defaults( p.cap, true );

    this.impostor = true;
    this.count = from.length / 3;
    this.vertexShader = "CylinderImpostor.vert";
    this.fragmentShader = "CylinderImpostor.frag";

    AlignedBoxBuffer.call( this, p );

    var modelViewMatrixInverse = new Uniform( new Matrix4() )
        .onUpdate( function( object, camera ){
            this.value.getInverse( object.modelViewMatrix );
        } );

    this.addUniforms( {
        "modelViewMatrixInverse": modelViewMatrixInverse,
        "shift": { value: this.shift },
        "ortho": { value: 0.0 },
    } );

    this.addAttributes( {
        "position1": { type: "v3", value: null },
        "position2": { type: "v3", value: null },
        "color2": { type: "c", value: null },
        "radius": { type: "f", value: null },
    } );

    this.setAttributes( {
        "position": calculateCenterArray( from, to ),

        "position1": from,
        "position2": to,
        "color": color,
        "color2": color2,
        "radius": radius,
    } );

    if( pickingColor ){

        this.addAttributes( {
            "pickingColor": { type: "c", value: null },
            "pickingColor2": { type: "c", value: null },
        } );

        this.setAttributes( {
            "pickingColor": pickingColor,
            "pickingColor2": pickingColor2,
        } );

        this.pickable = true;

    }

    this.makeMapping();

    // FIXME
    // if( this.cap ){
    //     this.material.defines[ "CAP" ] = 1;
    // }

}

CylinderImpostorBuffer.prototype = Object.assign( Object.create(

    AlignedBoxBuffer.prototype ), {

    constructor: CylinderImpostorBuffer,

    getMaterial: function( type ){

        var material = Buffer.prototype.getMaterial.call( this, type );

        if( this.cap ){
            material.defines.CAP = 1;
        }

        return material;

    }

} );


export default CylinderImpostorBuffer;
