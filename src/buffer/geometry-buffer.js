/**
 * @file Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Matrix4, Matrix3, BufferAttribute } from "../../lib/three.es6.js";

import { positionFromGeometry, normalFromGeometry, indexFromGeometry } from "./buffer-utils.js";
import MeshBuffer from "./mesh-buffer.js";


function GeometryBuffer( position, color, pickingColor, params ){

    var p = params || {};

    // required property of subclasses
    var geo = this.geo;

    var n = position.length / 3;
    var m, o;

    if( geo.vertices && geo.faces ){
        this.geoPosition = positionFromGeometry( geo );
        this.geoNormal = normalFromGeometry( geo );
        this.geoIndex = indexFromGeometry( geo );
        m = geo.vertices.length;
        o = geo.faces.length;
    }else{
        this.geoPosition = geo.attributes.position.array;
        this.geoNormal = geo.attributes.normal.array;
        this.geoIndex = geo.index.array;
        m = this.geoPosition.length / 3;
        o = this.geoIndex.length / 3;
    }

    this.size = n * m;
    this.positionCount = n;
    this.geoPositionCount = m;
    this.geoFacesCount = o;

    this.transformedGeoPosition = new Float32Array( m * 3 );
    this.transformedGeoNormal = new Float32Array( m * 3 );

    this.meshPosition = new Float32Array( this.size * 3 );
    this.meshNormal = new Float32Array( this.size * 3 );
    this.meshColor = new Float32Array( this.size * 3 );
    this.meshPickingColor = new Float32Array( this.size * 3 );

    var TypedArray = this.meshPosition.length / 3 > 65535 ? Uint32Array : Uint16Array;
    this.meshIndex = new TypedArray( n * o * 3 );
    this.makeIndex();

    MeshBuffer.call(
        this, this.meshPosition, this.meshColor, this.meshIndex,
        this.meshNormal, this.meshPickingColor, p
    );

    this.initNormals = true;

    this.setAttributes( {
        position: position,
        color: color,
        pickingColor: pickingColor
    } );

    this.initNormals = false;

}

GeometryBuffer.prototype = Object.assign( Object.create(

    MeshBuffer.prototype ), {

    constructor: GeometryBuffer,

    applyPositionTransform: function(){},

    resizeAttributes: function( count ){

        var size = count * this.geoPositionCount;
        var oldSize = this.size;
        this.size = size;
        this.positionCount = count;

        var geometry = this.geometry;
        var attributes = geometry.attributes;
        var indexLength = count * this.geoFacesCount * 3;

        if( size > oldSize ){

            this.meshPosition = new Float32Array( this.size * 3 );
            this.meshNormal = new Float32Array( this.size * 3 );
            this.meshColor = new Float32Array( this.size * 3 );
            this.meshPickingColor = new Float32Array( this.size * 3 );

            geometry.addAttribute(
                "position",
                new BufferAttribute( this.meshPosition, 3 )
                    .setDynamic( this.dynamic )
            );

            geometry.addAttribute(
                "normal",
                new BufferAttribute( this.meshNormal, 3 )
                    .setDynamic( this.dynamic )
            );

            geometry.addAttribute(
                "color",
                new BufferAttribute( this.meshColor, 3 )
                    .setDynamic( this.dynamic )
            );

            geometry.addAttribute(
                "pickingColor",
                new BufferAttribute( this.meshPickingColor, 3 )
                    .setDynamic( this.dynamic )
            );

            var TypedArray = this.size > 65535 ? Uint32Array : Uint16Array;
            this.meshIndex = new TypedArray( count * this.geoFacesCount * 3 );
            this.makeIndex();

            geometry.setIndex(
                new BufferAttribute( this.meshIndex, 1 )
                    .setDynamic( this.dynamic )
            );

        }else if( size < oldSize ){

            var index = geometry.getIndex();
            index.needsUpdate = indexLength > 0;
            index.updateRange.count = indexLength;

        }

        geometry.setDrawRange( 0, indexLength );

        attributes.position.updateRange.count = this.size * 3;
        attributes.normal.updateRange.count = this.size * 3;
        attributes.color.updateRange.count = this.size * 3;
        attributes.pickingColor.updateRange.count = this.size * 3;

    },

    setAttributes: function(){

        var matrix = new Matrix4();
        var normalMatrix = new Matrix3();

        return function setAttributes( data ){

            if( data.position ){
                this.resizeAttributes( data.position.length / 3 );
            }

            var attributes = this.geometry.attributes;

            var position, color, pickingColor;
            var geoPosition, geoNormal;
            var transformedGeoPosition, transformedGeoNormal;
            var meshPosition, meshColor, meshPickingColor, meshNormal;

            if( data.position ){
                position = data.position;
                geoPosition = this.geoPosition;
                meshPosition = this.meshPosition;
                transformedGeoPosition = this.transformedGeoPosition;
                attributes.position.needsUpdate = this.size > 0;
            }

            if( data.color ){
                color = data.color;
                meshColor = this.meshColor;
                attributes.color.needsUpdate = this.size > 0;
            }

            if( data.pickingColor ){
                pickingColor = data.pickingColor;
                meshPickingColor = this.meshPickingColor;
                attributes.pickingColor.needsUpdate = this.size > 0;
            }

            var updateNormals = !!( this.updateNormals && position );
            var initNormals = !!( this.initNormals && position );

            if( updateNormals || initNormals ){
                geoNormal = this.geoNormal;
                meshNormal = this.meshNormal;
                transformedGeoNormal = this.transformedGeoNormal;
                attributes.normal.needsUpdate = this.size > 0;
            }

            var n = this.positionCount;
            var m = this.geoPositionCount;

            for( var i = 0; i < n; ++i ){

                var j, l;
                var k = i * m * 3;
                var i3 = i * 3;

                if( position ){

                    transformedGeoPosition.set( geoPosition );
                    matrix.makeTranslation(
                        position[ i3 ], position[ i3 + 1 ], position[ i3 + 2 ]
                    );
                    this.applyPositionTransform( matrix, i, i3 );
                    matrix.applyToVector3Array( transformedGeoPosition );

                    meshPosition.set( transformedGeoPosition, k );

                }

                if( updateNormals ){

                    transformedGeoNormal.set( geoNormal );
                    normalMatrix.getNormalMatrix( matrix );
                    normalMatrix.applyToVector3Array( transformedGeoNormal );

                    meshNormal.set( transformedGeoNormal, k );

                }else if( initNormals ){

                    meshNormal.set( geoNormal, k );

                }

                if( color ){

                    for( j = 0; j < m; ++j ){

                        l = k + 3 * j;

                        meshColor[ l     ] = color[ i3     ];
                        meshColor[ l + 1 ] = color[ i3 + 1 ];
                        meshColor[ l + 2 ] = color[ i3 + 2 ];

                    }

                }

                if( pickingColor ){

                    for( j = 0; j < m; ++j ){

                        l = k + 3 * j;

                        meshPickingColor[ l     ] = pickingColor[ i3     ];
                        meshPickingColor[ l + 1 ] = pickingColor[ i3 + 1 ];
                        meshPickingColor[ l + 2 ] = pickingColor[ i3 + 2 ];

                    }

                }

            }

        };

    }(),

    makeIndex: function(){

        var geoIndex = this.geoIndex;
        var meshIndex = this.meshIndex;

        var n = this.positionCount;
        var m = this.geoPositionCount;
        var o = this.geoFacesCount;

        var p, i, j, q;
        var o3 = o * 3;

        for( i = 0; i < n; ++i ){

            j = i * o3;
            q = j + o3;

            meshIndex.set( geoIndex, j );
            for( p = j; p < q; ++p ) meshIndex[ p ] += i * m;

        }

    }

} );


export default GeometryBuffer;
