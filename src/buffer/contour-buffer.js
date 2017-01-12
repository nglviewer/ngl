/**
 * @file Contour Buffer
 * @author Fred ludlow <fred.ludlow@gmail.com>
 * @private
 */

import "../shader/Line.vert";
import "../shader/Line.frag";

import Buffer from "./buffer.js";


function ContourBuffer( position, color, index, params ){

    var p = params || {};
    this.size = position.length / 3;
    this.vertexShader = 'Line.vert';
    this.fragmentShader = 'Line.frag';
    this.line = true;
    this.attributeSize = this.size;

    Buffer.call(
        this, position, color, index, undefined, p 
    );

}

ContourBuffer.prototype = Object.assign( Object.create(

    Buffer.prototype ), {

    constructor: ContourBuffer,

    setAttributes: function( data ){

        var attributes = this.geometry.attributes;

        if( data.color ){
            
            attributes.color.array.set( data.color );
            attributes.color.needsUpdate = true;

        }

        if( data.index ){

            attributes.index.array.set( data.index );
            attributes.index.needsUpdate = true;

        }
            
    }
        
});


export default ContourBuffer;