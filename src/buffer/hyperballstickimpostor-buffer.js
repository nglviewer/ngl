/**
 * @file Hyperball Stick Impostor Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Matrix4, Uniform } from "../../lib/three.es6.js";

import "../shader/HyperballStickImpostor.vert";
import "../shader/HyperballStickImpostor.frag";

import { defaults } from "../utils.js";
import BoxBuffer from "./box-buffer.js";


var tmpMatrix = new Matrix4();

function matrixCalc( object, camera ){

    var u = object.material.uniforms;

    if( u.modelViewMatrixInverse ){
        u.modelViewMatrixInverse.value.getInverse(
            object.modelViewMatrix
        );
    }

    if( u.modelViewMatrixInverseTranspose ){
        if( u.modelViewMatrixInverse ){
            u.modelViewMatrixInverseTranspose.value.copy(
                u.modelViewMatrixInverse.value
            ).transpose();
        }else{
            u.modelViewMatrixInverseTranspose.value
                .getInverse( object.modelViewMatrix )
                .transpose();
        }
    }

    if( u.modelViewProjectionMatrix ){
        u.modelViewProjectionMatrix.value.multiplyMatrices(
            camera.projectionMatrix, object.modelViewMatrix
        );
    }

    if( u.modelViewProjectionMatrixInverse ){
        if( u.modelViewProjectionMatrix ){
            tmpMatrix.copy(
                u.modelViewProjectionMatrix.value
            );
            u.modelViewProjectionMatrixInverse.value.getInverse(
                tmpMatrix
            );
        }else{
            tmpMatrix.multiplyMatrices(
                camera.projectionMatrix, object.modelViewMatrix
            );
            u.modelViewProjectionMatrixInverse.value.getInverse(
                tmpMatrix
            );
        }
    }

}


class HyperballStickImpostorBuffer extends BoxBuffer{

    /**
     * make hyperball stick impostor buffer
     * @param  {Object} data - attribute object
     * @param  {Float32Array} data.position1 - from positions
     * @param  {Float32Array} data.position2 - to positions
     * @param  {Float32Array} data.color - from colors
     * @param  {Float32Array} data.color2 - to colors
     * @param  {Float32Array} data.radius1 - from radii
     * @param  {Float32Array} data.radius2 - to radii
     * @param  {Float32Array} data.pickingColor - from pickingColor
     * @param  {Float32Array} data.pickingColor2 - to pickingColor2
     * @param  {BufferParameters} params - parameter object
     */
    constructor( data, params ){

        super( data, params );

        var d = data || {};
        var p = params || {};

        var shrink = defaults( p.shrink, 0.14 );

        var modelViewProjectionMatrix = new Uniform( new Matrix4() )
            .onUpdate( matrixCalc );
        var modelViewProjectionMatrixInverse = new Uniform( new Matrix4() )
            .onUpdate( matrixCalc );
        var modelViewMatrixInverseTranspose = new Uniform( new Matrix4() )
            .onUpdate( matrixCalc );

        this.addUniforms( {
            "modelViewProjectionMatrix": modelViewProjectionMatrix,
            "modelViewProjectionMatrixInverse": modelViewProjectionMatrixInverse,
            "modelViewMatrixInverseTranspose": modelViewMatrixInverseTranspose,
            "shrink": { value: shrink },
        } );

        this.addAttributes( {
            "position1": { type: "v3", value: null },
            "position2": { type: "v3", value: null },
            "color2": { type: "c", value: null },
            "radius": { type: "f", value: null },
            "radius2": { type: "f", value: null }
        } );

        if( d.pickingColor2 ){
            this.addAttributes( {
                "pickingColor2": { type: "c", value: null }
            } );
        }

        this.setAttributes( d );

        this.makeMapping();

    }

    get parameters (){

        return Object.assign( {

            shrink: { uniform: true }

        }, super.parameters );

    }

    get impostor (){ return true; }
    get vertexShader (){ return "HyperballStickImpostor.vert"; }
    get fragmentShader (){ return "HyperballStickImpostor.frag"; }

}


export default HyperballStickImpostorBuffer;
