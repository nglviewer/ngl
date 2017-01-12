/**
 * @file Mesh Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import "../shader/Mesh.vert";
import "../shader/Mesh.frag";

import Buffer from "./buffer.js";


function MeshBuffer( position, color, index, normal, pickingColor, params ){

    var p = params || {};

    this.size = position ? position.length / 3 : 0;
    this.attributeSize = this.size;
    this.vertexShader = 'Mesh.vert';
    this.fragmentShader = 'Mesh.frag';

    Buffer.call( this, position, color, index, pickingColor, p );

    this.addAttributes( {
        "normal": { type: "v3", value: normal },
    } );

    if( normal === undefined ){
        this.geometry.computeVertexNormals();
    }

}

MeshBuffer.prototype = Object.assign( Object.create(

    Buffer.prototype ), {

    constructor: MeshBuffer

} );


export default MeshBuffer;
