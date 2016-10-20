/**
 * @file Line Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import "../shader/Line.vert";
import "../shader/Line.frag";

import Buffer from "./buffer.js";


function LineBuffer( from, to, color, color2, params ){

    var p = params || {};

    this.size = from.length / 3;
    this.vertexShader = 'Line.vert';
    this.fragmentShader = 'Line.frag';
    this.line = true;

    var n = this.size;
    var nX = n * 2 * 2;

    this.attributeSize = nX;

    this.linePosition = new Float32Array( nX * 3 );
    this.lineColor = new Float32Array( nX * 3 );

    Buffer.call(
        this, this.linePosition, this.lineColor, undefined, undefined, p
    );

    this.setAttributes( {
        from: from,
        to: to,
        color: color,
        color2: color2
    } );

}

LineBuffer.prototype = Object.assign( Object.create(

    Buffer.prototype ), {

    constructor: LineBuffer,

    setAttributes: function( data ){

        var from, to, color, color2;
        var aPosition, aColor;

        var attributes = this.geometry.attributes;

        if( data.from && data.to ){
            from = data.from;
            to = data.to;
            aPosition = attributes.position.array;
            attributes.position.needsUpdate = true;
        }

        if( data.color && data.color2 ){
            color = data.color;
            color2 = data.color2;
            aColor = attributes.color.array;
            attributes.color.needsUpdate = true;
        }

        var n = this.size;
        var n6 = n * 6;

        var i, j, i2;
        var x, y, z, x1, y1, z1, x2, y2, z2;

        for( var v = 0; v < n; v++ ){

            j = v * 3;
            i = v * 2 * 3;
            i2 = i + n6;

            if( from && to ){

                x1 = from[ j     ];
                y1 = from[ j + 1 ];
                z1 = from[ j + 2 ];

                x2 = to[ j     ];
                y2 = to[ j + 1 ];
                z2 = to[ j + 2 ];

                x = ( x1 + x2 ) / 2.0;
                y = ( y1 + y2 ) / 2.0;
                z = ( z1 + z2 ) / 2.0;

                aPosition[ i     ] = x1;
                aPosition[ i + 1 ] = y1;
                aPosition[ i + 2 ] = z1;
                aPosition[ i + 3 ] = x;
                aPosition[ i + 4 ] = y;
                aPosition[ i + 5 ] = z;

                aPosition[ i2     ] = x;
                aPosition[ i2 + 1 ] = y;
                aPosition[ i2 + 2 ] = z;
                aPosition[ i2 + 3 ] = x2;
                aPosition[ i2 + 4 ] = y2;
                aPosition[ i2 + 5 ] = z2;

            }

            if( color && color2 ){

                aColor[ i     ] = aColor[ i + 3 ] = color[ j     ];
                aColor[ i + 1 ] = aColor[ i + 4 ] = color[ j + 1 ];
                aColor[ i + 2 ] = aColor[ i + 5 ] = color[ j + 2 ];

                aColor[ i2     ] = aColor[ i2 + 3 ] = color2[ j     ];
                aColor[ i2 + 1 ] = aColor[ i2 + 4 ] = color2[ j + 1 ];
                aColor[ i2 + 2 ] = aColor[ i2 + 5 ] = color2[ j + 2 ];

            }

        }

    }

} );


export default LineBuffer;
