/**
 * @file Cylinder Impostor Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import THREE from "../../lib/three.js";

import { defaults } from "../utils.js";
import { calculateCenterArray } from "../math/array-utils.js";
import Buffer from "./buffer.js";
import AlignedBoxBuffer from "./alignedbox-buffer.js";


function CylinderImpostorBuffer( from, to, color, color2, radius, pickingColor, pickingColor2, shiftDir, params ){

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

    var modelViewMatrixInverse = new THREE.Uniform( new THREE.Matrix4() )
        .onUpdate( function( object, camera ){
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
        "radius": radius,
        "shiftDir": shiftDir,
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

    },

    setAttributes: function( data ){

        data = Object.assign( {}, data );

        if( data && data.shiftDir ){
            this.shiftDir = data.shiftDir;
            delete data.shiftDir;
        }

        if( data && this.shiftDir && this.shift && data.position1 && data.position2 ){
            var pos1 = new Float32Array( data.position1 );
            var pos2 = new Float32Array( data.position2 );
            var shiftDir = this.shiftDir;
            var shift = this.shift;
            for( var i = 0, il = shiftDir.length; i < il; i += 3 ){
                pos1[ i     ] += shiftDir[ i     ] * shift;
                pos1[ i + 1 ] += shiftDir[ i + 1 ] * shift;
                pos1[ i + 2 ] += shiftDir[ i + 2 ] * shift;
                pos2[ i     ] += shiftDir[ i     ] * shift;
                pos2[ i + 1 ] += shiftDir[ i + 1 ] * shift;
                pos2[ i + 2 ] += shiftDir[ i + 2 ] * shift;
            }
            data.position1 = pos1;
            data.position2 = pos2;
        }

        if( data && data.position1 && data.position2 ){
            data.position = calculateCenterArray( data.position1, data.position2 );
        }

        AlignedBoxBuffer.prototype.setAttributes.call( this, data );

    }

} );


export default CylinderImpostorBuffer;
