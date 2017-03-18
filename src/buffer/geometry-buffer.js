/**
 * @file Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Matrix4, Matrix3 } from "../../lib/three.es6.js";

import { positionFromGeometry, normalFromGeometry, indexFromGeometry } from "./buffer-utils.js";
import MeshBuffer from "./mesh-buffer.js";


const matrix = new Matrix4();
const normalMatrix = new Matrix3();


class GeometryBuffer extends MeshBuffer{

    // position, color, pickingColor
    constructor( data, params, geo ){

        var p = params || {};

        var n = data.position.length / 3;
        var m, o;
        var geoPosition, geoNormal, geoIndex;

        if( geo.vertices && geo.faces ){
            geoPosition = positionFromGeometry( geo );
            geoNormal = normalFromGeometry( geo );
            geoIndex = indexFromGeometry( geo );
            m = geo.vertices.length;
            o = geo.faces.length;
        }else{
            geoPosition = geo.attributes.position.array;
            geoNormal = geo.attributes.normal.array;
            geoIndex = geo.index.array;
            m = geoPosition.length / 3;
            o = geoIndex.length / 3;
        }

        var size = n * m;

        const meshPosition = new Float32Array( size * 3 );
        const meshNormal = new Float32Array( size * 3 );
        const meshColor = new Float32Array( size * 3 );
        const meshPickingColor = new Float32Array( size * 3 );

        const TypedArray = size > 65535 ? Uint32Array : Uint16Array;
        const meshIndex = new TypedArray( n * o * 3 );

        super( {
            position: meshPosition,
            color: meshColor,
            index: meshIndex,
            normal: meshNormal,
            pickingColor: meshPickingColor
        }, p );

        this.geoPosition = geoPosition;
        this.geoNormal = geoNormal;
        this.geoIndex = geoIndex;

        this.positionCount = n;
        this.geoPositionCount = m;
        this.geoFacesCount = o;

        this.transformedGeoPosition = new Float32Array( m * 3 );
        this.transformedGeoNormal = new Float32Array( m * 3 );

        this.meshPosition = meshPosition;
        this.meshColor = meshColor;
        this.meshIndex = meshIndex;
        this.meshNormal = meshNormal;
        this.meshPickingColor = meshPickingColor;

        this.meshIndex = meshIndex;
        this.makeIndex();

    }

    applyPositionTransform(){}

    setAttributes( data, initNormals ){

        var attributes = this.geometry.attributes;

        var position, color, pickingColor;
        var geoPosition, geoNormal;
        var transformedGeoPosition, transformedGeoNormal;
        var meshPosition, meshColor, meshPickingColor, meshNormal;

        var updateNormals = this.updateNormals;

        if( data.position ){
            position = data.position;
            geoPosition = this.geoPosition;
            meshPosition = this.meshPosition;
            transformedGeoPosition = this.transformedGeoPosition;
            attributes.position.needsUpdate = true;
            if( updateNormals || initNormals ){
                geoNormal = this.geoNormal;
                meshNormal = this.meshNormal;
                transformedGeoNormal = this.transformedGeoNormal;
                attributes.normal.needsUpdate = true;
            }
        }

        if( data.color ){
            color = data.color;
            meshColor = this.meshColor;
            attributes.color.needsUpdate = true;
        }

        if( data.pickingColor ){
            pickingColor = data.pickingColor;
            meshPickingColor = this.meshPickingColor;
            attributes.pickingColor.needsUpdate = true;
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

                if( updateNormals ){

                    transformedGeoNormal.set( geoNormal );
                    normalMatrix.getNormalMatrix( matrix );
                    normalMatrix.applyToVector3Array( transformedGeoNormal );

                    meshNormal.set( transformedGeoNormal, k );

                }else if( initNormals ){

                    meshNormal.set( geoNormal, k );

                }

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

    }

    makeIndex(){

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

    get updateNormals (){ return false; }

}


export default GeometryBuffer;
