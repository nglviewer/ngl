/**
 * @file Vector Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Color } from "../../lib/three.es6.js";

import { uniformArray3 } from "../math/array-utils.js";
import Buffer from "./buffer.js";


function VectorBuffer( position, vector, params ){

    var p = params || {};

    this.size = position.length / 3;
    this.vertexShader = 'Line.vert';
    this.fragmentShader = 'Line.frag';
    this.line = true;

    var n = this.size;
    var n2 = n * 2;

    this.attributeSize = n2;

    this.scale = p.scale || 1;
    var color = new Color( p.color || "grey" );

    this.linePosition = new Float32Array( n2 * 3 );
    this.lineColor = uniformArray3( n2, color.r, color.g, color.b );

    Buffer.call(
        this, this.linePosition, this.lineColor, undefined, undefined, p
    );

    this.setAttributes( {
        position: position,
        vector: vector
    } );

}

VectorBuffer.prototype = Object.assign( Object.create(

    Buffer.prototype ), {

    constructor: VectorBuffer,

    setAttributes: function( data ){

        var attributes = this.geometry.attributes;

        var position, vector;
        var aPosition;

        if( data.position && data.vector ){
            position = data.position;
            vector = data.vector;
            aPosition = attributes.position.array;
            attributes.position.needsUpdate = true;
        }

        var n = this.size;
        var scale = this.scale;

        var i, j;

        if( data.position && data.vector ){

            for( var v = 0; v < n; v++ ){

                i = v * 2 * 3;
                j = v * 3;

                aPosition[ i + 0 ] = position[ j + 0 ];
                aPosition[ i + 1 ] = position[ j + 1 ];
                aPosition[ i + 2 ] = position[ j + 2 ];
                aPosition[ i + 3 ] = position[ j + 0 ] + vector[ j + 0 ] * scale;
                aPosition[ i + 4 ] = position[ j + 1 ] + vector[ j + 1 ] * scale;
                aPosition[ i + 5 ] = position[ j + 2 ] + vector[ j + 2 ] * scale;

            }

        }

    }

} );


export default VectorBuffer;
