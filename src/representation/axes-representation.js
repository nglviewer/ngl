/**
 * @file Axes Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Color, Vector3 } from "../../lib/three.es6.js";

import { RepresentationRegistry } from "../globals.js";
import { defaults } from "../utils.js";
import { uniformArray, uniformArray3 } from "../math/array-utils.js";
import { pointVectorIntersection } from "../math/vector-utils.js";
import Representation from "./representation.js";
import StructureRepresentation from "./structure-representation.js";
import SphereBuffer from "../buffer/sphere-buffer.js";
import CylinderBuffer from "../buffer/cylinder-buffer.js";


function AxesRepresentation( structure, viewer, params ){

    StructureRepresentation.call( this, structure, viewer, params );

}

AxesRepresentation.prototype = Object.assign( Object.create(

    StructureRepresentation.prototype ), {

    constructor: AxesRepresentation,

    type: "axes",

    parameters: Object.assign( {

        radius: {
            type: "number", precision: 3, max: 10.0, min: 0.001
        },
        sphereDetail: true,
        radialSegments: true,
        disableImpostor: true,
        align: {
            type: "button"
        }

    }, Representation.prototype.parameters, {
        assembly: null
    } ),

    init: function( params ){

        var p = params || {};

        p.radius = defaults( p.radius, 0.5 );
        p.colorValue = defaults( p.colorValue, "lightgreen" );

        StructureRepresentation.prototype.init.call( this, p );

    },

    getPrincipalAxes: function( /*sview*/ ){

        var selection;
        var assembly = this.getAssembly();

        if( assembly ){
            selection = assembly.partList[ 0 ].getSelection();
        }

        // return this.structureView.getPrincipalAxes( selection );  // FIXME
        return this.structureView.getView( selection ).getPrincipalAxes();

    },

    align: function(){

        var pa = this.getPrincipalAxes( this.structureView );

        var v1 = new Vector3().copy( pa[0][1] ).sub( pa[0][0] ).normalize();
        // var v2 = new Vector3().copy( pa[1][1] ).sub( pa[1][0] ).normalize();
        var v3 = new Vector3().copy( pa[2][1] ).sub( pa[2][0] ).normalize();

        this.viewer.alignView( v3, v1, pa[ 3 ], true );

    },

    getAxesData: function( sview ){

        var pa = this.getPrincipalAxes( sview );
        var c = new Color( this.colorValue );

        var vertexPosition = new Float32Array( 3 * ( 6 + 8 ) );
        var vertexColor = uniformArray3( ( 6 + 8 ), c.r, c.g, c.b );
        var vertexRadius = uniformArray( ( 6 + 8 ), this.radius );

        var edgePosition1 = new Float32Array( 3 * ( 3 + 12 ) );
        var edgePosition2 = new Float32Array( 3 * ( 3 + 12 ) );
        var edgeColor = uniformArray3( ( 3 + 12 ), c.r, c.g, c.b );
        var edgeRadius = uniformArray( ( 3 + 12 ), this.radius );

        var offset = 0;
        function addAxis( v1, v2 ){
            v1.toArray( vertexPosition, offset * 2 );
            v2.toArray( vertexPosition, offset * 2 + 3 );
            v1.toArray( edgePosition1, offset );
            v2.toArray( edgePosition2, offset );
            offset += 3;
        }

        addAxis( pa[ 0 ][ 0 ], pa[ 0 ][ 1 ] );
        addAxis( pa[ 1 ][ 0 ], pa[ 1 ][ 1 ] );
        addAxis( pa[ 2 ][ 0 ], pa[ 2 ][ 1 ] );

        var offset2 = offset * 2;
        function addCorner( v ){
            v.toArray( vertexPosition, offset2 );
            offset2 += 3;
        }

        var ax1 = new Vector3().subVectors( pa[ 0 ][ 0 ], pa[ 0 ][ 1 ] ).normalize();
        var ax2 = new Vector3().subVectors( pa[ 1 ][ 0 ], pa[ 1 ][ 1 ] ).normalize();
        var ax3 = new Vector3().subVectors( pa[ 2 ][ 0 ], pa[ 2 ][ 1 ] ).normalize();
        var p1 = new Vector3();
        var p2 = new Vector3();
        var p3 = new Vector3();
        var t = new Vector3();
        var v = new Vector3();
        var d1a = -Infinity;
        var d1b = -Infinity;
        var d2a = -Infinity;
        var d2b = -Infinity;
        var d3a = -Infinity;
        var d3b = -Infinity;
        sview.eachAtom( function( ap ){
            p1.copy( pointVectorIntersection( p1.copy( ap ), pa[3], ax1 ) );
            var dp1 = t.subVectors( p1, pa[3] ).normalize().dot( ax1 );
            var dt1 = p1.distanceTo( pa[3] );
            if( dp1 > 0 ){
                if( dt1 > d1a ) d1a = dt1;
            }else{
                if( dt1 > d1b ) d1b = dt1;
            }

            p2.copy( pointVectorIntersection( p2.copy( ap ), pa[3], ax2 ) );
            var dp2 = t.subVectors( p2, pa[3] ).normalize().dot( ax2 );
            var dt2 = p2.distanceTo( pa[3] );
            if( dp2 > 0 ){
                if( dt2 > d2a ) d2a = dt2;
            }else{
                if( dt2 > d2b ) d2b = dt2;
            }

            p3.copy( pointVectorIntersection( p3.copy( ap ), pa[3], ax3 ) );
            var dp3 = t.subVectors( p3, pa[3] ).normalize().dot( ax3 );
            var dt3 = p3.distanceTo( pa[3] );
            if( dp3 > 0 ){
                if( dt3 > d3a ) d3a = dt3;
            }else{
                if( dt3 > d3b ) d3b = dt3;
            }
        } );

        v.copy( pa[3] )
            .addScaledVector( ax1, d1a )
            .addScaledVector( ax2, d2a )
            .addScaledVector( ax3, d3a );
        addCorner( v );

        v.copy( pa[3] )
            .addScaledVector( ax1, d1a )
            .addScaledVector( ax2, d2a )
            .addScaledVector( ax3, -d3b );
        addCorner( v );

        v.copy( pa[3] )
            .addScaledVector( ax1, d1a )
            .addScaledVector( ax2, -d2b )
            .addScaledVector( ax3, -d3b );
        addCorner( v );

        v.copy( pa[3] )
            .addScaledVector( ax1, d1a )
            .addScaledVector( ax2, -d2b )
            .addScaledVector( ax3, d3a );
        addCorner( v );

        v.copy( pa[3] )
            .addScaledVector( ax1, -d1b )
            .addScaledVector( ax2, -d2b )
            .addScaledVector( ax3, -d3b );
        addCorner( v );

        v.copy( pa[3] )
            .addScaledVector( ax1, -d1b )
            .addScaledVector( ax2, -d2b )
            .addScaledVector( ax3, d3a );
        addCorner( v );

        v.copy( pa[3] )
            .addScaledVector( ax1, -d1b )
            .addScaledVector( ax2, d2a )
            .addScaledVector( ax3, d3a );
        addCorner( v );

        v.copy( pa[3] )
            .addScaledVector( ax1, -d1b )
            .addScaledVector( ax2, d2a )
            .addScaledVector( ax3, -d3b );
        addCorner( v );

        var edgeOffset = offset;
        function addEdge( a, b ){
            v.fromArray( vertexPosition, offset * 2 + a * 3 )
                .toArray( edgePosition1, edgeOffset );
            v.fromArray( vertexPosition, offset * 2 + b * 3 )
                .toArray( edgePosition2, edgeOffset );
            edgeOffset += 3;
        }
        addEdge( 0, 1 );
        addEdge( 0, 3 );
        addEdge( 0, 6 );
        addEdge( 1, 2 );
        addEdge( 1, 7 );
        addEdge( 2, 3 );
        addEdge( 2, 4 );
        addEdge( 3, 5 );
        addEdge( 4, 5 );
        addEdge( 4, 7 );
        addEdge( 5, 6 );
        addEdge( 6, 7 );

        return {
            vertexPosition: vertexPosition,
            vertexColor: vertexColor,
            vertexRadius: vertexRadius,
            edgePosition1: edgePosition1,
            edgePosition2: edgePosition2,
            edgeColor: edgeColor,
            edgeRadius: edgeRadius
        };

    },

    create: function(){

        var axesData = this.getAxesData( this.structureView );

        this.sphereBuffer = new SphereBuffer(
            axesData.vertexPosition,
            axesData.vertexColor,
            axesData.vertexRadius,
            undefined,
            this.getBufferParams( {
                sphereDetail: this.sphereDetail,
                disableImpostor: this.disableImpostor,
                dullInterior: true
            } )
        );

        this.cylinderBuffer = new CylinderBuffer(
            axesData.edgePosition1,
            axesData.edgePosition2,
            axesData.edgeColor,
            axesData.edgeColor,
            axesData.edgeRadius,
            undefined,
            undefined,
            this.getBufferParams( {
                openEnded: true,
                radialSegments: this.radialSegments,
                disableImpostor: this.disableImpostor,
                dullInterior: true
            } )
        );

        this.dataList.push( {
            sview: this.structureView,
            bufferList: [ this.sphereBuffer, this.cylinderBuffer ]
        } );

    },

    updateData: function( what, data ){

        var axesData = this.getAxesData( data.sview );
        var sphereData = {};
        var cylinderData = {};

        if( !what || what.position ){
            sphereData.position = axesData.vertexPosition;
            cylinderData.position1 = axesData.edgePosition1;
            cylinderData.position2 = axesData.edgePosition2;
        }

        if( !what || what.color ){
            sphereData.color = axesData.vertexColor;
            cylinderData.color = axesData.edgeColor;
            cylinderData.color2 = axesData.edgeColor;
        }

        if( !what || what.radius ){
            sphereData.radius = axesData.vertexRadius;
            cylinderData.radius = axesData.edgeRadius;
        }

        this.sphereBuffer.setAttributes( sphereData );
        this.cylinderBuffer.setAttributes( cylinderData );

    }

} );


RepresentationRegistry.add( "axes", AxesRepresentation );


export default AxesRepresentation;
