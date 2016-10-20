/**
 * @file Ribbon Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { BufferAttribute } from "../../lib/three.es6.js";

import "../shader/Ribbon.vert";
import "../shader/Mesh.frag";

import Buffer from "./buffer.js";
import MeshBuffer from "./mesh-buffer.js";


function RibbonBuffer( position, normal, dir, color, size, pickingColor, params ){

    var p = params || {};

    var n = ( position.length / 3 ) - 1;
    var n4 = n * 4;
    var x = n4 * 3;

    this.meshPosition = new Float32Array( x );
    this.meshColor = new Float32Array( x );
    this.meshNormal = new Float32Array( x );
    this.meshPickingColor = pickingColor ? new Float32Array( x ) : undefined;

    var TypedArray = this.meshPosition.length / 3 > 65535 ? Uint32Array : Uint16Array;
    this.meshIndex = new TypedArray( x );
    this.makeIndex();

    MeshBuffer.call(
        this, this.meshPosition, this.meshColor, this.meshIndex,
        this.meshNormal, this.meshPickingColor, p
    );

    this.vertexShader = 'Ribbon.vert';
    this.fragmentShader = 'Mesh.frag';

    this.geometry.addAttribute(
        'dir', new BufferAttribute( new Float32Array( x ), 3 )
    );
    this.geometry.addAttribute(
        'size', new BufferAttribute( new Float32Array( n4 ), 1 )
    );

    this.setAttributes( {
        position: position,
        normal: normal,
        dir: dir,
        color: color,
        size: size,
        pickingColor: pickingColor
    } );

}

RibbonBuffer.prototype = Object.assign( Object.create(

    Buffer.prototype ), {

    constructor: RibbonBuffer,

    setAttributes: function( data ){

        var n4 = this.size;
        var n = n4 / 4;

        var attributes = this.geometry.attributes;

        var position, normal, size, dir, color, pickingColor;
        var aPosition, aNormal, aSize, aDir, aColor, aPickingColor;

        if( data.position ){
            position = data.position;
            aPosition = attributes.position.array;
            attributes.position.needsUpdate = true;
        }

        if( data.normal ){
            normal = data.normal;
            aNormal = attributes.normal.array;
            attributes.normal.needsUpdate = true;
        }

        if( data.size ){
            size = data.size;
            aSize = attributes.size.array;
            attributes.size.needsUpdate = true;
        }

        if( data.dir ){
            dir = data.dir;
            aDir = attributes.dir.array;
            attributes.dir.needsUpdate = true;
        }

        if( data.color ){
            color = data.color;
            aColor = attributes.color.array;
            attributes.color.needsUpdate = true;
        }

        if( data.pickingColor ){
            pickingColor = data.pickingColor;
            aPickingColor = attributes.pickingColor.array;
            attributes.pickingColor.needsUpdate = true;
        }

        var v, i, k, p, l, v3;
        var currSize;
        var prevSize = size ? size[ 0 ] : null;

        for( v = 0; v < n; ++v ){

            v3 = v * 3;
            k = v * 3 * 4;
            l = v * 4;

            if( position ){

                aPosition[ k     ] = aPosition[ k + 3 ] = position[ v3     ];
                aPosition[ k + 1 ] = aPosition[ k + 4 ] = position[ v3 + 1 ];
                aPosition[ k + 2 ] = aPosition[ k + 5 ] = position[ v3 + 2 ];

                aPosition[ k + 6 ] = aPosition[ k +  9 ] = position[ v3 + 3 ];
                aPosition[ k + 7 ] = aPosition[ k + 10 ] = position[ v3 + 4 ];
                aPosition[ k + 8 ] = aPosition[ k + 11 ] = position[ v3 + 5 ];

            }

            if( normal ){

                aNormal[ k     ] = aNormal[ k + 3 ] = -normal[ v3     ];
                aNormal[ k + 1 ] = aNormal[ k + 4 ] = -normal[ v3 + 1 ];
                aNormal[ k + 2 ] = aNormal[ k + 5 ] = -normal[ v3 + 2 ];

                aNormal[ k + 6 ] = aNormal[ k +  9 ] = -normal[ v3 + 3 ];
                aNormal[ k + 7 ] = aNormal[ k + 10 ] = -normal[ v3 + 4 ];
                aNormal[ k + 8 ] = aNormal[ k + 11 ] = -normal[ v3 + 5 ];

            }


            for( i = 0; i<4; ++i ){

                p = k + 3 * i;

                if( color ){

                    aColor[ p     ] = color[ v3     ];
                    aColor[ p + 1 ] = color[ v3 + 1 ];
                    aColor[ p + 2 ] = color[ v3 + 2 ];

                }

                if( pickingColor ){

                    aPickingColor[ p     ] = pickingColor[ v3     ];
                    aPickingColor[ p + 1 ] = pickingColor[ v3 + 1 ];
                    aPickingColor[ p + 2 ] = pickingColor[ v3 + 2 ];

                }

            }

            if( size ){

                currSize = size[ v ];

                if( prevSize !== size[ v ] ){

                    aSize[ l     ] = prevSize;
                    aSize[ l + 1 ] = prevSize;
                    aSize[ l + 2 ] = currSize;
                    aSize[ l + 3 ] = currSize;

                }else{

                    aSize[ l     ] = currSize;
                    aSize[ l + 1 ] = currSize;
                    aSize[ l + 2 ] = currSize;
                    aSize[ l + 3 ] = currSize;

                }

                prevSize = currSize;

            }

            if( dir ){

                aDir[ k     ] = dir[ v3     ];
                aDir[ k + 1 ] = dir[ v3 + 1 ];
                aDir[ k + 2 ] = dir[ v3 + 2 ];

                aDir[ k + 3 ] = -dir[ v3     ];
                aDir[ k + 4 ] = -dir[ v3 + 1 ];
                aDir[ k + 5 ] = -dir[ v3 + 2 ];

                aDir[ k + 6 ] = dir[ v3 + 3 ];
                aDir[ k + 7 ] = dir[ v3 + 4 ];
                aDir[ k + 8 ] = dir[ v3 + 5 ];

                aDir[ k +  9 ] = -dir[ v3 + 3 ];
                aDir[ k + 10 ] = -dir[ v3 + 4 ];
                aDir[ k + 11 ] = -dir[ v3 + 5 ];

            }

        }

    },

    makeIndex: function(){

        var meshIndex = this.meshIndex;
        var n = meshIndex.length / 4 / 3;

        var quadIndices = new Uint16Array([
            0, 1, 2,
            1, 3, 2
        ]);

        var s, v, ix, it;

        for( v = 0; v < n; ++v ){

            ix = v * 6;
            it = v * 4;

            meshIndex.set( quadIndices, ix );
            for( s = 0; s < 6; ++s ){
                meshIndex[ ix + s ] += it;
            }

        }

    }

} );


export default RibbonBuffer;
