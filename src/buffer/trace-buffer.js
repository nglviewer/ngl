/**
 * @file Trace Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Log } from "../globals.js";
import Buffer from "./buffer.js";


function TraceBuffer( position, color, params ){

    var p = params || {};

    this.size = position.length / 3;
    this.vertexShader = 'Line.vert';
    this.fragmentShader = 'Line.frag';
    this.line = true;

    var n = this.size;
    var n1 = n - 1;

    this.attributeSize = n1 * 2;

    this.linePosition = new Float32Array( n1 * 3 * 2 );
    this.lineColor = new Float32Array( n1 * 3 * 2 );

    Buffer.call(
        this, this.linePosition, this.lineColor, undefined, undefined, p
    );

    this.setAttributes( {
        position: position,
        color: color
    } );

}

TraceBuffer.prototype = Object.assign( Object.create(

    Buffer.prototype ), {

    constructor: TraceBuffer,

    setAttributes: function( data ){

        var position, color;
        var linePosition, lineColor;

        var attributes = this.geometry.attributes;

        if( data.position ){
            position = data.position;
            linePosition = attributes.position.array;
            attributes.position.needsUpdate = true;
        }

        if( data.color ){
            color = data.color;
            lineColor = attributes.color.array;
            attributes.color.needsUpdate = true;
        }

        if( !position && !color ){
            Log.warn( "TraceBuffer.prototype.setAttributes no data" );
            return;
        }

        var v, v2;
        var n = this.size;
        var n1 = n - 1;

        for( var i = 0; i < n1; ++i ){

            v = 3 * i;
            v2 = 3 * i * 2;

            if( position ){

                linePosition[ v2     ] = position[ v     ];
                linePosition[ v2 + 1 ] = position[ v + 1 ];
                linePosition[ v2 + 2 ] = position[ v + 2 ];

                linePosition[ v2 + 3 ] = position[ v + 3 ];
                linePosition[ v2 + 4 ] = position[ v + 4 ];
                linePosition[ v2 + 5 ] = position[ v + 5 ];

            }

            if( color ){

                lineColor[ v2     ] = color[ v     ];
                lineColor[ v2 + 1 ] = color[ v + 1 ];
                lineColor[ v2 + 2 ] = color[ v + 2 ];

                lineColor[ v2 + 3 ] = color[ v + 3 ];
                lineColor[ v2 + 4 ] = color[ v + 4 ];
                lineColor[ v2 + 5 ] = color[ v + 5 ];

            }

        }

    }

} );


export default TraceBuffer;
