/**
 * @file Image Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { BufferAttribute, DataTexture, NormalBlending } from "../../lib/three.es6.js";

import "../shader/Image.vert";
import "../shader/Image.frag";

import Buffer from "./buffer.js";


var quadIndices = new Uint16Array([
    0, 1, 2,
    1, 3, 2
]);

var quadUvs = new Float32Array([
    0, 1,
    0, 0,
    1, 1,
    1, 0
]);


function ImageBuffer( position, data, width, height, params ){

    var p = params || {};

    this.size = 4;
    this.attributeSize = this.size;
    this.vertexShader = 'Image.vert';
    this.fragmentShader = 'Image.frag';

    Buffer.call( this, position, undefined, quadIndices, undefined, p );

    this.forceTransparent = true;

    this.tex = new DataTexture( data, width, height );
    this.tex.needsUpdate = true;

    this.addUniforms( {
        "map": { value: null },
    } );

    this.geometry.addAttribute( 'uv', new BufferAttribute( quadUvs, 2 ) );

}

ImageBuffer.prototype = Object.assign( Object.create(

    Buffer.prototype ), {

    constructor: ImageBuffer,

    makeMaterial: function(){

        Buffer.prototype.makeMaterial.call( this );

        this.material.uniforms.map.value = this.tex;
        this.material.blending = NormalBlending;
        this.material.needsUpdate = true;

        this.wireframeMaterial.uniforms.map.value = this.tex;
        this.wireframeMaterial.blending = NormalBlending;
        this.wireframeMaterial.needsUpdate = true;

        this.pickingMaterial.uniforms.map.value = this.tex;
        this.pickingMaterial.blending = NormalBlending;
        this.pickingMaterial.needsUpdate = true;

    },

} );


export default ImageBuffer;
