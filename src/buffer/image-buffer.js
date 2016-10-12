/**
 * @file Image Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { DataTexture } from "../../lib/three.es6.js";

import "../shader/Image.vert";
import "../shader/Image.frag";

import Buffer from "./buffer.js";


function ImageBuffer( position, data, width, height, params ){

    var p = params || {};

    this.size = 4;
    this.attributeSize = this.size;
    this.vertexShader = 'Image.vert';
    this.fragmentShader = 'Image.frag';

    Buffer.call( this, position, undefined, undefined, undefined, p );

    this.tex = new DataTexture( data, width, height );
    this.tex.needsUpdate = true;

}

ImageBuffer.prototype = Object.assign( Object.create(

    Buffer.prototype ), {

    constructor: ImageBuffer

} );


export default ImageBuffer;
