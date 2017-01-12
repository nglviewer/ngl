/**
 * @file Cylinder Impostor Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Matrix4, Uniform } from "../../lib/three.es6.js";

import "../shader/CylinderImpostor.vert";
import "../shader/CylinderImpostor.frag";

import { defaults } from "../utils.js";
import { calculateCenterArray } from "../math/array-utils.js";
import AlignedBoxBuffer from "./alignedbox-buffer.js";


function CylinderImpostorBuffer( from, to, color, color2, radius, pickingColor, pickingColor2, params ){

    var p = params || {};

    this.openEnded = defaults( p.openEnded, false );

    this.impostor = true;
    this.count = from.length / 3;
    this.vertexShader = "CylinderImpostor.vert";
    this.fragmentShader = "CylinderImpostor.frag";

    AlignedBoxBuffer.call( this, p );

    var modelViewMatrixInverse = new Uniform( new Matrix4() )
        .onUpdate( function( object/*, camera*/ ){
            this.value.getInverse( object.modelViewMatrix );
        } );

    this.addUniforms( {
        "modelViewMatrixInverse": modelViewMatrixInverse,
        "ortho": { value: 0.0 },
    } );

    this.addAttributes( {
        "position1": { type: "v3", value: null },
        "position2": { type: "v3", value: null },
        "color2": { type: "c", value: null },
        "radius": { type: "f", value: null },
    } );

    this.setAttributes( {
        "position1": from,
        "position2": to,
        "color": color,
        "color2": color2,
        "radius": radius
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

}

CylinderImpostorBuffer.prototype = Object.assign( Object.create(

    AlignedBoxBuffer.prototype ), {

    constructor: CylinderImpostorBuffer,

    parameters: Object.assign( {

        openEnded: { updateShader: true }

    }, AlignedBoxBuffer.prototype.parameters ),

    getDefines: function( type ){

        var defines = AlignedBoxBuffer.prototype.getDefines.call( this, type );

        if( !this.openEnded ){
            defines.CAP = 1;
        }

        return defines;

    },

    setAttributes: function( data ){

        if( data && data.position1 && data.position2 ){
            data.position = calculateCenterArray( data.position1, data.position2 );
        }

        AlignedBoxBuffer.prototype.setAttributes.call( this, data );

    }

} );


export default CylinderImpostorBuffer;
