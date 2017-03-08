/**
 * @file Cylinder Impostor Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Matrix4, Uniform } from "../../lib/three.es6.js";

import "../shader/CylinderImpostor.vert";
import "../shader/CylinderImpostor.frag";

import { defaults } from "../utils.js";
import AlignedBoxBuffer from "./alignedbox-buffer.js";


class CylinderImpostorBuffer extends AlignedBoxBuffer{

    /**
     * make cylinder impostor buffer
     * @param  {Object} data - attribute object
     * @param  {Float32Array} data.position1 - from positions
     * @param  {Float32Array} data.position2 - to positions
     * @param  {Float32Array} data.color - from colors
     * @param  {Float32Array} data.color2 - to colors
     * @param  {Float32Array} data.radius - radii
     * @param  {Float32Array} data.pickingColor - from pickingColor
     * @param  {Float32Array} data.pickingColor2 - to pickingColor2
     * @param  {BufferParameters} params - parameter object
     */
    constructor( data, params ){

        super( data, params );

        var p = params || {};

        this.openEnded = defaults( p.openEnded, false );

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

        if( data.pickingColor2 ){
            this.addAttributes( {
                "pickingColor2": { type: "c", value: null }
            } );
        }

        this.setAttributes( data );

        this.makeMapping();

    }

    get parameters (){

        return Object.assign( {

            openEnded: { updateShader: true }

        }, super.parameters );

    }

    getDefines( type ){

        var defines = AlignedBoxBuffer.prototype.getDefines.call( this, type );

        if( !this.openEnded ){
            defines.CAP = 1;
        }

        return defines;

    }

    get impostor (){ return true; }
    get vertexShader (){ return "CylinderImpostor.vert"; }
    get fragmentShader (){ return "CylinderImpostor.frag"; }

}


export default CylinderImpostorBuffer;
